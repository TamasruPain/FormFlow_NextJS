"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { FieldDefinition } from "@/types/form";
import { SubmissionResponse } from "@/types/response";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Search,
  MessageSquare,
  Sparkles,
  ListFilter,
  Check,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useToastStore } from "@/store/toastStore";

interface ResponsesClientProps {
  form: {
    id: string;
    title: string;
    description: string | null;
    schema: FieldDefinition[];
    isPublished: boolean;
  };
  responses: SubmissionResponse[];
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

export function ResponsesClient({ form, responses }: ResponsesClientProps) {
  const { title, schema } = form;

  const [activeTab, setActiveTab] = useState<"table" | "ai">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentResponses, setCurrentResponses] = useState(responses);
  const [prevResponses, setPrevResponses] = useState(responses);
  const { showToast } = useToastStore();
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const activePollsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Sync state with props in render pass instead of useEffect
  if (responses !== prevResponses) {
    setPrevResponses(responses);
    setCurrentResponses(responses);
  }

  // Clean up all active polls on unmount
  useEffect(() => {
    const activePolls = activePollsRef.current;
    return () => {
      Object.values(activePolls).forEach(clearInterval);
    };
  }, []);

  // Poll for individual response status updates
  const startPolling = useCallback((responseId: string) => {
    if (activePollsRef.current[responseId]) {
      clearInterval(activePollsRef.current[responseId]);
    }

    activePollsRef.current[responseId] = setInterval(async () => {
      try {
        const checkRes = await fetch(`/api/forms/${form.id}/responses/${responseId}`);
        if (checkRes.ok) {
          const data = await checkRes.json();
          
          setCurrentResponses(prev =>
            prev.map(r => (r.id === responseId ? { ...r, status: data.status, aiInsight: data.aiInsight } : r))
          );

          if (data.status === "analyzed" || data.status === "failed") {
            if (activePollsRef.current[responseId]) {
              clearInterval(activePollsRef.current[responseId]);
              delete activePollsRef.current[responseId];
            }
            setLoadingIds(prev => ({ ...prev, [responseId]: false }));

            if (data.status === "analyzed") {
              showToast("AI Insights regenerated successfully!", "success");
            } else {
              showToast("AI Insights regeneration failed.", "error");
            }
          }
        }
      } catch (err) {
        console.error("Polling error for response ID:", responseId, err);
      }
    }, 3000);
  }, [form.id, showToast]);

  // Start regeneration handler
  const handleRegenerate = async (responseId: string) => {
    if (loadingIds[responseId] || currentResponses.find(r => r.id === responseId)?.status === "pending") return;

    setLoadingIds(prev => ({ ...prev, [responseId]: true }));
    
    // Set status to pending locally
    setCurrentResponses(prev =>
      prev.map(r => (r.id === responseId ? { ...r, status: "pending", aiInsight: null } : r))
    );

    try {
      const res = await fetch(`/api/forms/${form.id}/responses/${responseId}`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to trigger regeneration");
      }

      showToast("Regeneration started...", "info");
      startPolling(responseId);
    } catch (err) {
      console.error(err);
      showToast("Failed to start regeneration.", "error");
      setLoadingIds(prev => ({ ...prev, [responseId]: false }));
      
      const original = responses.find(r => r.id === responseId);
      if (original) {
        setCurrentResponses(prev =>
          prev.map(r => (r.id === responseId ? original : r))
        );
      }
    }
  };

  // Auto-start polling for any initially pending responses
  useEffect(() => {
    responses.forEach(r => {
      if (r.status === "pending" && !activePollsRef.current[r.id]) {
        setLoadingIds(prev => ({ ...prev, [r.id]: true }));
        startPolling(r.id);
      }
    });
  }, [responses, startPolling]);

