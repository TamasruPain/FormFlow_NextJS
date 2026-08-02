"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDanger = false,
  isLoading = false,
}: ConfirmModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onCancel}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-900/90 shadow-2xl shadow-blue-500/5 backdrop-blur-xl p-6"
          >
            {/* Top Glow Accent Line */}
            <div
              className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-${
                isDanger ? "red" : "blue"
              }-500/50 to-transparent`}
            />

            <div className="flex flex-col items-center text-center gap-4">
              {/* Hazard/Alert Icon */}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                  isDanger
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                }`}
              >
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-zinc-100">{title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 w-full mt-4">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 cursor-pointer"
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 rounded-xl cursor-pointer ${
                    isDanger
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/10"
                      : "bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-md shadow-blue-600/10"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    confirmText
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
