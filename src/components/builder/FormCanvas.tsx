"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FormSchema, FieldDefinition } from "@/types/form";
import { DraggableField } from "./DraggableField";
import { ArrowDownToLine, Sparkles, Wand2, Plus } from "lucide-react";
import { useBuilderStore } from "@/store/builderStore";

interface FormCanvasProps {
  fields: FieldDefinition[];
  onOpenPalette?: () => void;
}

export function FormCanvas({ fields, onOpenPalette }: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "form-canvas",
  });

  const title = useBuilderStore((state) => state.title);
  const description = useBuilderStore((state) => state.description);
  const setTitle = useBuilderStore((state) => state.setTitle);
  const setDescription = useBuilderStore((state) => state.setDescription);

  return (
    <div className="flex h-full flex-col bg-zinc-900/10 p-4 md:p-6">
      {/* Form Details Header */}
      <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950/30 p-4 backdrop-blur-sm space-y-2 group/canvas-header">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Form"
            className="bg-transparent text-lg font-bold text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-0 w-full border-b border-transparent hover:border-zinc-800 focus:border-blue-500 transition-colors"
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Form Description (Click to add description...)"
          rows={2}
          className="bg-transparent text-xs text-zinc-400 placeholder-zinc-600 focus:outline-none focus:ring-0 w-full border-b border-transparent hover:border-zinc-800 focus:border-blue-500 transition-colors resize-none leading-relaxed"
        />
      </div>

      {/* Drop Zone / Canvas Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl border border-dashed p-4 transition-all duration-300 overflow-y-auto ${
          isOver
            ? "border-blue-500 bg-blue-950/20 shadow-inner shadow-blue-500/10 scale-[0.99]"
            : fields.length === 0
            ? "border-zinc-800 bg-zinc-950/20 hover:border-zinc-700"
            : "border-transparent bg-transparent"
        }`}
      >
        {fields.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-zinc-900 p-4 text-zinc-500 mb-4 border border-zinc-800 relative">
              <ArrowDownToLine className={`h-6 w-6 text-zinc-400 transition-transform duration-300 ${isOver ? "translate-y-1 text-blue-400" : ""}`} />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <h3 className="text-md font-semibold text-zinc-200">
              Your Form Canvas is Empty
            </h3>
            <p className="mt-1.5 text-xs text-zinc-500 max-w-sm leading-relaxed">
              Drag elements from the left side bar and drop them here, or simply click on them to populate your form workflow.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-full border border-blue-500/10 bg-blue-950/20 px-4 py-1.5 text-[10px] font-medium text-blue-400">
              <Wand2 className="h-3 w-3" />
              Supported field types: Text, Date, Choices & Dropdowns
            </div>
            {onOpenPalette && (
              <button
                onClick={onOpenPalette}
                className="lg:hidden mt-5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-md shadow-blue-500/15 flex items-center gap-1.5 animate-pulse"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Form Element
              </button>
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-2.5">
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field) => (
                <DraggableField key={field.id} field={field} />
              ))}
            </SortableContext>

            {/* Drop Indicator placeholder when dragging item over empty space */}
            {isOver && (
              <div className="h-16 rounded-xl border border-dashed border-blue-500/50 bg-blue-950/20 animate-pulse flex items-center justify-center">
                <span className="text-xs text-blue-400 font-medium">Drop here...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
