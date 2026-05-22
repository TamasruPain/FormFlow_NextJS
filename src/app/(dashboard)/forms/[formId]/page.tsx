import React from "react";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormBuilderClient } from "@/components/builder/FormBuilderClient";

interface EditFormPageProps {
  params: Promise<{
    formId: string;
  }>;
}

export default async function EditFormPage({ params }: EditFormPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { formId } = await params;

  // Retrieve form details to edit
  const form = await db.form.findFirst({
    where: {
      id: formId,
      userId: session.user.id,
    },
  });

  if (!form) {
    notFound();
  }

  return (
    <FormBuilderClient
      initialForm={{
        id: form.id,
        title: form.title,
        description: form.description,
        isMultiStep: form.isMultiStep,
        isPublished: form.isPublished,
        schema: form.schema,
      }}
    />
  );
}
