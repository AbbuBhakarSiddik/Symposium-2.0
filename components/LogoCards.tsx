"use client";

import Image from "next/image";
import Link from "next/link";

export default function LogoCards() {
  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto px-2 sm:px-0">
      {/* ── UNIFIED STRUCTURED LOGO BADGE CONTAINER ────────────────── */}
      <div className="relative rounded-3xl p-5 sm:p-7 md:p-8 bg-[#040e24]/90 backdrop-blur-xl border border-sky-500/35 shadow-[0_0_35px_rgba(0,110,255,0.22),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300">
        {/* Subtle top inner accent highlight */}
        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent pointer-events-none" />

        {/* ── TOP SECTION: ORGANIZED BY ───────────────────────────── */}
        <div className="flex flex-col items-center text-center">
          {/* Header with flanking horizontal accent lines */}
          <div className="flex items-center justify-center w-full max-w-xs sm:max-w-sm mx-auto mb-4 sm:mb-5">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-slate-500/80" />
            <span className="px-3 sm:px-4 font-mono text-[11px] sm:text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold whitespace-nowrap">
              ORGANIZED BY
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-600 to-slate-500/80" />
          </div>

          {/* Circular Golden Medallion holding college logo */}
          <a
            href="https://shrideviengineering.org/"
            target="_blank"
            rel="noreferrer"
            className="group/college relative inline-flex items-center justify-center rounded-full p-[3px] bg-gradient-to-b from-[#ffe58f] via-[#faad14] to-[#d48806] shadow-[0_0_30px_rgba(250,173,20,0.5),0_0_55px_rgba(250,173,20,0.22)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(250,173,20,0.7)]"
            aria-label="Visit Shridevi Education website"
          >
            {/* White Circular Disc */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-white flex items-center justify-center p-2 sm:p-2.5 overflow-hidden shadow-inner">
              <Image
                src="/logos/SIETLOGO2.jpeg"
                alt="Shridevi Education Logo"
                width={160}
                height={160}
                priority
                className="w-full h-full object-contain scale-[1.28] select-none transition-transform duration-300 group-hover/college:scale-[1.34]"
              />
            </div>
          </a>

          {/* College Name text */}
          <h3 className="font-sans font-semibold text-xs sm:text-sm md:text-base text-slate-100 text-center mt-3.5 sm:mt-4 leading-snug max-w-xs sm:max-w-sm">
            Shridevi Institute of Engineering
            <br />
            and Technology, Tumakuru
          </h3>
        </div>

        {/* ── MIDDLE DIVIDER: IN ASSOCIATION WITH ─────────────────── */}
        <div className="flex items-center justify-center w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto my-5 sm:my-6">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-slate-500/80" />
          <span className="px-3 sm:px-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-slate-400 font-semibold whitespace-nowrap">
            IN ASSOCIATION WITH
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-600 to-slate-500/80" />
        </div>

        {/* ── BOTTOM SECTION: 2 CARDS SIDE-BY-SIDE ─────────────────── */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4.5 w-full">
          {/* Card 1: Innovation Ignite Symposium 2.0 */}
          <Link
            href="#events"
            className="group/sympo relative rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between text-center bg-[#06142e]/70 hover:bg-[#07193b]/95 border border-sky-500/30 hover:border-sky-400/60 shadow-inner transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(255,140,0,0.22)]"
            aria-label="Innovation Ignite Symposium 2.0 Events"
          >
            {/* Round Logo */}
            <div className="relative w-18 h-18 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_18px_rgba(255,140,0,0.4)] group-hover/sympo:scale-105 transition-transform duration-300">
              <Image
                src="/logos/sympo2.0.jpeg"
                alt="Innovation Ignite Symposium 2.0 Emblem"
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title */}
            <div className="mt-3 sm:mt-3.5 flex flex-col items-center">
              <span className="font-display font-bold text-white text-xs sm:text-sm md:text-[15px] leading-tight group-hover/sympo:text-amber-300 transition-colors">
                Innovation Ignite
              </span>
              <span className="font-display font-bold text-white text-xs sm:text-sm md:text-[15px] leading-tight group-hover/sympo:text-amber-300 transition-colors">
                Symposium 2.0
              </span>
            </div>
          </Link>

          {/* Card 2: Creative Codex Technical Club */}
          <Link
            href="#contact"
            className="group/club relative rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between text-center bg-[#06142e]/70 hover:bg-[#07193b]/95 border border-sky-500/30 hover:border-sky-400/60 shadow-inner transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,160,255,0.22)]"
            aria-label="Creative Codex Department Student Technical Club"
          >
            {/* Round Logo */}
            <div className="relative w-18 h-18 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_18px_rgba(0,160,255,0.4)] group-hover/club:scale-105 transition-transform duration-300">
              <Image
                src="/logos/cclogo1.png"
                alt="Creative Codex Club Emblem"
                width={100}
                height={100}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Title & Subtitle */}
            <div className="mt-3 sm:mt-3.5 flex flex-col items-center">
              <span className="font-display font-bold text-white text-xs sm:text-sm md:text-[15px] leading-tight group-hover/club:text-sky-300 transition-colors">
                Creative Codex
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1 leading-snug">
                Department Student
                <br />
                Technical Club
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
