"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Type,
  Mail,
  Hash,
  FileText,
  ChevronDown,
  CheckSquare,
  CircleDot,
  Calendar,
  Plus,
} from "lucide-react";
import { FieldType } from "@/types/form";
import { useBuilderStore } from "@/store/builderStore";

interface PaletteItem {
  type: FieldType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: "text",
    label: "Short Text",
    description: "Single line input for name, title, etc.",
    icon: Type,
  },
  {
    type: "email",
    label: "Email Address",
    description: "Validated email input.",
    icon: Mail,
  },
  {
    type: "number",
    label: "Number",
    description: "Numeric input with min/max support.",
    icon: Hash,
  },
  {
    type: "textarea",
    label: "Long Text",
    description: "Multi-line text area for feedback, bio, etc.",
    icon: FileText,
  },
  {
    type: "select",
    label: "Dropdown Select",
    description: "Option select from a dropdown list.",
    icon: ChevronDown,
  },
  {
    type: "checkbox",
    label: "Checkboxes",
    description: "Select one or more options.",
    icon: CheckSquare,
  },
  {
    type: "radio",
    label: "Multiple Choice",
    description: "Single option select from list.",
    icon: CircleDot,
  },
  {
    type: "date",
    label: "Date Picker",
    description: "Calendar selector for dates.",
    icon: Calendar,
  },
];

export function FieldPalette({ onAddField }: { onAddField?: (type: FieldType) => void }) {
  const addField = useBuilderStore((state) => state.addField);

  const handleAdd = (type: FieldType) => {
    if (onAddField) {
      onAddField(type);
    } else {
      addField(type);
    }
  };

  return (
    <div className="flex h-full flex-col border-r border-zinc-900 bg-zinc-950/50 p-5 backdrop-blur-xl">
      <div className="mb-4">
        <h3 className="text-md font-semibold text-zinc-100">Form Elements</h3>
        <p className="text-[11px] text-zinc-400">
          Click to add or drag into the canvas.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid gap-2 grid-cols-2">
          {PALETTE_ITEMS.map((item) => (
            <DraggablePaletteButton
              key={item.type}
              item={item}
              onAdd={() => handleAdd(item.type)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DraggablePaletteButton({
  item,
  onAdd,
}: {
  item: PaletteItem;
  onAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${item.type}`,
      data: {
        type: item.type,
        isPaletteItem: true,
      },
    });

  // Keep element in place visually while dragging, dnd-kit will handle the drag overlay
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const Icon = item.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (isDragging) return;
        onAdd();
      }}
      className={`group relative flex flex-col items-center justify-center rounded-lg border-none bg-gradient-to-br from-blue-600/90 via-sky-500/95 to-sky-400/90 p-2.5 text-center text-white transition-all duration-200 hover:shadow-md hover:shadow-blue-500/15 hover:translate-y-[-1px] cursor-grab active:cursor-grabbing select-none h-[72px] ${
        isDragging ? "opacity-40" : ""
      }`}
      title={item.description}
    >
      <Icon className="h-4.5 w-4.5 text-blue-50 group-hover:text-white mb-1.5 transition-colors duration-200" />
      <span className="text-[11px] font-medium text-blue-50 group-hover:text-white leading-none">
        {item.label}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded bg-white/15 backdrop-blur-sm text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-white/30 border border-white/20 transition-all cursor-pointer"
        title="Add to form"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
