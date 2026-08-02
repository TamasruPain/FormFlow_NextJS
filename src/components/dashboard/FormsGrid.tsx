"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormCard } from "./FormCard";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { useToastStore } from "@/store/toastStore";

interface FormItem {
  id: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  createdAt: Date;
  _count: {
    responses: number;
  };
}

interface FormsGridProps {
  initialForms: FormItem[];
}

export function FormsGrid({ initialForms }: FormsGridProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { showToast } = useToastStore();

  const confirmDelete = (id: string) => {
    setPendingDeleteId(id);
    setShowConfirmModal(true);
  };

  const executeDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete form");
      }

      showToast("Form deleted successfully!", "success");
      setShowConfirmModal(false);
      setPendingDeleteId(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      showToast("Error deleting form. Please try again.", "error");
      setShowConfirmModal(false);
      setPendingDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {deletingId && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-55 rounded-full border border-red-500/20 bg-red-950/80 px-4 py-2 text-xs font-semibold text-red-400 backdrop-blur-md shadow-lg shadow-red-500/5 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          Deleting form...
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Delete Form"
        description="Are you sure you want to delete this form? All responses associated with it will be permanently deleted."
        confirmText="Delete"
        isDanger
        isLoading={deletingId !== null}
        onConfirm={executeDelete}
        onCancel={() => {
          setShowConfirmModal(false);
          setPendingDeleteId(null);
        }}
      />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {initialForms.map((form) => (
          <FormCard
            key={form.id}
            id={form.id}
            title={form.title}
            description={form.description}
            isPublished={form.isPublished}
            responsesCount={form._count.responses}
            createdAt={form.createdAt}
            onDelete={confirmDelete}
          />
        ))}
      </div>
    </>
  );
}
