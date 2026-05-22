import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateFormValidator } from "@/validators/form";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const forms = await db.form.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { responses: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error("[FORMS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = CreateFormValidator.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { title, description, schema, isPublished, isMultiStep } =
      result.data;

    // Generate unique slug
    const slug = crypto.randomBytes(6).toString("hex");

    const form = await db.form.create({
      data: {
        userId: session.user.id,
        title,
        description,
        schema: schema || [],
        isPublished,
        isMultiStep,
        slug,
      },
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error("[FORMS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
