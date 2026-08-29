"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { SYMPOSIUM_NAME, CLUB_NAME, COLLEGE_NAME } from "@/lib/eventsConfig";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  // Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/#events", label: "Events" },
    { href: "/announcements", label: "Announcements" },
    { href: "/#gallery", label: "Gallery" },
    { href: "/#achievements", label: "Achievements" },
    { href: "/#coordinators", label: "Coordinators" },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <>
      <header
        className={`
          sticky top-0 z-50 transition-all duration-300
          ${scrolled
            ? "bg-[#e4e4e4]/90 backdrop-blur-xl border-b border-slate-200/80 shadow-md"
            : "bg-[#e4e4e4]/70 backdrop-blur-md border-b border-slate-200/50"
          }
        `}
      >
        <div className="mx-auto flex max-w-20xl items-center justify-between px-10 sm:px-10 lg:px-8 py-10 lg:py-6">
          {/* Logo — club logo image on the left, symposium name text on the right */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label={`${SYMPOSIUM_NAME} home`}
          >
            <Image
              src="/logos/sympo3.jpeg"
              alt={`${CLUB_NAME} logo`}
              width={120}
              height={36}
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]"
              priority
            />
            <span className="font-display text-lg font-semibold tracking-tight text-paper transition-colors group-hover:text-cyber-cyan">
              {SYMPOSIUM_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-mono text-xs uppercase tracking-widest text-muted transition-colors duration-200 hover:text-paper after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-cyber-cyan after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>


          {/* Right side: Login + Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="btn-cyber hidden sm:inline-flex"  // using the global btn-cyber class
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Coordinator / Admin
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-white/10 bg-ink/80 backdrop-blur-sm transition-colors hover:border-cyber-cyan/50"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span
                className={`block h-0.5 w-5 bg-paper transition-all duration-300 ${isMobileMenuOpen ? "translate-y-1.5 rotate-45" : ""
                  }`}
              />
              <span
                className={`block h-0.5 w-5 bg-paper transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""
                  }`}
              />
              <span
                className={`block h-0.5 w-5 bg-paper transition-all duration-300 ${isMobileMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
                  }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`
          fixed inset-0 z-40 bg-ink/90 backdrop-blur-2xl transition-all duration-500 lg:hidden
          ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        aria-hidden={!isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <nav
          className="flex h-full flex-col items-center justify-center gap-8 px-8"
          onClick={(e) => e.stopPropagation()}
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-display text-3xl font-medium text-paper transition-colors hover:text-cyber-cyan"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="btn-cyber mt-4"  // using the global button class
          >
            Coordinator / Admin
          </Link>
        </nav>
      </div>
    </>
  );
}