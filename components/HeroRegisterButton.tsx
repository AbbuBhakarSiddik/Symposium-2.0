"use client";

import { useRegistrationCountdown, openHypeModal } from "@/lib/useRegistrationCountdown";
import { REGISTER_FORM_URL } from "@/lib/eventsConfig";

type HeroRegisterButtonProps = {
  registerFormUrl?: string;
};

export default function HeroRegisterButton({
  registerFormUrl = REGISTER_FORM_URL,
}: HeroRegisterButtonProps) {
  const countdown = useRegistrationCountdown();

  // If not yet mounted on client, render clean fallback that matches SSR
  if (!countdown.isMounted) {
    return (
      <div className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#0095ff] via-[#0080ff] to-[#6366f1] text-white px-8 py-3.5 font-sans text-sm sm:text-base font-semibold shadow-xl shadow-sky-500/25 w-full sm:w-auto opacity-90">
        <span>Registration Opens 7:30 PM</span>
      </div>
    );
  }

  // When live (after 7:30 PM on 4th Oct 2026): Active direct register button
  if (countdown.isLive) {
    return (
      <a
        href={registerFormUrl}
        target="_blank"
        rel="noreferrer"
        className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-[#0095ff] to-[#6366f1] hover:opacity-95 text-white px-8 py-3.5 font-sans text-sm sm:text-base font-bold shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        <span>Register Now</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </a>
    );
  }

  // Before 7:30 PM: Glowing Countdown Timer Button
  return (
    <div className="flex flex-col items-center gap-1.5 w-full sm:w-auto">
      <button
        type="button"
        onClick={openHypeModal}
        title="Registrations open at 7:30 PM today! Click to view live countdown"
        className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#0095ff] via-[#0080ff] to-[#6366f1] hover:brightness-110 text-white px-6 sm:px-8 py-3.5 font-sans text-sm sm:text-base font-bold shadow-xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto cursor-pointer"
      >
        {/* Pulsing clock indicator */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>

        <span className="tracking-wide">Opens in:</span>

        {/* Live Timer digits */}
        <span className="font-mono font-black tracking-widest bg-black/25 px-2.5 py-0.5 rounded-lg border border-white/20 tabular-nums text-white text-sm sm:text-base shadow-inner">
          {countdown.formattedTimer}
        </span>

        {/* Info Eye / Arrow icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      <span className="text-[11px] font-mono text-sky-200/80 tracking-wide">
        ⚡ Today at 7:30 PM IST • Click for countdown
      </span>
    </div>
  );
}
