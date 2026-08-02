import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { qstash } from "@/lib/qstash";

// GET: Fetch response status & insights
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string; responseId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId, responseId } = await params;

    // Verify form ownership
    const form = await db.form.findFirst({
      where: {
        id: formId,
        userId: session.user.id,
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found or unauthorized" }, { status: 404 });
    }

    // Verify response
    const response = await db.response.findUnique({
      where: { id: responseId },
    });

    if (!response || response.formId !== form.id) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: response.id,
      status: response.status,
      aiInsight: response.aiInsight,
    });
  } catch (error) {
    console.error("[RESPONSE_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Trigger AI Insights regeneration
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string; responseId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId, responseId } = await params;

    // Verify form ownership
    const form = await db.form.findFirst({
      where: {
        id: formId,
        userId: session.user.id,
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found or unauthorized" }, { status: 404 });
    }

    // Verify response
    const response = await db.response.findUnique({
      where: { id: responseId },
    });

    if (!response || response.formId !== form.id) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    // Update status to pending and clear old insight
    await db.response.update({
      where: { id: responseId },
      data: {
        status: "pending",
        aiInsight: null,
      },
    });

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ai/webhook`;

    // Queue job to QStash in production
    if (process.env.NODE_ENV === "production") {
      try {
        await qstash.publishJSON({
          url: webhookUrl,
          body: {
            responseId: response.id,
            formId: form.id,
            force: true,
          },
          retries: 3,
        });
      } catch (qstashError) {
        console.error("Failed to publish to QStash for regeneration:", qstashError);
        await db.response.update({
          where: { id: responseId },
          data: { status: "failed" },
        });
        return NextResponse.json({ error: "Failed to queue regeneration job" }, { status: 500 });
      }
    }

    // Auto-trigger immediately in local development
    if (process.env.NODE_ENV === "development") {
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-bypass": "true",
        },
        body: JSON.stringify({
          responseId: response.id,
          formId: form.id,
          force: true,
        }),
      }).catch((err) => {
        console.error("Local webhook regeneration auto-trigger failed:", err);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Regeneration queued successfully.",
    });
  } catch (error) {
    console.error("[RESPONSE_REGENERATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
