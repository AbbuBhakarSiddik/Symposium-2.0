"use client";

import { useEffect, useState } from "react";
import { EVENTS, EventConfig } from "@/lib/eventsConfig";

type SeatData = { id: string; registered: number; capacity: number; available: number };
type ApiResponse = { isLive: boolean; data: SeatData[]; fetchedAt: string };

const POLL_MS = 15000;

export default function EventBoard() {
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
      } catch {
        // silently keep last known state; the row falls back to "—"
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
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Board</p>
          <h2 className="section-heading">Events &amp; live seats</h2>
        </div>
        <div className="hidden items-center gap-2 font-mono text-xs text-muted sm:flex">
          <span
            className={`h-2 w-2 rounded-full ${isLive ? "bg-ok animate-blink" : "bg-muted"}`}
          />
          {isLive ? "Live from registration sheet" : "Preview data — sheet not connected yet"}
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-ink-line">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-ink-line bg-ink-surface px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-muted sm:grid-cols-[1fr_auto_auto_auto_auto]">
          <span>Event</span>
          <span className="hidden sm:block">Date</span>
          <span>Registered</span>
          <span>Available</span>
          <span></span>
        </div>

        {EVENTS.map((event) => (
          <EventRow
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

function EventRow({
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
  const status =
    available === undefined
      ? "loading"
      : available === 0
      ? "full"
      : available <= event.capacity * 0.15
      ? "filling"
      : "open";

  const statusStyles: Record<string, string> = {
    loading: "text-muted",
    open: "text-ok",
    filling: "text-signal",
    full: "text-full",
  };

  return (
    <div className="border-b border-ink-line last:border-b-0">
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-4 transition hover:bg-ink-surface sm:grid-cols-[1fr_auto_auto_auto_auto]">
        <div>
          <p className="font-display text-base font-medium text-paper sm:text-lg">{event.name}</p>
          <p className="font-mono text-xs text-muted">{event.tagline}</p>
        </div>
        <span className="hidden font-mono text-sm text-muted sm:block">{event.date}</span>
        <span className="font-mono text-sm tabular-nums text-paper">
          {seat ? seat.registered : "—"}
          <span className="text-muted">/{event.capacity}</span>
        </span>
        <span className={`font-mono text-sm font-bold uppercase tabular-nums ${statusStyles[status]}`}>
          {available === undefined ? "···" : status === "full" ? "Full" : available}
        </span>
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={`More options for ${event.name}`}
          className="ml-2 flex h-8 w-8 flex-col items-center justify-center gap-[3px] rounded-sm border border-ink-line transition hover:border-signal"
        >
          <span className="h-px w-4 bg-muted" />
          <span className="h-px w-4 bg-muted" />
          <span className="h-px w-4 bg-muted" />
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-ink-line bg-ink-surface px-4 py-5 sm:px-6">
          <p className="mb-4 max-w-2xl text-sm text-muted">{event.description}</p>

          <p className="eyebrow mb-2">Schedule</p>
          <ul className="mb-5 space-y-1 font-mono text-sm">
            {event.schedule.map((s, i) => (
              <li key={i} className="flex gap-3 text-muted">
                <span className="w-28 shrink-0 text-signal">{s.time}</span>
                <span>{s.item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <a
              href="#contact"
              className="rounded-sm bg-signal px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-ink transition hover:bg-signal-soft"
            >
              Register
            </a>
            <a
              href="#coordinators"
              className="rounded-sm border border-ink-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted transition hover:border-circuit hover:text-circuit"
            >
              Contact coordinator
            </a>
            <span className="rounded-sm border border-ink-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted">
              {event.venue}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
