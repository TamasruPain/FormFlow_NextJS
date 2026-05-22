"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Bell, FileText, Clock, User, Mail, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  formId: string;
  formTitle: string;
  submitterName: string;
  submitterEmail: string;
  status: string;
  createdAt: string;
}

const LAST_READ_KEY = "formflow_notifications_last_read";
const POLL_INTERVAL = 30000; // 30 seconds

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotificationDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastReadTime, setLastReadTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize lastReadTime from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LAST_READ_KEY);
    setLastReadTime(stored || new Date(0).toISOString());
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data: Notification[] = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute unread count
  const unreadCount = notifications.filter(
    (n) => new Date(n.createdAt) > new Date(lastReadTime)
  ).length;

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark all as read
      const now = new Date().toISOString();
      setLastReadTime(now);
      localStorage.setItem(LAST_READ_KEY, now);
    }
  };

  const handleNotificationClick = (formId: string) => {
    setIsOpen(false);
    router.push(`/forms/${formId}/responses`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-sky-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-blue-500/30 animate-in zoom-in duration-300">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-[360px] max-w-[calc(100vw-32px)] rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-zinc-100">
                Notifications
              </h3>
            </div>
            {notifications.length > 0 && (
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                {notifications.length} submissions
              </span>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900/80 mb-3">
                  <Bell className="h-5 w-5 text-zinc-600" />
                </div>
                <p className="text-xs font-semibold text-zinc-400">
                  No submissions yet
                </p>
                <p className="text-[10px] text-zinc-600 mt-1 text-center">
                  When someone submits a response to your forms, it will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="py-1">
                {notifications.map((n) => {
                  const isUnread =
                    new Date(n.createdAt) > new Date(lastReadTime);
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n.formId)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-150 cursor-pointer group hover:bg-zinc-900/60 ${
                        isUnread ? "bg-blue-500/[0.04]" : ""
                      }`}
                    >
                      {/* Avatar Indicator */}
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          isUnread
                            ? "bg-gradient-to-br from-blue-600 to-sky-500 shadow-md shadow-blue-500/20"
                            : "bg-zinc-900 border border-zinc-800"
                        }`}
                      >
                        <User
                          className={`h-4 w-4 ${
                            isUnread ? "text-white" : "text-zinc-500"
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold truncate ${
                              isUnread ? "text-zinc-100" : "text-zinc-300"
                            }`}
                          >
                            {n.submitterName}
                          </span>
                          {isUnread && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <FileText className="h-3 w-3 text-zinc-600 shrink-0" />
                          <span className="text-[11px] text-zinc-500 truncate">
                            {n.formTitle}
                          </span>
                        </div>

                        {n.submitterEmail && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Mail className="h-3 w-3 text-zinc-600 shrink-0" />
                            <span className="text-[10px] text-zinc-600 truncate">
                              {n.submitterEmail}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="h-3 w-3 text-zinc-700 shrink-0" />
                          <span className="text-[10px] text-zinc-600">
                            {getTimeAgo(n.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-400 transition-colors mt-2.5 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
