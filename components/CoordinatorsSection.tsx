"use client";

import { EVENTS, COLLEGE_NAME, EventConfig } from "@/lib/eventsConfig";

type CoordinatorsSectionProps = {
  events?: EventConfig[];
};

const THEME_ACCENTS = [
  {
    gradientBar: "from-indigo-500 via-purple-500 to-pink-500",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    roleBg: "bg-indigo-50 text-indigo-700 border-indigo-100",
    hoverBorder: "hover:border-indigo-400 hover:shadow-[0_16px_45px_rgba(99,102,241,0.18)]",
    pulseColor: "bg-indigo-500",
    avatarGrad: "from-indigo-500 via-purple-600 to-pink-500",
    ringColor: "ring-indigo-200/70",
    accentColor: "text-indigo-600",
    ctaBtn: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/80 shadow-xs",
  },
  {
    gradientBar: "from-sky-500 via-blue-500 to-indigo-500",
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200/80",
    roleBg: "bg-sky-50 text-sky-700 border-sky-100",
    hoverBorder: "hover:border-sky-400 hover:shadow-[0_16px_45px_rgba(14,165,233,0.18)]",
    pulseColor: "bg-sky-500",
    avatarGrad: "from-sky-500 via-blue-600 to-indigo-600",
    ringColor: "ring-sky-200/70",
    accentColor: "text-sky-600",
    ctaBtn: "bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200/80 shadow-xs",
  },
  {
    gradientBar: "from-emerald-500 via-teal-500 to-cyan-500",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    roleBg: "bg-emerald-50 text-emerald-700 border-emerald-100",
    hoverBorder: "hover:border-emerald-400 hover:shadow-[0_16px_45px_rgba(16,185,129,0.18)]",
    pulseColor: "bg-emerald-500",
    avatarGrad: "from-emerald-500 via-teal-600 to-cyan-600",
    ringColor: "ring-emerald-200/70",
    accentColor: "text-emerald-600",
    ctaBtn: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/80 shadow-xs",
  },
];

