import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  href,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900/60 text-zinc-400 border border-zinc-800/80 mb-4 shadow-inner">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-200 mb-1">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && (onAction || href) && (
        <>
          {href ? (
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-md shadow-blue-600/10"
            >
              <a href={href}>{actionLabel}</a>
            </Button>
          ) : (
            <Button
              onClick={onAction}
              className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-md shadow-blue-600/10"
            >
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
