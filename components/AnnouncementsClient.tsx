"use client";

import { useState, useEffect, useMemo } from "react";
import { Announcement } from "@/lib/db";
import Link from "next/link";
import Header from "./Header";

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
}: {
  announcements: Announcement[];
  symposiumName: string;
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isLive, setIsLive] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date>(new Date());
  const [search, setSearch] = useState("");

  // Live polling for admin announcements
  useEffect(() => {
    let cancelled = false;

    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements", { cache: "no-store" });
        if (!res.ok) throw new Error("Fetch failed");
        const json = await res.json();
        if (cancelled) return;
        if (Array.isArray(json.announcements)) {
          setAnnouncements(json.announcements);
        }
        setIsLive(true);
        setLastFetched(new Date());
      } catch {
        if (!cancelled) setIsLive(false);
      }
    }

    const interval = setInterval(fetchAnnouncements, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

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
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900">
      <Header />

      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 space-y-8">
        {/* Top Hero Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 shadow-sm font-bold">
            <span className={`h-2.5 w-2.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            {isLive ? "Live Stream Active" : "Offline"} · {symposiumName}
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Official Announcements
          </h1>
          <p className="font-mono text-xs text-slate-500 max-w-lg mx-auto">
            Real-time news, schedule adjustments, venue updates, and announcements broadcasted directly by organizers.
          </p>
        </div>

        {/* Search & Counter Bar */}
        <div className="glass rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200/80 shadow-glass">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search live notices..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs text-slate-900 outline-none transition shadow-sm focus:border-sky-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 font-mono text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-slate-500">
            <span>
              Showing <strong className="text-sky-600">{filtered.length}</strong> of {announcements.length} notices
            </span>
            <span className="text-[10px] text-slate-400">
              Synced {lastFetched.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
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
                className="glass rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:border-sky-300 hover:shadow-depth border border-slate-200/80 space-y-4 bg-white"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 shadow-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
                      </span>
                      Notice
                    </span>
                    <span className="font-mono text-xs font-bold text-sky-600">
                      {relTime}
                    </span>
                  </div>

                  <span className="font-mono text-xs text-slate-400">
                    {fullDate}
                  </span>
                </div>

                <p className="text-base text-slate-800 leading-relaxed font-body font-medium">
                  {a.message}
                </p>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between font-mono text-xs text-slate-500">
                  <span>
                    Broadcasted by <strong className="text-slate-900">@{a.created_by}</strong>
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    ✓ Verified Admin Notice
                  </span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="glass rounded-3xl p-12 text-center space-y-3 border border-slate-200/80 bg-white">
              <p className="font-mono text-sm text-slate-500">
                {search ? `No announcements match "${search}".` : "No announcements posted yet."}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="font-mono text-xs text-sky-600 font-bold underline hover:text-sky-800"
                >
                  Clear search filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold text-slate-500 hover:text-sky-600 transition"
          >
            ← Back to Home Page
          </Link>
        </div>
      </main>
    </div>
  );
}
