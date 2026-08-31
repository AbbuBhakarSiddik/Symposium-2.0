import { CLUB_NAME } from "@/lib/eventsConfig";

const ACHIEVEMENTS = [
  { stat: "5+", label: "Years running the symposium", icon: "🏆" },
  { stat: "2000+", label: "Students hosted across editions", icon: "👥" },
  { stat: "40+", label: "Partner colleges", icon: "🏛️" },
  { stat: "12", label: "Industry speakers to date", icon: "🎤" },
];

export default function Achievements() {
  return (
    <section id="achievements" className="border-t border-slate-200 bg-gradient-to-br from-white via-blue-50/30 to-slate-50 section-spacing">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center mb-12">
          <p className="eyebrow mb-2">About</p>
          <h2 className="section-heading mb-4 text-slate-900">{CLUB_NAME}</h2>
          <p className="mx-auto max-w-2xl text-base text-slate-600 leading-relaxed">
            Replace this paragraph with the club's real story — when it was founded, what it runs
            year-round (workshops, projects, competitions), and what makes this year's symposium
            worth attending.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 stagger-children">
          {ACHIEVEMENTS.map((a, i) => (
            <div
              key={a.label}
              className={`glass rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 border ${
                i === 0
                  ? "bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200 hover:border-blue-400 hover:shadow-[0_8px_30px_rgba(59,130,246,0.25)]"
                  : i === 1
                  ? "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:border-green-400 hover:shadow-[0_8px_30px_rgba(16,185,129,0.25)]"
                  : i === 2
                  ? "bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 hover:border-orange-400 hover:shadow-[0_8px_30px_rgba(249,115,22,0.25)]"
                  : "bg-gradient-to-br from-red-50 to-rose-100 border-red-200 hover:border-red-400 hover:shadow-[0_8px_30px_rgba(239,68,68,0.25)]"
              }`}
            >
              <div className="text-3xl mb-2">{a.icon}</div>
              <p className={`font-display text-3xl sm:text-4xl font-bold ${
                i === 0 ? "text-blue-600" : i === 1 ? "text-emerald-600" : i === 2 ? "text-orange-600" : "text-red-600"
              }`}>
                {a.stat}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-600 font-semibold">
                {a.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}