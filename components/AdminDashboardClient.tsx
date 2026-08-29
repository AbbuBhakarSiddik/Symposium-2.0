"use client";

import { useState, useMemo } from "react";
import { AppUser, Announcement, Resource, SiteSettings } from "@/lib/db";
import { EventConfig } from "@/lib/eventsConfig";
import SignOutButton from "./SignOutButton";
import Link from "next/link";
import {
  createUserAction,
  deleteUserAction,
  createAnnouncementAction,
  deleteAnnouncementAction,
  createResourceAction,
  deleteResourceAction,
  createEventAction,
  updateEventAction,
  deleteEventAction,
  assignCoordinatorAction,
  updateSiteSettingsAction,
} from "@/lib/actions";

type AdminDashboardClientProps = {
  counts: Record<string, number>;
  isLive: boolean;
  users: AppUser[];
  announcements: Announcement[];
  resources: Resource[];
  events: EventConfig[];
  settings: SiteSettings;
  currentUser: { name: string; username: string; role: string };
};

export default function AdminDashboardClient({
  counts,
  isLive,
  users,
  announcements,
  resources,
  events,
  settings,
  currentUser,
}: AdminDashboardClientProps) {
  // Live seats table state: search, sort, filter
  const [eventSearch, setEventSearch] = useState("");
  const [eventSortField, setEventSortField] = useState<"name" | "capacity" | "registered" | "available" | "venue" | "date">("name");
  const [eventSortAsc, setEventSortAsc] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "filling" | "full">("all");

  // User search & filter state
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "coordinator">("all");

  // Announcements & Resources search
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");

  // Edit Event Modal state
  const [editingEvent, setEditingEvent] = useState<EventConfig | null>(null);

  // Computed & Filtered Events Table Data
  const processedEvents = useMemo(() => {
    return events
      .map((e) => {
        const registered = counts[e.id] ?? 0;
        const available = Math.max(e.capacity - registered, 0);
        let status: "available" | "filling" | "full" = "available";
        if (available === 0) status = "full";
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
          e.sheetEventLabel.toLowerCase().includes(q) ||
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

  // Filtered Users
  const processedUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    });
  }, [users, userSearch, roleFilter]);

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

  // Export Events to CSV
  function handleExportEventsCSV() {
    const headers = ["ID", "Event Name", "Tagline", "Date", "Time", "Venue", "Capacity", "Registered", "Available Spots", "Google Sheet Label"];
    const rows = processedEvents.map((e) => [
      `"${e.id}"`,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${(e.tagline || "").replace(/"/g, '""')}"`,
      `"${e.date}"`,
      `"${e.time}"`,
      `"${e.venue.replace(/"/g, '""')}"`,
      e.capacity,
      e.registered,
      e.available,
      `"${e.sheetEventLabel.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `symposium_events_registration_${new Date().toISOString().slice(0, 10)}.csv`);
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
                Admin Control Center
              </span>
              <span className="font-mono text-xs text-slate-500">
                {settings.symposiumName}
              </span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
              Master Admin Panel
            </h1>
            <p className="mt-1 font-mono text-xs text-slate-500">
              Logged in as <span className="text-slate-900 font-semibold">{currentUser.name}</span> (@{currentUser.username})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/coordinators"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs font-semibold text-slate-700 shadow-sm transition hover:border-sky-500 hover:text-sky-600 hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Coordinator Portal
            </Link>
            <SignOutButton />
          </div>
        </div>

        {/* Section 1: Live Event Seats & Registration Data */}
        <section className="glass rounded-3xl p-6 sm:p-8 space-y-6 shadow-glass border border-slate-200/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Event Seats &amp; Live Registration Status
                </h2>
                <span className={`h-2.5 w-2.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                <span className="font-mono text-xs text-slate-500 font-medium">
                  {isLive ? "Connected to Google Sheet" : "Preview Mode (Sheet Not Connected)"}
                </span>
              </div>
              <p className="font-mono text-xs text-slate-500 mt-1">
                Live Google Form response counts. Filter, search, and sort event capacities below.
              </p>
            </div>

            <button
              onClick={handleExportEventsCSV}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 border border-sky-200 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-sky-700 transition hover:bg-sky-600 hover:text-white shadow-sm hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV / Excel
            </button>
          </div>

          {/* Search Bar & Filters Controls */}
          <div className="grid gap-3 sm:grid-cols-12 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
            <div className="sm:col-span-7 relative">
              <input
                type="text"
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                placeholder="🔍 Search events by name, venue, date, or sheet label…"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs text-slate-900 outline-none transition shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
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

            <div className="sm:col-span-5 flex gap-2">
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
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedEvents.map((e) => (
                  <tr key={e.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {e.name}
                      <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                        Sheet Label: <code className="text-sky-600 font-semibold bg-sky-50 px-1.5 py-0.5 rounded">{e.sheetEventLabel}</code>
                      </span>
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
                    <td className="px-4 py-3.5 text-right space-x-3">
                      <button
                        onClick={() => setEditingEvent(e)}
                        className="text-sky-600 hover:text-sky-800 font-bold text-[11px]"
                      >
                        Edit
                      </button>
                      <form action={deleteEventAction} className="inline">
                        <input type="hidden" name="id" value={e.id} />
                        <button
                          type="submit"
                          onClick={(evt) => {
                            if (!confirm(`Are you sure you want to delete event "${e.name}"?`)) {
                              evt.preventDefault();
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 font-bold text-[11px]"
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}

                {processedEvents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500 font-medium">
                      No matching events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Create & Manage Events (Assign Dates, Venues, Capacities) */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Add New Event Form */}
          <div className="glass rounded-3xl p-6 sm:p-8 space-y-4 shadow-glass border border-slate-200/80">
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              Add New Event
            </h3>
            <p className="font-mono text-xs text-slate-500">
              Set up new event, date, venue, and Google Form response dropdown label.
            </p>

            <form action={createEventAction} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Event Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. AI Hackathon 2026"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Event Date *</label>
                  <input
                    name="date"
                    required
                    placeholder="e.g. 15 Oct 2026"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Start Time *</label>
                  <input
                    name="time"
                    required
                    placeholder="e.g. 09:30 AM"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Venue *</label>
                  <input
                    name="venue"
                    required
                    placeholder="e.g. Auditorium B"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Capacity (Seats) *</label>
                  <input
                    name="capacity"
                    type="number"
                    defaultValue={60}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">
                  Google Form / Sheet Label *
                </label>
                <input
                  name="sheetEventLabel"
                  required
                  placeholder="e.g. Hackathon (Must match Google Form dropdown)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Tagline</label>
                <input
                  name="tagline"
                  placeholder="e.g. Build. Code. Win."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Event guidelines and details…"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="btn-cyber w-full justify-center mt-2 shadow-md"
              >
                Create Event
              </button>
            </form>
          </div>

          {/* Assign Coordinator to Event */}
          <div className="glass rounded-3xl p-6 sm:p-8 space-y-4 shadow-glass border border-slate-200/80">
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              Assign Coordinator to Event
            </h3>
            <p className="font-mono text-xs text-slate-500">
              Select an event and assign lead coordinators from committee members.
            </p>

            <form action={assignCoordinatorAction} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Select Event *</label>
                <select
                  name="eventId"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                >
                  <option value="">-- Choose an Event --</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.date})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Select Coordinator *</label>
                <select
                  name="name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                >
                  <option value="">-- Choose Coordinator / Admin --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role}) — {u.phone || u.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Role Title</label>
                <input
                  name="role"
                  defaultValue="Event Lead"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Contact Phone</label>
                  <input
                    name="phone"
                    placeholder="+91 90000 00000"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Email</label>
                  <input
                    name="email"
                    placeholder="coord@symposium.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-50 border border-indigo-200 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-indigo-700 hover:bg-indigo-600 hover:text-white transition shadow-sm"
              >
                Assign Coordinator
              </button>
            </form>
          </div>
        </section>

        {/* Section 3: Manage Admins & Coordinators */}
        <section className="glass rounded-3xl p-6 sm:p-8 space-y-6 shadow-glass border border-slate-200/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Admins &amp; Coordinators Management ({users.length})
              </h2>
              <p className="font-mono text-xs text-slate-500 mt-1">
                Add, remove, and filter role permissions for committee accounts.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="🔍 Search users…"
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-mono text-xs text-slate-900 outline-none shadow-sm focus:border-sky-500"
              />
              <select
                value={roleFilter}
                onChange={(e: any) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none shadow-sm focus:border-sky-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="coordinator">Coordinators</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm bg-white">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-100/80 text-[11px] uppercase tracking-widest text-slate-600 border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedUsers.map((u) => (
                  <tr key={u.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="px-4 py-3.5 text-slate-500">@{u.username}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                            : "bg-sky-100 text-sky-700 border border-sky-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{u.phone || "—"}</td>
                    <td className="px-4 py-3.5 text-slate-600">{u.email || "—"}</td>
                    <td className="px-4 py-3.5 text-right">
                      <form action={deleteUserAction} className="inline">
                        <input type="hidden" name="id" value={u.id} />
                        <button
                          type="submit"
                          onClick={(evt) => {
                            if (!confirm(`Are you sure you want to remove ${u.name}?`)) {
                              evt.preventDefault();
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 font-bold text-[11px]"
                        >
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}

                {processedUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-medium">
                      No matching users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add User Form */}
          <form
            action={createUserAction}
            className="grid gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 font-mono text-xs sm:grid-cols-2 lg:grid-cols-3"
          >
            <p className="col-span-full font-bold uppercase tracking-wider text-sky-700">
              Add New User Account (Admin or Coordinator)
            </p>
            <input
              name="name"
              required
              placeholder="Full Name"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
            />
            <input
              name="username"
              required
              placeholder="Username"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
            />
            <select
              name="role"
              required
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
            >
              <option value="coordinator">Coordinator</option>
              <option value="admin">Admin</option>
            </select>
            <input
              name="phone"
              placeholder="Phone (optional)"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
            />
            <input
              name="email"
              placeholder="Email (optional)"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
            />
            <button
              type="submit"
              className="btn-cyber col-span-full justify-center mt-2 shadow-md"
            >
              Create Account
            </button>
          </form>
        </section>

        {/* Section 4: Announcements & Resources */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Announcements */}
          <div className="glass rounded-3xl p-6 sm:p-8 space-y-4 shadow-glass border border-slate-200/80">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900">Announcements</h3>
              <input
                type="text"
                value={announcementSearch}
                onChange={(e) => setAnnouncementSearch(e.target.value)}
                placeholder="🔍 Search…"
                className="w-36 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-[11px] text-slate-900 outline-none focus:border-sky-500 shadow-sm"
              />
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {filteredAnnouncements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">{a.message}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                      by @{a.created_by} · {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <form action={deleteAnnouncementAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="font-mono text-[11px] font-bold text-rose-600 hover:underline">Remove</button>
                  </form>
                </div>
              ))}

              {filteredAnnouncements.length === 0 && (
                <p className="font-mono text-xs text-slate-500">No announcements found.</p>
              )}
            </div>

            <form action={createAnnouncementAction} className="flex gap-2">
              <input
                name="message"
                required
                placeholder="Broadcast a note to coordinators…"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-mono text-xs text-slate-900 outline-none focus:border-sky-500 shadow-sm"
              />
              <button type="submit" className="btn-cyber text-xs py-2 px-4 shadow-sm">
                Post
              </button>
            </form>
          </div>

          {/* Resources */}
          <div className="glass rounded-3xl p-6 sm:p-8 space-y-4 shadow-glass border border-slate-200/80">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900">Resources &amp; Links</h3>
              <input
                type="text"
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                placeholder="🔍 Search…"
                className="w-36 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-[11px] text-slate-900 outline-none focus:border-sky-500 shadow-sm"
              />
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {filteredResources.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                >
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-sky-600 font-bold underline hover:text-sky-800"
                  >
                    📄 {r.title}
                  </a>
                  <form action={deleteResourceAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="font-mono text-[11px] font-bold text-rose-600 hover:underline">Remove</button>
                  </form>
                </div>
              ))}

              {filteredResources.length === 0 && (
                <p className="font-mono text-xs text-slate-500">No resources found.</p>
              )}
            </div>

            <form action={createResourceAction} className="space-y-2 font-mono text-xs">
              <input
                name="title"
                required
                placeholder="Resource Title (e.g. Schedule PDF)"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
              />
              <div className="flex gap-2">
                <input
                  name="url"
                  required
                  placeholder="https://drive.google.com/…"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                />
                <button type="submit" className="btn-cyber text-xs py-2 px-4 shadow-sm">
                  Add Link
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Section 5: Website General Settings */}
        <section className="glass rounded-3xl p-6 sm:p-8 space-y-4 shadow-glass border border-slate-200/80">
          <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            General Site Information &amp; Links
          </h3>
          <p className="font-mono text-xs text-slate-500">
            Configure symposium title, hosting club, college name, and registration form URL.
          </p>

          <form action={updateSiteSettingsAction} className="grid gap-4 sm:grid-cols-2 font-mono text-xs">
            <div>
              <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Symposium Title</label>
              <input
                name="symposiumName"
                defaultValue={settings.symposiumName}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Hosting Club Name</label>
              <input
                name="clubName"
                defaultValue={settings.clubName}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">College Name</label>
              <input
                name="collegeName"
                defaultValue={settings.collegeName}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Google Form Registration URL</label>
              <input
                name="registerFormUrl"
                defaultValue={settings.registerFormUrl}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
              />
            </div>

            <button
              type="submit"
              className="btn-cyber col-span-full justify-center mt-2 shadow-md"
            >
              Save Site Settings
            </button>
          </form>
        </section>

      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="glass w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-4 font-mono text-xs border border-slate-200 shadow-depth bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Edit Event: {editingEvent.name}
              </h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-slate-400 hover:text-slate-700 font-mono text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateEventAction(formData);
                setEditingEvent(null);
              }}
              className="space-y-3"
            >
              <input type="hidden" name="id" value={editingEvent.id} />

              <div>
                <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Event Name</label>
                <input
                  name="name"
                  defaultValue={editingEvent.name}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Date</label>
                  <input
                    name="date"
                    defaultValue={editingEvent.date}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Time</label>
                  <input
                    name="time"
                    defaultValue={editingEvent.time}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Venue</label>
                  <input
                    name="venue"
                    defaultValue={editingEvent.venue}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Capacity</label>
                  <input
                    name="capacity"
                    type="number"
                    defaultValue={editingEvent.capacity}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Google Sheet Event Label</label>
                <input
                  name="sheetEventLabel"
                  defaultValue={editingEvent.sheetEventLabel}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Tagline</label>
                <input
                  name="tagline"
                  defaultValue={editingEvent.tagline}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 uppercase tracking-wider text-[10px] font-bold">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingEvent.description}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="w-1/2 rounded-2xl border border-slate-200 py-2.5 text-center text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-cyber w-1/2 justify-center shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
