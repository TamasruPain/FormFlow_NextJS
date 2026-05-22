import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HelpCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative background grids & glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-8 bg-slate-900/40 border border-slate-900 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
          <HelpCircle className="h-7 w-7 animate-bounce" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white">404</h1>
          <h2 className="text-xl font-bold text-white">Page Not Found</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            The page or form you are looking for does not exist, has been removed, or is temporarily unavailable.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl h-11 shadow-md shadow-indigo-600/10"
          >
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl h-11"
          >
            <Link href="/dashboard" className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