export default function CoordinatorsSection({ events }: CoordinatorsSectionProps) {
  // Use DB events if present, otherwise fallback to config
  const rawEvents = events && events.length > 0 ? events : EVENTS;

  // Filter out any "event flow" / schedule item so only true competition events appear
  const activeEvents = rawEvents.filter((event) => {
    const name = (event.name || "").toLowerCase().trim();
    return (
      event.id !== "event-1789830960648" &&
      !name.includes("event flow") &&
      !name.includes("symposium event flow")
    );
  });

  return (
    <section
      id="coordinators"
      className="scroll-mt-24 border-t border-slate-200 bg-gradient-to-br from-white via-indigo-50/25 to-purple-50/25 pt-10 pb-16 sm:pt-14 sm:pb-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="mb-10 sm:mb-12 pb-6 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              <p className="eyebrow tracking-widest text-indigo-600 font-bold">People &amp; Leadership</p>
            </div>
            <h2 className="section-heading text-slate-900 tracking-tight">Coordinators &amp; Event Leads</h2>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed font-body">
              Meet the faculty and student leads orchestrating each competition arena. Contact coordinators directly for queries, guidance, or internal operational access.
            </p>
          </div>
        </div>

        {/* 3 Events Grid */}
        <div className="grid gap-8 sm:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 stagger-children items-stretch">
          {activeEvents.map((event, eventIdx) => {
            const theme = THEME_ACCENTS[eventIdx % THEME_ACCENTS.length];

            return (
              <div
                key={event.id}
                className={`glass rounded-3xl p-5 sm:p-6 transition-all duration-300 border border-slate-200/90 bg-white/95 ${theme.hoverBorder} hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden group shadow-lg shadow-slate-100/80 h-full`}
              >
                {/* Top decorative gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.gradientBar}`} />

                {/* Ambient glow on hover */}
                <div
                  className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br from-indigo-500 to-purple-600"
                />

                <div className="relative z-10 flex flex-col flex-1">
                  {/* Event Header Banner */}
                  <div className="flex items-center justify-between gap-2 mb-3.5 border-b border-slate-100 pb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider ${theme.badgeBg} shrink-0`}
                    >
                      <span className={`h-2 w-2 rounded-full ${theme.pulseColor} animate-pulse shrink-0`} />
                      <span className="truncate max-w-[220px] whitespace-nowrap">
                        {event.name}
                      </span>
                    </span>
                  </div>

                  {/* Event Title & Tagline */}
                  <div className="mb-3.5 flex flex-col justify-center">
                    <h3
                      className="font-display text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight truncate"
                      title={event.name}
                    >
                      {event.name}
                    </h3>
                    <p className="font-mono text-xs text-slate-500 font-medium italic mt-1 truncate">
                      &ldquo;{event.tagline || "Challenge your limits"}&rdquo;
                    </p>
                  </div>

                  {/* Coordinators Section Container */}
                  <div className="relative flex-1 flex flex-col">
                    {/* Middle Area: Fits up to 3 coordinators and scrolls internally */}
                    <div className="relative flex flex-col">
                      {event.coordinators.length > 0 ? (
                        <>
                          <div
                            onWheel={(e) => {
                              const el = e.currentTarget;
                              const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 2;
                              const isAtTop = el.scrollTop <= 2;

                              if ((e.deltaY > 0 && isAtBottom) || (e.deltaY < 0 && isAtTop)) {
                                window.scrollBy({ top: e.deltaY, behavior: "auto" });
                              }
                            }}
                            className="max-h-[365px] space-y-2.5 overflow-y-auto overflow-x-hidden overscroll-auto select-text pr-1 scrollbar-thin"
                            style={{
                              scrollbarWidth: "thin",
                              touchAction: "pan-y",
                            }}
                          >
                            {event.coordinators.map((c, idx) => (
                              <div
                                key={`${c.name}-${idx}`}
                                className="relative flex flex-col p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all duration-200 group/coord"
                              >
                                {/* Top row: Avatar + Name & Rank Badge */}
                                <div className="flex items-center gap-3">
                                  {/* Coordinator Avatar */}
                                  <div
                                    className={`relative h-12 w-12 shrink-0 rounded-xl overflow-hidden ring-2 ${theme.ringColor} shadow-xs bg-slate-900 flex items-center justify-center`}
                                  >
                                    {c.image ? (
                                      <img
                                        src={c.image}
                                        alt={c.name}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover/coord:scale-105"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = "none";
                                        }}
                                      />
                                    ) : null}
                                    {/* Initials Fallback */}
                                    <div
                                      className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${theme.avatarGrad} text-base font-bold text-white uppercase font-display tracking-wider`}
                                    >
                                      {c.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </div>
                                  </div>

                                  {/* Name, Rank & Role */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1 flex-wrap">
                                      <h4 className="font-display text-sm sm:text-base font-bold text-slate-900 group-hover/coord:text-indigo-600 transition-colors leading-snug truncate">
                                        {c.name}
                                      </h4>
                                      {event.coordinators.length > 1 && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs shrink-0">
                                          #{idx + 1} {idx === 0 ? "Lead" : "Co-Lead"}
                                        </span>
                                      )}
                                    </div>

                                    <div className="mt-0.5">
                                      <span
                                        className={`inline-block font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.roleBg} truncate max-w-full`}
                                      >
                                        {c.role || "Event Lead"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Full-width Contact Chips underneath */}
                                {(c.phone || c.email) && (
                                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                                    {c.phone && (
                                      <a
                                        href={`tel:${c.phone}`}
                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-300 transition-all font-mono text-xs font-semibold group/contact"
                                        title={`Call ${c.name} at ${c.phone}`}
                                      >
                                        <span className="text-emerald-500 group-hover/contact:scale-110 transition-transform">
                                          📞
                                        </span>
                                        <span>{c.phone}</span>
                                      </a>
                                    )}
                                    {c.email && (
                                      <a
                                        href={`mailto:${c.email}`}
                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/80 hover:border-indigo-300 transition-all font-mono text-xs font-medium group/contact break-all"
                                        title={`Email ${c.name} (${c.email})`}
                                      >
                                        <span className="text-indigo-500 group-hover/contact:scale-110 transition-transform shrink-0">
                                          ✉️
                                        </span>
                                        <span className="break-all">{c.email}</span>
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Subtle bottom fade if list has more than 3 coordinators */}
                          {event.coordinators.length > 3 && (
                            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/95 via-white/40 to-transparent rounded-b-2xl z-10" />
                          )}
                        </>
                      ) : (
                        /* Beautiful Balanced Placeholder for Upcoming Leads */
                        <div className="w-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-6 px-4 text-center bg-slate-50/70 space-y-2">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shadow-xs">
                            📢
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-display font-bold text-slate-800 text-sm">
                              Leads Being Finalized
                            </p>
                            <p className="font-mono text-xs text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                              Event coordinators and student heads will be announced shortly.
                            </p>
                          </div>
                          <div className="pt-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Assignment In Progress
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Event Card Footer (Structured Date & Time) */}
                <div className="relative z-10 mt-4 pt-3 border-t border-slate-100 shrink-0">
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 font-semibold whitespace-nowrap overflow-hidden">
                      <span className="text-sm shrink-0">🗓️</span>
                      <span className="truncate">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 font-semibold whitespace-nowrap overflow-hidden">
                      <span className="text-sm shrink-0">⏰</span>
                      <span className="truncate">{event.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-16 text-center font-mono text-xs uppercase tracking-widest text-slate-500">
          Department of Engineering &amp; Technology — {COLLEGE_NAME}
        </p>
      </div>
    </section>
  );
}