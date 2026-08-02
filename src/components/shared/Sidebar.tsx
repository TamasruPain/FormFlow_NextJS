"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { useSidebarStore } from "@/store/sidebarStore";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Rocket,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, isMobileOpen, toggleCollapsed, setMobileOpen } = useSidebarStore();

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

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
              (item.href !== "/" &&
                pathname.startsWith(item.href) &&
                !(item.href === "/forms" && pathname.startsWith("/forms/new")));

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

        <div className={cn("border-t border-zinc-900 pt-4 flex gap-2", isCollapsed ? "flex-col items-center px-1" : "flex-row items-stretch px-3.5")}>
          {isCollapsed ? (
            <>
              <a
                href="https://github.com/TamasruPain"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/20 text-[#E5A320] hover:border-[#E5A320]/50 hover:bg-[#E5A320]/5 hover:shadow-[0_0_15px_rgba(229,163,32,0.15)] transition-all duration-300 group/collapsed"
                title="Creator: TamasruPain"
              >
                <Rocket className="h-3.5 w-3.5 text-[#E5A320] group-hover/collapsed:scale-110 transition-transform duration-300" />
              </a>
              <button
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 text-zinc-500 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all duration-200 cursor-pointer focus:outline-none"
                title="Log Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              {/* Creator Card */}
              <a
                href="https://github.com/TamasruPain"
                target="_blank"
                rel="noopener noreferrer"
                className="group/card flex items-center gap-2 flex-1 min-w-0 rounded-lg border border-zinc-900 bg-zinc-900/10 py-1.5 px-2.5 hover:border-[#E5A320]/30 hover:bg-[#E5A320]/5 hover:shadow-[0_0_15px_rgba(229,163,32,0.05)] transition-all duration-300"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E5A320]/10 border border-[#E5A320]/20 text-[#E5A320] group-hover/card:scale-105 transition-transform duration-300">
                  <Rocket className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider leading-none group-hover/card:text-[#E5A320] transition-colors duration-300">
                    Creator
                  </span>
                  <span className="text-[11px] font-bold text-zinc-200 truncate leading-tight group-hover/card:text-white transition-colors duration-300">
                    @TamasruPain
                  </span>
                </div>
              </a>

              {/* Log Out Button */}
              <button
                onClick={handleLogout}
                className="flex w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-900/10 text-zinc-500 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all duration-200 cursor-pointer focus:outline-none"
                title="Log Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
