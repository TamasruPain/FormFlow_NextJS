"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let iconColor = "text-blue-400";
          let borderColor = "border-blue-500/20";
          let bgColor = "bg-zinc-950/80";
          let glowColor = "shadow-blue-500/5";

          if (toast.type === "success") {
            Icon = CheckCircle2;
            iconColor = "text-emerald-400";
            borderColor = "border-emerald-500/20";
            bgColor = "bg-zinc-950/80";
            glowColor = "shadow-emerald-500/5";
          } else if (toast.type === "error") {
            Icon = AlertCircle;
            iconColor = "text-rose-400";
            borderColor = "border-rose-500/20";
            bgColor = "bg-zinc-950/80";
            glowColor = "shadow-rose-500/5";
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border ${borderColor} ${bgColor} px-4 py-3.5 shadow-xl ${glowColor} backdrop-blur-xl transition-all duration-300 w-full`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />
                <p className="text-sm font-medium text-zinc-100 leading-snug">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
