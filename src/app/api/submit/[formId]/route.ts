import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qstash } from "@/lib/qstash";
import crypto from "crypto";
import { FieldDefinition } from "@/types/form";
import { sendSubmissionNotification } from "@/lib/email";
import { getCachedForm } from "@/lib/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const body = await request.json().catch(() => null);

    if (!body || !body.data) {
      return NextResponse.json(
        { error: "Invalid submission. Missing data body." },
        { status: 400 }
      );
    }

    const { data, metadata } = body;

    // Fetch the form schema (cached)
    const form = await getCachedForm(formId);

    if (!form) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }

    if (!form.isPublished) {
      return NextResponse.json(
        { error: "This form is not accepting responses." },
        { status: 400 }
      );
    }

    // Validate submission data against the JSON schema
    const schema = (form.schema || []) as unknown as FieldDefinition[];
    const errors: Record<string, string> = {};

    schema.forEach((field) => {
      const val = data[field.id];

      if (field.required) {
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          errors[field.id] = `${field.label} is required.`;
        }
      }

      if (val) {
        if (field.type === "email" && typeof val === "string") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            errors[field.id] = "Please enter a valid email address.";
          }
        }
        if (field.type === "number" && isNaN(Number(val))) {
          errors[field.id] = "Please enter a valid number.";
        }
        if (field.type === "file") {
          if (typeof val === "object" && val !== null) {
            const { base64 } = val as { base64?: string };
            if (!base64 || typeof base64 !== "string" || !base64.startsWith("data:application/pdf;base64,")) {
              errors[field.id] = "Invalid file. Please upload a valid PDF document.";
            }
          } else {
            errors[field.id] = "Invalid file format.";
          }
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed.", fields: errors },
        { status: 400 }
      );
    }

    // Extract IP and hash it (GDPR compliant)
    const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const hashedIp = crypto.createHash("sha256").update(rawIp).digest("hex");

    // Construct submission metadata
    const finalMetadata = {
      userAgent: metadata?.userAgent || request.headers.get("user-agent") || "Unknown",
      browser: metadata?.browser || "Unknown",
      os: metadata?.os || "Unknown",
      ip: hashedIp,
      submittedAt: new Date().toISOString(),
    };

    // Save to Database
    const newResponse = await db.response.create({
      data: {
        formId: form.id,
        data,
        metadata: finalMetadata,
        status: "pending",
      },
    });

    // Enqueue job to QStash for AI analysis
    try {
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ai/webhook`;
      
      await qstash.publishJSON({
        url: webhookUrl,
        body: {
          responseId: newResponse.id,
          formId: form.id,
        },
        retries: 3,
      });
    } catch (qstashError) {
      console.error("Failed to publish to QStash:", qstashError);
      // In production, QStash is critical. But we proceed to save the response, keeping queue failure logged.
    }

    // Local dev fallback trigger (since QStash cannot reach localhost)
    if (process.env.NODE_ENV === "development") {
      const devWebhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ai/webhook`;
      fetch(devWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-bypass": "true",
        },
        body: JSON.stringify({
          responseId: newResponse.id,
          formId: form.id,
        }),
      }).catch((err) => {
        console.error("Local webhook auto-trigger failed:", err);
      });
    }

    // Send email alert to form owner (non-blocking, handled safely within try/catch)
    try {
      const owner = await db.user.findUnique({
        where: { id: form.userId },
      });

      if (owner && owner.email) {
        await sendSubmissionNotification({
          ownerEmail: owner.email,
          ownerName: owner.name || "Form Owner",
          formTitle: form.title,
          formId: form.id,
          responseId: newResponse.id,
          schema: schema,
          submittedData: data,
        });
      }
    } catch (emailError) {
      console.error("[SUBMISSION_EMAIL_ERROR] Failed to send notification:", emailError);
    }

    return NextResponse.json({
      success: true,
      responseId: newResponse.id,
    });
  } catch (error) {
    console.error("Submission API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
