"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, Sparkles, ChevronLeft } from "lucide-react";
import { useBuilderStore } from "@/store/builderStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FieldEditor({ onGoToCanvas }: { onGoToCanvas?: () => void }) {
  const selectedFieldId = useBuilderStore((state) => state.selectedFieldId);
  const fields = useBuilderStore((state) => state.fields);
  const updateField = useBuilderStore((state) => state.updateField);
  const removeField = useBuilderStore((state) => state.removeField);

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  const [newOption, setNewOption] = useState("");

  if (!selectedField) {
    return (
      <div className="flex h-full flex-col items-center justify-center border-l border-blue-500/10 bg-blue-500/5 p-6 text-center backdrop-blur-xl">
        <div className="rounded-full bg-zinc-900 p-4 text-zinc-500 mb-3 border border-zinc-800/80">
          <Sparkles className="h-6 w-6 text-zinc-500" />
        </div>
        <h4 className="text-sm font-medium text-zinc-300">No element selected</h4>
        <p className="mt-1 text-xs text-zinc-500 max-w-[200px] mb-4">
          Select any element on the canvas to configure its properties here.
        </p>
        {onGoToCanvas && (
          <button
            onClick={onGoToCanvas}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all cursor-pointer shadow-md shadow-blue-500/15"
          >
            Go to Canvas
          </button>
        )}
      </div>
    );
  }

  const showPlaceholder = [
    "text",
    "email",
    "number",
    "textarea",
    "date",
  ].includes(selectedField.type);

  const showOptions = ["select", "checkbox", "radio"].includes(
    selectedField.type
  );

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOption.trim()) return;

    const currentOptions = selectedField.options || [];
    if (currentOptions.includes(newOption.trim())) return; // Prevent duplicates

    updateField(selectedField.id, {
      options: [...currentOptions, newOption.trim()],
    });
    setNewOption("");
  };

  const handleRemoveOption = (indexToRemove: number) => {
    const currentOptions = selectedField.options || [];
    updateField(selectedField.id, {
      options: currentOptions.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const currentOptions = selectedField.options || [];
    const updatedOptions = [...currentOptions];
    updatedOptions[index] = value;
    updateField(selectedField.id, {
      options: updatedOptions,
    });
  };

  return (
    <div className="flex h-full flex-col border-l border-blue-500/10 bg-blue-500/5 p-6 backdrop-blur-xl overflow-y-auto">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
        <div className="flex items-center gap-2">
          {onGoToCanvas && (
            <button
              onClick={onGoToCanvas}
              className="lg:hidden p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-900/50 border border-zinc-800/80 mr-1 cursor-pointer"
              title="Back to canvas"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 leading-tight">Properties</h3>
            <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold block mt-0.5">
              {selectedField.type} element
            </span>
          </div>
        </div>
        <button
          onClick={() => removeField(selectedField.id)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-950/30 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
          title="Delete Field"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-6">
        {/* Label Field */}
        <div className="space-y-2">
          <Label htmlFor="field-label" className="text-xs font-semibold text-zinc-300">
            Field Label
          </Label>
          <Input
            id="field-label"
            value={selectedField.label}
            onChange={(e) =>
              updateField(selectedField.id, { label: e.target.value })
            }
            placeholder="e.g. Full Name"
            className="border-zinc-800 bg-zinc-950/60 text-zinc-100 focus:border-blue-500"
          />
        </div>

        {/* Placeholder Field */}
        {showPlaceholder && (
          <div className="space-y-2">
            <Label htmlFor="field-placeholder" className="text-xs font-semibold text-zinc-300">
              Placeholder Text
            </Label>
            <Input
              id="field-placeholder"
              value={selectedField.placeholder || ""}
              onChange={(e) =>
                updateField(selectedField.id, { placeholder: e.target.value })
              }
              placeholder="e.g. Enter your name..."
              className="border-zinc-800 bg-zinc-950/60 text-zinc-100 focus:border-blue-500"
            />
          </div>
        )}

        {/* Help Text Field */}
        <div className="space-y-2">
          <Label htmlFor="field-help" className="text-xs font-semibold text-zinc-300">
            Help Text / Description
          </Label>
          <Input
            id="field-help"
            value={selectedField.helpText || ""}
            onChange={(e) =>
              updateField(selectedField.id, { helpText: e.target.value })
            }
            placeholder="Brief sub-label text"
            className="border-zinc-800 bg-zinc-950/60 text-zinc-100 focus:border-blue-500"
          />
        </div>

        {/* Required Field (Toggle) */}
        <div className="flex items-center justify-between rounded-lg border border-blue-500/15 bg-blue-500/10 p-4">
          <div>
            <Label htmlFor="field-required" className="text-sm font-semibold text-zinc-200 cursor-pointer">
              Required field
            </Label>
            <p className="text-[10px] text-zinc-500">
              Validation fails if empty
            </p>
          </div>
          <button
            id="field-required"
            onClick={() =>
              updateField(selectedField.id, {
                required: !selectedField.required,
              })
            }
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              selectedField.required ? "bg-blue-600" : "bg-zinc-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                selectedField.required ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Options Management */}
        {showOptions && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-zinc-300">Options</Label>
              <span className="text-[10px] text-zinc-500">
                {(selectedField.options || []).length} items
              </span>
            </div>

            <div className="space-y-2">
              {(selectedField.options || []).map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 border-zinc-800 bg-zinc-950/60 text-zinc-100 focus:border-blue-500 py-1 h-8 text-xs"
                  />
                  <button
                    onClick={() => handleRemoveOption(idx)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 hover:border-red-500/40 hover:text-red-400 text-zinc-500 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddOption} className="flex items-center gap-2 pt-2">
              <Input
                placeholder="Add option..."
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                className="flex-1 border-zinc-800 bg-zinc-950/60 text-zinc-100 focus:border-blue-500 py-1 h-8 text-xs"
              />
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
