"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useBuilderStore } from "@/store/builderStore";
import { FieldPalette } from "./FieldPalette";
import { FormCanvas } from "./FormCanvas";
import { FieldEditor } from "./FieldEditor";
import { BuilderToolbar } from "./BuilderToolbar";
import { FieldType, FieldDefinition } from "@/types/form";
import { Sparkles, GripVertical, FileText, Plus, Settings } from "lucide-react";

interface FormBuilderClientProps {
  initialForm?: {
    id: string;
    title: string;
    description: string | null;
    isMultiStep: boolean;
    isPublished: boolean;
    schema: FieldDefinition[]; // FormSchema JSON
  };
}

export function FormBuilderClient({ initialForm }: FormBuilderClientProps) {
  const router = useRouter();
  // Zustand Actions
  const setForm = useBuilderStore((state) => state.setForm);
  const title = useBuilderStore((state) => state.title);
  const description = useBuilderStore((state) => state.description);
  const isMultiStep = useBuilderStore((state) => state.isMultiStep);
  const isPublished = useBuilderStore((state) => state.isPublished);
  const fields = useBuilderStore((state) => state.fields);
  const addField = useBuilderStore((state) => state.addField);
  const reorderFields = useBuilderStore((state) => state.reorderFields);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);
  const resetStore = useBuilderStore((state) => state.reset);
  const selectedFieldId = useBuilderStore((state) => state.selectedFieldId);

  // Mobile Workspace States & Ref
  const [activeTab, setActiveTab] = useState<"canvas" | "palette" | "editor">("canvas");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const ignoreNextSelectionChangeRef = useRef(false);

  // Auto-switch tabs to "editor" when a field is selected on mobile viewports
  useEffect(() => {
    if (ignoreNextSelectionChangeRef.current) {
      ignoreNextSelectionChangeRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (selectedFieldId) {
        setActiveTab("editor");
      } else {
        if (activeTab === "editor") {
          setActiveTab("canvas");
        }
      }
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFieldId]);

  const handlePaletteAddField = (type: FieldType) => {
    ignoreNextSelectionChangeRef.current = true;
    addField(type);
    setActiveTab("canvas");
  };

  // Initialize store with server-fetched data if edit mode
  useEffect(() => {
    if (initialForm) {
      setForm({
        title: initialForm.title,
        description: initialForm.description,
        isMultiStep: initialForm.isMultiStep,
        isPublished: initialForm.isPublished,
        schema: (initialForm.schema as FieldDefinition[]) || [],
      });
    } else {
      resetStore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialForm?.id]);

  // Premium Keyboard Shortcuts: Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (cmdKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if (cmdKey && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // Drag-and-drop state
  const [activePaletteDrag, setActivePaletteDrag] = useState<FieldType | null>(
    null
  );
  const [activeFieldDrag, setActiveFieldDrag] = useState<FieldDefinition | null>(
    null
  );

  // Activation constraint prevents accidental drag starts on clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id.toString();

    if (activeId.startsWith("palette-")) {
      const type = activeId.replace("palette-", "") as FieldType;
      setActivePaletteDrag(type);
    } else {
      const field = fields.find((f) => f.id === activeId);
      if (field) {
        setActiveFieldDrag(field);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePaletteDrag(null);
    setActiveFieldDrag(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // 1. Dragging element from left palette into canvas
    if (activeId.startsWith("palette-")) {
      const type = activeId.replace("palette-", "") as FieldType;

      if (overId === "form-canvas") {
        addField(type);
      } else {
        const index = fields.findIndex((f) => f.id === overId);
        if (index !== -1) {
          addField(type, index);
        }
      }
    }
    // 2. Reordering fields inside canvas
    else {
      if (activeId !== overId) {
        reorderFields(activeId, overId);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const url = initialForm ? `/api/forms/${initialForm.id}` : "/api/forms";
      const method = initialForm ? "PATCH" : "POST";
      const payload = {
        title,
        description,
        isMultiStep,
        isPublished,
        schema: fields,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      const savedForm = await res.json();
      setSaveStatus("success");

      // Auto-hide success state after 2 seconds
      setTimeout(() => setSaveStatus("idle"), 2000);

      if (!initialForm) {
        // Redirect to edit page
        router.push(`/forms/${savedForm.id}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100 relative">
        {/* Save Status Notification overlay */}
        {saveStatus === "success" && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 rounded-full border border-emerald-500/20 bg-emerald-950/80 px-4 py-2 text-xs font-semibold text-emerald-400 backdrop-blur-md shadow-lg shadow-emerald-500/5 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
            Form saved successfully!
          </div>
        )}
        {saveStatus === "error" && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 rounded-full border border-red-500/20 bg-red-950/80 px-4 py-2 text-xs font-semibold text-red-400 backdrop-blur-md shadow-lg shadow-red-500/5 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
            Error saving form. Please try again.
          </div>
        )}

        {/* Toolbar */}
        <BuilderToolbar
          onSave={handleSave}
          isSaving={isSaving}
          onBack={handleBack}
        />
        {/* Main Work Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Elements Palette */}
          <aside className={`w-full lg:w-80 shrink-0 border-r border-zinc-900 bg-zinc-950/50 backdrop-blur-xl lg:block ${
            activeTab === "palette" ? "block" : "hidden"
          }`}>
            <FieldPalette onAddField={handlePaletteAddField} />
          </aside>

          {/* Form Canvas (Center) */}
          <main className={`flex-1 overflow-y-auto lg:block ${
            activeTab === "canvas" ? "block" : "hidden"
          }`}>
            <FormCanvas 
              fields={fields} 
              onOpenPalette={() => setActiveTab("palette")}
            />
          </main>

          {/* Field Properties Editor (Right) */}
          <aside className={`w-full lg:w-80 shrink-0 border-l border-blue-500/10 bg-blue-500/5 backdrop-blur-xl lg:block ${
            activeTab === "editor" ? "block" : "hidden"
          }`}>
            <FieldEditor onGoToCanvas={() => setActiveTab("canvas")} />
          </aside>
        </div>

        {/* Mobile bottom tab switcher */}
        <div className="lg:hidden border-t border-zinc-900 bg-zinc-950/80 px-4 py-2.5 backdrop-blur-md flex items-center justify-around z-20">
          {[
            { id: "canvas" as const, label: "Canvas", icon: FileText },
            { id: "palette" as const, label: "Add Element", icon: Plus },
            { id: "editor" as const, label: "Configure", icon: Settings },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "text-blue-400 bg-blue-500/10 border border-blue-500/20 shadow-md shadow-blue-500/5 scale-105"
                    : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                }`}
              >
                <TabIcon className="h-4.5 w-4.5" />
                <span className="text-[10px] font-semibold tracking-wide">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Drag Overlay for smooth sliding animations */}
        <DragOverlay dropAnimation={null}>
          {activePaletteDrag && (
            <div className="flex items-center gap-2 rounded-lg border-none bg-gradient-to-br from-blue-600/90 via-sky-500/95 to-sky-400/90 px-3 py-2 shadow-2xl scale-[1.05] opacity-90 cursor-grabbing select-none text-white z-50">
              <Sparkles className="h-4 w-4 text-white animate-pulse" />
              <div className="text-left">
                <span className="block text-[9px] uppercase font-bold text-blue-50 leading-none mb-0.5">
                  Adding Field
                </span>
                <h4 className="text-xs font-semibold text-white leading-none">
                  {activePaletteDrag}
                </h4>
              </div>
            </div>
          )}

          {activeFieldDrag && (
            <div className="flex items-center gap-2 rounded-lg border-none bg-gradient-to-br from-blue-600/90 via-sky-500/95 to-sky-400/90 p-3 shadow-2xl scale-[1.03] opacity-90 cursor-grabbing select-none text-white w-[calc(100vw-32px)] sm:w-[380px] z-50">
              <GripVertical className="h-3.5 w-3.5 text-white/80 shrink-0" />
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-100 shrink-0">
                  {activeFieldDrag.type}
                </span>
                <span className="text-white/30 select-none">|</span>
                <span className="text-xs font-semibold text-white truncate">
                  {activeFieldDrag.label || "Untitled field"}
                </span>
              </div>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
