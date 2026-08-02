import React from "react";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ResponsesClient } from "@/components/dashboard/ResponsesClient";
import { SubmissionResponse, ResponseData, ResponseMetadata } from "@/types/response";
import { FieldDefinition } from "@/types/form";

interface PageProps {
  params: Promise<{
    formId: string;
  }>;
}

export default async function ResponsesPage({ params }: PageProps) {
  const { formId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Retrieve form details
  const form = await db.form.findUnique({
    where: { id: formId },
  });

  if (!form) {
    return notFound();
  }

  // Authorize form ownership
  if (form.userId !== userId) {
    redirect("/dashboard");
  }

  // Retrieve responses sorted newest first
  const rawResponses = await db.response.findMany({
    where: { formId: form.id },
    orderBy: { createdAt: "desc" },
  });

  // Safely map Neon JSON types to SubmissionResponse contracts
  const responses: SubmissionResponse[] = rawResponses.map((res) => ({
    id: res.id,
    formId: res.formId,
    data: (res.data || {}) as ResponseData,
    metadata: res.metadata as unknown as ResponseMetadata | null,
    aiInsight: res.aiInsight,
    status: res.status as "pending" | "analyzed" | "failed",
    createdAt: res.createdAt,
  }));

  // Structure form data
  const formDetails = {
    id: form.id,
    title: form.title,
    description: form.description,
    schema: (form.schema || []) as unknown as FieldDefinition[],
    isPublished: form.isPublished,
  };

  return <ResponsesClient form={formDetails} responses={responses} />;
}
