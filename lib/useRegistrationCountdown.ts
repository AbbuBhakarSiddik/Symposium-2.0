"use client";

import { useEffect, useState, useCallback } from "react";
import { REGISTRATION_LIVE_DATE } from "./eventsConfig";

export type CountdownState = {
  isMounted: boolean;
  isLive: boolean;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  totalSeconds: number;
  formattedTimer: string;
  targetDate: Date;
};

const pad = (n: number): string => String(Math.max(0, n)).padStart(2, "0");

/** Helper to dispatch global event to open the hype modal from anywhere in the app */
export function openHypeModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("symposium:open-hype-modal"));
  }
}

export function useRegistrationCountdown(targetDateIso: string = REGISTRATION_LIVE_DATE): CountdownState {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const targetDate = new Date(targetDateIso);
  const targetTime = targetDate.getTime();
  
  // If not yet mounted in the browser, return predictable static SSR state
  if (!mounted || now === 0) {
    return {
      isMounted: false,
      isLive: false,
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
      totalSeconds: 0,
      formattedTimer: "7:30 PM",
      targetDate,
    };
  }

  const diffMs = Math.max(0, targetTime - now);
  const isLive = diffMs <= 0;

  const totalSeconds = Math.floor(diffMs / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const days = pad(d);
  const hours = pad(h);
  const minutes = pad(m);
  const seconds = pad(s);

  const formattedTimer = d > 0 ? `${days}d ${hours}h ${minutes}m ${seconds}s` : `${hours}:${minutes}:${seconds}`;

  return {
    isMounted: true,
    isLive,
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    formattedTimer,
    targetDate,
  };
}
