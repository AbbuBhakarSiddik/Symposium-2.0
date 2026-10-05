"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Announcement } from "@/lib/db";
import Link from "next/link";
import Header from "./Header";
import CollegeBanner from "./CollegeBanner";

const POLL_INTERVAL_MS = 5000;

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 10) return "Just now";
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const mins = Math.floor(diffInSeconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
}

export default function AnnouncementsClient({
  announcements: initialAnnouncements,
  symposiumName,
  runningAnnouncement,
  runningAnnouncementActive = true,
}: {
  announcements: Announcement[];
  symposiumName: string;
  runningAnnouncement?: string;
  runningAnnouncementActive?: boolean;
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isLive, setIsLive] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date>(new Date());
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch("/api/announcements", { cache: "no-store" });
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      if (Array.isArray(json.announcements)) {
        setAnnouncements(json.announcements);
      }
      setIsLive(true);
      setLastFetched(new Date());
    } catch {
      setIsLive(false);
    }
  }, []);

  // Live polling for admin announcements
  useEffect(() => {
    const interval = setInterval(fetchAnnouncements, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    await fetchAnnouncements();
    setTimeout(() => setIsManualRefreshing(false), 600);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return announcements;
    const q = search.toLowerCase();
    return announcements.filter(
      (a) =>
        a.message.toLowerCase().includes(q) ||
        a.created_by.toLowerCase().includes(q)
    );
  }, [announcements, search]);

  return (
    <div className="cyber-bg relative min-h-screen text-slate-900 flex flex-col justify-between selection:bg-blue-500/20 selection:text-blue-900">
      {/* Ambient Floating Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="cyber-orb w-[420px] sm:w-[600px] h-[420px] sm:h-[600px] -top-32 -left-20 bg-blue-400/25" />
        <div className="cyber-orb w-[400px] sm:w-[550px] h-[400px] sm:h-[550px] top-1/3 -right-28 bg-purple-400/20" />
        <div className="cyber-orb w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] -bottom-24 left-1/4 bg-teal-400/20" />
        <div className="grid-dots" />
      </div>

      <div className="relative z-10 w-full">
        <CollegeBanner />
        <Header
          runningAnnouncement={runningAnnouncement}
          runningAnnouncementActive={runningAnnouncementActive}
        />

        <main className="mx-auto max-w-4xl px-3.5 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
          {/* Top Hero Section */}
          <div className="text-center space-y-4 pt-2">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 rounded-full border border-slate-200/90 bg-white/95 shadow-xs backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isLive ? "bg-emerald-400 opacity-75" : "bg-amber-400 opacity-75"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isLive ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </span>
              <span className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-800">
                {isLive ? "Live Broadcast Feed" : "Reconnecting..."}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-slate-500">
                Auto-syncs every 5s
              </span>
            </div>

            {/* Main Title with Gradient Accent */}
            <div className="space-y-2.5">
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                Official Symposium{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Announcements
                </span>
              </h1>
              <p className="font-mono text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed px-2">
                Real-time official broadcast channel for schedule adjustments, venue notices, and urgent bulletins from the organizers.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold bg-white/80 border border-slate-200 text-slate-700 shadow-xs">
                <span className="text-blue-600">📢</span>
                <span>{announcements.length} Published Notices</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold bg-white/80 border border-slate-200 text-slate-700 shadow-xs">
                <span className="text-emerald-500">✓</span>
                <span>Verified Admin Channel</span>
              </div>
              <button
                type="button"
                onClick={handleManualRefresh}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 shadow-xs transition active:scale-95 cursor-pointer"
                title="Force refresh now"
              >
                <svg
                  className={`w-3 h-3 ${isManualRefreshing ? "animate-spin text-blue-600" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{isManualRefreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>
          </div>

          {/* Search & Status Bar */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/90 p-3 sm:p-4 shadow-sm backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <svg
                  className="h-4 w-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search live notices, keywords, or admins..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-9 py-2.5 font-mono text-xs sm:text-[13px] text-slate-900 outline-none transition shadow-inner focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2.5 p-0.5 rounded-md font-mono text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-4 font-mono text-xs text-slate-600 px-1">
              <span>
                Showing <strong className="text-blue-600 font-bold">{filtered.length}</strong> of {announcements.length} notices
              </span>
              <span suppressHydrationWarning className="text-[11px] text-slate-400 shrink-0">
                Synced {mounted ? lastFetched.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
              </span>
            </div>
          </div>

          {/* Announcements List */}
          <div className="space-y-4 sm:space-y-5">
            {filtered.map((a) => {
              const relTime = formatRelativeTime(a.created_at);
              const fullDate = new Date(a.created_at).toLocaleString(undefined, {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={a.id}
                  className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 p-5 sm:p-7 shadow-sm hover:shadow-xl hover:border-blue-400/80 transition-all duration-300 space-y-4 backdrop-blur-xl hover:-translate-y-0.5"
                >
                  {/* Top Gradient Highlight Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 opacity-90 group-hover:h-2 transition-all duration-300" />

                  {/* Header: Notice Badge + Timestamps */}
                  <div className="flex items-center justify-between gap-2.5 flex-wrap pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-blue-200/90 bg-blue-50 text-blue-700 shadow-xs">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                        </span>
                        Notice
                      </span>
                      <span
                        suppressHydrationWarning
                        className="inline-flex items-center gap-1 font-mono text-xs font-bold text-blue-600 bg-blue-50/70 px-2.5 py-0.5 rounded-lg border border-blue-100"
                      >
                        <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {mounted ? relTime : ""}
                      </span>
                    </div>

                    <span
                      suppressHydrationWarning
                      className="inline-flex items-center gap-1.5 font-mono text-[11px] sm:text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60"
                    >
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {mounted ? fullDate : ""}
                    </span>
                  </div>

                  {/* Message Body with crisp typography */}
                  <p className="font-sans text-base sm:text-lg text-slate-900 font-semibold leading-relaxed tracking-tight whitespace-pre-wrap break-words">
                    {a.message}
                  </p>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 sm:p-14 text-center space-y-3 backdrop-blur-md">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600 border border-blue-100">
                  {search ? "🔍" : "📢"}
                </div>
                <h3 className="font-display text-lg font-bold text-slate-800">
                  {search ? `No announcements match "${search}"` : "No announcements posted yet"}
                </h3>
                <p className="font-mono text-xs text-slate-500 max-w-sm mx-auto">
                  {search
                    ? "Try adjusting your search terms or clear the filter to see all official broadcasts."
                    : "Check back soon — official updates and schedule adjustments stream in real-time."}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 transition shadow-xs"
                  >
                    Clear search filter
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Back to Home Page link */}
          <div className="text-center pt-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold text-slate-700 bg-white/90 border border-slate-200/90 hover:border-blue-400 hover:text-blue-600 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              <span>Back to Home Page</span>
            </Link>
          </div>
        </main>
      </div>

      {/* Subtle Bottom Attribution Footer */}
      <footer className="relative z-10 w-full text-center py-6 border-t border-slate-200/60 mt-12 bg-white/40 backdrop-blur-sm">
        <p className="font-mono text-[11px] text-slate-500">
          {symposiumName} • Official Live Broadcast Center
        </p>
      </footer>
    </div>
  );
}
