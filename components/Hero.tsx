// Hero.tsx — Landing section matching the reference design:
//   1. Full-bleed cinematic background (AI cybernetic face, college campus, glowing bulb, students)
//   2. Top eyebrow: "NATIONAL LEVEL TECHNICAL SYMPOSIUM"
//   3. Main Title: "Innovation Ignite 2.0"
//   4. Tagline: "Explore • Create • Collaborate • Innovate"
//   5. Info chips: Coming Soon, Shridevi Institute of Engineering & Technology, Open for All Students
//   6. CTA Buttons: Register Now & View Events
//   7. 3 Organiser & Event Cards placed directly underneath over the bottom curve

import Image from "next/image";
import LogoCards from "@/components/LogoCards";
import { REGISTER_FORM_URL } from "@/lib/eventsConfig";

export default function Hero() {
  return (
    <section
      id="home"
      className="scroll-mt-24 relative overflow-hidden min-h-[92vh] flex flex-col justify-between z-10 bg-[#020b18] text-white pt-10 pb-20 sm:pt-14 sm:pb-28"
      aria-label="Hero section"
    >
      {/* ── CINEMATIC ARTWORK BACKGROUND ─────────────────────────── */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none select-none">
        <Image
          src="/media/hero-bg.jpg"
          alt="Innovation Ignite 2.0 Technical Symposium"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top sm:object-center"
        />
        {/* Subtle dark vignette overlay at top for navigation/title contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020b18]/50 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* ── SUBTLE SMOOTH BOTTOM FADE TRANSITION ───────────────────── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-20 sm:h-28 bg-gradient-to-t from-[#e8f0fe] via-[#e8f0fe]/40 to-transparent pointer-events-none -z-10"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full z-10 flex flex-col items-center text-center">
        {/* ── 1. EYEBROW (NATIONAL LEVEL) ─────────────────────────── */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3">
          <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-sky-400/60 to-sky-300" />
          <p className="font-mono text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.35em] text-sky-200 drop-shadow-md">
            NATIONAL LEVEL
          </p>
          <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent via-sky-400/60 to-sky-300" />
        </div>

        {/* ── 2. MAIN TITLE IN TWO BIG CAPITAL LINES ────────────────── */}
        <h1 className="font-display font-black uppercase tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] leading-[1.08] max-w-5xl mx-auto flex flex-col items-center justify-center text-[2.2rem] min-[380px]:text-4xl min-[480px]:text-5xl sm:text-7xl md:text-8xl lg:text-[5.75rem] xl:text-[6.25rem]">
          {/* Line 1: INNOVATION IGNITE */}
          <span className="inline-flex items-baseline justify-center flex-wrap gap-x-2 sm:gap-x-4">
            <span className="text-white drop-shadow-md">INNOVATION</span>
            <span className="text-[#0080ff] inline-flex items-baseline">
              IGN
              <span className="relative inline-flex items-center justify-center">
                {/* Stylized Blue Flame crowning the 'I' */}
                <img
                  src="/media/flame-icon.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute -top-3.5 sm:-top-6 md:-top-7 lg:-top-8 xl:-top-9 left-1/2 -translate-x-1/2 w-3 sm:w-5 md:w-6 lg:w-7 h-auto drop-shadow-[0_0_12px_rgba(0,128,255,0.9)] pointer-events-none"
                />
                <span className="inline-block">I</span>
              </span>
              TE
            </span>
          </span>

          {/* Line 2: SYMPOSIUM 2.O */}
          <span className="inline-flex items-baseline justify-center flex-wrap gap-x-2 sm:gap-x-4 mt-0.5 sm:mt-1">
            <span className="text-white drop-shadow-md">SYMPOSIUM</span>
            <span className="text-[#0080ff] drop-shadow-[0_0_16px_rgba(0,128,255,0.4)]">
              2.O
            </span>
          </span>
        </h1>

        {/* ── DECORATIVE ACCENT DIVIDER UNDER TITLE ─────────────────── */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5 sm:mt-3 mb-5 sm:mb-6">
          <span className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-sky-400/40" />
          <span className="h-[3px] w-12 sm:w-16 rounded-full bg-[#0080ff] shadow-[0_0_12px_rgba(0,128,255,0.8)]" />
          <span className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-sky-400/40" />
        </div>

        {/* ── 3. TAGLINE ────────────────────────────────────────────── */}
        <p className="font-sans text-xs sm:text-base md:text-lg text-slate-200/90 font-normal tracking-wider drop-shadow mb-6 sm:mb-7">
          Explore &bull; Create &bull; Collaborate &bull; Innovate
        </p>

        {/* ── 4. INFO CHIPS ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium mb-7 sm:mb-8 max-w-3xl px-2">
          <span className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-sky-400/25 bg-[#091b38]/80 backdrop-blur-md px-3 sm:px-4 py-1.5 text-slate-200 shadow-sm text-center">
            <span>📅</span> October 30th, 2026
          </span>
          <span className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-sky-400/25 bg-[#091b38]/80 backdrop-blur-md px-3 sm:px-4 py-1.5 text-slate-200 shadow-sm text-center">
            <span>📍</span> Shridevi Institute of Engineering and Technology, Tumkur
          </span>
          <span className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-sky-400/25 bg-[#091b38]/80 backdrop-blur-md px-3 sm:px-4 py-1.5 text-slate-200 shadow-sm text-center">
            <span>👥</span> Open for All Students
          </span>
        </div>

        {/* ── 5. CTA BUTTONS ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full mb-10 sm:mb-12">
          {/* Primary: Register Now (Gradient pill with arrow) */}
          <a
            href={REGISTER_FORM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#0095ff] via-[#0080ff] to-[#6366f1] hover:opacity-95 text-white px-8 py-3.5 font-sans text-sm sm:text-base font-semibold shadow-xl shadow-sky-500/25 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto"
          >
            Register Now
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </a>

          {/* Secondary: View Events (Dark glass pill with arrow) */}
          <a
            href="#events"
            className="inline-flex items-center justify-center gap-2.5 rounded-full border border-slate-400/35 bg-[#091b38]/65 hover:bg-[#091b38]/90 backdrop-blur-md px-7 py-3.5 font-sans text-sm sm:text-base font-medium text-white shadow-md hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto"
          >
            <span aria-hidden="true">📅</span>
            View Events
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </a>
        </div>

        {/* ── 6. THE 3 CARDS UNDER THE TITLE ─────────────────────────── */}
        <LogoCards />
      </div>
    </section>
  );
}
