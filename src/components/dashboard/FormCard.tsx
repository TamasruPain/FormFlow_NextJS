"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  MessageSquare,
  Eye,
  Settings,
  Trash2,
  Copy,
} from "lucide-react";

import { useToastStore } from "@/store/toastStore";

interface FormCardProps {
  id: string;
  title: string;
  description?: string | null;
  isPublished: boolean;
  responsesCount: number;
  createdAt: Date;
  onDelete?: (id: string) => void;
}

export function FormCard({
  id,
  title,
  description,
  isPublished,
  responsesCount,
  createdAt,
  onDelete,
}: FormCardProps) {
  const { showToast } = useToastStore();

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleCopyEmbed = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const embedUrl = `${window.location.origin}/embed/${id}`;
    navigator.clipboard.writeText(embedUrl);
    showToast("Embed URL copied to clipboard!", "success");
  };

  return (
    <Card className="group relative flex flex-col sm:flex-row sm:items-center justify-between overflow-hidden border-sky-500/15 bg-gradient-to-br from-zinc-900 via-zinc-950 to-sky-950/25 backdrop-blur-md transition-all duration-300 shadow-sm shadow-sky-400 hover:border-sky-400/30 hover:shadow-md hover:shadow-sky-200 p-4 gap-4">
      
      {/* Visual background highlight on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-sky-500/0 to-sky-500/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

      <div className="">

        {/* Left content area */}
        <div className="flex flex-1 items-start gap-3 min-w-0 mb-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600/90 via-sky-500/95 to-sky-400/90 text-white shadow-inner transition-transform duration-300 group-hover:scale-[1.05] mt-0.5">
            <FileText className="h-4.5 w-4.5" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white line-clamp-1 transition-colors duration-300">
                {title}
              </h3>
              <Badge
                variant={isPublished ? "default" : "secondary"}
                className={
                  isPublished
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0 h-4.5 leading-none shrink-0 absolute right-2 top-2"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700/50 text-[10px] px-1.5 py-0 h-4.5 leading-none shrink-0 absolute right-2 top-2"
                }
              >
                {isPublished ? "Published" : "Draft"}
              </Badge>
            </div>

            <p className="text-xs text-zinc-400 line-clamp-1 leading-relaxed">
              {description || "No description provided."}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 font-medium pt-0.5">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-zinc-400" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-zinc-400" />
                <span>{responsesCount} responses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right actions area */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0 self-end sm:self-center">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs text-zinc-300 border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:text-white transition-all duration-200"
          >
            <Link href={`/forms/${id}`}>
              <Settings className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
              Edit
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs text-zinc-300 border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:text-white transition-all duration-200"
          >
            <Link href={`/forms/${id}/responses`}>
              <Eye className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
              Insights
            </Link>
          </Button>

          <Button
            onClick={handleCopyEmbed}
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs text-zinc-300 border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:text-white transition-all duration-200"
          >
            <Copy className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
            Share
          </Button>

          {onDelete && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(id);
              }}
              variant="outline"
              size="icon"
              className="h-8 w-8 text-red-400 border-zinc-800 bg-zinc-950 hover:bg-red-950/30 hover:border-red-900/30 hover:text-red-300 transition-all duration-200"
              title="Delete Form"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
