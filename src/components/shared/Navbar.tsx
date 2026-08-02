"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { User, LogOut, ChevronDown, Menu } from "lucide-react";
import { NotificationDropdown } from "@/components/shared/NotificationDropdown";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "@/store/sidebarStore";

export function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toggleMobileOpen } = useSidebarStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Get initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="relative z-50 flex h-16 items-center justify-between border-b border-zinc-900 bg-zinc-950/40 px-6 backdrop-blur-md">
      {/* Mobile Menu Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileOpen}
          className="flex md:hidden rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors focus:outline-none cursor-pointer"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right side user section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationDropdown />

        {/* User profile info */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 pl-2 border-l border-zinc-900 hover:opacity-90 transition-opacity text-left relative focus:outline-none cursor-pointer group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-zinc-100 group-hover:text-white transition-colors">{user.name}</p>
                <p className="text-[10px] text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors">{user.email}</p>
              </div>
              {user.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-blue-500/20 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-xs font-bold text-white shadow-sm ring-1 ring-blue-500/20">
                  {getInitials(user.name)}
                </div>
              )}
              <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180 text-zinc-300" : ""}`} />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 z-50 w-52 rounded-xl border border-zinc-900 bg-zinc-950/95 backdrop-blur-xl p-1.5 shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-3 py-2 border-b border-zinc-900/80 mb-1">
                  <p className="text-xs font-bold text-zinc-100 truncate">{user.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition duration-200 cursor-pointer text-left"
                >
                  <LogOut className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400">
            <User className="h-4 w-4" />
          </div>
        )}
      </div>
    </header>
  );
}
