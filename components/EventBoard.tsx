"use client";

import { useEffect, useState } from "react";
import { EVENTS, EventConfig } from "@/lib/eventsConfig";

type SeatData = { id: string; registered: number; capacity: number; available: number };
type ApiResponse = { isLive: boolean; data: SeatData[]; events?: EventConfig[]; fetchedAt: string };

const POLL_MS = 15000;

export default function EventBoard() {
  const [eventsList, setEventsList] = useState<EventConfig[]>(EVENTS);
  const [seats, setSeats] = useState<Record<string, SeatData>>({});
  const [isLive, setIsLive] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/sheets", { cache: "no-store" });
        const json: ApiResponse = await res.json();
        if (cancelled) return;
        setIsLive(json.isLive);
        setSeats(Object.fromEntries(json.data.map((d) => [d.id, d])));
        if (json.events && json.events.length > 0) {
          setEventsList(json.events);
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

  return (
    <section id="events" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Live Board</p>
          <h2 className="section-heading">Events &amp; Seats</h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-muted">
          <span
            className={`h-2 w-2 rounded-full ${isLive ? "bg-cyber-cyan animate-pulse" : "bg-muted"}`}
          />
          {isLive ? "Live from registration" : "Preview — sheet not connected"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
        {eventsList.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            seat={seats[event.id]}
            isOpen={openId === event.id}
            onToggle={() => setOpenId(openId === event.id ? null : event.id)}
          />
        ))}
      </div>
    </section>
  );
}


function EventCard({
  event,
  seat,
  isOpen,
  onToggle,
}: {
  event: EventConfig;
  seat?: SeatData;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const available = seat?.available;
  const registered = seat?.registered ?? 0;
  const capacity = event.capacity;
  const percentageFilled = capacity > 0 ? Math.min((registered / capacity) * 100, 100) : 0;

  // Determine status
  const status =
    available === undefined
      ? "loading"
      : available === 0
      ? "full"
      : available <= capacity * 0.15
      ? "filling"
      : "open";

  const statusColor = {
    loading: "text-muted border-muted/30",
    open: "text-ok border-ok/50",
    filling: "text-warning border-warning/50",
    full: "text-full border-full/50",
  }[status];

  const statusLabel = {
    loading: "···",
    open: "Open",
    filling: "Filling Fast",
    full: "Full",
  }[status];

  return (
    <div className={`
      glass rounded-2xl p-5 transition-all duration-300 hover:border-cyber-cyan/40 hover:shadow-glow-cyan
      ${isOpen ? "border-cyber-cyan/40 shadow-glow-cyan" : ""}
    `}>
      {/* Header: Event name + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-display text-xl font-semibold text-paper">{event.name}</h3>
          <p className="font-mono text-xs text-muted mt-0.5">{event.tagline}</p>
        </div>
        <span className={`
          font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border
          ${statusColor} bg-ink/40 backdrop-blur-sm
        `}>
          {statusLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-4 space-y-1">
        <div className="flex justify-between text-xs font-mono text-muted">
          <span>Seats filled</span>
          <span>{registered} / {capacity}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyber-cyan to-cyber-magenta transition-all duration-500 ease-out"
            style={{ width: `${percentageFilled}%` }}
          />
        </div>
      </div>

      {/* Quick info row */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-mono text-muted">
        <span className="flex items-center gap-1">📅 {event.date}</span>
        <span className="h-3 w-px bg-ink-line" />
        <span className="flex items-center gap-1">📍 {event.venue}</span>
        {available !== undefined && (
          <>
            <span className="h-3 w-px bg-ink-line" />
            <span className="text-cyber-cyan">{available} spots left</span>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={onToggle}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-muted transition-all hover:border-cyber-cyan hover:text-cyber-cyan"
        >
          {isOpen ? "Hide Details" : "View Details"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3 w-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <a
          href="#contact"
          className="btn-cyber text-xs py-1.5 px-5"
        >
          Register Now
        </a>
      </div>

      {/* Expandable details */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? "max-h-[600px] opacity-100 mt-5" : "max-h-0 opacity-0"}
        `}
      >
        <div className="border-t border-white/10 pt-5 space-y-4">
          <p className="text-sm text-muted leading-relaxed">{event.description}</p>

          <div>
            <p className="eyebrow text-[10px]">Schedule</p>
            <ul className="mt-2 space-y-1 font-mono text-sm text-muted">
              {event.schedule.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-24 shrink-0 text-cyber-cyan">{s.time}</span>
                  <span>{s.item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-[10px]">Coordinators</p>
            <div className="mt-2 flex flex-wrap gap-4">
              {event.coordinators.map((c) => (
                <div key={c.name} className="text-sm">
                  <p className="text-paper font-medium">{c.name}</p>
                  <p className="text-xs text-muted">{c.role}</p>
                  {c.phone && <p className="text-xs text-cyber-cyan">{c.phone}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}