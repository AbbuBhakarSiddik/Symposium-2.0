import { SYMPOSIUM_NAME, COLLEGE_NAME, CLUB_NAME, EVENTS } from "@/lib/eventsConfig";

export default function Hero() {
  const stats = [
    { label: "Years", value: "5+" },
    { label: "Students", value: "2000+" },
    { label: "Colleges", value: "40+" },
    { label: "Speakers", value: "12" },
  ];

  return (
    <section className="relative overflow-hidden min-h-[80vh] flex items-center z-10">
      {/* Additional Hero-specific orbs – these float on top of the global background */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyber-cyan/10 blur-[140px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyber-magenta/10 blur-[140px] animate-float pointer-events-none" style={{ animationDelay: "-4s" }} />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-40 w-full text-center z-20">
        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-semibold leading-[1.05] tracking-tight">
          <span className="text-paper">{SYMPOSIUM_NAME}</span>
          <span className="block gradient-text mt-1">National Symposium</span>
        </h1>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-mono text-muted">
          <span className="flex items-center gap-2 rounded-full border border-cyber-cyan/20 bg-ink/80 backdrop-blur-sm px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyber-cyan animate-pulse" />
            📅 12–13 September 2026
          </span>
          <span className="hidden sm:inline text-ink-line">·</span>
          <span className="flex items-center gap-2 rounded-full border border-cyber-cyan/20 bg-ink/80 backdrop-blur-sm px-4 py-1.5">
            📍 {COLLEGE_NAME}, Main Auditorium
          </span>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 text-center transition-all duration-300 hover:border-cyber-cyan/40 hover:shadow-glow-cyan">
              <p className="font-display text-3xl sm:text-4xl font-bold text-cyber-cyan">{stat.value}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-2xl mx-auto text-base sm:text-lg text-muted leading-relaxed">
          Bringing together {EVENTS.length} electrifying events, industry experts, and students from across the country – 
          one day, one stage, limitless innovation.
        </p>

        <div className="mt-10">
          <a
            href="#events"
            className="btn-cyber"
          >
            Explore Events
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}