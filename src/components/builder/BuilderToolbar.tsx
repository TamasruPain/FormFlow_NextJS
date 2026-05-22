"use client";

import React, { useState } from "react";
import {
  Undo2,
  Redo2,
  Save,
  Globe,
  Settings,
  ChevronLeft,
  Sparkles,
  Pencil,
  ChevronDown,
  FileText,
} from "lucide-react";
import { useBuilderStore } from "@/store/builderStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BuilderToolbarProps {
  onSave: () => Promise<void>;
  isSaving: boolean;
  onBack: () => void;
}

export function BuilderToolbar({
  onSave,
  isSaving,
  onBack,
}: BuilderToolbarProps) {
  const title = useBuilderStore((state) => state.title);
  const description = useBuilderStore((state) => state.description);
  const isMultiStep = useBuilderStore((state) => state.isMultiStep);
  const isPublished = useBuilderStore((state) => state.isPublished);

  const setTitle = useBuilderStore((state) => state.setTitle);
  const setDescription = useBuilderStore((state) => state.setDescription);
  const setIsMultiStep = useBuilderStore((state) => state.setIsMultiStep);
  const setIsPublished = useBuilderStore((state) => state.setIsPublished);

  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);
  const historyIndex = useBuilderStore((state) => state.historyIndex);
  const history = useBuilderStore((state) => state.history);

  const [showSettings, setShowSettings] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="border-b border-zinc-900 bg-zinc-950/70 p-4 backdrop-blur-xl relative z-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Back & Title input */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800/80 rounded-lg cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 group/title w-fit">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Form"
                className="bg-transparent text-lg font-bold text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-0 w-[200px] sm:w-[320px] border-b border-transparent hover:border-zinc-800 focus:border-blue-500 transition-colors"
              />
              <Pencil className="h-4 w-4 text-zinc-500 opacity-40 group-hover/title:opacity-100 transition-opacity shrink-0" />
            </div>
            {description && (
              <span className="text-xs text-zinc-500 line-clamp-1 max-w-[350px]">
                {description}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Undo/Redo & Save/Publish Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* History */}
          <div className="flex items-center gap-1 border-r border-zinc-900 pr-3">
            <Button
              variant="ghost"
              size="icon"
              disabled={!canUndo}
              onClick={undo}
              className={`h-8 w-8 text-zinc-400 hover:text-zinc-200 rounded-lg cursor-pointer ${
                !canUndo ? "opacity-30 cursor-not-allowed" : "hover:bg-zinc-900"
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!canRedo}
              onClick={redo}
              className={`h-8 w-8 text-zinc-400 hover:text-zinc-200 rounded-lg cursor-pointer ${
                !canRedo ? "opacity-30 cursor-not-allowed" : "hover:bg-zinc-900"
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Form Settings Dialog Trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowSettings(!showSettings);
              setShowStatusDropdown(false);
            }}
            className={`text-zinc-300 border border-zinc-800 hover:bg-zinc-900 h-9 rounded-lg px-3 cursor-pointer ${
              showSettings ? "bg-zinc-900 border-blue-500/50" : ""
            }`}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>

          {/* Publish / Draft Dropdown Trigger */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowSettings(false);
              }}
              className={`border h-9 rounded-lg px-3 transition-all cursor-pointer ${
                isPublished
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  : "border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300"
              }`}
            >
              <Globe className="mr-1.5 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Status: </span>
              <span>{isPublished ? "Published" : "Draft"}</span>
              <ChevronDown className="ml-1.5 h-3.5 w-3.5 opacity-60" />
            </Button>

            {showStatusDropdown && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-[260px] max-w-[calc(100vw-32px)] rounded-xl border border-zinc-900 bg-zinc-900/95 p-2 shadow-2xl shadow-black/90 animate-in fade-in slide-in-from-top-2 duration-200 z-30">
                  {/* Draft Option */}
                  <button
                    onClick={() => {
                      setIsPublished(false);
                      setShowStatusDropdown(false);
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors cursor-pointer ${
                      !isPublished
                        ? "bg-zinc-900 border border-zinc-800/50"
                        : "hover:bg-zinc-900/50 border border-transparent"
                    }`}
                  >
                    <div className="mt-0.5 rounded bg-zinc-950 p-1 text-zinc-400 border border-zinc-800">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-200">
                        Draft Mode
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        Private. Only you can view or edit this form.
                      </span>
                    </div>
                  </button>

                  {/* Published Option */}
                  <button
                    onClick={() => {
                      setIsPublished(true);
                      setShowStatusDropdown(false);
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors cursor-pointer ${
                      isPublished
                        ? "bg-emerald-950/20 border border-emerald-900/30"
                        : "hover:bg-zinc-900/50 border border-transparent"
                    }`}
                  >
                    <div className="mt-0.5 rounded bg-zinc-950 p-1 text-emerald-400 border border-zinc-800">
                      <Globe className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        Published
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        Publicly active. Anyone can view and submit answers.
                      </span>
                    </div>
                  </button>
                </div>
            )}
          </div>

          {/* Save Action */}
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-md shadow-blue-600/15 h-9 px-4 rounded-lg cursor-pointer"
          >
            {isSaving ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Settings Dropdown Area (Expands inline below the toolbar) */}
      {showSettings && (
        <div className="absolute top-[calc(100%+8px)] left-4 right-4 sm:left-auto sm:right-4 sm:w-[350px] w-auto rounded-xl border border-zinc-900 bg-zinc-900/95 p-5 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <h4 className="text-sm font-semibold text-zinc-200">Form Configuration</h4>
          </div>

          <div className="space-y-4">
            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Form Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Form"
                className="border-zinc-800 bg-zinc-950/60 text-zinc-100 focus:border-blue-500 text-xs"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Form Description
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the form's objective..."
                className="border-zinc-800 bg-zinc-950/60 text-zinc-100 focus:border-blue-500 text-xs"
              />
            </div>

            {/* Layout Toggle (Single step vs Multi step) */}
            <div className="flex items-center justify-between rounded-lg border border-blue-500/15 bg-blue-500/10 p-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                  Multi-step Layout
                </label>
                <p className="text-[10px] text-zinc-500">
                  One question per page workflow
                </p>
              </div>
              <button
                onClick={() => setIsMultiStep(!isMultiStep)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  isMultiStep ? "bg-blue-600" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isMultiStep ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
