import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { openrouter } from "@/lib/openrouter";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { FieldDefinition } from "@/types/form";
import { ResponseData } from "@/types/response";
import { PDFParse } from "pdf-parse";
import path from "path";
import { pathToFileURL } from "url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

try {
  const workerPath = path.join(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs"
  );
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
} catch (workerErr) {
  console.error("[PDFJS_WORKER_SETUP_ERROR]", workerErr);
}

async function mainHandler(req: NextRequest) {
  try {
    const { responseId, formId, force } = await req.json().catch(() => ({}));

    if (!responseId || !formId) {
      return NextResponse.json(
        { error: "Missing responseId or formId." },
        { status: 400 }
      );
    }

    // Fetch response with its form configuration
    const response = await db.response.findUnique({
      where: { id: responseId },
      include: {
        form: true,
      },
    });

    if (!response) {
      return NextResponse.json({ error: "Response not found." }, { status: 404 });
    }

    // Prevent redundant calls if already analyzed (unless force is true)
    if (!force && response.status === "analyzed" && response.aiInsight) {
      return NextResponse.json({
        success: true,
        message: "Response already analyzed.",
      });
    }

    const schema = (response.form.schema || []) as unknown as FieldDefinition[];
    const responseData = (response.data || {}) as ResponseData;

    // Match submitted data to field labels for prompt clarity
    const structuredAnswers = await Promise.all(
      schema.map(async (field) => {
        const val = responseData[field.id];
        let answeredVal = "N/A";

        if (val !== undefined && val !== null && val !== "") {
          if (Array.isArray(val)) {
            answeredVal = val.join(", ");
          } else if (typeof val === "boolean") {
            answeredVal = val ? "Checked" : "Unchecked";
          } else if (typeof val === "object" && val !== null && "base64" in val) {
            // PDF file upload
            const fileObj = val as { name: string; size: number; type: string; base64: string };
            let extractedText = "";
            try {
              const base64Part = fileObj.base64.split(",")[1];
              if (base64Part) {
                const pdfBuffer = Buffer.from(base64Part, "base64");
                const parser = new PDFParse({ data: pdfBuffer });
                try {
                  const result = await parser.getText();
                  extractedText = result.text || "No readable text content extracted.";
                } finally {
                  await parser.destroy();
                }
              }
            } catch (pdfErr) {
              console.error("[PDF_PARSE_ERROR] Failed to parse PDF text:", pdfErr);
              extractedText = "Error reading PDF contents.";
            }
            answeredVal = `PDF File "${fileObj.name}" (Extracted text content:\n${extractedText.substring(0, 4000)}\n)`;
          } else {
            answeredVal = String(val);
          }
        }

        return {
          label: field.label,
          value: answeredVal,
        };
      })
    );

    // Format prompt content
    const promptContent = `
Analyze the following form submission for the form titled "${response.form.title}".
Form description: ${response.form.description || "N/A"}

Form Fields and Answers:
${structuredAnswers.map((ans) => `- **${ans.label}**: ${ans.value}`).join("\n")}

Please provide:
1. **Sentiment**: A single sentence specifying if the response sentiment is Positive, Neutral, or Negative and why.
2. **Key Insights**: 2-3 bulleted highlights of key themes, preferences, concerns, or requests from this respondent. If a PDF attachment is submitted (indicated by its text content being present above), include a dedicated summary of the PDF document's key points.
3. **Recommended Actions**: 1-2 practical, direct next steps for the form owner.

Keep the output concise, constructive, and formatted in clean Markdown.
`;

    // Query OpenRouter with fallback options
    let aiInsight = "";
    try {
      const completion = await openrouter.chat.completions.create({
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content: "You are FormKyte AI, an analytical SaaS assistant. Your goal is to synthesize form responses into brief, highly actionable takeaways for product owners.",
          },
          {
            role: "user",
            content: promptContent,
          },
        ],
        temperature: 0.7,
        max_tokens: 600,
      });

      aiInsight = completion.choices[0]?.message?.content || "No insights could be generated.";
    } catch (apiError) {
      const err = apiError as Error;
      console.error("OpenRouter Completion Error:", err);
      
      // Update status to failed
      await db.response.update({
        where: { id: responseId },
        data: { status: "failed" },
      });

      return NextResponse.json(
        { error: "AI completions failed.", details: err.message },
        { status: 500 }
      );
    }

    // Save insights back to Database
    await db.response.update({
      where: { id: responseId },
      data: {
        aiInsight,
        status: "analyzed",
      },
    });

    return NextResponse.json({
      success: true,
      message: "AI analysis completed successfully.",
    });
  } catch (error) {
    const err = error as Error;
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}

// Wrapper routing allowing bypass in local development
export const POST = async (req: NextRequest) => {
  if (
    process.env.NODE_ENV === "development" &&
    req.headers.get("x-dev-bypass") === "true"
  ) {
    return mainHandler(req);
  }

  // Enforce QStash signature verification in production
  const verifiedHandler = verifySignatureAppRouter(mainHandler);
  return verifiedHandler(req);
};
