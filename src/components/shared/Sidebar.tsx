"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useSidebarStore } from "@/store/sidebarStore";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleCollapsed, setMobileOpen } = useSidebarStore();

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      label: "My Forms",
      icon: FileText,
      href: "/forms",
    },
    {
      label: "Create Form",
      icon: PlusCircle,
      href: "/forms/new",
    },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-zinc-900 bg-zinc-950/95 p-5 text-slate-100 backdrop-blur-md transition-all duration-300 ease-in-out md:static md:translate-x-0 md:flex",
          isCollapsed ? "md:w-20 md:p-3" : "w-64 md:w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className={cn("mb-8 flex items-center", isCollapsed ? "flex-col gap-4 justify-center" : "justify-between")}>
          <Logo showText={!isCollapsed} />
          
          {/* Collapse button for desktop */}
          <button
            onClick={toggleCollapsed}
            className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all cursor-pointer focus:outline-none"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            className="flex md:hidden h-7 w-7 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all cursor-pointer focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center rounded-lg transition-all duration-200",
                  isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "gap-3 px-3.5 py-2.5 text-sm font-medium",
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-sky-600/10 text-blue-300 border-l-2 border-blue-500"
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-100"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                    isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={cn("border-t border-zinc-900 pt-4 flex items-center", isCollapsed ? "justify-center px-1" : "justify-between px-3.5")}>
          {isCollapsed ? (
            <span
              className="text-[10px] font-bold tracking-wider bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent select-none"
              title="@TamasruPain"
            >
              @TRP
            </span>
          ) : (
            <span className="text-xs font-semibold tracking-wider bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm select-none">
              @TamasruPain
            </span>
          )}
        </div>
      </aside>
    </>
  );
}
