import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpdateFormValidator } from "@/validators/form";
import { invalidateFormCache } from "@/lib/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;

    const form = await db.form.findFirst({
      where: {
        id: formId,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { responses: true },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("[FORM_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;
    const body = await req.json();
    const result = UpdateFormValidator.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: result.error.format() },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingForm = await db.form.findFirst({
      where: {
        id: formId,
        userId: session.user.id,
      },
    });

    if (!existingForm) {
      return NextResponse.json(
        { error: "Form not found or access denied" },
        { status: 404 }
      );
    }

    const updatedForm = await db.form.update({
      where: {
        id: formId,
      },
      data: result.data,
    });

    // Invalidate form cache (non-blocking)
    invalidateFormCache(formId, existingForm.slug).catch((err) => {
      console.error("[CACHE_INVALIDATE_ERROR] Failed to invalidate old form cache:", err);
    });
    if (updatedForm.slug !== existingForm.slug) {
      invalidateFormCache(formId, updatedForm.slug).catch((err) => {
        console.error("[CACHE_INVALIDATE_ERROR] Failed to invalidate new form cache:", err);
      });
    }

    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error("[FORM_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;

    // Verify ownership
    const existingForm = await db.form.findFirst({
      where: {
        id: formId,
        userId: session.user.id,
      },
    });

    if (!existingForm) {
      return NextResponse.json(
        { error: "Form not found or access denied" },
        { status: 404 }
      );
    }

    await db.form.delete({
      where: {
        id: formId,
      },
    });

    // Invalidate form cache (non-blocking)
    invalidateFormCache(formId, existingForm.slug).catch((err) => {
      console.error("[CACHE_INVALIDATE_ERROR] Failed to invalidate deleted form cache:", err);
    });

    return NextResponse.json({ success: true, message: "Form deleted" });
  } catch (error) {
    console.error("[FORM_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