  // Filter responses by search query
  const filteredResponses = useMemo(() => {
    if (!searchQuery) return currentResponses;
    const query = searchQuery.toLowerCase();
    return currentResponses.filter((res) => {
      // Check response data
      const dataMatch = Object.values(res.data).some((val) =>
        String(val).toLowerCase().includes(query)
      );
      // Check AI insight
      const insightMatch = res.aiInsight?.toLowerCase().includes(query) || false;
      return dataMatch || insightMatch;
    });
  }, [currentResponses, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = currentResponses.length;
    const analyzed = currentResponses.filter((r) => r.status === "analyzed").length;
    const pending = currentResponses.filter((r) => r.status === "pending").length;

    // Detect positive sentiment counts
    let positiveCount = 0;
    currentResponses.forEach((r) => {
      if (r.aiInsight && /positive/i.test(r.aiInsight)) {
        positiveCount++;
      }
    });

    const positivePercent = analyzed > 0 ? Math.round((positiveCount / analyzed) * 100) : 0;

    return { total, analyzed, pending, positivePercent };
  }, [currentResponses]);

  // Export to CSV Function
  const exportToCSV = () => {
    if (currentResponses.length === 0) return;

    // Headings
    const csvHeaders = ["Submission ID", "Date", ...schema.map((f) => f.label), "AI Sentiment/Insight"];

    // Rows
    const csvRows = currentResponses.map((res) => {
      const date = new Date(res.createdAt).toLocaleString();
      
      const answers = schema.map((field) => {
        const val = res.data[field.id];
        if (Array.isArray(val)) return `"${val.join(", ")}"`;
        if (typeof val === "boolean") return val ? "Yes" : "No";
        if (typeof val === "object" && val !== null && "name" in val) return `"${(val as unknown as { name?: string }).name || ""}"`;
        return `"${String(val || "").replace(/"/g, '""')}"`;
      });

      const insightSummary = res.aiInsight
        ? `"${res.aiInsight.replace(/"/g, '""').replace(/\n/g, " ")}"`
        : "N/A";

      return [res.id, date, ...answers, insightSummary].join(",");
    });

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `responses_${form.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  return (
    <div className="space-y-8 relative">
      {/* Top Banner and Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/forms"
            className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-white transition duration-200"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Forms
          </Link>
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-sm text-zinc-400">Manage responses and AI analytics.</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={exportToCSV}
            disabled={responses.length === 0}
            variant="outline"
            className="border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900/60"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Responses */}
        <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-blue-600/90 via-sky-500/95 to-sky-400/90 p-3.5 text-white shadow-md shadow-blue-500/[0.08] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-blue-500/20">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm text-white border border-white/20 shadow-inner">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold text-blue-50 uppercase tracking-wider block">Total Responses</span>
              <span className="text-2xl font-extrabold tracking-tight text-white block mt-0.5">{stats.total}</span>
            </div>
          </div>
        </Card>

        {/* AI Analyzed */}
        <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-blue-600/90 via-sky-500/95 to-sky-400/90 p-3.5 text-white shadow-md shadow-blue-500/[0.08] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-blue-500/20">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm text-white border border-white/20 shadow-inner">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold text-blue-50 uppercase tracking-wider block">AI Analyzed</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold tracking-tight text-white">{stats.analyzed}</span>
                <span className="text-[10px] font-medium text-blue-100">of {stats.total}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Analysis Queue */}
        <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-blue-600/90 via-sky-500/95 to-sky-400/90 p-3.5 text-white shadow-md shadow-blue-500/[0.08] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-blue-500/20">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm text-white border border-white/20 shadow-inner">
              <ListFilter className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold text-blue-50 uppercase tracking-wider block">Analysis Queue</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold tracking-tight text-white">{stats.pending}</span>
                <span className="text-[10px] font-medium text-blue-100">pending</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Positive Sentiment */}
        <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-blue-600/90 via-sky-500/95 to-sky-400/90 p-3.5 text-white shadow-md shadow-blue-500/[0.08] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-blue-500/20">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm text-white border border-white/20 shadow-inner">
              <Check className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold text-blue-50 uppercase tracking-wider block">Positive Sentiment</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold tracking-tight text-white">{stats.positivePercent}%</span>
                <span className="text-[10px] font-medium text-blue-100">by AI</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Menu & Search bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("table")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition duration-200 ${
              activeTab === "table"
                ? "bg-zinc-900 text-white border border-zinc-800"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Submissions ({filteredResponses.length})
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition duration-200 flex items-center gap-1.5 ${
              activeTab === "ai"
                ? "bg-zinc-900 text-white border border-zinc-800"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            AI Analytics Board
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search answers or insights..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-950/60 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition duration-200"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {responses.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/10">
          <MessageSquare className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-bold text-zinc-300">No responses yet</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            Once users start filling out this form, their submissions and AI-powered insights will appear here.
          </p>
        </div>
      ) : activeTab === "table" ? (
        /* Submissions Table */
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/40 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-4 px-6">Date</th>
                {schema.slice(0, 4).map((f) => (
                  <th key={f.id} className="py-4 px-6 max-w-[150px] truncate">
                    {f.label}
                  </th>
                ))}
                <th className="py-4 px-6">AI Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm text-zinc-300">
              {filteredResponses.map((res) => {
                const sentiment = getSentimentDetails(res.aiInsight);
                return (
                  <tr
                    key={res.id}
                    className="hover:bg-zinc-900/10 transition duration-150 cursor-pointer"
                    onClick={() => window.open(`/forms/${form.id}/responses/${res.id}`, "_blank")}
                  >
                    <td className="py-4 px-6 whitespace-nowrap text-zinc-400" suppressHydrationWarning>
                      {new Date(res.createdAt).toLocaleDateString()}{" "}
                      <span className="text-xs opacity-60" suppressHydrationWarning>
                        {new Date(res.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    {schema.slice(0, 4).map((field) => {
                      const val = res.data[field.id];
                      let displayVal = "N/A";
                      if (val !== undefined && val !== null && val !== "") {
                        if (Array.isArray(val)) {
                          displayVal = val.join(", ");
                        } else if (typeof val === "object" && val !== null && "name" in val) {
                           displayVal = (val as unknown as { name?: string }).name || "N/A";
                        } else {
                          displayVal = String(val);
                        }
                      }
                      return (
                        <td
                          key={field.id}
                          className="py-4 px-6 max-w-[150px] truncate text-zinc-200"
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {res.status === "analyzed" ? (
                        <Badge
                          variant="outline"
                          className={`text-xs border px-2.5 py-0.5 rounded-full ${sentiment.color}`}
                        >
                          {sentiment.label}
                        </Badge>
                      ) : res.status === "pending" ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20 px-2.5 py-0.5 rounded-full animate-pulse"
                        >
                          Pending
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs bg-rose-500/10 text-rose-400 border-rose-500/20 px-2.5 py-0.5 rounded-full"
                        >
                          Failed
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRegenerate(res.id)}
                        disabled={loadingIds[res.id] || res.status === "pending"}
                        className="h-7 rounded-md px-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 bg-zinc-950/20 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3 w-3 ${loadingIds[res.id] || res.status === "pending" ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline ml-1">Regenerate</span>
                      </Button>

                      <Link
                        href={`/forms/${form.id}/responses/${res.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-xs font-semibold px-3 py-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/5 transition duration-200"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* AI Analytics board */
        <div className="grid gap-6 md:grid-cols-2">
          {filteredResponses
            .filter((r) => r.status === "analyzed" && r.aiInsight)
            .map((res) => {
              const sentiment = getSentimentDetails(res.aiInsight);
              return (
                <Card
                  key={res.id}
                  onClick={() => window.open(`/forms/${form.id}/responses/${res.id}`, "_blank")}
                  className="p-6 border-zinc-800 bg-zinc-950/40 backdrop-blur-xl hover:border-zinc-700 transition duration-200 cursor-pointer space-y-4 text-left"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500" suppressHydrationWarning>
                        {new Date(res.createdAt).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className={`text-xs border ${sentiment.color}`}>
                        {sentiment.label}
                      </Badge>
                    </div>
                    <Sparkles className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="line-clamp-6 text-zinc-300 overflow-hidden">
                    {renderMarkdown(res.aiInsight)}
                  </div>
                  <div className="pt-2 flex justify-end">
                    <span className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      Read full analysis →
                    </span>
                  </div>
                </Card>
              );
            })}
          {responses.filter((r) => r.status === "analyzed").length === 0 && (
            <div className="col-span-2 text-center py-12 text-zinc-500">
              <Sparkles className="mx-auto h-8 w-8 text-zinc-700 mb-2" />
              <span>No AI insights generated yet. Verify your OpenRouter settings.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
