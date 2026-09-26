"use client";

import Image from "next/image";
import Link from "next/link";
import { SYMPOSIUM_NAME, COLLEGE_NAME, CLUB_NAME } from "@/lib/eventsConfig";

export default function LogoCards() {
  const cards = [
    {
      id: "college",
      badge: "HOST INSTITUTION",
      badgeType: "blue",
      logo: "/logos/SIETLOGO2.jpeg",
      logoAlt: "Shridevi Education Logo",
      title: "Shridevi Institute Of Engineering And Technology, Tumkur",
      subtitle: "Shridevi Institute of Engineering & Technology",
      href: "#about",
      isFeatured: false,
      btnColor: "blue",
      ariaLabel: "Learn about Shridevi Institute Of Engineering And Technology",
    },
    {
      id: "symposium",
      badge: "MAIN EVENT",
      badgeType: "orange",
      logo: "/logos/sympo2.0.jpeg",
      logoAlt: "Innovation Ignite Symposium 2.0",
      title: "Innovation Ignite Symposium 2.0",
      subtitle: "National Level Technical Symposium 2.0",
      href: "#events",
      isFeatured: true,
      btnColor: "orange",
      ariaLabel: "View Innovation Ignite Symposium Events",
    },
    {
      id: "club",
      badge: "ORGANIZING CLUB",
      badgeType: "blue",
      logo: "/logos/cclogo1.png",
      logoAlt: "Creative Codex Logo",
      title: "Creative Codex",
      subtitle: "Department Student Technical Club",
      href: "#creative-codex",
      isFeatured: false,
      btnColor: "blue",
      ariaLabel: "Learn about Creative Codex Technical Club",
    },
  ];

  return (
    <div
      className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7 items-stretch"
      aria-label="Symposium Highlights and Partners"
    >
      {cards.map((card) => {
        const isFeatured = card.isFeatured;
        return (
          <div
            key={card.id}
            className={`group relative rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-between text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
              isFeatured
                ? "bg-gradient-to-b from-[#fffef9] to-[#ffffff] border-2 border-amber-300 ring-4 ring-amber-400/20 shadow-2xl shadow-amber-500/15"
                : "bg-white border border-slate-100 shadow-xl shadow-slate-900/10 hover:border-sky-200"
            }`}
          >
            {/* Top Pill Tag */}
            <div className="w-full flex justify-center mb-4">
              <span
                className={`font-mono text-[11px] font-bold uppercase tracking-wider px-4 py-1 rounded-full ${
                  card.badgeType === "orange"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "bg-[#eaf2ff] text-[#2563eb] border border-blue-100/80"
                }`}
              >
                {card.badge}
              </span>
            </div>

            {/* Logo Display Container */}
            <div
              className={`w-full h-32 sm:h-36 flex items-center justify-center p-3 mb-4 rounded-2xl transition-transform duration-300 group-hover:scale-105 ${
                isFeatured ? "bg-slate-950/5" : "bg-white"
              }`}
            >
              <Image
                src={card.logo}
                alt={card.logoAlt}
                width={360}
                height={200}
                className="max-h-24 sm:max-h-28 max-w-full w-auto object-contain drop-shadow-sm rounded-lg"
                priority
              />
            </div>

            {/* Card Titles */}
            <div className="flex flex-col items-center gap-1.5 mb-6 px-1">
              <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-sky-600 transition-colors">
                {card.title}
              </h3>
              <p className="font-mono text-xs text-slate-500 font-medium">
                {card.subtitle}
              </p>
            </div>

            {/* Circular Action Button at Bottom */}
            <a
              href={card.href}
              aria-label={card.ariaLabel}
              className={`w-11 h-11 rounded-full text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 active:scale-95 shadow-md ${
                card.btnColor === "orange"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-orange-500/30 hover:from-amber-600 hover:to-orange-600"
                  : "bg-[#0088ff] hover:bg-[#0070e0] shadow-blue-500/25"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
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
        );
      })}
    </div>
  );
}
