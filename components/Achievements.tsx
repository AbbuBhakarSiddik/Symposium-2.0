"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CLUB_NAME, COLLEGE_NAME } from "@/lib/eventsConfig";

const ACHIEVEMENTS = [
  {
    stat: "2+",
    label: "Years Running Symposium",
    icon: "🏆",
    color: "from-blue-500/10 via-sky-500/10 to-transparent",
    textGrad: "from-blue-600 to-sky-600",
    border: "hover:border-blue-300",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    stat: "12+",
    label: "Industry Speakers & Mentors",
    icon: "🎤",
    color: "from-purple-500/10 via-pink-500/10 to-transparent",
    textGrad: "from-purple-600 to-pink-600",
    border: "hover:border-purple-300",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

export default function Achievements() {
  const logoRef = useRef<HTMLDivElement>(null);
  const [isLogoVisible, setIsLogoVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLogoVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (logoRef.current) {
      observer.observe(logoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="achievements"
      className="scroll-mt-24 border-t border-slate-200/80 bg-gradient-to-b from-white via-indigo-50/20 to-slate-50/50 pt-10 pb-10 sm:pt-14 sm:pb-14"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Header Section — Highlighted & Structured */}
        <div className="text-center mb-10">
          {/* Highlighted 'About' Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200/90 bg-indigo-50/80 text-indigo-700 shadow-xs mb-3 font-mono text-xs font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            <span>About The Community</span>
          </div>

          {/* Highlighted 'Creative Codex' Title */}
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            About{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 bg-clip-text text-transparent">
              {CLUB_NAME}
            </span>
          </h2>

          {/* Subtitle Chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-slate-600">
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs font-semibold text-slate-700">
              ⚡ Official Student Technical Club
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs font-semibold text-indigo-700">
              🏛️ {COLLEGE_NAME}
            </span>
          </div>

          {/* ── Scroll-Triggered Animated Club Logo ───────────────────── */}
          <div
            ref={logoRef}
            className="my-7 flex flex-col items-center justify-center select-none"
          >
            {/* Concentric Cyber Emblem Stage */}
            <div
              className={`relative flex items-center justify-center group cursor-pointer transform transition-all duration-700 ease-out ${isLogoVisible
                ? "opacity-100 scale-100 translate-y-0 rotate-0"
                : "opacity-0 scale-50 translate-y-8 rotate-[-10deg]"
                }`}
            >
              {/* Ambient cybernetic pulsing reactor glow - centered on emblem */}
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-1000 ${isLogoVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  }`}
              >
                <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-gradient-to-r from-sky-400/25 via-indigo-500/25 to-purple-500/25 blur-2xl" />
              </div>

              {/* Outer rotating cyber ring - perfectly concentric */}
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-1000 ${isLogoVisible ? "opacity-60 scale-100" : "opacity-0 scale-50"
                  }`}
              >
                <div className="w-[164px] h-[164px] sm:w-[210px] sm:h-[210px] rounded-full border border-sky-400/35 border-dashed animate-[spin_20s_linear_infinite]" />
              </div>

              {/* Inner reverse rotating accent ring - perfectly concentric */}
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-1000 ${isLogoVisible ? "opacity-45 scale-100" : "opacity-0 scale-50"
                  }`}
              >
                <div className="w-[138px] h-[138px] sm:w-[176px] sm:h-[176px] rounded-full border border-indigo-400/30 border-dotted animate-[spin_15s_linear_infinite_reverse]" />
              </div>

              {/* The Emblem Image (centered in stage) */}
              <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full p-1.5 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2">
                <Image
                  src="/logos/cclogo1.png"
                  alt={`${CLUB_NAME} Official Emblem`}
                  width={350}
                  height={350}
                  className="w-full h-full object-contain filter drop-shadow-[0_12px_28px_rgba(14,165,233,0.4)] transition-all duration-300 group-hover:drop-shadow-[0_16px_36px_rgba(99,102,241,0.55)]"
                  priority
                />
              </div>
            </div>

            {/* Emblem Badge: cleanly placed underneath with proper margin */}
            <div className="text-center mt-7 sm:mt-9 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/95 text-indigo-700 border border-indigo-200/90 shadow-xs backdrop-blur-md transition-colors hover:border-indigo-400 hover:text-indigo-900">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Creative Codex Emblem
              </span>
            </div>
          </div>

          {/* Club Story Card */}
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-6 sm:p-8 shadow-sm text-center space-y-3">
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-body font-medium">
              <strong className="text-indigo-600">{CLUB_NAME}</strong> is the student technical club of the Department of Computer Science & Engineering, dedicated to fostering technical skills, creativity, collaboration, and innovation among students.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed font-body">
              The club organizes technical activities, coding competitions, Department activities, project showcases and symposiums that provide students with opportunities to learn and demonstrate their skills.
            </p>
          </div>
        </div>

        {/* 2 Stat Cards Side by Side */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto stagger-children">
          {ACHIEVEMENTS.map((a) => (
            <div
              key={a.label}
              className={`glass rounded-2xl p-5 sm:p-6 text-center transition-all duration-300 hover:-translate-y-1.5 border border-slate-200/90 bg-white/95 shadow-sm hover:shadow-lg ${a.border} relative overflow-hidden group`}
            >
              {/* Subtle top ambient glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${a.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />

              <div className="relative z-10">
                <div className="text-3xl sm:text-4xl mb-2.5 transform group-hover:scale-110 transition-transform duration-300">
                  {a.icon}
                </div>
                <p
                  className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r ${a.textGrad} bg-clip-text text-transparent`}
                >
                  {a.stat}
                </p>
                <p className="mt-2 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-slate-600 font-semibold leading-snug">
                  {a.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}