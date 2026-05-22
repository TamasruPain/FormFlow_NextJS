import React from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-slate-100">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-6 md:p-8 relative">
          {/* Subtle ambient lighting details */}
          <div className="absolute top-0 left-1/4 h-[300px] w-[300px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-sky-600/5 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
