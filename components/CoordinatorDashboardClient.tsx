"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { AppUser, Announcement, Resource, SiteSettings } from "@/lib/db";
import { EventConfig } from "@/lib/eventsConfig";
import SignOutButton from "./SignOutButton";
import Link from "next/link";

type CoordinatorDashboardClientProps = {
  counts: Record<string, number>;
  isLive: boolean;
  users: AppUser[];
  announcements: Announcement[];
  resources: Resource[];
  events: EventConfig[];
  settings: SiteSettings;
  currentUser: { name: string; username: string; role: string };
};

export default function CoordinatorDashboardClient({
  counts,
  isLive,
  users,
  announcements,
  resources,
  events,
  settings,
  currentUser,
}: CoordinatorDashboardClientProps) {
  // Live seats state (auto-polled every 30s)
  const [liveCounts, setLiveCounts] = useState<Record<string, number>>(counts);
  const [liveIsLive, setLiveIsLive] = useState(isLive);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/sheets");
      if (!res.ok) return;
      const json = await res.json();
      const newCounts: Record<string, number> = {};
      for (const item of json.data ?? []) {
        newCounts[item.id] = item.registered;
      }
      setLiveCounts(newCounts);
      setLiveIsLive(json.isLive ?? false);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    pollingRef.current = setInterval(fetchCounts, 30_000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchCounts]);

  // Live seats table state
  const [eventSearch, setEventSearch] = useState("");
  const [eventSortField, setEventSortField] = useState<"name" | "capacity" | "registered" | "available" | "venue" | "date">("name");
  const [eventSortAsc, setEventSortAsc] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "filling" | "full">("all");

  // Search states for other sections
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [directorySearch, setDirectorySearch] = useState("");
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");

  const admins = useMemo(() => users.filter((u) => u.role === "admin"), [users]);
  const coordinators = useMemo(() => users.filter((u) => u.role === "coordinator"), [users]);

  // Computed & Filtered Events Table
  const processedEvents = useMemo(() => {
    return events
      .map((e) => {
        const registered = liveCounts[e.id] ?? 0;
        const available = Math.max(e.capacity - registered, 0);
        let status: "available" | "filling" | "full" = "available";
        if (available === 0 || registered >= e.capacity) status = "full";
        else if (available <= e.capacity * 0.2) status = "filling";

        return {
          ...e,
          registered,
          available,
          status,
        };
      })
      .filter((e) => {
        if (statusFilter !== "all" && e.status !== statusFilter) return false;
        if (!eventSearch.trim()) return true;
        const q = eventSearch.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.date.toLowerCase().includes(q) ||
          (e.tagline && e.tagline.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        let valA: any = a[eventSortField];
        let valB: any = b[eventSortField];
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return eventSortAsc ? -1 : 1;
        if (valA > valB) return eventSortAsc ? 1 : -1;
        return 0;
      });
  }, [events, counts, eventSearch, statusFilter, eventSortField, eventSortAsc]);

  // Filtered Schedules
  const filteredSchedules = useMemo(() => {
    if (!scheduleSearch.trim()) return events;
    const q = scheduleSearch.toLowerCase();
    return events.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.schedule.some((s) => s.item.toLowerCase().includes(q) || s.time.toLowerCase().includes(q))
    );
  }, [events, scheduleSearch]);

  // Filtered Directory
  const filteredAdmins = useMemo(() => {
    if (!directorySearch.trim()) return admins;
    const q = directorySearch.toLowerCase();
    return admins.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  }, [admins, directorySearch]);

  const filteredCoordinators = useMemo(() => {
    if (!directorySearch.trim()) return coordinators;
    const q = directorySearch.toLowerCase();
    return coordinators.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  }, [coordinators, directorySearch]);

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    if (!announcementSearch.trim()) return announcements;
    const q = announcementSearch.toLowerCase();
    return announcements.filter(
      (a) => a.message.toLowerCase().includes(q) || a.created_by.toLowerCase().includes(q)
    );
  }, [announcements, announcementSearch]);

  // Filtered Resources
  const filteredResources = useMemo(() => {
    if (!resourceSearch.trim()) return resources;
    const q = resourceSearch.toLowerCase();
    return resources.filter(
      (r) => r.title.toLowerCase().includes(q) || r.url.toLowerCase().includes(q)
    );
  }, [resources, resourceSearch]);

  // Export Events CSV for Coordinators
  function handleExportEventsCSV() {
    const headers = ["Event Name", "Venue", "Date", "Time", "Capacity", "Registered", "Available Spots", "Status"];
    const rows = processedEvents.map((e) => [
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.venue.replace(/"/g, '""')}"`,
      `"${e.date}"`,
      `"${e.time}"`,
      e.capacity,
      e.registered,
      e.available,
      e.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `coordinator_events_status_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleSort(field: "name" | "capacity" | "registered" | "available" | "venue" | "date") {
    if (eventSortField === field) {
      setEventSortAsc(!eventSortAsc);
    } else {
      setEventSortField(field);
      setEventSortAsc(true);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF9F5] px-4 py-8 sm:px-8 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Top Header */}
        <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-glass border border-slate-200/80">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 font-bold">
                Coordinator Portal
              </span>
              <span className="font-mono text-xs text-slate-500">
                {settings.symposiumName}
              </span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
              Coordinator Dashboard
            </h1>
            <p className="mt-1 font-mono text-xs text-slate-500">
              Logged in as <span className="text-slate-900 font-semibold">{currentUser.name}</span> (@{currentUser.username})
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.role === "admin" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 font-mono text-xs font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition shadow-sm"
              >
                ← Back to Admin Panel
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>

        {/* Announcements Section */}
        <section className="glass rounded-3xl p-6 sm:p-8 space-y-4 shadow-glass border border-slate-200/80">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse" />
              Latest Announcements
            </h2>
            <input
              type="text"
              value={announcementSearch}
              onChange={(e) => setAnnouncementSearch(e.target.value)}
              placeholder="🔍 Search announcements…"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-sky-500 shadow-sm"
            />
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {filteredAnnouncements.map((a) => (
              <div key={a.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-1 shadow-sm">
                <p className="text-sm text-slate-800 font-medium leading-relaxed">{a.message}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  Posted by @{a.created_by} · {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
            ))}

            {filteredAnnouncements.length === 0 && (
              <p className="font-mono text-xs text-slate-500">No announcements posted yet.</p>
            )}
          </div>
        </section>

        {/* Live Events Table with Search & Sort */}
        <section className="glass rounded-3xl p-6 sm:p-8 space-y-6 shadow-glass border border-slate-200/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Live Event Seats &amp; Registrations
                </h2>
                <span className={`h-2.5 w-2.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                <span className="font-mono text-xs text-slate-500 font-medium">
                  {isLive ? "Live Sync Active" : "Preview Mode"}
                </span>
              </div>
              <p className="font-mono text-xs text-slate-500 mt-1">
                Search and sort live seat counts reflected from Google Sheets.
              </p>
            </div>

            <button
              onClick={handleExportEventsCSV}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 border border-sky-200 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-sky-700 transition hover:bg-sky-600 hover:text-white shadow-sm hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Excel / CSV
            </button>
          </div>

          {/* Search Bar & Filters */}
          <div className="grid gap-3 sm:grid-cols-12 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
            <div className="sm:col-span-8 relative">
              <input
                type="text"
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                placeholder="🔍 Search by event name, venue, or date…"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs text-slate-900 outline-none transition shadow-sm focus:border-sky-500"
              />
              {eventSearch && (
                <button
                  onClick={() => setEventSearch("")}
                  className="absolute right-3 top-2.5 font-mono text-xs text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="sm:col-span-4">
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-xs text-slate-900 outline-none shadow-sm focus:border-sky-500"
              >
                <option value="all">All Availability Statuses</option>
                <option value="available">Open / Available Spots</option>
                <option value="filling">Filling Fast (≤20% left)</option>
                <option value="full">Full / Sold Out</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm bg-white">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-100/80 text-[11px] uppercase tracking-widest text-slate-600 border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort("name")}>
                    Event Name {eventSortField === "name" && (eventSortAsc ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort("venue")}>
                    Venue {eventSortField === "venue" && (eventSortAsc ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort("date")}>
                    Date &amp; Time {eventSortField === "date" && (eventSortAsc ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort("capacity")}>
                    Capacity {eventSortField === "capacity" && (eventSortAsc ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort("registered")}>
                    Registered {eventSortField === "registered" && (eventSortAsc ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort("available")}>
                    Available {eventSortField === "available" && (eventSortAsc ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedEvents.map((e) => (
                  <tr key={e.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {e.name}
                      {e.tagline && <span className="block text-[10px] text-slate-500 font-normal mt-0.5">{e.tagline}</span>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{e.venue}</td>
                    <td className="px-4 py-3.5 text-slate-600">{e.date} · {e.time}</td>
                    <td className="px-4 py-3.5 text-slate-600">{e.capacity}</td>
                    <td className="px-4 py-3.5 font-bold text-sky-600">{e.registered}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{e.available}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          e.status === "full"
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : e.status === "filling"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {e.status === "full" ? "Full" : e.status === "filling" ? "Filling Fast" : "Open"}
                      </span>
                    </td>
                  </tr>
                ))}

                {processedEvents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-medium">
                      No matching events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Full Schedules View */}
        <section className="glass rounded-3xl p-6 sm:p-8 space-y-4 shadow-glass border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-slate-900">Full Event Schedules</h2>
            <input
              type="text"
              value={scheduleSearch}
              onChange={(e) => setScheduleSearch(e.target.value)}
              placeholder="🔍 Search schedules…"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-sky-500 shadow-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filteredSchedules.map((e) => (
              <div key={e.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-sm">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-slate-900">{e.name}</h3>
                  <span className="font-mono text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">{e.venue}</span>
                </div>
                <ul className="space-y-1.5 font-mono text-xs text-slate-600">
                  {e.schedule.map((s, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="w-24 shrink-0 text-slate-900 font-bold">{s.time}</span>
                      <span>{s.item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {filteredSchedules.length === 0 && (
              <p className="col-span-full font-mono text-xs text-slate-500">No schedules matching your search.</p>
            )}
          </div>
        </section>

        {/* Directory Section */}
        <section className="glass rounded-3xl p-6 sm:p-8 space-y-6 shadow-glass border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-slate-900">Symposium Directory</h2>
            <input
              type="text"
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              placeholder="🔍 Search contacts…"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-sky-500 shadow-sm"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 font-mono text-xs">
            {/* Admins */}
            <div className="space-y-3">
              <h3 className="text-indigo-700 font-bold uppercase tracking-wider text-xs border-b border-indigo-100 pb-1">
                Admins ({filteredAdmins.length})
              </h3>
              <ul className="space-y-2">
                {filteredAdmins.map((u) => (
                  <li key={u.id} className="rounded-2xl border border-slate-200/80 bg-white p-3.5 flex flex-col gap-0.5 shadow-sm">
                    <span className="font-bold text-slate-900">{u.name}</span>
                    <span className="text-slate-400 text-[11px]">@{u.username}</span>
                    {u.phone && <span className="text-sky-600 font-semibold text-[11px]">📞 {u.phone}</span>}
                    {u.email && <span className="text-slate-600 text-[11px]">✉️ {u.email}</span>}
                  </li>
                ))}
                {filteredAdmins.length === 0 && <li className="text-slate-500">No admins found.</li>}
              </ul>
            </div>

            {/* Coordinators */}
            <div className="space-y-3">
              <h3 className="text-sky-700 font-bold uppercase tracking-wider text-xs border-b border-sky-100 pb-1">
                Coordinators ({filteredCoordinators.length})
              </h3>
              <ul className="space-y-2">
                {filteredCoordinators.map((u) => (
                  <li key={u.id} className="rounded-2xl border border-slate-200/80 bg-white p-3.5 flex flex-col gap-0.5 shadow-sm">
                    <span className="font-bold text-slate-900">{u.name}</span>
                    <span className="text-slate-400 text-[11px]">@{u.username}</span>
                    {u.phone && <span className="text-sky-600 font-semibold text-[11px]">📞 {u.phone}</span>}
                    {u.email && <span className="text-slate-600 text-[11px]">✉️ {u.email}</span>}
                  </li>
                ))}
                {filteredCoordinators.length === 0 && <li className="text-slate-500">No coordinators found.</li>}
              </ul>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="glass rounded-3xl p-6 sm:p-8 space-y-4 shadow-glass border border-slate-200/80">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-slate-900">Shared Resources &amp; Documents</h2>
            <input
              type="text"
              value={resourceSearch}
              onChange={(e) => setResourceSearch(e.target.value)}
              placeholder="🔍 Search resources…"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-sky-500 shadow-sm"
            />
          </div>

          <ul className="space-y-2.5 font-mono text-xs">
            {filteredResources.map((r) => (
              <li key={r.id} className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600 font-bold underline hover:text-sky-800"
                >
                  📄 {r.title}
                </a>
              </li>
            ))}

            {filteredResources.length === 0 && (
              <li className="text-slate-500">No resources uploaded yet.</li>
            )}
          </ul>
        </section>

      </div>
    </main>
  );
}
