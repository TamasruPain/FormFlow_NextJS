import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface FieldDef {
  id: string;
  type: string;
  label: string;
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the latest 20 submissions across all of the user's forms
    const responses = await db.response.findMany({
      where: {
        form: {
          userId: session.user.id,
        },
      },
      include: {
        form: {
          select: {
            id: true,
            title: true,
            schema: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    // Parse each submission to extract submitter details
    const notifications = responses.map((response) => {
      const data = (response.data ?? {}) as Record<string, unknown>;
      const schema = (response.form.schema as unknown as FieldDef[]) ?? [];

      let submitterName = "Anonymous Submitter";
      let submitterEmail = "";

      // Try to find a name field
      const nameField = schema.find(
        (f) =>
          (f.type === "text" || f.type === "email") &&
          /name|user|full\s*name|first\s*name/i.test(f.label)
      );
      if (nameField && data[nameField.id]) {
        submitterName = String(data[nameField.id]);
      }

      // Try to find an email field
      const emailField = schema.find(
        (f) => f.type === "email" || /email/i.test(f.label)
      );
      if (emailField && data[emailField.id]) {
        submitterEmail = String(data[emailField.id]);
      }

      return {
        id: response.id,
        formId: response.form.id,
        formTitle: response.form.title,
        submitterName,
        submitterEmail,
        status: response.status,
        createdAt: response.createdAt.toISOString(),
      };
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[NOTIFICATIONS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
