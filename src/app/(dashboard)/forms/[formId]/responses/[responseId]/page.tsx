import React from "react";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ResponseDetailView } from "@/components/dashboard/ResponseDetailView";
import { SubmissionResponse, ResponseData, ResponseMetadata } from "@/types/response";
import { FieldDefinition } from "@/types/form";

interface PageProps {
  params: Promise<{
    formId: string;
    responseId: string;
  }>;
}

export default async function ResponseDetailPage({ params }: PageProps) {
  const { formId, responseId } = await params;

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

  // Retrieve specific response
  const rawResponse = await db.response.findUnique({
    where: { id: responseId },
  });

  if (!rawResponse || rawResponse.formId !== form.id) {
    return notFound();
  }

  // Safely map Neon JSON types to SubmissionResponse contracts
  const response: SubmissionResponse = {
    id: rawResponse.id,
    formId: rawResponse.formId,
    data: (rawResponse.data || {}) as ResponseData,
    metadata: rawResponse.metadata as unknown as ResponseMetadata | null,
    aiInsight: rawResponse.aiInsight,
    status: rawResponse.status as "pending" | "analyzed" | "failed",
    createdAt: rawResponse.createdAt,
  };

  // Structure form data
  const formDetails = {
    id: form.id,
    title: form.title,
    description: form.description,
    schema: (form.schema || []) as unknown as FieldDefinition[],
    isPublished: form.isPublished,
  };

  return <ResponseDetailView form={formDetails} response={response} />;
}
