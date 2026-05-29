"use client";

import React, { useState } from "react";
import { FieldDefinition } from "@/types/form";
import { FieldRenderer } from "./FieldRenderer";
import { MultiStepForm } from "./MultiStepForm";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface FormRendererProps {
  form: {
    id: string;
    title: string;
    description: string | null;
    schema: FieldDefinition[];
    isMultiStep: boolean;
    isPublished: boolean;
  };
  isPreview?: boolean;
}

// Client-side Browser/OS parsers
function parseUserAgent(ua: string) {
  let browser = "Unknown";
  let os = "Unknown";

  if (/chrome|crios/i.test(ua) && !/opr|opios|edg/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome|crios|opr|opios|edg/i.test(ua)) browser = "Safari";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/opr|opios/i.test(ua)) browser = "Opera";
  else if (/edg/i.test(ua)) browser = "Edge";

  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { browser, os };
}

export function FormRenderer({ form, isPreview = false }: FormRendererProps) {
  const { id, title, description, schema, isMultiStep } = form;
  
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFieldChange = (fieldId: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    schema.forEach((field) => {
      const val = values[field.id];

      if (field.required) {
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[field.id] = `${field.label} is required.`;
        }
      }

      if (val) {
        if (field.type === "email" && typeof val === "string") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            newErrors[field.id] = "Please enter a valid email address.";
          }
        }
        if (field.type === "number" && isNaN(Number(val))) {
          newErrors[field.id] = "Please enter a valid number.";
        }
        if (field.type === "file") {
          if (typeof val !== "object" || val === null || !val.base64) {
            newErrors[field.id] = "Please upload a valid PDF document.";
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    if (isPreview) {
      // Simulate submission in preview mode
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
      }, 1000);
      return;
    }

    const { browser, os } = parseUserAgent(
      typeof window !== "undefined" ? navigator.userAgent : ""
    );

    const submissionPayload = {
      data: values,
      metadata: {
        userAgent: typeof window !== "undefined" ? navigator.userAgent : "",
        browser,
        os,
      },
    };

    try {
      const response = await fetch(`/api/submit/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit response.");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setValues({});
    setErrors({});
    setIsSubmitted(false);
    setSubmitError(null);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full mx-auto max-w-xl text-center p-8 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-2xl shadow-blue-950/5 text-slate-900"
      >
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Thank you!</h2>
        <p className="text-slate-500 mb-8">
          Your submission has been received successfully.
        </p>
        <Button
          onClick={handleReset}
          variant="outline"
          className="border-blue-200/80 text-blue-700 hover:text-blue-800 hover:bg-blue-50/40 bg-white/80"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Submit Another Response
        </Button>

        <div className="mt-8 pt-4 border-t border-blue-100/50 flex items-center justify-center gap-1">
          <span className="text-[10px] text-slate-400">Powered by</span>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-extrabold text-slate-600 hover:text-blue-600 transition-colors"
          >
            Form<span className="text-blue-600">Flow</span>
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-2xl rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-blue-950/5 relative overflow-hidden text-slate-900">
      {/* Visual Ambient Lighting Details */}
      <div className="absolute top-0 right-0 h-[150px] w-[150px] rounded-full bg-sky-500/10 blur-[50px] pointer-events-none" />

      {/* Form Header */}
      <div className="mb-8 relative z-10">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">{description}</p>
        )}
      </div>

      {isPreview && (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-xs font-medium text-amber-400">
          Preview Mode: Submitting will simulate the submission without sending data.
        </div>
      )}

      {submitError && (
        <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
          {submitError}
        </div>
      )}

      {/* Form Fields container */}
      <div className="relative z-10">
        {schema.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            This form has no fields yet.
          </div>
        ) : isMultiStep ? (
          <MultiStepForm
            fields={schema}
            values={values}
            onChange={handleFieldChange}
            errors={errors}
            setErrors={setErrors}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {schema.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  onChange={(val) => {
                    handleFieldChange(field.id, val);
                    if (errors[field.id]) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next[field.id];
                        return next;
                      });
                    }
                  }}
                  error={errors[field.id]}
                  disabled={isSubmitting}
                />
              ))}
            </div>

            <div className="pt-4 border-t border-blue-100/60">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-semibold shadow-md shadow-blue-500/10 py-6"
              >
                {isSubmitting ? "Submitting..." : "Submit Form"}
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-blue-100/50 flex items-center justify-center gap-1 relative z-10">
        <span className="text-[10px] text-slate-400">Powered by</span>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-extrabold text-slate-600 hover:text-blue-600 transition-colors"
        >
          Form<span className="text-blue-600">Flow</span>
        </a>
      </div>
    </div>
  );
}
