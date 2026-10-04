"use client";

import { useEffect, useState } from "react";
import { EVENTS, EventConfig, REGISTER_FORM_URL } from "@/lib/eventsConfig";
import { useRegistrationCountdown, openHypeModal } from "@/lib/useRegistrationCountdown";

type SeatData = { id: string; registered: number; capacity: number; available: number };
type ApiResponse = {
  isLive: boolean;
  data: SeatData[];
  events?: EventConfig[];
  registerFormUrl?: string;
  fetchedAt: string;
};

const POLL_MS = 15000;

export default function EventBoard({
  registerFormUrl: initialRegisterFormUrl,
}: {
  registerFormUrl?: string;
} = {}) {
  const [eventsList, setEventsList] = useState<EventConfig[]>(EVENTS);
  const [seats, setSeats] = useState<Record<string, SeatData>>({});
  const [registerFormUrl, setRegisterFormUrl] = useState<string>(
    initialRegisterFormUrl || REGISTER_FORM_URL
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const countdown = useRegistrationCountdown();

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/sheets", { cache: "no-store" });
        const json: ApiResponse = await res.json();
        if (cancelled) return;
        setSeats(Object.fromEntries(json.data.map((d) => [d.id, d])));
        if (json.events && json.events.length > 0) {
          setEventsList(json.events);
        }
        if (json.registerFormUrl && json.registerFormUrl !== "#") {
          setRegisterFormUrl(json.registerFormUrl);
        }
      } catch {
        // silently keep last known state
      }
    }

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Filter out any "event flow" / schedule item so only actual competition events appear on front page
  const visibleEvents = eventsList.filter((event) => {
    const name = (event.name || "").toLowerCase().trim();
    return (
      event.id !== "event-1789830960648" &&
      !name.includes("event flow") &&
      !name.includes("symposium event flow")
    );
  });

  const totalCapacity = visibleEvents.reduce((acc, ev) => acc + (ev.capacity || 0), 0);
  const totalRegistered = visibleEvents.reduce(
    (acc, ev) => acc + (seats[ev.id]?.registered ?? 0),
    0
  );

  return (
    <section id="events" className="scroll-mt-24 mx-auto max-w-7xl px-5 pt-8 pb-8 sm:pt-14 sm:pb-12">
      {/* Section Header */}
      <div className="mb-6 sm:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            <p className="eyebrow tracking-widest text-sky-600 font-bold">Registration Arenas</p>
          </div>
          <h2 className="section-heading text-slate-900 tracking-tight">Events</h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Choose your competition, explore event timelines and team requirements, and claim your spot before seats fill up.
          </p>
        </div>

        {/* Aggregate Badges & Countdown (Desktop/Tablet) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openHypeModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-300 bg-sky-50/90 hover:bg-sky-100 text-sky-800 font-mono text-xs font-bold transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
            title="Click to view live countdown popup"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${countdown.isLive ? "bg-emerald-400 opacity-75" : "bg-sky-400 opacity-75"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${countdown.isLive ? "bg-emerald-500" : "bg-sky-500"}`} />
            </span>
            <span suppressHydrationWarning>
              {countdown.isLive ? "🔥 Registrations Open!" : `⏳ Unlocks: ${countdown.formattedTimer}`}
            </span>
          </button>
        </div>
      </div>

      {/* 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-stretch">
        {visibleEvents.map((event, index) => (
          <EventCard
            key={event.id}
            index={index}
            event={event}
            seat={seats[event.id]}
            registerFormUrl={registerFormUrl}
            isOpen={openId === event.id}
            onToggle={() => setOpenId(openId === event.id ? null : event.id)}
          />
        ))}
      </div>
    </section>
  );
}

const THEME_ACCENTS = [
  {
    gradientBar: "from-sky-400 via-blue-500 to-indigo-600",
    topAccent: "bg-gradient-to-r from-sky-400 to-blue-600",
    badgeBg: "bg-sky-50 border-sky-200 text-sky-700",
    hoverBorder: "hover:border-sky-400 hover:shadow-[0_20px_40px_-12px_rgba(14,165,233,0.22)]",
    tagNumber: "#01",
  },
  {
    gradientBar: "from-indigo-500 via-purple-500 to-pink-500",
    topAccent: "bg-gradient-to-r from-indigo-500 to-purple-600",
    badgeBg: "bg-indigo-50 border-indigo-200 text-indigo-700",
    hoverBorder: "hover:border-indigo-400 hover:shadow-[0_20px_40px_-12px_rgba(99,102,241,0.22)]",
    tagNumber: "#02",
  },
  {
    gradientBar: "from-teal-400 via-emerald-500 to-cyan-500",
    topAccent: "bg-gradient-to-r from-emerald-400 to-teal-600",
    badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-700",
    hoverBorder: "hover:border-emerald-400 hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.22)]",
    tagNumber: "#03",
  },
];

type CustomTrackConfig = {
  sectionTitle: string;
  badgePrefix: string;
  items: string[];
};

const EVENT_CUSTOM_CONFIG: Record<string, CustomTrackConfig> = {
  // Mini Hackathon
  "event-3": {
    sectionTitle: "DOMAIN",
    badgePrefix: "Track",
    items: ["Fintech", "Smartcity", "Healthcare"],
  },
  "mini hackathon": {
    sectionTitle: "DOMAIN",
    badgePrefix: "Track",
    items: ["Fintech", "Smartcity", "Healthcare"],
  },

  // Agentic AI
  "event-1789796722143": {
    sectionTitle: "DOMAIN",
    badgePrefix: "Track",
    items: ["E-Commerce", "Industrial automation", "Business Productivity"],
  },
  "agentic ai": {
    sectionTitle: "DOMAIN",
    badgePrefix: "Track",
    items: ["E-Commerce", "Industrial automation", "Business Productivity"],
  },

  // Modal presentation
  "event-1789796788245": {
    sectionTitle: "KEY ROUNDS",
    badgePrefix: "Round",
    items: ["Presentation", "Innovation & Approach", "Jury Evaluation"],
  },
  "modal presentation": {
    sectionTitle: "KEY ROUNDS",
    badgePrefix: "Round",
    items: ["Presentation", "Innovation & Approach", "Jury Evaluation"],
  },
};

function getDomainIcon(dom: string): string {
  const clean = dom.toLowerCase();
  if (clean.includes("presentation")) return "🎤";
  if (clean.includes("innovation") || clean.includes("approach")) return "💡";
  if (clean.includes("jury") || clean.includes("evaluat")) return "🏆";
  if (clean.includes("fintech") || clean.includes("finance")) return "💳";
  if (clean.includes("smart") || clean.includes("city")) return "🏙️";
  if (clean.includes("health") || clean.includes("med")) return "🏥";
  if (clean.includes("commerce") || clean.includes("shop") || clean.includes("e-com")) return "🛒";
  if (clean.includes("industrial") || clean.includes("automation")) return "⚙️";
  if (clean.includes("business") || clean.includes("productivity")) return "📊";
  return "⚡";
}

function parseTrackItem(item: string) {
  const trimmed = item.trim();
  const emojiMatch = trimmed.match(/^([\p{Extended_Pictographic}\u200d]+)\s*(.*)$/u);
  if (emojiMatch) {
    return {
      icon: emojiMatch[1],
      name: emojiMatch[2] || trimmed,
    };
  }
  return {
    icon: getDomainIcon(trimmed),
    name: trimmed,
  };
}

function EventCard({
  event,
  index,
  seat,
  registerFormUrl: _registerFormUrl,
  isOpen,
  onToggle,
}: {
  event: EventConfig;
  index: number;
  seat?: SeatData;
  registerFormUrl?: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const registerFormUrl = _registerFormUrl || REGISTER_FORM_URL;
  const countdown = useRegistrationCountdown();
  const eventNameKey = (event.name || "").toLowerCase().trim();
  const customConfig =
    EVENT_CUSTOM_CONFIG[event.id] ||
    EVENT_CUSTOM_CONFIG[eventNameKey] ||
    (eventNameKey.includes("hackathon")
      ? EVENT_CUSTOM_CONFIG["mini hackathon"]
      : eventNameKey.includes("agentic")
        ? EVENT_CUSTOM_CONFIG["agentic ai"]
        : eventNameKey.includes("modal") || eventNameKey.includes("presentation")
          ? EVENT_CUSTOM_CONFIG["modal presentation"]
          : null);

  const customItems =
    event.domains && event.domains.length > 0
      ? event.domains
      : customConfig
        ? customConfig.items
        : null;

  const sectionTitle = customConfig?.sectionTitle || "DOMAIN";
  const hasCustomItems = Boolean(customItems && customItems.length > 0);

  const registered = seat?.registered ?? 0;
  const capacity = event.capacity;
  const available = seat?.available ?? Math.max(capacity - registered, 0);
  const isClosed = available <= 0 || (capacity > 0 && registered >= capacity);
  const percentageFilled = capacity > 0 ? Math.min((registered / capacity) * 100, 100) : 0;

  const theme = THEME_ACCENTS[index % THEME_ACCENTS.length];

  // Determine status
  const status =
    seat === undefined
      ? "loading"
      : isClosed
        ? "full"
        : available <= capacity * 0.2
          ? "filling"
          : "open";

  return (
    <div
      className={`
        relative flex flex-col justify-between rounded-2xl sm:rounded-3xl transition-all duration-300 border
        bg-white sm:bg-white/95 backdrop-blur-none sm:backdrop-blur-xl p-4 sm:p-6 lg:p-7
        ${isOpen && !hasCustomItems ? "border-blue-400 shadow-[0_20px_45px_-12px_rgba(59,130,246,0.25)] ring-1 ring-blue-300" : "border-slate-200/90 shadow-sm"}
        ${theme.hoverBorder} hover:-translate-y-1.5
      `}
    >
      {/* Top decorative accent bar */}
      <div className={`absolute top-0 left-6 right-6 sm:left-8 sm:right-8 h-1 rounded-b-full ${theme.topAccent}`} />

      {/* Top Card Section */}
      <div>
        {/* Category Badge & Status Pill */}
        <div className={`flex items-center ${hasCustomItems ? "justify-end" : "justify-between"} gap-2 pt-0.5 sm:pt-1 mb-2.5 sm:mb-4`}>
          {!hasCustomItems && (
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider border ${theme.badgeBg}`}>
                {event.sheetEventLabel || "Competition"}
              </span>
              <span className="font-mono text-[10px] text-slate-400 font-semibold">{theme.tagNumber}</span>
            </div>
          )}

          {/* Status Badge */}
          {status === "open" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
              Open
            </span>
          )}
          {status === "filling" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 shadow-sm font-semibold">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-500 animate-ping" />
              Filling Fast
            </span>
          )}
          {status === "full" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-300 shadow-sm">
              Closed / Full
            </span>
          )}
          {status === "loading" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono bg-slate-50 text-slate-500 border border-slate-300">
              ···
            </span>
          )}
        </div>

        {/* Event Title & Tagline */}
        <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          {event.name}
        </h3>
        <p className="mt-1 text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
          {event.tagline || event.description || "Compete, collaborate, and display your technical brilliance."}
        </p>

        {/* Date and Time / Meta Grid */}
        <div className="mt-3.5 sm:mt-5 grid grid-cols-2 gap-2 sm:gap-2.5">
          {/* Date */}
          <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70">
            <span className="text-sm sm:text-base select-none">📅</span>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Date</p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">{event.date || "30 Oct 2026"}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70">
            <span className="text-sm sm:text-base select-none">⏰</span>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Time</p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">{event.time || "09:00 AM"}</p>
            </div>
          </div>

          {!hasCustomItems && (
            <>
              {/* Venue */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70">
                <span className="text-base select-none">📍</span>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Venue</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{event.venue}</p>
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70">
                <span className="text-base select-none">👥</span>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Capacity</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{capacity} Seats</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* DOMAIN / KEY ROUNDS Section (under by under) */}
        {hasCustomItems && customItems && customItems.length > 0 ? (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/90 bg-slate-50/80 shadow-2xs">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-600 animate-pulse" />
              <p className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                {sectionTitle}
              </p>
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2">
              {customItems.map((rawItem, i) => {
                const parsed = parseTrackItem(rawItem);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-sky-300 transition-colors"
                  >
                    <span className="text-sm sm:text-base select-none shrink-0">{parsed.icon}</span>
                    <span className="font-sans text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {parsed.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Live Seat Tracker & Progress Bar for regular events */
          <div className="mt-5 p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/90 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                Seats Status
              </span>
              <span className="font-bold text-slate-900">
                {registered} <span className="font-normal text-slate-400">/ {capacity} filled</span>
              </span>
            </div>

            {/* Progress bar track */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${isClosed
                  ? "bg-red-500"
                  : percentageFilled >= 80
                    ? "bg-gradient-to-r from-amber-400 to-red-500"
                    : `bg-gradient-to-r ${theme.gradientBar}`
                  }`}
                style={{ width: `${percentageFilled}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono">
              <span
                className={`font-semibold px-2 py-0.5 rounded ${isClosed
                  ? "text-red-700 bg-red-100/70"
                  : available <= capacity * 0.2
                    ? "text-amber-800 bg-amber-100/70"
                    : "text-blue-700 bg-blue-100/60"
                  }`}
              >
                {isClosed ? "0 spots remaining" : `${available} spots left`}
              </span>
              <span className="text-slate-500 font-medium">{percentageFilled.toFixed(0)}% Booked</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: Action Buttons */}
      <div className="mt-4 sm:mt-6 pt-3.5 sm:pt-5 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {!hasCustomItems && (
            <button
              onClick={onToggle}
              className={`
                flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all
                ${isOpen ? "bg-blue-50/80 border-blue-400 text-blue-700 shadow-sm" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"}
              `}
            >
              <span>{isOpen ? "Hide Details" : "Details"}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {/* Registration / Countdown Button */}
          {countdown.isLive ? (
            <a
              href={registerFormUrl}
              target="_blank"
              rel="noreferrer"
              className={`${hasCustomItems ? "w-full" : "w-auto"} inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3.5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider shadow-sm hover:scale-[1.02] active:scale-95 transition-all`}
            >
              <span>Register</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          ) : (
            <button
              type="button"
              onClick={openHypeModal}
              title="Registrations open at 7:30 PM today! Click to see countdown"
              className={`${hasCustomItems ? "w-full" : "w-auto"} inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-300/80 bg-sky-50/90 hover:bg-sky-100 text-sky-800 px-3.5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider shadow-2xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping" />
              <span>Opens 7:30 PM</span>
            </button>
          )}
        </div>

        {/* Expandable Details Accordion */}
        {!hasCustomItems && (
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${isOpen ? "max-h-[800px] opacity-100 mt-5 pt-4 border-t border-slate-200/80" : "max-h-0 opacity-0"}
            `}
          >
            <div className="space-y-4">
              {/* Description */}
              <div>
                <p className="eyebrow text-[10px] text-slate-500 mb-1">About This Event</p>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {event.description || "Join this flagship symposium arena to test your skills, innovate alongside peers, and earn prestigious accolades."}
                </p>
              </div>

              {/* Schedule Timeline */}
              {event.schedule && event.schedule.length > 0 && (
                <div>
                  <p className="eyebrow text-[10px] text-slate-500 mb-2.5">Event Flow &amp; Schedule</p>
                  <div className="relative pl-5 space-y-2.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-sky-400 before:to-indigo-300">
                    {event.schedule.map((s, i) => (
                      <div key={i} className="relative flex items-start gap-2.5 text-xs">
                        <span className="absolute -left-5 mt-1 h-2 w-2 rounded-full border-2 border-white bg-sky-500 shadow-sm" />
                        <span className="font-mono font-bold text-sky-700 shrink-0 w-20">{s.time}</span>
                        <span className="text-slate-700 font-medium">{s.item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coordinators Contact Section */}
              <div>
                <p className="eyebrow text-[10px] text-slate-500 mb-2">Event Coordinators</p>
                {event.coordinators && event.coordinators.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto overscroll-contain pr-1">
                    {event.coordinators.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60"
                      >
                        <div className="min-w-0 pr-2 flex items-center gap-2">
                          {event.coordinators.length > 1 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shrink-0">
                              #{i + 1}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                            <p className="text-[10px] font-mono text-slate-500 truncate">{c.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {c.phone && (
                            <a
                              href={`tel:${c.phone}`}
                              title={`Call ${c.name} (${c.phone})`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-mono text-[10px] font-bold transition-colors"
                            >
                              <span>📞</span>
                              <span className="hidden sm:inline">Call</span>
                            </a>
                          )}
                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              title={`Email ${c.name}`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 font-mono text-[10px] font-bold transition-colors"
                            >
                              <span>✉️</span>
                              <span className="hidden sm:inline">Email</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                    Student and faculty coordinators will be on ground at the venue help desk.
                  </p>
                )}
              </div>

              {/* Rulebook / Guidelines Button if available */}
              {event.rulebookUrl && (
                <a
                  href={event.rulebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/70 font-mono text-xs font-bold text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors shadow-sm"
                >
                  <span>📘</span>
                  <span>Official Rulebook &amp; Guidelines ↗</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}