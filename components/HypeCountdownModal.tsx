"use client";

import { useEffect, useState, useCallback } from "react";
import { useRegistrationCountdown } from "@/lib/useRegistrationCountdown";
import { REGISTER_FORM_URL } from "@/lib/eventsConfig";

type HypeCountdownModalProps = {
  registerFormUrl?: string;
};

export default function HypeCountdownModal({
  registerFormUrl = REGISTER_FORM_URL,
}: HypeCountdownModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const countdown = useRegistrationCountdown();

  // Open automatically on initial website open after a micro-delay for smooth mount animation
  useEffect(() => {
    // Check if dismissed previously in this session
    const isDismissed = sessionStorage.getItem("symposium_hype_modal_dismissed");
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen to custom event to open modal from any button on the website
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("symposium:open-hype-modal", handleOpen);
    return () => window.removeEventListener("symposium:open-hype-modal", handleOpen);
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    sessionStorage.setItem("symposium_hype_modal_dismissed", "true");
  }, []);

  const handleExploreArenas = useCallback(() => {
    handleClose();
    const eventsEl = document.getElementById("events");
    if (eventsEl) {
      eventsEl.scrollIntoView({ behavior: "smooth" });
    }
  }, [handleClose]);

  if (!countdown.isMounted) {
    return null;
  }

  const { isLive, days, hours, minutes, seconds } = countdown;

  return (
    <>
      {/* ── MINIMIZED FLOATING PILL (Matches website glass theme) ── */}
      {!isOpen && (
        <aside
          aria-label="Registration countdown preview"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-fade-up"
        >
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/95 hover:bg-white border border-sky-300/80 hover:border-sky-500 text-slate-800 shadow-xl shadow-sky-500/20 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95"
            title="Click to view live countdown"
          >
            {/* Pulsing indicator */}
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? "bg-emerald-400 opacity-75" : "bg-sky-400 opacity-75"
                  }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? "bg-emerald-500" : "bg-[#0080ff]"
                  }`}
              />
            </span>

            <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm">
              <span className="font-bold text-sky-700">
                {isLive ? "🔥 REGISTRATIONS LIVE!" : "⚡ REGISTRATIONS IN:"}
              </span>
              {!isLive && (
                <span className="font-extrabold text-blue-900 tracking-wider tabular-nums bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {hours}:{minutes}:{seconds}
                </span>
              )}
            </div>

            <span className="hidden md:inline-block text-[10px] uppercase font-mono tracking-wider text-sky-600 font-bold group-hover:text-sky-700">
              [Click here]
            </span>
          </button>
        </aside>
      )}

      {/* ── FULL SCREEN HYPING POPUP MODAL (WEBSITE THEME) ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hype-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          {/* Backdrop with frosted soft dark blur for contrast */}
          <div
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
          />

          {/* Ambient Chroma Glow Orbs */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10 flex items-center justify-center">
            <div className="w-[340px] sm:w-[550px] h-[340px] sm:h-[550px] rounded-full bg-sky-400/20 blur-[130px] animate-pulse" />
            <div className="w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] rounded-full bg-indigo-400/20 blur-[130px] -translate-x-24 translate-y-16" />
          </div>

          {/* Modal Container: Matches Website Card & Gradient Theme */}
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200/90 bg-white/95 text-slate-900 p-6 sm:p-8 md:p-10 shadow-[0_25px_70px_-15px_rgba(14,165,233,0.3),0_0_1px_rgba(15,23,42,0.15)] backdrop-blur-xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
            {/* Top Multi-Color Gradient Accent Bar (Matching Header stripe) */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-500 shadow-sm" />

            {/* Subtle Website Cyber Grid Overlay */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none select-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(99, 102, 241, 0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(99, 102, 241, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: "36px 36px",
              }}
            />

            {/* Close Button ("✕") */}
            <button
              onClick={handleClose}
              aria-label="Close popup"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Top Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-[11px] sm:text-xs font-mono font-bold tracking-widest text-sky-700 uppercase mb-4 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600" />
                </span>
                <span>{isLive ? "SYSTEM STATUS: ACTIVE" : "SYSTEM PROTOCOL: STANDBY"}</span>
              </div>

              {/* 1. "LET THE GAME BEGIN.." Main Title */}
              <h2
                id="hype-modal-title"
                className="font-display font-black uppercase tracking-tight text-slate-900 text-3xl sm:text-5xl md:text-6xl leading-[1.08] mb-2 sm:mb-3"
              >
                <span className="inline-block text-slate-900">
                  LET THE GAME
                </span>{" "}
                <span className="inline-block text-[#0080ff] drop-shadow-sm">
                  BEGIN..
                </span>
              </h2>

              {/* 2. "registrations soon.." Subheading */}
              <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5">
                <span className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-sky-400" />
                <p className="font-mono text-sm sm:text-lg md:text-xl font-bold tracking-wider text-sky-600 lowercase">
                  {isLive ? "registrations are now live!" : "registrations soon.."}
                </p>
                <span className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-sky-400" />
              </div>

              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mb-7 font-sans leading-relaxed">
                {isLive ? (
                  "The countdown has finished! Arena registrations are officially open. Claim your seats before spots run out."
                ) : (
                  <>
                    The flagship technical battleground is almost here. Registration portal officially unlocks on{" "}
                    <span className="text-slate-900 font-bold underline decoration-sky-400 underline-offset-4">
                      4th October 2026 at 7:30 PM (IST)
                    </span>
                    .
                  </>
                )}
              </p>

              {/* 3. Live Countdown Timer Running Below (Light Glass Themed Cards) */}
              {!isLive ? (
                <div className="w-full max-w-lg mb-7">
                  <div className="grid grid-cols-4 gap-2 sm:gap-3.5">
                    {/* Days */}
                    <div className="flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/80 to-white shadow-sm">
                      <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tabular-nums">
                        {days}
                      </span>
                      <span className="mt-1 font-mono text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-sky-600">
                        DAYS
                      </span>
                    </div>

                    {/* Hours */}
                    <div className="flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/80 to-white shadow-sm">
                      <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tabular-nums">
                        {hours}
                      </span>
                      <span className="mt-1 font-mono text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-sky-600">
                        HOURS
                      </span>
                    </div>

                    {/* Minutes */}
                    <div className="flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/80 to-white shadow-sm">
                      <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tabular-nums">
                        {minutes}
                      </span>
                      <span className="mt-1 font-mono text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-sky-600">
                        MINS
                      </span>
                    </div>

                    {/* Seconds (Active Accent Card) */}
                    <div className="flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-2xl border border-sky-300 bg-gradient-to-b from-sky-100/90 to-blue-50/80 shadow-md shadow-sky-500/10">
                      <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-black text-[#0080ff] tabular-nums">
                        {seconds}
                      </span>
                      <span className="mt-1 font-mono text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-sky-700">
                        SECS
                      </span>
                    </div>
                  </div>

                  {/* Pulsing sub-bar */}
                  <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Real-time sync targeting 7:30 PM IST (Today)</span>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md p-4 sm:p-5 rounded-2xl border border-emerald-300 bg-emerald-50/80 text-emerald-900 mb-7 text-center shadow-sm">
                  <div className="text-2xl mb-1">🎉</div>
                  <p className="font-mono font-bold text-sm sm:text-base text-emerald-800">
                    REGISTRATION PORTAL IS NOW FULLY UNLOCKED!
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Select your arena and reserve your team's slot now.
                  </p>
                </div>
              )}

              {/* Event Feature Highlights */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-lg mb-7 text-left">
                <div className="p-2.5 sm:p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 shadow-2xs">
                  <span className="text-base sm:text-lg block mb-1">🏆</span>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-900">Cash Prizes</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono">Top performers rewarded</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 shadow-2xs">
                  <span className="text-base sm:text-lg block mb-1">⚡</span>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-900">Arenas</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono">Hackathons to Ideas Pitch</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 shadow-2xs">
                  <span className="text-base sm:text-lg block mb-1">📜</span>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-900">Certificates</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono">For all participants</p>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
                {isLive ? (
                  <a
                    href={registerFormUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-6 py-3.5 font-sans text-sm font-bold text-white shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <span>Register Now</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                ) : (
                  <button
                    onClick={handleExploreArenas}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0095ff] via-[#0080ff] to-[#6366f1] px-6 py-3.5 font-sans text-sm font-bold text-white shadow-xl shadow-sky-500/25 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <span>Explore Arenas &amp; Flow ⚔️</span>
                  </button>
                )}

                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-mono text-xs font-semibold shadow-sm transition-all"
                >
                  Enter Website
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
