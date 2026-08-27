import Link from "next/link";
import { EVENTS, COLLEGE_NAME } from "@/lib/eventsConfig";

export default function CoordinatorsSection() {
  return (
    <section id="coordinators" className="border-t border-white/5 bg-ink-surface/30 py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">People</p>
            <h2 className="section-heading">Coordinators &amp; Department</h2>
          </div>
          <Link
            href="/login"
            className="btn-cyber text-xs py-1.5 px-5"
          >
            Coordinator Login →
          </Link>
        </div>

        <p className="mb-10 max-w-xl text-sm text-muted leading-relaxed">
          Full contact details and internal event material are restricted to coordinator and
          admin logins. Public event‑lead names for each event are below.
        </p>

        {/* Coordinators Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          {EVENTS.map((event) => (
            <div
              key={event.id}
              className="glass rounded-2xl p-5 transition-all duration-300 hover:border-cyber-cyan/40 hover:shadow-glow-cyan hover:-translate-y-1"
            >
              {/* Event badge */}
              <div className="mb-3 inline-block rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cyber-cyan">
                {event.name}
              </div>

              {/* Coordinators */}
              <div className="space-y-4">
                {event.coordinators.map((c) => (
                  <div key={c.name} className="flex items-start gap-3">
                    {/* Avatar placeholder (initials) */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyber-cyan to-cyber-purple text-xs font-bold text-ink">
                      {c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-display text-base font-medium text-paper">
                        {c.name}
                      </p>
                      <p className="font-mono text-xs text-muted">{c.role}</p>
                      {c.phone && (
                        <p className="mt-0.5 font-mono text-[10px] text-cyber-cyan">
                          {c.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center font-mono text-xs uppercase tracking-widest text-muted">
          Department — {COLLEGE_NAME}
        </p>
      </div>
    </section>
  );
}