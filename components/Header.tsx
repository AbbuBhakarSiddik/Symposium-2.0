"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CLUB_NAME } from "@/lib/eventsConfig";

type HeaderProps = {
  runningAnnouncement?: string;
  runningAnnouncementActive?: boolean;
};

export default function Header({
  runningAnnouncement = "📢 Registrations are now open for Innovation Ignite Symposium 2.0!  Register now!",
  runningAnnouncementActive = true,
}: HeaderProps = {}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Navigation click lock refs to prevent active pill indicator flickering during smooth scrolling
  const isNavClickingRef = useRef(false);
  const clickUnlockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollEndDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Track active section and scroll state
  useEffect(() => {
    if (pathname === "/announcements") {
      setActiveSection("announcements");
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);

      // If programmatic smooth scroll from clicking a nav item is in progress,
      // preserve the clicked active section and avoid intermediate fluctuation.
      if (isNavClickingRef.current) {
        if (scrollEndDebounceRef.current) {
          clearTimeout(scrollEndDebounceRef.current);
        }
        scrollEndDebounceRef.current = setTimeout(() => {
          isNavClickingRef.current = false;
        }, 150);
        return;
      }

      // If near top of page, home is active
      if (window.scrollY < 120) {
        setActiveSection("home");
        return;
      }

      // If user has scrolled to the bottom of the page, contact is active
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60
      ) {
        setActiveSection("contact");
        return;
      }

      // Check sections from bottom of page to top:
      // Page order: Home -> Events -> Achievements -> Gallery -> Coordinators -> Contact
      const sections = ["contact", "coordinators", "gallery", "achievements", "events"];
      const headerEl = document.querySelector("header");
      const headerOffset = headerEl ? headerEl.offsetHeight + 12 : 90;
      const scrollPosition = window.scrollY + headerOffset + 80;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && scrollPosition >= el.offsetTop) {
          setActiveSection(section);
          return;
        }
      }
      setActiveSection("home");
    };

    // If user starts physically scrolling (wheel or touch swipe), release click lock
    const handleUserGesture = () => {
      if (isNavClickingRef.current) {
        isNavClickingRef.current = false;
        if (clickUnlockTimeoutRef.current) clearTimeout(clickUnlockTimeoutRef.current);
        if (scrollEndDebounceRef.current) clearTimeout(scrollEndDebounceRef.current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleUserGesture, { passive: true });
    window.addEventListener("touchmove", handleUserGesture, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleUserGesture);
      window.removeEventListener("touchmove", handleUserGesture);
      if (clickUnlockTimeoutRef.current) clearTimeout(clickUnlockTimeoutRef.current);
      if (scrollEndDebounceRef.current) clearTimeout(scrollEndDebounceRef.current);
    };
  }, [pathname]);

  // Handle initial hash navigation (e.g. landing from /announcements with /#events)
  useEffect(() => {
    if (pathname === "/" && typeof window !== "undefined") {
      const scrollFromHash = () => {
        const hash = window.location.hash.replace("#", "");
        if (hash) {
          const el = document.getElementById(hash);
          if (el) {
            isNavClickingRef.current = true;
            setActiveSection(hash);
            if (clickUnlockTimeoutRef.current) clearTimeout(clickUnlockTimeoutRef.current);
            clickUnlockTimeoutRef.current = setTimeout(() => {
              isNavClickingRef.current = false;
            }, 1200);

            const headerEl = document.querySelector("header");
            const headerOffset = headerEl ? headerEl.offsetHeight + 12 : 90;
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;
            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: "smooth",
            });
          }
        }
      };

      scrollFromHash();
      const timer = setTimeout(scrollFromHash, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Unified click handler for guaranteed smooth scrolling & section navigation
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string, href: string) => {
      // 1. Immediately unlock body scroll so window.scrollTo can execute without being blocked
      document.body.style.overflow = "unset";
      setIsMobileMenuOpen(false);

      // Lock the active section immediately on the tapped item so intermediate scroll ticks don't flicker
      isNavClickingRef.current = true;
      setActiveSection(id);

      if (clickUnlockTimeoutRef.current) clearTimeout(clickUnlockTimeoutRef.current);
      if (scrollEndDebounceRef.current) clearTimeout(scrollEndDebounceRef.current);

      // Fallback safety timeout to release lock after smooth scroll completes (or if already near target)
      clickUnlockTimeoutRef.current = setTimeout(() => {
        isNavClickingRef.current = false;
      }, 1200);

      // Dedicated page navigation (Announcements)
      if (href === "/announcements") {
        return;
      }

      // If we're already on the home page, perform smooth scrolling
      if (pathname === "/") {
        e.preventDefault();

        if (id === "home") {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          window.history.pushState(null, "", "/");
          return;
        }

        const scrollToTarget = () => {
          const el = document.getElementById(id);
          if (el) {
            const headerEl = document.querySelector("header");
            const headerOffset = headerEl ? headerEl.offsetHeight + 12 : 90;
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: "smooth",
            });
            window.history.pushState(null, "", `/#${id}`);
          }
        };

        // Scroll immediately, and repeat after 60ms to guarantee execution after mobile drawer unfreezes
        scrollToTarget();
        setTimeout(scrollToTarget, 60);
      } else {
        // If we are on another route (e.g. /announcements), navigate to /#id
        e.preventDefault();
        router.push(href);
      }
    },
    [pathname, router]
  );

  const navLinks = [
    {
      id: "home",
      href: "/",
      label: "Home",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      id: "events",
      href: "/#events",
      label: "Events",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "announcements",
      href: "/announcements",
      label: "Announcements",
      hasNotification: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      id: "achievements",
      href: "/#achievements",
      label: "Achievements",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 8a5 5 0 01-5 5h-4a5 5 0 01-5-5V4h14v4zM5 6H3a2 2 0 00-2 2v1a4 4 0 004 4h1M19 6h2a2 2 0 012 2v1a4 4 0 01-4 4h-1M12 13v5m-4 3h8" />
        </svg>
      ),
    },
    {
      id: "gallery",
      href: "/#gallery",
      label: "Gallery",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "coordinators",
      href: "/#coordinators",
      label: "Coordinators",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: "contact",
      href: "/#contact",
      label: "Contact",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 border-b ${scrolled ? "border-slate-300/80 shadow-md" : "border-slate-200/60 shadow-xs"
          }`}
        style={{
          background: 'linear-gradient(135deg, rgba(238,244,255,0.96) 0%, rgba(245,238,255,0.94) 33%, rgba(255,240,246,0.92) 66%, rgba(237,252,251,0.94) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.05) 1px, transparent 1px),
            linear-gradient(135deg, rgba(238,244,255,0.96) 0%, rgba(245,238,255,0.94) 33%, rgba(255,240,246,0.92) 66%, rgba(237,252,251,0.94) 100%)
          `,
          backgroundSize: '48px 48px, 48px 48px, 100% 100%',
        }}
      >
        <div className="mx-auto w-full max-w-[1400px]">
          {/* Card Container with Top Vibrant Gradient Border */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl transition-all">
            {/* Top Gradient Stripe */}
            <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-500" />

            {/* Header Content Bar */}
            <div className="flex items-center justify-between min-h-[80px] px-3 sm:px-5 py-4 sm:py-5 gap-4 lg:gap-3">
              {/* Left: Brand Identity */}
              <Link
                href="/"
                onClick={(e) => handleNavClick(e, "home", "/")}
                className="flex items-center gap-2.5 group select-none shrink-0"
                aria-label="Innovation Ignite Symposium 2.0"
              >
                {/* Logo Image in Dark Rounded Square Box */}
                <div className="h-12 w-12 sm:h-11 sm:w-11 rounded-xl bg-slate-950 p-1 flex items-center justify-center overflow-hidden border border-slate-800 shadow-xs shrink-0 transition-transform duration-200 group-hover:scale-105">
                  <Image
                    src="/logos/sympo2.0.jpeg"
                    alt={`${CLUB_NAME} logo`}
                    width={40}
                    height={40}
                    className="h-full w-full object-contain rounded-lg"
                    priority
                  />
                </div>

                {/* 2-Line Title */}
                <div className="flex flex-col">
                  <span className="font-display text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                    Innovation Ignite
                  </span>
                  <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-semibold leading-tight mt-0.5">
                    Symposium 2.0
                  </span>
                </div>

                {/* 2.0 Badge */}
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] sm:text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200/80 shadow-xs">
                  2.0
                </span>
              </Link>

              {/* Center: Desktop Navigation Capsule Dock */}
              <nav
                className="hidden lg:flex items-center gap-0.5 xl:gap-1 p-1 rounded-full border border-slate-200/80 bg-white shadow-xs shrink"
                aria-label="Main navigation"
              >
                {navLinks.map((link) => {
                  const isActive = activeSection === link.id;

                  return (
                    <Link
                      key={link.id}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.id, link.href)}
                      className={`
                        relative flex items-center gap-1.5 px-2 lg:px-2.5 2xl:px-3.5 py-1.5 rounded-full font-mono text-[11px] 2xl:text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer
                        ${isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                          : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                        }
                      `}
                    >
                      <span className={isActive ? "text-white" : "text-slate-500"}>
                        {link.icon}
                      </span>
                      <span>{link.label}</span>

                      {/* Red Notification Dot for Announcements */}
                      {link.hasNotification && (
                        <span className="relative flex h-2 w-2 ml-0.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Right: Coordinator/Admin Action Button & Hamburger */}
              <div className="flex items-center gap-2 h-11 px-5 shrink-0">
                <Link
                  href="/login"
                  className="relative group inline-flex items-center gap-3 px-3.5 sm:px-4 2xl:px-5 py-2 rounded-full font-mono text-[11px] 2xl:text-xs font-semibold text-white bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap shrink-0"
                >
                  {/* User Icon Circle */}
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-white shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>

                  <span className="tracking-wide">Coordinator / Admin</span>

                  {/* Down Chevron / Caret */}
                  <svg
                    className="w-3.5 h-3.5 text-white/90 transition-transform duration-200 group-hover:translate-y-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {/* Mobile Menu Hamburger (for screens < lg) */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden flex h-9 w-9 sm:h-10 sm:w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white shadow-xs transition-colors hover:bg-slate-50 shrink-0"
                  aria-label="Toggle navigation menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <span
                    className={`block h-0.5 w-5 bg-slate-800 transition-all duration-300 ${isMobileMenuOpen ? "translate-y-2 rotate-45" : ""
                      }`}
                  />
                  <span
                    className={`block h-0.5 w-5 bg-slate-800 transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""
                      }`}
                  />
                  <span
                    className={`block h-0.5 w-5 bg-slate-800 transition-all duration-300 ${isMobileMenuOpen ? "-translate-y-2 -rotate-45" : ""
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Running Announcement Marquee Ticker */}
          {runningAnnouncementActive && !!runningAnnouncement?.trim() && (
            <div className="mt-1.5 sm:mt-2 relative overflow-hidden rounded-xl border border-amber-300/80 bg-white/95 shadow-xs backdrop-blur-md flex items-center">
              {/* Left Live Badge */}
              <Link
                href="/announcements"
                className="relative z-10 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-mono text-[10px] sm:text-[16px] font-extrabold uppercase tracking-wider px-2.5 sm:px-3 py-7 shrink-0 shadow-xs transition-colors"
                title="View all official announcements"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span className="hidden sm:inline">Notice</span>
                <span className="sm:hidden">Alert</span>
              </Link>

              {/* Marquee Track */}
              <Link
                href="/announcements"
                className="relative flex-1 overflow-hidden py-5 group select-none block"
                title="Click to view all announcements"
              >
                {/* Left/Right soft fade gradients */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/80 to-transparent z-1" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-1" />

                <div className="flex w-max animate-marquee hover:[animation-play-state:paused] font-mono text-[16px] sm:text-m font-semibold text-slate-800 whitespace-nowrap">
                  {/* Track 1 */}
                  <div className="flex items-center gap-6 sm:gap-8 px-4">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-amber-500 font-bold">⚡</span>
                      <span>{runningAnnouncement}</span>
                    </span>
                    <span className="text-amber-400 font-bold">•</span>
                    <span className="inline-flex items-center gap-2">
                      <span className="text-blue-500 font-bold">📢</span>
                      <span>{runningAnnouncement}</span>
                    </span>
                    <span className="text-amber-400 font-bold">•</span>
                  </div>

                  {/* Track 2 for seamless loop */}
                  <div className="flex items-center gap-6 sm:gap-8 px-4" aria-hidden="true">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-amber-500 font-bold">⚡</span>
                      <span>{runningAnnouncement}</span>
                    </span>
                    <span className="text-amber-400 font-bold">•</span>
                    <span className="inline-flex items-center gap-2">
                      <span className="text-blue-500 font-bold">📢</span>
                      <span>{runningAnnouncement}</span>
                    </span>
                    <span className="text-amber-400 font-bold">•</span>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`
          fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md transition-all duration-300 lg:hidden
          ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        aria-hidden={!isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`
            fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white p-6 shadow-2xl transition-transform duration-300 flex flex-col justify-between
            ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-slate-950 p-1 flex items-center justify-center">
                  <Image
                    src="/logos/sympo2.0.jpeg"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="font-display text-sm font-bold text-slate-900">
                  Innovation Ignite 2.0
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 text-lg"
              >
                ✕
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1.5" aria-label="Mobile navigation">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;

                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.id, link.href)}
                    className={`
                      flex items-center justify-between px-4 py-2.5 rounded-xl font-mono text-xs font-semibold transition-colors
                      ${isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                        : "text-slate-800 hover:bg-slate-100"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? "text-white" : "text-slate-500"}>
                        {link.icon}
                      </span>
                      <span>{link.label}</span>
                    </div>
                    {link.hasNotification && (
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full font-mono text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md text-center"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Coordinator / Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}