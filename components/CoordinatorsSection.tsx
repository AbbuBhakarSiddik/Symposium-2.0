"use client";

import Link from "next/link";
import { EVENTS, COLLEGE_NAME, EventConfig } from "@/lib/eventsConfig";

type CoordinatorsSectionProps = {
  events?: EventConfig[];
};

export default function CoordinatorsSection({ events }: CoordinatorsSectionProps) {
  const activeEvents = events && events.length > 0 ? events : EVENTS;

  return (
    <section id="coordinators" className="border-t border-slate-200 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-2">People &amp; Leadership</p>
            <h2 className="section-heading text-slate-900">Coordinators &amp; Event Leads</h2>
          </div>
          <Link
            href="/login"
            className="btn-cyber text-xs py-2.5 px-6 shadow-md"
          >
            Coordinator Portal →
          </Link>
        </div>

        <p className="mb-12 max-w-2xl text-base text-slate-600 leading-relaxed">
          Meet the faculty and student leads orchestrating each event. Log in to the Coordinator Portal for full operational access and internal documentation.
        </p>

        {/* Coordinators Grid — Larger Cards & Profile Images */}
        <div className="grid gap-8 sm:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {activeEvents.map((event) => (
            <div
              key={event.id}
              className="glass rounded-3xl p-8 sm:p-10 transition-all duration-300 border border-slate-200 bg-white/80 hover:border-purple-400 hover:shadow-[0_10px_40px_rgba(139,92,246,0.2)] hover:-translate-y-2 flex flex-col justify-between"
            >
              <div>
                {/* Event header badge */}
                <div className="flex items-center justify-between gap-2 mb-6 border-b border-slate-200 pb-4">
                  <span className="inline-block rounded-full border border-indigo-300 bg-indigo-50 px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-widest text-indigo-700">
                    {event.name}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 font-medium">
                    📍 {event.venue}
                  </span>
                </div>

                {/* Coordinators list */}
                <div className="space-y-6">
                  {event.coordinators.map((c, idx) => (
                    <div key={`${c.name}-${idx}`} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
                      {/* Coordinator Profile Image / Larger Avatar */}
                      <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-2xl overflow-hidden border-2 border-cyber-cyan/40 shadow-lg shadow-cyber-cyan/15 bg-slate-900 flex items-center justify-center group">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              // Fallback on image load error
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : null}
                        {/* Initials Fallback if no image or image error */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyber-cyan via-cyber-purple to-cyber-magenta text-xl font-bold text-white uppercase font-display">
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 pt-1">
                        <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                          {c.name}
                        </h3>
                        <p className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-600">
                          {c.role || "Event Lead"}
                        </p>
                        
                        {c.phone && (
                          <p className="pt-1">
                            <a
                              href={`tel:${c.phone}`}
                              className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-muted hover:text-cyber-cyan transition-colors"
                            >
                              <span>📞</span> {c.phone}
                            </a>
                          </p>
                        )}
                        {c.email && (
                          <p>
                            <a
                              href={`mailto:${c.email}`}
                              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-cyber-cyan transition-colors truncate max-w-[200px]"
                            >
                              <span>✉️</span> {c.email}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {event.coordinators.length === 0 && (
                    <p className="font-mono text-xs text-muted italic">
                      No event lead assigned yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between font-mono text-[11px] text-slate-500">
                <span>Date: {event.date}</span>
                <span>Time: {event.time}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-16 text-center font-mono text-xs uppercase tracking-widest text-slate-500">
          Department of Engineering &amp; Technology — {COLLEGE_NAME}
        </p>
      </div>
    </section>
  );
}