import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { openrouter } from "@/lib/openrouter";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { FieldDefinition } from "@/types/form";

async function mainHandler(req: NextRequest) {
  try {
    const { responseId, formId } = await req.json().catch(() => ({}));

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

    // Prevent redundant calls if already analyzed
    if (response.status === "analyzed" && response.aiInsight) {
      return NextResponse.json({
        success: true,
        message: "Response already analyzed.",
      });
    }

    const schema = (response.form.schema || []) as unknown as FieldDefinition[];
    const responseData = (response.data || {}) as Record<string, any>;

    // Match submitted data to field labels for prompt clarity
    const structuredAnswers = schema.map((field) => {
      const val = responseData[field.id];
      let answeredVal = "N/A";

      if (val !== undefined && val !== null && val !== "") {
        if (Array.isArray(val)) {
          answeredVal = val.join(", ");
        } else if (typeof val === "boolean") {
          answeredVal = val ? "Checked" : "Unchecked";
        } else {
          answeredVal = String(val);
        }
      }

      return {
        label: field.label,
        value: answeredVal,
      };
    });

    // Format prompt content
    const promptContent = `
Analyze the following form submission for the form titled "${response.form.title}".
Form description: ${response.form.description || "N/A"}

Form Fields and Answers:
${structuredAnswers.map((ans) => `- **${ans.label}**: ${ans.value}`).join("\n")}

Please provide:
1. **Sentiment**: A single sentence specifying if the response sentiment is Positive, Neutral, or Negative and why.
2. **Key Insights**: 2-3 bulleted highlights of key themes, preferences, concerns, or requests from this respondent.
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
            content: "You are FormFlow AI, an analytical SaaS assistant. Your goal is to synthesize form responses into brief, highly actionable takeaways for product owners.",
          },
          {
            role: "user",
            content: promptContent,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      aiInsight = completion.choices[0]?.message?.content || "No insights could be generated.";
    } catch (apiError: any) {
      console.error("OpenRouter Completion Error:", apiError);
      
      // Update status to failed
      await db.response.update({
        where: { id: responseId },
        data: { status: "failed" },
      });

      return NextResponse.json(
        { error: "AI completions failed.", details: apiError.message },
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
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
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
