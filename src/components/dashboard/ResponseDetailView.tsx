"use client";

import React from "react";
import { FieldDefinition } from "@/types/form";
import { SubmissionResponse } from "@/types/response";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  X,
  Check,
  AlertTriangle,
  FileText,
  Download,
} from "lucide-react";
import Link from "next/link";

interface ResponseDetailViewProps {
  form: {
    id: string;
    title: string;
    description: string | null;
    schema: FieldDefinition[];
    isPublished: boolean;
  };
  response: SubmissionResponse;
}

// Simple Markdown Parser for AI insights
function renderMarkdown(md: string | null) {
  if (!md) return <span className="text-zinc-500 italic">No analysis available.</span>;

  let html = md;
  // Headers
  html = html.replace(/### (.*?)(?:\n|$)/g, '<h4 class="text-sm font-bold text-zinc-200 mt-4 mb-2 tracking-wide uppercase">$1</h4>');
  html = html.replace(/## (.*?)(?:\n|$)/g, '<h3 class="text-base font-bold text-zinc-100 mt-5 mb-3">$1</h3>');
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-blue-400">$1</strong>');
  // Bullet lists
  html = html.replace(/-\s+(.*?)(?:\n|$)/g, '<li class="text-sm text-zinc-300 ml-5 list-disc py-1">$1</li>');
  
  // Convert rest to paragraphs
  const paragraphs = html.split("\n\n").map((chunk) => {
    if (chunk.trim().startsWith("<li") || chunk.trim().startsWith("<h")) {
      return chunk;
    }
    return `<p class="text-sm text-zinc-300 leading-relaxed mb-3">${chunk}</p>`;
  });

  return (
    <div
      dangerouslySetInnerHTML={{ __html: paragraphs.join("") }}
      className="space-y-1 text-left prose prose-invert max-w-none"
    />
  );
}

// Helper to get sentiment badge color
const getSentimentDetails = (insight: string | null) => {
  if (!insight) return { label: "N/A", color: "bg-zinc-800 text-zinc-300 border-zinc-700/50" };
  const text = insight.toLowerCase();
  
  if (text.includes("positive")) {
    return { label: "Positive", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
  }
  if (text.includes("negative")) {
    return { label: "Negative", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
  }
  return { label: "Neutral", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
};

export function ResponseDetailView({ form, response }: ResponseDetailViewProps) {
  const { schema } = form;

  const submitterName = (() => {
    const nameField = schema.find(
      (f) =>
        (f.type === "text" || f.type === "email") &&
        /name|user|full\s*name|first\s*name/i.test(f.label)
    );
    return nameField && response.data[nameField.id]
      ? String(response.data[nameField.id])
      : null;
  })();

  const sentiment = getSentimentDetails(response.aiInsight);

  // Close dynamic tab helper
  const handleCloseTab = () => {
    if (typeof window !== "undefined") {
      window.close();
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-400">
            <Link
              href={`/forms/${form.id}/responses`}
              className="inline-flex items-center text-zinc-400 hover:text-white transition duration-200"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              All Responses
            </Link>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-500">Submission Details</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            {submitterName ? `Submission from ${submitterName}` : `Submission ${response.id.slice(0, 8)}`}
          </h1>
          <p className="text-sm text-zinc-400">
            Form: <span className="text-zinc-300 font-semibold">{form.title}</span> • Submitted on <span suppressHydrationWarning>{new Date(response.createdAt).toLocaleString()}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleCloseTab}
            variant="outline"
            className="border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900/60"
          >
            <X className="mr-2 h-4 w-4" />
            Close Tab
          </Button>
        </div>
      </div>

      {/* Main Grid containing the two boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Box 1: Submitted Form Data (Properly Displayed) */}
        <Card className="border border-zinc-800 bg-zinc-950/20 p-6 md:p-8 flex flex-col space-y-6 shadow-xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800/80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Submitted Form Data</h2>
              <p className="text-xs text-zinc-500">All input answers submitted by the responder</p>
            </div>
          </div>

          <div className="space-y-5 overflow-y-auto max-h-[550px] pr-2 custom-scrollbar">
            {schema.map((field) => {
              const val = response.data[field.id];
              let displayVal = <span className="text-zinc-500 italic">No Answer Provided</span>;

              if (val !== undefined && val !== null && val !== "") {
                if (Array.isArray(val)) {
                  displayVal = (
                    <div className="flex flex-wrap gap-1.5">
                      {val.map((item) => (
                        <Badge
                          key={item}
                          variant="secondary"
                          className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2.5 py-0.5 font-medium rounded-md"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  );
                } else if (typeof val === "boolean") {
                  displayVal = (
                    <span className="text-zinc-200 text-sm font-semibold">
                      {val ? "Yes (Checked)" : "No (Unchecked)"}
                    </span>
                  );
                } else if (typeof val === "object" && val !== null && "base64" in val) {
                  const fileObj = val as { name: string; size: number; type: string; base64: string };
                  displayVal = (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 w-full animate-in fade-in duration-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-zinc-100 block truncate max-w-[200px] sm:max-w-[280px]">
                            {fileObj.name}
                          </span>
                          <span className="text-xs text-zinc-500 block">
                            PDF Document • {(fileObj.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                      <a
                        href={fileObj.base64}
                        download={fileObj.name}
                        className="inline-flex items-center gap-1.5 justify-center rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-semibold text-white transition duration-200 w-fit shrink-0 cursor-pointer shadow-md shadow-blue-500/15"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    </div>
                  );
                } else {
                  displayVal = (
                    <span className="text-zinc-100 text-sm md:text-base font-medium whitespace-pre-wrap leading-relaxed">
                      {String(val)}
                    </span>
                  );
                }
              }

              return (
                <div
                  key={field.id}
                  className="p-5 rounded-xl border border-zinc-800/60 bg-zinc-950/30 text-left space-y-2 hover:border-zinc-700/60 transition duration-150"
                >
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    {field.label}
                  </label>
                  <div className="pt-1">{displayVal}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Box 2: AI Summary & Input Key Points */}
        <Card className="border border-zinc-800 bg-zinc-950/20 p-6 md:p-8 flex flex-col space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">AI Insights & Key Points</h2>
                <p className="text-xs text-zinc-500">Inputs synthesis and semantic evaluation</p>
              </div>
            </div>
            {response.status === "analyzed" && (
              <Badge
                variant="outline"
                className={`text-xs font-bold tracking-wide uppercase border px-2.5 py-0.5 rounded-full ${sentiment.color}`}
              >
                {sentiment.label} Sentiment
              </Badge>
            )}
          </div>

          <div className="space-y-6 overflow-y-auto max-h-[550px] pr-2 custom-scrollbar">
            {/* Subsection A: Inputs Key Points */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Inputs Key Points
              </h3>
              
              <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-4 space-y-3 text-left">
                {schema.map((field) => {
                  const val = response.data[field.id];
                  if (val === undefined || val === null || val === "") return null;

                  let formattedVal = "";
                  if (Array.isArray(val)) {
                    formattedVal = val.join(", ");
                  } else if (typeof val === "boolean") {
                    formattedVal = val ? "Yes" : "No";
                  } else if (typeof val === "object" && val !== null && "name" in val) {
                    const fileObj = val as { name: string; size: number };
                    formattedVal = `${fileObj.name} (${(fileObj.size / 1024 / 1024).toFixed(2)} MB)`;
                  } else {
                    formattedVal = String(val);
                  }

                  // Truncate long texts for keypoint view
                  if (formattedVal.length > 80) {
                    formattedVal = formattedVal.slice(0, 77) + "...";
                  }

                  return (
                    <div key={field.id} className="flex items-start gap-2 text-xs">
                      <span className="text-blue-400 font-bold mt-0.5">•</span>
                      <div className="flex-1">
                        <span className="font-semibold text-zinc-400">{field.label}:</span>{" "}
                        <span className="text-zinc-200 font-medium">{formattedVal}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subsection B: AI Summary based on inputs */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                AI Summary & Actionables
              </h3>

              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/60 shadow-inner min-h-[150px] flex flex-col justify-center">
                {response.status === "analyzed" ? (
                  <div className="text-left text-sm leading-relaxed">
                    {renderMarkdown(response.aiInsight)}
                  </div>
                ) : response.status === "pending" ? (
                  <div className="text-center py-8 text-zinc-500 space-y-3">
                    <Sparkles className="mx-auto h-6 w-6 text-blue-400 animate-spin" />
                    <p className="text-xs">
                      Analysis is in queue. The system is synthesizing response patterns...
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-rose-400 space-y-3">
                    <AlertTriangle className="mx-auto h-6 w-6" />
                    <p className="text-xs">
                      AI analysis failed. Please verify API configurations or retry.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
