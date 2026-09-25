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

// Default event operations checklist items for symposium coordinators
const DEFAULT_CHECKLIST = [
  { id: "chk-1", text: "Verify venue booking & unlock hall with facility team", category: "Pre-Event", completed: false },
  { id: "chk-2", text: "Test audio, projector, HDMI connections & wireless clicker", category: "Pre-Event", completed: false },
  { id: "chk-3", text: "Set up registration desk, participant badges & pen kits", category: "Pre-Event", completed: false },
  { id: "chk-4", text: "Cross-check registered attendees against Live Google Sheet", category: "Pre-Event", completed: false },
  { id: "chk-5", text: "Welcome judges/speakers and brief them on scoring criteria", category: "During Event", completed: false },
  { id: "chk-6", text: "Deliver opening briefing and explain rules to participants", category: "During Event", completed: false },
  { id: "chk-7", text: "Track round timings and keep strict timekeeper countdowns", category: "During Event", completed: false },
  { id: "chk-8", text: "Collect evaluation sheets and tally judge scorecards", category: "During Event", completed: false },
  { id: "chk-9", text: "Submit verified winner results to Core Admin for certificate print", category: "Post-Event", completed: false },
  { id: "chk-10", text: "Coordinate prize distribution & participation certificates", category: "Post-Event", completed: false },
  { id: "chk-11", text: "Inspect venue clean-up & return borrowed AV/college equipment", category: "Post-Event", completed: false },
  { id: "chk-12", text: "File final event turnout report to faculty coordinator desk", category: "Post-Event", completed: false },
];

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
  // ── Theme State (Dark / Light) matching Admin Panel ──
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("admin-dashboard-theme");
    const initial = saved === "light" || saved === "dark" ? saved : "dark";
    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("admin-dashboard-theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const isDark = theme === "dark";

  // ── Left Sidebar Navigation State ──
  const [activeNavTab, setActiveNavTab] = useState<string>("home");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleNavTabClick = (tabId: string) => {
    setActiveNavTab(tabId);
    setIsMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toast notification for user actions (copy, sync, etc.)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // ── Live counts state (auto-polled every 30s) ──
  const [liveCounts, setLiveCounts] = useState<Record<string, number>>(counts);
  const [liveIsLive, setLiveIsLive] = useState(isLive);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCounts = useCallback(async (forceRefresh = false) => {
    try {
      const url = forceRefresh ? "/api/sheets/refresh" : "/api/sheets";
      const method = forceRefresh ? "POST" : "GET";
      const res = await fetch(url, { method });
      if (!res.ok) {
        if (forceRefresh) {
          // Fallback to GET /api/sheets if POST is rejected
          const fallbackRes = await fetch("/api/sheets");
          if (fallbackRes.ok) {
            const fallbackJson = await fallbackRes.json();
            const newCounts: Record<string, number> = {};
            for (const item of fallbackJson.data ?? []) {
              newCounts[item.id] = item.registered;
            }
            setLiveCounts(newCounts);
            setLiveIsLive(fallbackJson.isLive ?? false);
            setLastRefreshed(new Date());
            showToast("Refreshed seat counts successfully");
          }
        }
        return;
      }
      const json = await res.json();
      const newCounts: Record<string, number> = {};
      for (const item of json.data ?? []) {
        newCounts[item.id] = item.registered;
      }
      setLiveCounts(newCounts);
      setLiveIsLive(json.isLive ?? false);
      setLastRefreshed(new Date());
      if (forceRefresh) {
        showToast("Synchronized with Google Sheets!");
      }
    } catch {
      // silently ignore stale data
    }
  }, [showToast]);

  useEffect(() => {
    pollingRef.current = setInterval(() => fetchCounts(false), 30_000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchCounts]);

  const handleRefreshCounts = useCallback(async () => {
    setIsRefreshing(true);
    await fetchCounts(true);
    setIsRefreshing(false);
  }, [fetchCounts]);

  // ── Live Seats & Events Table State ──
  const [eventSearch, setEventSearch] = useState("");
  const [eventSortField, setEventSortField] = useState<
    "name" | "capacity" | "registered" | "available" | "venue" | "date"
  >("name");
  const [eventSortAsc, setEventSortAsc] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "filling" | "full">("all");
  const [onlyMyEvents, setOnlyMyEvents] = useState(false);

  // ── Search & Filter states for other tabs ──
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [scheduleEventFilter, setScheduleEventFilter] = useState("all");
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryRoleFilter, setDirectoryRoleFilter] = useState<"all" | "admin" | "coordinator">("all");
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");

  // ── Interactive Checklist State (persisted in localStorage) ──
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [newChecklistText, setNewChecklistText] = useState("");
  const [newChecklistCategory, setNewChecklistCategory] = useState("During Event");

  useEffect(() => {
    const saved = localStorage.getItem("coordinator-operations-checklist");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChecklist(parsed);
        }
      } catch {
        // ignore parsing issues
      }
    }
  }, []);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item));
      localStorage.setItem("coordinator-operations-checklist", JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newItem = {
      id: `chk-custom-${Date.now()}`,
      text: newChecklistText.trim(),
      category: newChecklistCategory,
      completed: false,
    };
    setChecklist((prev) => {
      const updated = [newItem, ...prev];
      localStorage.setItem("coordinator-operations-checklist", JSON.stringify(updated));
      return updated;
    });
    setNewChecklistText("");
    showToast("Added checklist item");
  };

  const handleResetChecklist = () => {
    if (confirm("Reset operations checklist to standard defaults?")) {
      setChecklist(DEFAULT_CHECKLIST);
      localStorage.setItem("coordinator-operations-checklist", JSON.stringify(DEFAULT_CHECKLIST));
      showToast("Checklist reset to defaults");
    }
  };

  const completedChecklistCount = useMemo(() => checklist.filter((i) => i.completed).length, [checklist]);
  const checklistCompletionPct = checklist.length > 0 ? Math.round((completedChecklistCount / checklist.length) * 100) : 0;

  // ── Computed Users Breakdown ──
  const admins = useMemo(() => users.filter((u) => u.role === "admin"), [users]);
  const coordinators = useMemo(() => users.filter((u) => u.role === "coordinator"), [users]);

  // ── Computed & Filtered Events Table ──
  const processedEvents = useMemo(() => {
    return events
      .map((e) => {
        const registered = liveCounts[e.id] ?? 0;
        const available = Math.max(e.capacity - registered, 0);
        let status: "available" | "filling" | "full" = "available";
        if (available === 0 || registered >= e.capacity) status = "full";
        else if (available <= e.capacity * 0.2) status = "filling";

        const pct = e.capacity > 0 ? Math.min(Math.round((registered / e.capacity) * 100), 100) : 0;

        // Check if assigned to current user
        const isMyEvent = (e.coordinators || []).some(
          (c) =>
            c.name.toLowerCase() === currentUser.name.toLowerCase() ||
            (c.email && c.email.toLowerCase() === currentUser.username.toLowerCase())
        );

        return {
          ...e,
          registered,
          available,
          status,
          occupancyPct: pct,
          isMyEvent,
        };
      })
      .filter((e) => {
        if (onlyMyEvents && !e.isMyEvent) return false;
        if (statusFilter !== "all" && e.status !== statusFilter) return false;
        if (!eventSearch.trim()) return true;
        const q = eventSearch.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.date.toLowerCase().includes(q) ||
          e.sheetEventLabel.toLowerCase().includes(q) ||
          (e.tagline && e.tagline.toLowerCase().includes(q)) ||
          (e.coordinators && e.coordinators.some((c) => c.name.toLowerCase().includes(q)))
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
  }, [events, liveCounts, statusFilter, onlyMyEvents, eventSearch, currentUser, eventSortField, eventSortAsc]);

  // ── Executive KPI Summary Calculations ──
  const totalCapacity = useMemo(() => events.reduce((sum, e) => sum + (e.capacity || 0), 0), [events]);
  const totalRegistered = useMemo(
    () => events.reduce((sum, e) => sum + (liveCounts[e.id] ?? 0), 0),
    [events, liveCounts]
  );
  const totalAvailable = Math.max(totalCapacity - totalRegistered, 0);
  const overallOccupancy = totalCapacity > 0 ? Math.min(Math.round((totalRegistered / totalCapacity) * 100), 100) : 0;

  const statusStats = useMemo(() => {
    let openCount = 0;
    let fillingCount = 0;
    let fullCount = 0;
    for (const e of events) {
      const reg = liveCounts[e.id] ?? 0;
      const avail = Math.max(e.capacity - reg, 0);
      if (avail === 0 || reg >= e.capacity) fullCount++;
      else if (avail <= e.capacity * 0.2) fillingCount++;
      else openCount++;
    }
    return { openCount, fillingCount, fullCount };
  }, [events, liveCounts]);

  // ── Filtered Schedules ──
  const filteredSchedules = useMemo(() => {
    return events
      .filter((e) => {
        if (scheduleEventFilter !== "all" && e.id !== scheduleEventFilter) return false;
        if (!scheduleSearch.trim()) return true;
        const q = scheduleSearch.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.schedule.some((s) => s.item.toLowerCase().includes(q) || s.time.toLowerCase().includes(q))
        );
      })
      .map((e) => {
        if (!scheduleSearch.trim()) return e;
        const q = scheduleSearch.toLowerCase();
        return {
          ...e,
          schedule: e.schedule.filter(
            (s) =>
              s.item.toLowerCase().includes(q) ||
              s.time.toLowerCase().includes(q) ||
              e.name.toLowerCase().includes(q)
          ),
        };
      })
      .filter((e) => e.schedule.length > 0);
  }, [events, scheduleSearch, scheduleEventFilter]);

  // ── Filtered Directory ──
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (directoryRoleFilter !== "all" && u.role !== directoryRoleFilter) return false;
      if (!directorySearch.trim()) return true;
      const q = directorySearch.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    });
  }, [users, directorySearch, directoryRoleFilter]);

  // ── Filtered Announcements ──
  const filteredAnnouncements = useMemo(() => {
    if (!announcementSearch.trim()) return announcements;
    const q = announcementSearch.toLowerCase();
    return announcements.filter(
      (a) => a.message.toLowerCase().includes(q) || a.created_by.toLowerCase().includes(q)
    );
  }, [announcements, announcementSearch]);

  // ── Filtered Resources ──
  const filteredResources = useMemo(() => {
    if (!resourceSearch.trim()) return resources;
    const q = resourceSearch.toLowerCase();
    return resources.filter(
      (r) => r.title.toLowerCase().includes(q) || r.url.toLowerCase().includes(q)
    );
  }, [resources, resourceSearch]);

  // ── Export Events CSV for Coordinators ──
  function handleExportEventsCSV() {
    const headers = [
      "Event ID",
      "Event Name",
      "Venue",
      "Date",
      "Time",
      "Capacity",
      "Registered",
      "Available Spots",
      "Occupancy %",
      "Status",
      "Sheet Label",
      "Assigned Coordinators",
    ];
    const rows = processedEvents.map((e) => [
      `"${e.id}"`,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.venue.replace(/"/g, '""')}"`,
      `"${e.date}"`,
      `"${e.time}"`,
      e.capacity,
      e.registered,
      e.available,
      `"${e.occupancyPct}%"`,
      e.status,
      `"${e.sheetEventLabel.replace(/"/g, '""')}"`,
      `"${(e.coordinators || []).map((c) => c.name).join("; ").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `coordinator_events_status_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded event registrations CSV");
  }

  function handleSort(field: "name" | "capacity" | "registered" | "available" | "venue" | "date") {
    if (eventSortField === field) {
      setEventSortAsc(!eventSortAsc);
    } else {
      setEventSortField(field);
      setEventSortAsc(true);
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  // Helper to determine resource icon & label
  const getResourceMeta = (url: string) => {
    const low = url.toLowerCase();
    if (low.includes("drive.google.com") || low.includes("docs.google.com/document")) {
      return { label: "Google Doc", color: "bg-blue-500/15 text-blue-400 border-blue-400/30", icon: "📄" };
    }
    if (low.includes("docs.google.com/spreadsheets") || low.includes("sheets")) {
      return { label: "Spreadsheet", color: "bg-emerald-500/15 text-emerald-400 border-emerald-400/30", icon: "📊" };
    }
    if (low.includes("forms.gle") || low.includes("forms")) {
      return { label: "Google Form", color: "bg-purple-500/15 text-purple-400 border-purple-400/30", icon: "📝" };
    }
    if (low.endsWith(".pdf")) {
      return { label: "PDF Document", color: "bg-rose-500/15 text-rose-400 border-rose-400/30", icon: "📕" };
    }
    return { label: "External Link", color: "bg-sky-500/15 text-sky-400 border-sky-400/30", icon: "🔗" };
  };

  // ── Theme Design System Tokens (Identical to Admin Panel) ──
  const bgMain = isDark ? "bg-[#0d121f] text-slate-100" : "bg-[#f4f7fb] text-slate-900";
  const cardBg = isDark
    ? "border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-xl"
    : "border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-md shadow-slate-200/40";
  const headerText = isDark ? "text-white" : "text-slate-900";
  const subText = isDark ? "text-slate-400" : "text-slate-500";
  const inputBg = isDark
    ? "border-white/10 bg-white/[0.05] text-white placeholder:text-slate-500 focus:border-sky-400 focus:bg-white/[0.08]"
    : "border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white shadow-xs";
  const selectBg = isDark
    ? "border-white/10 bg-slate-900 text-slate-200 focus:border-sky-400"
    : "border-slate-200 bg-white text-slate-800 focus:border-sky-500 shadow-xs";
  const tableHeadBg = isDark
    ? "bg-white/[0.05] text-slate-400 border-white/10"
    : "bg-slate-100/90 text-slate-600 border-slate-200";
  const tableRowHover = isDark ? "hover:bg-white/[0.04]" : "hover:bg-slate-50/90";
  const tableDivide = isDark ? "divide-white/5" : "divide-slate-100";
  const searchBoxBg = isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-100/60";
  const borderCol = isDark ? "border-white/10" : "border-slate-200/80";

  // Sidebar navigation definitions
  const navTabs = [
    {
      id: "home",
      label: "Overview & Seats",
      badgeText: null,
      colorBadge: isDark
        ? "bg-sky-500/15 text-sky-300 border-sky-400/30 group-hover:bg-sky-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-sky-500/25"
        : "bg-sky-100 text-sky-950 border-sky-300 group-hover:bg-sky-500 group-hover:text-white font-bold group-hover:shadow-md group-hover:shadow-sky-500/25",
      activeIconBadge: "bg-gradient-to-tr from-sky-500 to-blue-600 text-white border-sky-400 shadow-md shadow-sky-500/30",
      activePill: isDark
        ? "bg-gradient-to-r from-sky-500/20 to-blue-500/15 text-sky-300 border border-sky-400/40 shadow-xs shadow-sky-500/20 font-bold"
        : "bg-gradient-to-r from-sky-100 to-blue-50 text-sky-900 border border-sky-300/80 shadow-xs font-bold",
      activeDot: "bg-sky-500 shadow-sm shadow-sky-500/50",
      hoverClass: isDark ? "hover:bg-sky-500/10 hover:text-sky-300" : "hover:bg-sky-50/80 hover:text-sky-900",
      icon: (isActive: boolean) => (
        <svg
          className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
          fill={isActive ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={isActive ? 0 : 2}
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      id: "events",
      label: "Event Explorer",
      badgeText: String(events.length),
      colorBadge: isDark
        ? "bg-amber-500/15 text-amber-300 border-amber-400/30 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-amber-500/25"
        : "bg-amber-100 text-amber-950 border-amber-300 group-hover:bg-amber-500 group-hover:text-white font-bold group-hover:shadow-md group-hover:shadow-amber-500/25",
      activeIconBadge: "bg-gradient-to-tr from-amber-500 to-orange-500 text-white border-amber-400 shadow-md shadow-amber-500/30",
      activePill: isDark
        ? "bg-gradient-to-r from-amber-500/20 to-orange-500/15 text-amber-300 border border-amber-400/40 shadow-xs shadow-amber-500/20 font-bold"
        : "bg-gradient-to-r from-amber-100 to-orange-50 text-amber-900 border border-amber-300/80 shadow-xs font-bold",
      activeDot: "bg-amber-500 shadow-sm shadow-amber-500/50",
      hoverClass: isDark ? "hover:bg-amber-500/10 hover:text-amber-300" : "hover:bg-amber-50/80 hover:text-amber-900",
      icon: (_isActive: boolean) => (
        <svg
          className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: "schedules",
      label: "Event Schedules",
      badgeText: null,
      colorBadge: isDark
        ? "bg-indigo-500/15 text-indigo-300 border-indigo-400/30 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-indigo-500/25"
        : "bg-indigo-100 text-indigo-950 border-indigo-300 group-hover:bg-indigo-500 group-hover:text-white font-bold group-hover:shadow-md group-hover:shadow-indigo-500/25",
      activeIconBadge: "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30",
      activePill: isDark
        ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/15 text-indigo-300 border border-indigo-400/40 shadow-xs shadow-indigo-500/20 font-bold"
        : "bg-gradient-to-r from-indigo-100 to-purple-50 text-indigo-900 border border-indigo-300/80 shadow-xs font-bold",
      activeDot: "bg-indigo-500 shadow-sm shadow-indigo-500/50",
      hoverClass: isDark ? "hover:bg-indigo-500/10 hover:text-indigo-300" : "hover:bg-indigo-50/80 hover:text-indigo-900",
      icon: (_isActive: boolean) => (
        <svg
          className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "announcements",
      label: "Announcements",
      badgeText: String(announcements.length),
      colorBadge: isDark
        ? "bg-rose-500/15 text-rose-300 border-rose-400/30 group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-rose-500/25"
        : "bg-rose-100 text-rose-950 border-rose-300 group-hover:bg-rose-500 group-hover:text-white font-bold group-hover:shadow-md group-hover:shadow-rose-500/25",
      activeIconBadge: "bg-gradient-to-tr from-rose-500 to-pink-600 text-white border-rose-400 shadow-md shadow-rose-500/30",
      activePill: isDark
        ? "bg-gradient-to-r from-rose-500/20 to-pink-500/15 text-rose-300 border border-rose-400/40 shadow-xs shadow-rose-500/20 font-bold"
        : "bg-gradient-to-r from-rose-100 to-pink-50 text-rose-900 border border-rose-300/80 shadow-xs font-bold",
      activeDot: "bg-rose-500 shadow-sm shadow-rose-500/50",
      hoverClass: isDark ? "hover:bg-rose-500/10 hover:text-rose-300" : "hover:bg-rose-50/80 hover:text-rose-900",
      icon: (_isActive: boolean) => (
        <svg
          className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      id: "directory",
      label: "Team Directory",
      badgeText: String(users.length),
      colorBadge: isDark
        ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-emerald-500/25"
        : "bg-emerald-100 text-emerald-950 border-emerald-300 group-hover:bg-emerald-500 group-hover:text-white font-bold group-hover:shadow-md group-hover:shadow-emerald-500/25",
      activeIconBadge: "bg-gradient-to-tr from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-500/30",
      activePill: isDark
        ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/15 text-emerald-300 border border-emerald-400/40 shadow-xs shadow-emerald-500/20 font-bold"
        : "bg-gradient-to-r from-emerald-100 to-teal-50 text-emerald-900 border border-emerald-300/80 shadow-xs font-bold",
      activeDot: "bg-emerald-500 shadow-sm shadow-emerald-500/50",
      hoverClass: isDark ? "hover:bg-emerald-500/10 hover:text-emerald-300" : "hover:bg-emerald-50/80 hover:text-emerald-900",
      icon: (_isActive: boolean) => (
        <svg
          className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: "resources",
      label: "Shared Resources",
      badgeText: String(resources.length),
      colorBadge: isDark
        ? "bg-purple-500/15 text-purple-300 border-purple-400/30 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-purple-500/25"
        : "bg-purple-100 text-purple-950 border-purple-300 group-hover:bg-purple-500 group-hover:text-white font-bold group-hover:shadow-md group-hover:shadow-purple-500/25",
      activeIconBadge: "bg-gradient-to-tr from-purple-500 to-fuchsia-600 text-white border-purple-400 shadow-md shadow-purple-500/30",
      activePill: isDark
        ? "bg-gradient-to-r from-purple-500/20 to-fuchsia-500/15 text-purple-300 border border-purple-400/40 shadow-xs shadow-purple-500/20 font-bold"
        : "bg-gradient-to-r from-purple-100 to-fuchsia-50 text-purple-900 border border-purple-300/80 shadow-xs font-bold",
      activeDot: "bg-purple-500 shadow-sm shadow-purple-500/50",
      hoverClass: isDark ? "hover:bg-purple-500/10 hover:text-purple-300" : "hover:bg-purple-50/80 hover:text-purple-900",
      icon: (_isActive: boolean) => (
        <svg
          className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "checklist",
      label: "Day Checklist",
      badgeText: `${completedChecklistCount}/${checklist.length}`,
      colorBadge: isDark
        ? "bg-cyan-500/15 text-cyan-300 border-cyan-400/30 group-hover:bg-cyan-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-cyan-500/25"
        : "bg-cyan-100 text-cyan-950 border-cyan-300 group-hover:bg-cyan-500 group-hover:text-white font-bold group-hover:shadow-md group-hover:shadow-cyan-500/25",
      activeIconBadge: "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30",
      activePill: isDark
        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/15 text-cyan-300 border border-cyan-400/40 shadow-xs shadow-cyan-500/20 font-bold"
        : "bg-gradient-to-r from-cyan-100 to-blue-50 text-cyan-900 border border-cyan-300/80 shadow-xs font-bold",
      activeDot: "bg-cyan-500 shadow-sm shadow-cyan-500/50",
      hoverClass: isDark ? "hover:bg-cyan-500/10 hover:text-cyan-300" : "hover:bg-cyan-50/80 hover:text-cyan-900",
      icon: (_isActive: boolean) => (
        <svg
          className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ];

  // ── Render Sidebar Content (Identical polished structure as Admin Panel) ──
  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Brand / Logo Header */}
      <div className={`p-4 border-b ${isDark ? "border-white/10" : "border-slate-200/80"} shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-display font-black text-lg shadow-md shadow-sky-500/25 shrink-0 ring-2 ring-sky-500/20">
              C
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className={`font-display font-black text-sm tracking-tight truncate ${headerText} leading-none`}>
                  Coordinator Panel
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider border shrink-0 ${
                    liveIsLive
                      ? isDark
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-emerald-100 text-emerald-950 border-emerald-300"
                      : isDark
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-amber-100 text-amber-950 border-amber-300"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${liveIsLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                  {liveIsLive ? "Live" : "Preview"}
                </span>
              </div>
              <p
                className={`text-[11px] font-mono font-medium truncate ${subText} pt-1`}
                title={settings.symposiumName}
              >
                {settings.symposiumName}
              </p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className={`p-1.5 rounded-lg border ${
                isDark
                  ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                  : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider ${subText}`}>
          Navigation
        </div>

        {navTabs.map((tab) => {
          const isActive = activeNavTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleNavTabClick(tab.id)}
              className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold ${
                isActive
                  ? tab.activePill
                  : `${isDark ? "text-slate-300" : "text-slate-700"} ${tab.hoverClass}`
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-200 shrink-0 ${
                    isActive
                      ? `${tab.activeIconBadge} scale-105`
                      : `${tab.colorBadge} opacity-90 group-hover:opacity-100 group-hover:scale-105`
                  }`}
                >
                  {tab.icon(isActive)}
                </div>
                <span className="tracking-tight truncate">{tab.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {tab.badgeText && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    isActive
                      ? isDark ? "bg-white/20 text-white" : "bg-sky-200 text-sky-900"
                      : isDark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-600"
                  }`}>
                    {tab.badgeText}
                  </span>
                )}
                {isActive && (
                  <span className="flex h-2 w-2 relative shrink-0">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${tab.activeDot}`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${tab.activeDot}`} />
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {/* Quick Portal Switch Links */}
        <div className="pt-3 mt-2 border-t border-slate-200/50 dark:border-white/10 space-y-1">
          <div className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider ${subText}`}>
            Quick Links
          </div>
          <Link
            href="/"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-mono transition ${
              isDark
                ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>🌐</span>
            <span>View Public Site</span>
          </Link>
          {currentUser.role === "admin" && (
            <Link
              href="/admin"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-mono font-bold transition ${
                isDark
                  ? "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                  : "text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50"
              }`}
            >
              <span>⚡</span>
              <span>Switch to Admin Panel</span>
            </Link>
          )}
        </div>
      </nav>

      {/* User Info & Controls Footer */}
      <div className={`p-4 border-t ${isDark ? "border-white/10" : "border-slate-100"} space-y-3 shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : "CO"}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-semibold truncate ${headerText}`}>{currentUser.name}</p>
            <p className={`text-[10px] font-mono truncate ${subText}`}>@{currentUser.username}</p>
          </div>
          <span
            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
              isDark
                ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
                : "bg-sky-100 text-sky-950 border-sky-300"
            }`}
          >
            {currentUser.role === "admin" ? "Admin" : "Coordinator"}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={toggleTheme}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border font-mono text-[11px] font-bold transition ${
              isDark
                ? "border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span>{isDark ? "☀️ Light" : "🌙 Dark"}</span>
          </button>
          <SignOutButton />
        </div>
      </div>
    </div>
  );

  return (
    <main
      className={`min-h-screen ${bgMain} relative overflow-x-hidden font-body transition-colors duration-300 selection:bg-sky-500/30 selection:text-sky-200`}
    >
      {/* Subtle Background Glows matching Admin Panel */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className={`absolute top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full blur-[140px] transition-opacity duration-500 ${
            isDark ? "bg-sky-500/10 opacity-70" : "bg-sky-400/15 opacity-50"
          }`}
        />
        <div
          className={`absolute top-[35%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[140px] transition-opacity duration-500 ${
            isDark ? "bg-indigo-500/10 opacity-60" : "bg-indigo-400/15 opacity-40"
          }`}
        />
        <div
          className={`absolute bottom-[-10%] left-[25%] w-[600px] h-[600px] rounded-full blur-[150px] transition-opacity duration-500 ${
            isDark ? "bg-cyan-500/10 opacity-50" : "bg-cyan-300/15 opacity-40"
          }`}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? "#ffffff" : "#0f172a"} 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="rounded-2xl border border-sky-400/50 bg-sky-950/90 text-white px-4 py-3 shadow-2xl backdrop-blur-xl flex items-center gap-2.5 font-mono text-xs">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Mobile Top Bar Navigation */}
      <div
        className={`lg:hidden sticky top-0 z-40 border-b px-4 py-3 flex items-center justify-between backdrop-blur-xl ${
          isDark
            ? "bg-[#0b101b]/90 border-white/10 text-white"
            : "bg-white/95 border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className={`p-2 rounded-xl border ${
              isDark
                ? "border-white/10 text-slate-300 hover:bg-white/5"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            aria-label="Open navigation sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-xs">
              C
            </div>
            <span className="font-display font-bold text-sm tracking-tight">Coordinator Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border text-xs ${
              isDark
                ? "border-amber-400/30 bg-amber-500/15 text-amber-300"
                : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
            aria-label="Toggle Theme"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Off-Canvas Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside
            className={`fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] border-r ${
              isDark ? "bg-[#0b101b] border-white/10" : "bg-white border-slate-200"
            } z-50 flex flex-col shadow-2xl transition-transform`}
          >
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Layout Container (Desktop Sidebar + Right Content) */}
      <div className="relative z-10 min-h-screen">
        {/* Desktop Fixed Left Sidebar */}
        <aside
          className={`w-64 border-r transition-colors duration-300 ${
            isDark
              ? "bg-[#0b101b]/95 border-white/10"
              : "bg-white/95 border-slate-200/80 shadow-xs"
          } backdrop-blur-xl hidden lg:flex lg:flex-col fixed top-0 bottom-0 left-0 h-screen z-30`}
        >
          {renderSidebarContent(false)}
        </aside>

        {/* Right Dashboard Content */}
        <div className="flex-1 min-w-0 lg:ml-64 px-4 py-8 sm:px-6 lg:px-8 space-y-8 max-w-7xl">
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW & LIVE SEATS (Default Home View)                           */}
          {/* ========================================================================= */}
          {activeNavTab === "home" && (
            <>
              {/* TOP EXECUTIVE COMMAND HEADER */}
              <header className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 transition-all`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border shadow-xs ${
                          isDark
                            ? "bg-sky-500/15 text-sky-300 border-sky-400/30"
                            : "bg-sky-100 text-sky-950 border-sky-300"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping" />
                        COORDINATOR OPERATIONS DESK
                      </span>
                      <span className={`${subText} text-xs`}>•</span>
                      <span className={`font-mono text-xs font-medium ${subText} tracking-wide`}>
                        {settings.symposiumName}
                      </span>
                    </div>

                    <h1 className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight ${headerText} flex items-center gap-3`}>
                      Coordinator Dashboard
                    </h1>

                    <div className={`flex items-center gap-2 font-mono text-xs ${subText} pt-0.5`}>
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      <span>
                        Logged in as <strong className={`${isDark ? "text-slate-200" : "text-slate-800"} font-semibold`}>{currentUser.name}</strong>
                      </span>
                      <span className={`rounded-md ${isDark ? "bg-white/10 text-sky-300" : "bg-sky-50 text-sky-700 border-sky-200"} px-2 py-0.5 text-[11px] font-medium border border-white/5`}>
                        @{currentUser.username}
                      </span>
                      <span className="text-[11px] text-slate-400">·</span>
                      <span className="text-[11px] font-bold text-sky-500 uppercase tracking-wider">{currentUser.role}</span>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
                    {/* Dark/Light Toggle */}
                    <button
                      type="button"
                      onClick={toggleTheme}
                      aria-label="Toggle Theme"
                      className={`group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm ${
                        isDark
                          ? "border-amber-400/30 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 hover:border-amber-400"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {isDark ? (
                        <>
                          <span className="text-sm">☀️</span>
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm">🌙</span>
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>

                    {/* Back to Admin if Admin */}
                    {currentUser.role === "admin" && (
                      <Link
                        href="/admin"
                        className={`group inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-xs font-semibold shadow-sm transition-all duration-200 ${
                          isDark
                            ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 hover:border-indigo-400"
                            : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white"
                        }`}
                      >
                        <span>⚡</span>
                        Admin Panel
                      </Link>
                    )}

                    <SignOutButton />
                  </div>
                </div>

                {/* Quick Navigation Jump Pills */}
                <div className={`mt-6 pt-5 border-t ${borderCol} flex flex-wrap gap-2.5 text-xs font-mono`}>
                  <a
                    href="#live-seats-table"
                    className={`px-3.5 py-1.5 rounded-xl border transition hover:shadow-md hover:scale-[1.02] font-bold ${
                      isDark
                        ? "bg-cyan-500/15 text-cyan-300 border-cyan-400/30 hover:border-cyan-400"
                        : "bg-cyan-50 text-cyan-950 border-cyan-300 hover:bg-cyan-100"
                    }`}
                  >
                    📊 Live Seats Table
                  </a>
                  <a
                    href="#visual-analytics"
                    className={`px-3.5 py-1.5 rounded-xl border transition hover:shadow-md hover:scale-[1.02] font-bold ${
                      isDark
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30 hover:border-emerald-400"
                        : "bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100"
                    }`}
                  >
                    📈 Seat Analytics
                  </a>
                  <button
                    type="button"
                    onClick={() => handleNavTabClick("events")}
                    className={`px-3.5 py-1.5 rounded-xl border transition hover:shadow-md hover:scale-[1.02] font-bold ${
                      isDark
                        ? "bg-amber-500/15 text-amber-300 border-amber-400/30 hover:border-amber-400"
                        : "bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100"
                    }`}
                  >
                    📅 Event Cards ({events.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavTabClick("schedules")}
                    className={`px-3.5 py-1.5 rounded-xl border transition hover:shadow-md hover:scale-[1.02] font-bold ${
                      isDark
                        ? "bg-indigo-500/15 text-indigo-300 border-indigo-400/30 hover:border-indigo-400"
                        : "bg-indigo-50 text-indigo-950 border-indigo-300 hover:bg-indigo-100"
                    }`}
                  >
                    ⏱️ Master Schedules
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavTabClick("directory")}
                    className={`px-3.5 py-1.5 rounded-xl border transition hover:shadow-md hover:scale-[1.02] font-bold ${
                      isDark
                        ? "bg-teal-500/15 text-teal-300 border-teal-400/30 hover:border-teal-400"
                        : "bg-teal-50 text-teal-950 border-teal-300 hover:bg-teal-100"
                    }`}
                  >
                    👥 Team Directory ({users.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavTabClick("announcements")}
                    className={`px-3.5 py-1.5 rounded-xl border transition hover:shadow-md hover:scale-[1.02] font-bold ${
                      isDark
                        ? "bg-rose-500/15 text-rose-300 border-rose-400/30 hover:border-rose-400"
                        : "bg-rose-50 text-rose-950 border-rose-300 hover:bg-rose-100"
                    }`}
                  >
                    📢 Announcements ({announcements.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavTabClick("checklist")}
                    className={`px-3.5 py-1.5 rounded-xl border transition hover:shadow-md hover:scale-[1.02] font-bold ${
                      isDark
                        ? "bg-sky-500/15 text-sky-300 border-sky-400/30 hover:border-sky-400"
                        : "bg-sky-50 text-sky-950 border-sky-300 hover:bg-sky-100"
                    }`}
                  >
                    ✅ Day Checklist ({checklistCompletionPct}%)
                  </button>
                </div>
              </header>

              {/* EXECUTIVE KPI SUMMARY CARDS */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Registrations & Occupancy */}
                <div className={`relative overflow-hidden rounded-2xl border ${cardBg} p-5 transition hover:scale-[1.01]`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${subText}`}>
                      Total Registrations
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-display text-3xl font-extrabold ${headerText} tracking-tight`}>
                        {totalRegistered}
                      </span>
                      <span className={`font-mono text-xs ${subText}`}>
                        / {totalCapacity} spots
                      </span>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className={`h-2 w-full overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500"
                          style={{ width: `${overallOccupancy}%` }}
                        />
                      </div>
                      <div className={`flex justify-between text-[10px] font-mono ${subText}`}>
                        <span>Occupancy</span>
                        <span className="font-bold text-sky-500">{overallOccupancy}% Filled</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Active Events & Status */}
                <div className={`relative overflow-hidden rounded-2xl border ${cardBg} p-5 transition hover:scale-[1.01]`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${subText}`}>
                      Symposium Events
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-display text-3xl font-extrabold ${headerText} tracking-tight`}>
                        {events.length}
                      </span>
                      <span className={`font-mono text-xs ${subText}`}>Events Listed</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 font-mono text-[11px]">
                      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-bold ${
                        isDark
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                          : "bg-emerald-100 border-emerald-300 text-emerald-950"
                      }`}>
                        ● {statusStats.openCount} Open
                      </span>
                      {statusStats.fillingCount > 0 && (
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-bold ${
                          isDark
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                            : "bg-amber-100 border-amber-300 text-amber-950"
                        }`}>
                          ● {statusStats.fillingCount} Filling
                        </span>
                      )}
                      {statusStats.fullCount > 0 && (
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-bold ${
                          isDark
                            ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                            : "bg-rose-100 border-rose-300 text-rose-950"
                        }`}>
                          ● {statusStats.fullCount} Full
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 3: Committee Directory Count */}
                <div className={`relative overflow-hidden rounded-2xl border ${cardBg} p-5 transition hover:scale-[1.01]`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${subText}`}>
                      Committee Network
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-display text-3xl font-extrabold ${headerText} tracking-tight`}>
                        {users.length}
                      </span>
                      <span className={`font-mono text-xs ${subText}`}>Members</span>
                    </div>
                    <div className={`mt-3 flex items-center gap-2 font-mono text-[11px] ${subText}`}>
                      <span className={isDark ? "text-indigo-400 font-semibold" : "text-indigo-900 font-bold"}>
                        {admins.length} Admins
                      </span>
                      <span>•</span>
                      <span className={isDark ? "text-sky-400 font-semibold" : "text-sky-900 font-bold"}>
                        {coordinators.length} Coordinators
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Google Sheets Live Sync */}
                <div className={`relative overflow-hidden rounded-2xl border ${cardBg} p-5 transition hover:scale-[1.01]`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${subText}`}>
                      Google Sheets Sync
                    </span>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                        liveIsLive
                          ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-500"
                          : "bg-amber-500/15 border-amber-400/30 text-amber-500"
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full ${
                          liveIsLive ? "bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/60" : "bg-amber-500"
                        }`}
                      />
                      <span className={`font-display text-lg font-bold ${headerText} tracking-tight`}>
                        {liveIsLive ? "Live Sync Active" : "Preview Mode"}
                      </span>
                    </div>
                    <p className={`mt-2 font-mono text-[11px] ${subText} flex items-center justify-between`}>
                      <span>Updated: {lastRefreshed.toLocaleTimeString()}</span>
                      <button
                        onClick={handleRefreshCounts}
                        disabled={isRefreshing}
                        className="text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 font-bold hover:underline"
                      >
                        {isRefreshing ? "Syncing…" : "Sync Now"}
                      </button>
                    </p>
                  </div>
                </div>
              </section>

              {/* VISUAL REGISTRATION & CAPACITY ANALYTICS */}
              <section id="visual-analytics" className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-6`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <h2 className={`font-display text-xl sm:text-2xl font-bold ${headerText} tracking-tight`}>
                        Capacity Analytics &amp; Seat Distribution
                      </h2>
                    </div>
                    <p className={`font-mono text-xs ${subText} mt-1`}>
                      Instant visual breakdown of event capacity fill-rate and remaining slots.
                    </p>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className={`px-3 py-1.5 rounded-xl border ${isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"}`}>
                      Available: <strong className="text-emerald-500">{totalAvailable}</strong>
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl border ${isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"}`}>
                      Booked: <strong className="text-sky-500">{totalRegistered}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Donut Radial Gauge Chart */}
                  <div className={`lg:col-span-4 rounded-2xl border ${isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50/80"} p-5 flex flex-col items-center justify-center text-center`}>
                    <p className={`font-mono text-xs uppercase tracking-wider font-bold ${subText} mb-3`}>
                      Overall Seat Occupancy
                    </p>
                    
                    {/* SVG Radial Gauge */}
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          strokeWidth="10"
                          fill="transparent"
                          className={isDark ? "stroke-white/10" : "stroke-slate-200"}
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          strokeWidth="10"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * overallOccupancy) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                          className="stroke-sky-500 transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`font-display text-3xl font-extrabold ${headerText}`}>
                          {overallOccupancy}%
                        </span>
                        <span className={`font-mono text-[10px] uppercase tracking-wider ${subText}`}>
                          Capacity Filled
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 w-full font-mono text-[11px] pt-3 border-t border-slate-200/50 dark:border-white/10">
                      <div>
                        <span className="block text-emerald-500 font-bold">{statusStats.openCount}</span>
                        <span className={subText}>Open</span>
                      </div>
                      <div>
                        <span className="block text-amber-500 font-bold">{statusStats.fillingCount}</span>
                        <span className={subText}>Filling</span>
                      </div>
                      <div>
                        <span className="block text-rose-500 font-bold">{statusStats.fullCount}</span>
                        <span className={subText}>Full</span>
                      </div>
                    </div>
                  </div>

                  {/* Event-by-Event Interactive Fill Bar Chart */}
                  <div className={`lg:col-span-8 rounded-2xl border ${isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50/80"} p-5 space-y-3.5`}>
                    <div className="flex justify-between items-center font-mono text-xs pb-1 border-b border-slate-200/50 dark:border-white/10">
                      <span className={`uppercase font-bold tracking-wider ${subText}`}>
                        Per-Event Capacity Fill Breakdown ({events.length})
                      </span>
                      <span className={`text-[11px] ${subText}`}>Registered vs Total Seats</span>
                    </div>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {events.map((e) => {
                        const reg = liveCounts[e.id] ?? 0;
                        const cap = e.capacity || 1;
                        const pct = Math.min(Math.round((reg / cap) * 100), 100);
                        const isFull = reg >= cap;
                        const isFilling = !isFull && cap - reg <= cap * 0.2;

                        return (
                          <div key={e.id} className="space-y-1">
                            <div className="flex justify-between text-xs font-mono">
                              <span className={`font-bold ${headerText} truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5`}>
                                {e.name}
                                <span className={`text-[10px] font-normal ${subText}`}>
                                  ({e.venue})
                                </span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${isFull ? "text-rose-500" : isFilling ? "text-amber-500" : "text-sky-500"}`}>
                                  {reg} / {cap}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                  isFull
                                    ? "bg-rose-500/15 text-rose-500"
                                    : isFilling
                                    ? "bg-amber-500/15 text-amber-500"
                                    : "bg-sky-500/15 text-sky-500"
                                }`}>
                                  {pct}%
                                </span>
                              </div>
                            </div>

                            {/* Bar Track */}
                            <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200/80"}`}>
                              <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${
                                  isFull
                                    ? "bg-gradient-to-r from-rose-500 to-red-600 shadow-xs shadow-rose-500/50"
                                    : isFilling
                                    ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-xs shadow-amber-400/50"
                                    : "bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-500 shadow-xs shadow-sky-400/50"
                                }`}
                                style={{ width: `${Math.max(pct, 3)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}

                      {events.length === 0 && (
                        <p className={`font-mono text-xs ${subText} py-6 text-center`}>No events registered yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* LIVE EVENT SEATS TABLE SECTION */}
              <section id="live-seats-table" className={`relative overflow-hidden rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-6`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className={`font-display text-xl sm:text-2xl font-bold ${headerText} tracking-tight`}>
                        Event Seats &amp; Live Registration Status
                      </h2>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          liveIsLive ? "bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/60" : "bg-amber-500"
                        }`}
                      />
                      <span className={`font-mono text-xs font-semibold ${subText}`}>
                        {liveIsLive ? "Connected to Google Sheet" : "Preview Mode"}
                      </span>
                    </div>
                    <p className={`font-mono text-xs ${subText} mt-1`}>
                      Refreshes automatically every 30s · Last updated:{" "}
                      <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        {lastRefreshed.toLocaleTimeString()}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={handleRefreshCounts}
                      disabled={isRefreshing}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${
                        isRefreshing
                          ? isDark
                            ? "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed"
                            : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                          : isDark
                          ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-400"
                          : "bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100 hover:border-emerald-400"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      {isRefreshing ? "Refreshing…" : "↻ Refresh Counts"}
                    </button>

                    <button
                      onClick={handleExportEventsCSV}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${
                        isDark
                          ? "bg-sky-500/15 border-sky-400/40 text-sky-300 hover:bg-sky-500/25 hover:border-sky-400"
                          : "bg-sky-50 border-sky-300 text-sky-950 hover:bg-sky-100 hover:border-sky-400"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Export CSV / Excel
                    </button>
                  </div>
                </div>

                {/* Filter Controls Bar */}
                <div className={`p-4 rounded-2xl border ${searchBoxBg} grid gap-3 sm:grid-cols-12 items-center`}>
                  <div className="sm:col-span-6 relative">
                    <input
                      type="text"
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      placeholder="🔍 Search event, venue, date, coordinator, sheet label…"
                      className={`w-full rounded-xl border px-4 py-2.5 font-mono text-xs outline-none transition shadow-sm ${inputBg}`}
                    />
                    {eventSearch && (
                      <button
                        onClick={() => setEventSearch("")}
                        className="absolute right-3 top-2.5 font-mono text-xs text-slate-400 hover:text-slate-200"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={statusFilter}
                      onChange={(e: any) => setStatusFilter(e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2.5 font-mono text-xs outline-none ${selectBg}`}
                    >
                      <option value="all">All Statuses ({events.length})</option>
                      <option value="available">Open / Available Spots ({statusStats.openCount})</option>
                      <option value="filling">Filling Fast (≤20% left) ({statusStats.fillingCount})</option>
                      <option value="full">Full / Sold Out ({statusStats.fullCount})</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setOnlyMyEvents(!onlyMyEvents)}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border font-mono text-xs font-bold transition ${
                        onlyMyEvents
                          ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/30"
                          : isDark
                          ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                          : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>👤</span>
                      <span>My Events Only</span>
                    </button>
                  </div>
                </div>

                {/* Table Component */}
                <div className={`overflow-x-auto rounded-2xl border ${borderCol} shadow-sm bg-white dark:bg-black/30`}>
                  <table className="w-full text-left font-mono text-xs">
                    <thead className={`${tableHeadBg} text-[11px] uppercase tracking-widest border-b font-bold`}>
                      <tr>
                        <th className="px-4 py-3 cursor-pointer hover:text-sky-500 transition" onClick={() => handleSort("name")}>
                          Event Name {eventSortField === "name" && (eventSortAsc ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-3 cursor-pointer hover:text-sky-500 transition" onClick={() => handleSort("venue")}>
                          Venue {eventSortField === "venue" && (eventSortAsc ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-3 cursor-pointer hover:text-sky-500 transition" onClick={() => handleSort("date")}>
                          Date &amp; Time {eventSortField === "date" && (eventSortAsc ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-3 cursor-pointer hover:text-sky-500 transition" onClick={() => handleSort("capacity")}>
                          Capacity {eventSortField === "capacity" && (eventSortAsc ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-3 cursor-pointer hover:text-sky-500 transition" onClick={() => handleSort("registered")}>
                          Registered {eventSortField === "registered" && (eventSortAsc ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-3 cursor-pointer hover:text-sky-500 transition" onClick={() => handleSort("available")}>
                          Available {eventSortField === "available" && (eventSortAsc ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Sheet Label</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${tableDivide}`}>
                      {processedEvents.map((e) => (
                        <tr key={e.id} className={`transition ${tableRowHover}`}>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col">
                              <span className={`font-bold ${headerText} text-sm flex items-center gap-1.5`}>
                                {e.name}
                                {e.isMyEvent && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-400/30">
                                    Assigned
                                  </span>
                                )}
                              </span>
                              {e.tagline && (
                                <span className={`text-[10px] ${subText} font-normal mt-0.5`}>
                                  {e.tagline}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={`px-4 py-3.5 ${subText}`}>{e.venue}</td>
                          <td className={`px-4 py-3.5 ${subText}`}>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{e.date}</span>
                            <span className="block text-[11px] text-slate-400">{e.time}</span>
                          </td>
                          <td className={`px-4 py-3.5 font-bold ${headerText}`}>{e.capacity}</td>
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-sky-500 text-sm">{e.registered}</span>
                            <div className={`mt-1 h-1.5 w-16 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                              <div
                                className={`h-full rounded-full ${
                                  e.status === "full" ? "bg-rose-500" : e.status === "filling" ? "bg-amber-500" : "bg-sky-500"
                                }`}
                                style={{ width: `${e.occupancyPct}%` }}
                              />
                            </div>
                          </td>
                          <td className={`px-4 py-3.5 font-bold ${e.available === 0 ? "text-rose-500" : "text-emerald-500"}`}>
                            {e.available}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                e.status === "full"
                                  ? isDark
                                    ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                    : "bg-rose-100 text-rose-800 border border-rose-200"
                                  : e.status === "filling"
                                  ? isDark
                                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                    : "bg-amber-100 text-amber-800 border border-amber-200"
                                  : isDark
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {e.status === "full" ? "Full" : e.status === "filling" ? "Filling Fast" : "Open"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              onClick={() => copyToClipboard(e.sheetEventLabel, "Sheet Label")}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] cursor-pointer hover:scale-105 transition font-mono border ${
                                isDark
                                  ? "bg-white/5 border-white/10 text-slate-300 hover:border-sky-400"
                                  : "bg-slate-100 border-slate-200 text-slate-700 hover:border-sky-500"
                              }`}
                              title="Click to copy exact Google Form Label"
                            >
                              <span>🏷️</span>
                              <span className="truncate max-w-[120px]">{e.sheetEventLabel}</span>
                            </span>
                          </td>
                        </tr>
                      ))}

                      {processedEvents.length === 0 && (
                        <tr>
                          <td colSpan={8} className={`px-4 py-12 text-center ${subText} font-medium`}>
                            No matching events found for current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: EVENT EXPLORER & DETAIL VIEW                                       */}
          {/* ========================================================================= */}
          {activeNavTab === "events" && (
            <div className="space-y-6">
              {/* Header */}
              <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg} space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className={`font-display text-2xl sm:text-3xl font-bold ${headerText} tracking-tight`}>
                      Symposium Events Explorer
                    </h2>
                    <p className={`font-mono text-xs ${subText} mt-1`}>
                      Detailed cards with venues, assigned coordinators, live capacity, and rulebooks.
                    </p>
                  </div>

                  <button
                    onClick={handleExportEventsCSV}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition ${
                      isDark
                        ? "bg-amber-500/15 border-amber-400/30 text-amber-300 hover:bg-amber-500/25"
                        : "bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100"
                    }`}
                  >
                    📥 Export All Event Data
                  </button>
                </div>

                {/* Filter & Search Bar */}
                <div className={`p-3 rounded-2xl border ${searchBoxBg} grid gap-3 sm:grid-cols-12 items-center`}>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      placeholder="🔍 Search event cards by title, venue, coordinator or label…"
                      className={`w-full rounded-xl border px-4 py-2 font-mono text-xs outline-none ${inputBg}`}
                    />
                  </div>
                  <div className="sm:col-span-4 flex items-center gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e: any) => setStatusFilter(e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2 font-mono text-xs outline-none ${selectBg}`}
                    >
                      <option value="all">All Availability Statuses</option>
                      <option value="available">Open / Available</option>
                      <option value="filling">Filling Fast (≤20% left)</option>
                      <option value="full">Full / Sold Out</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Event Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {processedEvents.map((e) => {
                  const isFull = e.status === "full";
                  const isFilling = e.status === "filling";

                  return (
                    <div
                      key={e.id}
                      className={`rounded-3xl border ${cardBg} p-6 space-y-5 transition-all duration-200 hover:shadow-2xl relative overflow-hidden flex flex-col justify-between`}
                    >
                      {/* Top Bar with Venue & Status */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                            isDark ? "bg-sky-500/10 border-sky-400/30 text-sky-300" : "bg-sky-50 border-sky-200 text-sky-800"
                          }`}>
                            📍 {e.venue}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isFull
                                ? "bg-rose-500/15 text-rose-400 border border-rose-400/30"
                                : isFilling
                                ? "bg-amber-500/15 text-amber-400 border border-amber-400/30"
                                : "bg-emerald-500/15 text-emerald-400 border border-emerald-400/30"
                            }`}
                          >
                            {isFull ? "● Sold Out" : isFilling ? "● Filling Fast" : "● Available"}
                          </span>
                        </div>

                        <div>
                          <h3 className={`font-display text-xl font-bold ${headerText} leading-snug`}>
                            {e.name}
                          </h3>
                          {e.tagline && (
                            <p className="text-xs font-mono text-sky-500 font-semibold mt-0.5">{e.tagline}</p>
                          )}
                          <p className={`text-xs ${subText} mt-2 leading-relaxed line-clamp-2`}>
                            {e.description}
                          </p>
                        </div>
                      </div>

                      {/* Seat Progress & Stats */}
                      <div className="space-y-3 pt-3 border-t border-slate-200/50 dark:border-white/10">
                        <div className="flex justify-between items-baseline text-xs font-mono">
                          <span className={subText}>Seat Occupancy</span>
                          <span className={`font-bold ${isFull ? "text-rose-500" : "text-sky-500"}`}>
                            {e.registered} / {e.capacity} Registered ({e.occupancyPct}%)
                          </span>
                        </div>
                        <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFull ? "bg-rose-500" : isFilling ? "bg-amber-500" : "bg-gradient-to-r from-sky-400 to-indigo-500"
                            }`}
                            style={{ width: `${Math.max(e.occupancyPct, 3)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className={subText}>Available Spots: <strong className="text-emerald-500">{e.available}</strong></span>
                          <span className={subText}>Date: <strong className={headerText}>{e.date}</strong></span>
                        </div>
                      </div>

                      {/* Google Sheet Label + Coordinators */}
                      <div className="space-y-3 pt-3 border-t border-slate-200/50 dark:border-white/10 font-mono text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={subText}>Form Sheet Label:</span>
                          <button
                            onClick={() => copyToClipboard(e.sheetEventLabel, "Sheet Label")}
                            className={`px-2 py-0.5 rounded border ${
                              isDark ? "bg-white/5 border-white/10 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
                            } hover:border-sky-400 transition flex items-center gap-1`}
                          >
                            <span>🏷️ {e.sheetEventLabel}</span>
                            <span className="text-[10px] text-sky-400">copy</span>
                          </button>
                        </div>

                        {/* Assigned Coordinators */}
                        <div>
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${subText} block mb-1`}>
                            Assigned Coordinators
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {e.coordinators && e.coordinators.length > 0 ? (
                              e.coordinators.map((c, idx) => (
                                <div
                                  key={idx}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] border ${
                                    isDark
                                      ? "bg-white/5 border-white/10 text-slate-300"
                                      : "bg-slate-100 border-slate-200 text-slate-800"
                                  }`}
                                >
                                  <span>👤</span>
                                  <span className="font-semibold">{c.name}</span>
                                  {c.phone && (
                                    <a
                                      href={`tel:${c.phone}`}
                                      className="text-sky-500 hover:underline text-[10px] ml-1"
                                      title={c.phone}
                                    >
                                      📞
                                    </a>
                                  )}
                                </div>
                              ))
                            ) : (
                              <span className={`text-[11px] ${subText}`}>No specific coordinator assigned yet</span>
                            )}
                          </div>
                        </div>

                        {/* Rulebook & Action Links */}
                        <div className="flex items-center justify-between pt-2">
                          {e.rulebookUrl ? (
                            <a
                              href={e.rulebookUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-sky-500 hover:text-sky-400 underline inline-flex items-center gap-1"
                            >
                              <span>📖</span>
                              <span>View Rulebook ↗</span>
                            </a>
                          ) : (
                            <span className={`text-[11px] ${subText}`}>No rulebook URL</span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const summary = `${e.name}\nVenue: ${e.venue}\nDate & Time: ${e.date} · ${e.time}\nSpots: ${e.registered}/${e.capacity} (${e.available} available)\nSheet Label: ${e.sheetEventLabel}`;
                              copyToClipboard(summary, "Event Summary");
                            }}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                              isDark ? "border-white/10 hover:bg-white/10 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                            } transition`}
                          >
                            📋 Copy Info
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {processedEvents.length === 0 && (
                  <div className={`col-span-full p-12 text-center rounded-3xl border ${cardBg}`}>
                    <p className={`font-mono text-sm ${subText}`}>No events matching your search or filters.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SCHEDULES & TIMELINE                                               */}
          {/* ========================================================================= */}
          {activeNavTab === "schedules" && (
            <div className="space-y-6">
              <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg} space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className={`font-display text-2xl sm:text-3xl font-bold ${headerText} tracking-tight`}>
                      Symposium Master Schedules
                    </h2>
                    <p className={`font-mono text-xs ${subText} mt-1`}>
                      Track the timeline of rounds, reporting times, evaluations, and results across all venues.
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-mono border ${isDark ? "bg-indigo-500/15 border-indigo-400/30 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-800"}`}>
                    ⏱️ Chronological Breakdown
                  </span>
                </div>

                {/* Search Bar & Event Filter */}
                <div className={`p-3 rounded-2xl border ${searchBoxBg} grid gap-3 sm:grid-cols-12`}>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={scheduleSearch}
                      onChange={(e) => setScheduleSearch(e.target.value)}
                      placeholder="🔍 Search schedules (e.g. 'Round 1', 'Lunch', 'Reporting', 'Hall A')…"
                      className={`w-full rounded-xl border px-4 py-2 font-mono text-xs outline-none ${inputBg}`}
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <select
                      value={scheduleEventFilter}
                      onChange={(e) => setScheduleEventFilter(e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2 font-mono text-xs outline-none ${selectBg}`}
                    >
                      <option value="all">All Events ({events.length})</option>
                      {events.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Schedules Grid / Timeline View */}
              <div className="grid gap-6 sm:grid-cols-2">
                {filteredSchedules.map((e) => (
                  <div
                    key={e.id}
                    className={`rounded-3xl border ${cardBg} p-6 space-y-4 shadow-sm hover:shadow-md transition`}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-slate-200/50 dark:border-white/10 pb-3">
                      <div>
                        <h3 className={`font-display text-lg font-bold ${headerText}`}>{e.name}</h3>
                        <p className={`font-mono text-xs text-sky-500 font-semibold mt-0.5`}>
                          📅 {e.date} · ⏱️ {e.time}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl font-mono text-[10px] font-bold border shrink-0 ${
                        isDark ? "bg-sky-500/15 border-sky-400/30 text-sky-300" : "bg-sky-50 border-sky-200 text-sky-800"
                      }`}>
                        📍 {e.venue}
                      </span>
                    </div>

                    {/* Timeline List */}
                    <ul className="space-y-3 font-mono text-xs relative pl-4 border-l-2 border-sky-500/30 dark:border-sky-500/20">
                      {e.schedule.map((s, idx) => (
                        <li key={idx} className="relative group">
                          {/* Dot indicator */}
                          <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-sky-500 border-2 border-white dark:border-[#0d121f] group-hover:scale-125 transition-transform" />
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                            <span className="font-bold text-sky-500 w-28 shrink-0">{s.time}</span>
                            <span className={`${headerText} font-medium`}>{s.item}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {filteredSchedules.length === 0 && (
                  <div className={`col-span-full p-12 text-center rounded-3xl border ${cardBg}`}>
                    <p className={`font-mono text-xs ${subText}`}>No schedule items found matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: ANNOUNCEMENTS HUB                                                  */}
          {/* ========================================================================= */}
          {activeNavTab === "announcements" && (
            <div className="space-y-6">
              <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg} space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className={`font-display text-2xl sm:text-3xl font-bold ${headerText} tracking-tight flex items-center gap-2.5`}>
                      <span className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
                      Official Announcements &amp; Broadcasts
                    </h2>
                    <p className={`font-mono text-xs ${subText} mt-1`}>
                      Real-time notices and guidelines broadcasted by the core admin committee.
                    </p>
                  </div>

                  <input
                    type="text"
                    value={announcementSearch}
                    onChange={(e) => setAnnouncementSearch(e.target.value)}
                    placeholder="🔍 Search announcements…"
                    className={`rounded-xl border px-3.5 py-2 font-mono text-xs outline-none ${inputBg} w-full sm:w-64`}
                  />
                </div>
              </div>

              {/* Announcements Feed */}
              <div className="space-y-4">
                {filteredAnnouncements.map((a, idx) => (
                  <div
                    key={a.id}
                    className={`rounded-2xl border ${cardBg} p-5 space-y-3 shadow-sm hover:shadow-md transition relative`}
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200/50 dark:border-white/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        <span className={`font-mono text-xs font-bold uppercase tracking-wider ${
                          idx === 0 ? "text-rose-500" : isDark ? "text-slate-300" : "text-slate-700"
                        }`}>
                          {idx === 0 ? "Latest Bulletin" : `Announcement #${announcements.length - idx}`}
                        </span>
                      </div>
                      <span className={`font-mono text-[11px] ${subText}`}>
                        {new Date(a.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className={`text-sm sm:text-base leading-relaxed ${headerText} font-medium`}>
                      {a.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                      <span className={subText}>
                        Posted by <strong className="text-sky-500">@{a.created_by}</strong>
                      </span>
                      <button
                        onClick={() => copyToClipboard(a.message, "Announcement")}
                        className={`text-[10px] px-2 py-0.5 rounded border ${
                          isDark ? "border-white/10 text-slate-400 hover:text-white" : "border-slate-200 text-slate-600 hover:text-slate-900"
                        } transition`}
                      >
                        📋 Copy Text
                      </button>
                    </div>
                  </div>
                ))}

                {filteredAnnouncements.length === 0 && (
                  <div className={`p-12 text-center rounded-3xl border ${cardBg}`}>
                    <p className={`font-mono text-xs ${subText}`}>No announcements match your search.</p>
                  </div>
                )}
              </div>

              {/* Coordinator Brief Notice */}
              <div className={`p-5 rounded-2xl border ${isDark ? "border-sky-500/30 bg-sky-500/10" : "border-sky-200 bg-sky-50"} font-mono text-xs`}>
                <div className="flex items-start gap-3">
                  <span className="text-lg">💡</span>
                  <div>
                    <h4 className="font-bold text-sky-600 dark:text-sky-300 mb-1">Coordinator Protocol Reminder</h4>
                    <p className={`${isDark ? "text-slate-300" : "text-slate-700"} leading-relaxed text-[11px]`}>
                      Announcements posted by admins are automatically reflected across the public website and attendee announcement banners. As coordinators, ensure your participants are aligned with any schedule or venue adjustments announced here.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: TEAM & DIRECTORY                                                   */}
          {/* ========================================================================= */}
          {activeNavTab === "directory" && (
            <div className="space-y-6">
              <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg} space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className={`font-display text-2xl sm:text-3xl font-bold ${headerText} tracking-tight`}>
                      Symposium Committee Directory
                    </h2>
                    <p className={`font-mono text-xs ${subText} mt-1`}>
                      Direct contact phone numbers, emails, and roles for fellow coordinators and admins.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className={`px-3 py-1.5 rounded-xl border ${isDark ? "border-indigo-400/30 bg-indigo-500/15 text-indigo-300" : "border-indigo-200 bg-indigo-50 text-indigo-800"}`}>
                      {admins.length} Admins
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl border ${isDark ? "border-sky-400/30 bg-sky-500/15 text-sky-300" : "border-sky-200 bg-sky-50 text-sky-800"}`}>
                      {coordinators.length} Coordinators
                    </span>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className={`p-3 rounded-2xl border ${searchBoxBg} grid gap-3 sm:grid-cols-12`}>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={directorySearch}
                      onChange={(e) => setDirectorySearch(e.target.value)}
                      placeholder="🔍 Search directory by name, username, phone or email…"
                      className={`w-full rounded-xl border px-4 py-2 font-mono text-xs outline-none ${inputBg}`}
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <select
                      value={directoryRoleFilter}
                      onChange={(e: any) => setDirectoryRoleFilter(e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2 font-mono text-xs outline-none ${selectBg}`}
                    >
                      <option value="all">All Roles ({users.length})</option>
                      <option value="admin">Admins Only ({admins.length})</option>
                      <option value="coordinator">Coordinators Only ({coordinators.length})</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === "admin";
                  return (
                    <div
                      key={u.id}
                      className={`rounded-2xl border ${cardBg} p-5 space-y-4 hover:shadow-lg transition flex flex-col justify-between`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                              isAdmin
                                ? isDark
                                  ? "bg-indigo-500/15 border-indigo-400/30 text-indigo-300"
                                  : "bg-indigo-100 border-indigo-300 text-indigo-900"
                                : isDark
                                ? "bg-sky-500/15 border-sky-400/30 text-sky-300"
                                : "bg-sky-100 border-sky-300 text-sky-900"
                            }`}
                          >
                            {isAdmin ? "Admin" : "Coordinator"}
                          </span>
                        </div>

                        <div>
                          <h3 className={`font-bold ${headerText} text-base`}>{u.name}</h3>
                          <p className={`font-mono text-xs text-sky-500`}>@{u.username}</p>
                        </div>

                        <div className="space-y-1.5 font-mono text-xs pt-1 border-t border-slate-200/50 dark:border-white/10">
                          {u.phone ? (
                            <div className="flex items-center justify-between">
                              <span className={subText}>Phone:</span>
                              <a
                                href={`tel:${u.phone}`}
                                className="font-semibold text-sky-500 hover:underline flex items-center gap-1"
                              >
                                <span>📞</span> {u.phone}
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-slate-400 text-[11px]">
                              <span>Phone:</span>
                              <span>Not provided</span>
                            </div>
                          )}

                          {u.email ? (
                            <div className="flex items-center justify-between">
                              <span className={subText}>Email:</span>
                              <a
                                href={`mailto:${u.email}`}
                                className="font-semibold text-sky-500 hover:underline truncate max-w-[170px]"
                                title={u.email}
                              >
                                ✉️ {u.email}
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-slate-400 text-[11px]">
                              <span>Email:</span>
                              <span>Not provided</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Contact Buttons */}
                      <div className="pt-2 flex items-center gap-2">
                        {u.phone && (
                          <a
                            href={`tel:${u.phone}`}
                            className={`flex-1 py-1.5 text-center rounded-lg border text-xs font-mono font-bold ${
                              isDark ? "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200"
                            } transition`}
                          >
                            📞 Call
                          </a>
                        )}
                        {u.email && (
                          <a
                            href={`mailto:${u.email}`}
                            className={`flex-1 py-1.5 text-center rounded-lg border text-xs font-mono font-bold ${
                              isDark ? "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200"
                            } transition`}
                          >
                            ✉️ Email
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const info = `${u.name} (@${u.username})\nPhone: ${u.phone || "N/A"}\nEmail: ${u.email || "N/A"}`;
                            copyToClipboard(info, "Contact Details");
                          }}
                          className={`p-1.5 rounded-lg border text-xs ${
                            isDark ? "border-white/10 text-slate-400 hover:text-white" : "border-slate-200 text-slate-600 hover:text-slate-900"
                          } transition`}
                          title="Copy Contact Details"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <div className={`col-span-full p-12 text-center rounded-3xl border ${cardBg}`}>
                    <p className={`font-mono text-xs ${subText}`}>No team members matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: SHARED RESOURCES                                                   */}
          {/* ========================================================================= */}
          {activeNavTab === "resources" && (
            <div className="space-y-6">
              <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg} space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className={`font-display text-2xl sm:text-3xl font-bold ${headerText} tracking-tight`}>
                      Shared Resources &amp; Documents Hub
                    </h2>
                    <p className={`font-mono text-xs ${subText} mt-1`}>
                      Master links to scoring rubrics, participant lists, rulebook PDFs, and drive folders.
                    </p>
                  </div>

                  <input
                    type="text"
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                    placeholder="🔍 Search resources…"
                    className={`rounded-xl border px-3.5 py-2 font-mono text-xs outline-none ${inputBg} w-full sm:w-64`}
                  />
                </div>
              </div>

              {/* Resource Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredResources.map((r) => {
                  const meta = getResourceMeta(r.url);
                  return (
                    <div
                      key={r.id}
                      className={`rounded-2xl border ${cardBg} p-5 space-y-3 shadow-sm hover:shadow-md transition flex flex-col justify-between`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${meta.color}`}>
                            <span>{meta.icon}</span>
                            <span>{meta.label}</span>
                          </span>
                          <span className={`font-mono text-[10px] ${subText}`}>
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className={`font-bold ${headerText} text-base leading-snug`}>{r.title}</h3>
                        <p className={`font-mono text-xs ${subText} truncate`} title={r.url}>
                          {r.url}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between gap-2">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs font-bold transition shadow-xs"
                        >
                          <span>Open Document</span>
                          <span>↗</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(r.url, "Resource URL")}
                          className={`px-3 py-2 rounded-xl border font-mono text-xs font-bold transition ${
                            isDark ? "border-white/10 hover:bg-white/10 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          📋 Copy Link
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredResources.length === 0 && (
                  <div className={`col-span-full p-12 text-center rounded-3xl border ${cardBg}`}>
                    <p className={`font-mono text-xs ${subText}`}>No shared resources uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: OPERATIONS CHECKLIST (Day-of-Event Execution Tool)                  */}
          {/* ========================================================================= */}
          {activeNavTab === "checklist" && (
            <div className="space-y-6">
              <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg} space-y-5`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className={`font-display text-2xl sm:text-3xl font-bold ${headerText} tracking-tight flex items-center gap-2`}>
                      <span>✅</span>
                      Coordinator Event Operations Checklist
                    </h2>
                    <p className={`font-mono text-xs ${subText} mt-1`}>
                      Interactive task tracking for symposium day preparation, execution, and wrap-up.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetChecklist}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition ${
                      isDark ? "border-white/10 hover:bg-white/10 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span>↺</span>
                    <span>Reset Defaults</span>
                  </button>
                </div>

                {/* Progress Bar */}
                <div className={`p-4 rounded-2xl border ${searchBoxBg} space-y-2`}>
                  <div className="flex justify-between items-center font-mono text-xs">
                    <span className="font-bold text-sky-500">
                      Progress: {completedChecklistCount} of {checklist.length} Completed
                    </span>
                    <span className="font-bold text-emerald-500 text-sm">{checklistCompletionPct}%</span>
                  </div>
                  <div className={`h-3 w-full rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-emerald-500 transition-all duration-500 shadow-sm shadow-emerald-500/50"
                      style={{ width: `${checklistCompletionPct}%` }}
                    />
                  </div>
                </div>

                {/* Add Custom Task Form */}
                <form onSubmit={handleAddChecklistItem} className="flex flex-col sm:flex-row gap-2 pt-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="Add custom task item for your event (e.g. 'Arrange extra chairs for Hall B')…"
                    className={`flex-1 rounded-xl border px-4 py-2.5 font-mono text-xs outline-none ${inputBg}`}
                  />
                  <select
                    value={newChecklistCategory}
                    onChange={(e) => setNewChecklistCategory(e.target.value)}
                    className={`rounded-xl border px-3 py-2.5 font-mono text-xs outline-none ${selectBg}`}
                  >
                    <option value="Pre-Event">Pre-Event</option>
                    <option value="During Event">During Event</option>
                    <option value="Post-Event">Post-Event</option>
                  </select>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs font-bold transition shadow-xs shrink-0"
                  >
                    + Add Task
                  </button>
                </form>
              </div>

              {/* Tasks Divided by Stage */}
              {["Pre-Event", "During Event", "Post-Event"].map((category) => {
                const items = checklist.filter((i) => i.category === category);
                if (items.length === 0) return null;

                return (
                  <div key={category} className={`rounded-3xl border ${cardBg} p-6 space-y-4`}>
                    <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-2">
                      <h3 className={`font-display text-lg font-bold ${headerText} flex items-center gap-2`}>
                        <span className="h-2 w-2 rounded-full bg-sky-500" />
                        {category} Phase
                      </h3>
                      <span className={`font-mono text-xs ${subText}`}>
                        {items.filter((i) => i.completed).length}/{items.length} Done
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleChecklistItem(item.id)}
                          className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                            item.completed
                              ? isDark
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                : "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                              : isDark
                              ? "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
                              : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => {}} // handled by parent div onClick
                              className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                            />
                            <span className={`font-mono text-xs ${item.completed ? "line-through opacity-75 font-normal" : "font-semibold"}`}>
                              {item.text}
                            </span>
                          </div>

                          <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                            item.completed ? "text-emerald-500" : "text-slate-400"
                          }`}>
                            {item.completed ? "Completed ✓" : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
