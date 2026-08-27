import { CLUB_NAME } from "@/lib/eventsConfig";

const ACHIEVEMENTS = [
  { stat: "5+", label: "Years running the symposium", icon: "🏆" },
  { stat: "2000+", label: "Students hosted across editions", icon: "👥" },
  { stat: "40+", label: "Partner colleges", icon: "🏛️" },
  { stat: "12", label: "Industry speakers to date", icon: "🎤" },
];

export default function Achievements() {
  return (
    <section id="achievements" className="border-t border-white/5 bg-ink-surface/30 section-spacing">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center mb-12">
          <p className="eyebrow mb-2">About</p>
          <h2 className="section-heading mb-4">{CLUB_NAME}</h2>
          <p className="mx-auto max-w-2xl text-base text-muted leading-relaxed">
            Replace this paragraph with the club's real story — when it was founded, what it runs
            year-round (workshops, projects, competitions), and what makes this year's symposium
            worth attending.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 stagger-children">
          {ACHIEVEMENTS.map((a) => (
            <div
              key={a.label}
              className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:border-cyber-cyan/40 hover:shadow-glow-cyan hover:-translate-y-1"
            >
              <div className="text-3xl mb-2">{a.icon}</div>
              <p className="font-display text-3xl sm:text-4xl font-bold text-cyber-cyan">
                {a.stat}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                {a.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}