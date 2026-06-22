"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useRealtime } from "../hooks/useRealtime";

export function Header({ user }: { user: any }) {
  const { lastEvent } = useRealtime();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (lastEvent) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [lastEvent]);

  if (!user) return null;

  return (
    <header className="h-14 bg-[var(--header-bg)] border-b border-[var(--card-border)] flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 shadow-sm">
      {/* Left: spacer for mobile hamburger + title */}
      <div className="flex items-center gap-3">
        {/* Spacer for the hamburger button on mobile */}
        <div className="w-9 lg:hidden" />
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Avia Tech Logo" className="h-6 w-auto hidden sm:block dark:hidden" />
          <img src="/logo-dark.png" alt="Avia Tech Logo" className="h-6 w-auto hidden sm:dark:block" />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <a
          href={`/${user.role === "teacher" ? "teacher" : "student"}/notifications`}
          className="relative p-2 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-all"
          aria-label="Notifications"
          onClick={() => setUnreadCount(0)}
        >
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse ring-2 ring-[var(--header-bg)]" />
          )}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </a>
        <div className="flex items-center gap-2 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold leading-tight">{user.name}</p>
            <p className="text-[10px] text-foreground/50 capitalize">{user.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer overflow-hidden">
            {user?.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              (user?.name || "U").substring(0, 2).toUpperCase()
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
