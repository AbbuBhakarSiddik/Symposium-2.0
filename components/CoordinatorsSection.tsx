"use client";

import Link from "next/link";
import { EVENTS, COLLEGE_NAME, EventConfig } from "@/lib/eventsConfig";

type CoordinatorsSectionProps = {
  events?: EventConfig[];
};

export default function CoordinatorsSection({ events }: CoordinatorsSectionProps) {
  const activeEvents = events && events.length > 0 ? events : EVENTS;

  return (
    <section id="coordinators" className="scroll-mt-24 border-t border-slate-200 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 py-24 sm:py-32">
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

                {/* Coordinators list - inside scrollable when multiple coordinators */}
                <div className="relative">
                  {event.coordinators.length > 2 && (
                    <div className="mb-3 flex items-center justify-between text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50/90 px-3 py-1.5 rounded-xl border border-indigo-200/80">
                      <span>👥 {event.coordinators.length} Coordinators Assigned</span>
                      <span className="text-[10px] text-slate-500 font-medium">↕ Scroll inside to view all</span>
                    </div>
                  )}

                  <div className="space-y-5 max-h-[350px] sm:max-h-[380px] overflow-y-auto overscroll-contain pr-1.5 select-text">
                    {event.coordinators.map((c, idx) => (
                      <div
                        key={`${c.name}-${idx}`}
                        className="relative flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 p-3 rounded-2xl transition-all hover:bg-slate-50/90 border border-slate-100 hover:border-slate-200"
                      >
                        {/* Coordinator Rank Badge if more than 1 coordinator */}
                        {event.coordinators.length > 1 && (
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
                            #{idx + 1} {idx === 0 ? "Lead" : ""}
                          </div>
                        )}

                        {/* Coordinator Profile Image / Avatar */}
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl overflow-hidden border-2 border-indigo-400/50 shadow-md shadow-indigo-500/10 bg-slate-900 flex items-center justify-center group">
                          {c.image ? (
                            <img
                              src={c.image}
                              alt={c.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : null}
                          {/* Initials Fallback */}
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-lg sm:text-xl font-bold text-white uppercase font-display">
                            {c.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-1 pt-0.5 flex-1 min-w-0">
                          <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug truncate">
                            {c.name}
                          </h3>
                          <p className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-600">
                            {c.role || "Event Lead"}
                          </p>
                          
                          {c.phone && (
                            <p className="pt-0.5">
                              <a
                                href={`tel:${c.phone}`}
                                className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                              >
                                <span>📞</span> {c.phone}
                              </a>
                            </p>
                          )}
                          {c.email && (
                            <p>
                              <a
                                href={`mailto:${c.email}`}
                                className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-500 hover:text-indigo-600 transition-colors truncate max-w-[200px]"
                              >
                                <span>✉️</span> {c.email}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {event.coordinators.length === 0 && (
                      <p className="font-mono text-xs text-slate-500 italic py-4 text-center">
                        No event lead assigned yet.
                      </p>
                    )}
                  </div>
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