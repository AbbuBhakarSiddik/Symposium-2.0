import { CLUB_NAME } from "@/lib/eventsConfig";

const ACHIEVEMENTS = [
  { stat: "5+", label: "Years running the symposium" },
  { stat: "2000+", label: "Students hosted across editions" },
  { stat: "40+", label: "Partner colleges" },
  { stat: "12", label: "Industry speakers to date" },
];

export default function Achievements() {
  return (
    <section id="achievements" className="border-t border-ink-line bg-ink-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <p className="eyebrow mb-2">About</p>
        <h2 className="section-heading mb-4">{CLUB_NAME}</h2>
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Replace this paragraph with the club's real story — when it was founded, what it runs
          year-round (workshops, projects, competitions), and what makes this year's symposium
          worth attending.
        </p>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.label} className="border-l border-signal/50 pl-4">
              <p className="font-display text-3xl font-medium text-paper sm:text-4xl">{a.stat}</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
                {a.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
