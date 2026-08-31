"use client";

import { useEffect, useState } from "react";
import { EVENTS, EventConfig, REGISTER_FORM_URL } from "@/lib/eventsConfig";

type SeatData = { id: string; registered: number; capacity: number; available: number };
type ApiResponse = { isLive: boolean; data: SeatData[]; events?: EventConfig[]; registerFormUrl?: string; fetchedAt: string };

const POLL_MS = 15000;

export default function EventBoard() {
  const [eventsList, setEventsList] = useState<EventConfig[]>(EVENTS);
  const [seats, setSeats] = useState<Record<string, SeatData>>({});
  const [isLive, setIsLive] = useState(false);
  const [registerFormUrl, setRegisterFormUrl] = useState<string>(REGISTER_FORM_URL);
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
        if (json.registerFormUrl) {
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

  return (
    <section id="events" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Live Board</p>
          <h2 className="section-heading text-slate-900">Events &amp; Seats</h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
          <span
            className={`h-2 w-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-amber-400"}`}
          />
          {isLive ? "Live from Google Sheet" : "Preview — sheet not connected"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
        {eventsList.map((event) => (
          <EventCard
            key={event.id}
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


function EventCard({
  event,
  seat,
  registerFormUrl,
  isOpen,
  onToggle,
}: {
  event: EventConfig;
  seat?: SeatData;
  registerFormUrl?: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const registered = seat?.registered ?? 0;
  const capacity = event.capacity;
  const available = seat?.available ?? Math.max(capacity - registered, 0);
  const isClosed = available <= 0 || (capacity > 0 && registered >= capacity);
  const percentageFilled = capacity > 0 ? Math.min((registered / capacity) * 100, 100) : 0;

  // Determine status
  const status =
    seat === undefined
      ? "loading"
      : isClosed
      ? "full"
      : available <= capacity * 0.2
      ? "filling"
      : "open";

  const statusColor = {
    loading: "text-slate-500 border-slate-300 bg-slate-50",
    open: "text-green-700 border-green-300 bg-green-50",
    filling: "text-amber-800 border-amber-300 bg-amber-50 font-bold",
    full: "text-red-700 border-red-300 bg-red-50 font-bold",
  }[status];

  const statusLabel = {
    loading: "···",
    open: "Open",
    filling: "Filling Fast",
    full: "Closed / Full",
  }[status];

  const formHref = registerFormUrl && registerFormUrl !== "#" ? registerFormUrl : "#contact";
  const formTarget = registerFormUrl && registerFormUrl !== "#" ? "_blank" : "_self";

  return (
    <div className={`
      glass rounded-2xl p-5 transition-all duration-300 border
      bg-gradient-to-br from-white via-blue-50/40 to-sky-50/60
      hover:border-blue-400 hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)] hover:-translate-y-1
      ${isOpen ? "border-blue-400 shadow-[0_8px_30px_rgba(59,130,246,0.2)]" : "border-slate-200"}
    `}>
      {/* Header: Event name + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-display text-xl font-semibold text-slate-900">{event.name}</h3>
          <p className="font-mono text-xs text-slate-500 mt-0.5">{event.tagline}</p>
        </div>
        <span className={`
          font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border
          ${statusColor}
        `}>
          {statusLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-4 space-y-1">
        <div className="flex justify-between text-xs font-mono text-slate-500">
          <span>Seats filled</span>
          <span className="font-bold text-slate-700">{registered} / {capacity}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isClosed
                ? "bg-red-500"
                : percentageFilled >= 80
                ? "bg-gradient-to-r from-amber-400 to-red-500"
                : "bg-gradient-to-r from-blue-400 via-sky-500 to-blue-600"
            }`}
            style={{ width: `${percentageFilled}%` }}
          />
        </div>
      </div>

      {/* Quick info row */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500">
        <span className="flex items-center gap-1">📅 {event.date}</span>
        <span className="h-3 w-px bg-slate-200" />
        <span className="flex items-center gap-1">📍 {event.venue}</span>
        {seat !== undefined && (
          <>
            <span className="h-3 w-px bg-slate-200" />
            <span className={isClosed ? "text-red-600 font-bold" : "text-blue-600 font-semibold"}>
              {isClosed ? "0 spots left (Closed)" : `${available} spots left`}
            </span>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={onToggle}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-slate-600 bg-white transition-all hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 font-semibold"
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

        {isClosed ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 text-red-700 px-5 py-1.5 font-mono text-xs uppercase tracking-widest font-bold cursor-not-allowed select-none shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m0-6h4m-2 0V9m0 0V7m0 2h2m-2 0H10M5 13a7 7 0 1114 0 7 7 0 01-14 0z" />
            </svg>
            Registration Closed
          </span>
        ) : (
          <a
            href={formHref}
            target={formTarget}
            rel="noreferrer"
            className="btn-cyber text-xs py-1.5 px-5"
          >
            Register Now
          </a>
        )}
      </div>

      {/* Expandable details */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? "max-h-[600px] opacity-100 mt-5" : "max-h-0 opacity-0"}
        `}
      >
        <div className="border-t border-slate-200 pt-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>

          <div>
            <p className="eyebrow text-[10px]">Schedule</p>
            <ul className="mt-2 space-y-1 font-mono text-sm text-slate-600">
              {event.schedule.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-24 shrink-0 text-blue-600 font-semibold">{s.time}</span>
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
                  <p className="text-slate-900 font-semibold">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.role}</p>
                  {c.phone && <p className="text-xs text-blue-600 font-mono">{c.phone}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}