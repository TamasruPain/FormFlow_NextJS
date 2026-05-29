"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Type,
  Mail,
  Hash,
  FileText,
  ChevronDown,
  CheckSquare,
  CircleDot,
  Calendar,
  Upload,
} from "lucide-react";
import { FieldDefinition } from "@/types/form";
import { useBuilderStore } from "@/store/builderStore";

interface DraggableFieldProps {
  field: FieldDefinition;
}

export function DraggableField({ field }: DraggableFieldProps) {
  const selectedFieldId = useBuilderStore((state) => state.selectedFieldId);
  const selectField = useBuilderStore((state) => state.selectField);
  const removeField = useBuilderStore((state) => state.removeField);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSelected = selectedFieldId === field.id;

  const getFieldIcon = () => {
    switch (field.type) {
      case "text":
        return Type;
      case "email":
        return Mail;
      case "number":
        return Hash;
      case "textarea":
        return FileText;
      case "select":
        return ChevronDown;
      case "checkbox":
        return CheckSquare;
      case "radio":
        return CircleDot;
      case "date":
        return Calendar;
      case "file":
        return Upload;
      default:
        return Type;
    }
  };

  const Icon = getFieldIcon();

  const renderFieldPreview = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <input
            type="text"
            placeholder={field.placeholder || "Enter text..."}
            disabled
            className="w-full rounded-md border border-white/10 bg-white/10 px-2.5 py-1 h-8 text-xs text-white placeholder-white/40 cursor-not-allowed"
          />
        );
      case "date":
        return (
          <input
            type="date"
            disabled
            className="w-full rounded-md border border-white/10 bg-white/10 px-2.5 py-1 h-8 text-xs text-white placeholder-white/40 cursor-not-allowed"
          />
        );
      case "file":
        return (
          <div className="flex items-center gap-2 w-full rounded-md border border-white/10 bg-white/10 px-2.5 py-1 h-8 text-xs text-white/50 cursor-not-allowed">
            <Upload className="h-3 w-3 text-white/40 shrink-0" />
            <span className="truncate">{field.placeholder || "Upload PDF file..."}</span>
          </div>
        );
      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder || "Enter long text..."}
            disabled
            rows={1}
            className="w-full rounded-md border border-white/10 bg-white/10 px-2.5 py-1.5 h-8 text-xs text-white placeholder-white/40 cursor-not-allowed resize-none"
          />
        );
      case "select":
        return (
          <div className="relative">
            <select
              disabled
              className="w-full appearance-none rounded-md border border-white/10 bg-white/10 px-2.5 py-1 h-8 text-xs text-white cursor-not-allowed pr-8"
            >
              <option className="bg-blue-900 text-white">{field.placeholder || "Select option..."}</option>
              {(field.options || []).map((opt, i) => (
                <option key={i} className="bg-blue-900 text-white">{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-white/60" />
          </div>
        );
      case "checkbox":
        return (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {(field.options || []).map((opt, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  disabled
                  className="rounded border-white/20 bg-white/10 text-white focus:ring-white/20 h-3.5 w-3.5"
                />
                <span className="text-[11px] text-white/90">{opt}</span>
              </div>
            ))}
            {(field.options || []).length === 0 && (
              <span className="text-[10px] text-white/60 italic">No options defined</span>
            )}
          </div>
        );
      case "radio":
        return (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {(field.options || []).map((opt, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  type="radio"
                  disabled
                  className="border-white/20 bg-white/10 text-white focus:ring-white/20 h-3.5 w-3.5"
                />
                <span className="text-[11px] text-white/90">{opt}</span>
              </div>
            ))}
            {(field.options || []).length === 0 && (
              <span className="text-[10px] text-white/60 italic">No options defined</span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => selectField(field.id)}
      className={`group relative flex items-start gap-3 rounded-lg p-3 transition-all duration-300 select-none ${
        isDragging
          ? "opacity-50 border-none bg-gradient-to-br from-blue-600/90 via-sky-500/95 to-sky-400/90 shadow-2xl scale-[1.02] z-50"
          : isSelected
          ? "border-none bg-gradient-to-br from-blue-600/95 via-sky-500 to-sky-400/95 shadow-lg shadow-blue-500/10 ring-2 ring-white/60 scale-[1.01]"
          : "border-none bg-gradient-to-br from-blue-600/80 via-sky-500/85 to-sky-400/80 hover:from-blue-600/90 hover:via-sky-500/95 hover:to-sky-400/90"
      }`}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        className="mt-0.5 -ml-1 cursor-grab active:cursor-grabbing p-1 text-white/50 hover:text-white transition-colors rounded hover:bg-white/10"
        title="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>

      {/* Element content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Header row: Icon, Type, Label */}
        <div className="flex items-center justify-between gap-2 mr-6">
          <div className="flex items-center gap-1.5 min-w-0">
            <Icon className="h-3.5 w-3.5 text-white shrink-0" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-100 shrink-0">
              {field.type}
            </span>
            <span className="text-white/30 select-none">|</span>
            <span className="text-xs font-semibold text-white truncate">
              {field.label || "Untitled field"}
            </span>
            {field.required && (
              <span className="text-xs font-bold text-red-200" title="Required">
                *
              </span>
            )}
          </div>
        </div>

        {field.helpText && (
          <p className="text-[10px] text-blue-50 leading-none">{field.helpText}</p>
        )}

        {/* Input representation */}
        <div className="w-full select-none pointer-events-none">
          {renderFieldPreview()}
        </div>
      </div>

      {/* Delete button (hover state or active state) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeField(field.id);
        }}
        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white/80 hover:bg-white/25 hover:text-white transition-all cursor-pointer"
        title="Delete Field"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
