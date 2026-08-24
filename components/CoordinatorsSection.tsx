import Link from "next/link";
import { EVENTS, COLLEGE_NAME } from "@/lib/eventsConfig";

export default function CoordinatorsSection() {
  return (
    <section id="coordinators" className="border-t border-ink-line">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">People</p>
            <h2 className="section-heading">Coordinators &amp; department</h2>
          </div>
          <Link
            href="/login"
            className="rounded-sm border border-ink-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted transition hover:border-signal hover:text-signal"
          >
            Coordinator login →
          </Link>
        </div>

        <p className="mb-8 max-w-xl text-sm text-muted">
          Full contact details and internal event material are restricted to coordinator and
          admin logins. Public event-lead names for each event are below.
        </p>

        <div className="grid gap-px overflow-hidden rounded-sm border border-ink-line bg-ink-line sm:grid-cols-2 lg:grid-cols-4">
          {EVENTS.map((e) => (
            <div key={e.id} className="bg-ink p-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-signal">
                {e.name}
              </p>
              {e.coordinators.map((c) => (
                <p key={c.name} className="mt-2 font-display text-base text-paper">
                  {c.name}
                  <span className="block font-mono text-xs font-normal text-muted">{c.role}</span>
                </p>
              ))}
            </div>
          ))}
        </div>

        <p className="mt-8 font-mono text-xs uppercase tracking-widest text-muted">
          Department — {COLLEGE_NAME}
        </p>
      </div>
    </section>
  );
}
