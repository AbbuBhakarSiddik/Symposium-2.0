"use client";

import Image from "next/image";
import { SYMPOSIUM_NAME, COLLEGE_NAME, CLUB_NAME } from "@/lib/eventsConfig";

export default function LogoCards() {
  const logos = [
    {
      id: "college",
      src: "/logos/SIETLOGO2.jpeg",
      name: COLLEGE_NAME,
      subtitle: "Shridevi Institute of Engineering & Technology",
      badge: "Host Institution",
      width: 400,
      height: 250,
      isFeatured: false,
    },
    {
      id: "symposium",
      src: "/logos/sympo2.0.jpeg",
      name: SYMPOSIUM_NAME,
      subtitle: "National Level Technical Symposium 2.0",
      badge: "Main Event",
      width: 600,
      height: 300,
      isFeatured: true,
    },
    {
      id: "club",
      src: "/logos/cclogo1.png",
      name: CLUB_NAME,
      subtitle: "Department Student Technical Club",
      badge: "Organizing Club",
      width: 400,
      height: 250,
      isFeatured: false,
    },
  ];

  return (
    <div
      className="stagger-children w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch"
      aria-label="Organiser Logo Cards"
    >
      {logos.map((logo) => (
        <div
          key={logo.id}
          className={`hero-logo-enter glass rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-depth border bg-white/95 group ${logo.isFeatured
            ? "border-sky-300 ring-2 ring-sky-500/20 shadow-xl md:-translate-y-1"
            : "border-slate-200/80 shadow-glass"
            }`}
        >
          {/* Badge at top of card */}
          <div className="w-full flex justify-center mb-4">
            <span
              className={`font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${logo.isFeatured
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
            >
              {logo.badge}
            </span>
          </div>

          {/* Big Logo Image Container */}
          <div className="relative w-full h-36 sm:h-40 flex items-center justify-center p-4 rounded-2xl bg-white shadow-inner border border-slate-100 mb-5 group-hover:scale-105 transition-transform duration-300">
            <Image
              src={logo.src}
              alt={`${logo.name} logo`}
              width={logo.width}
              height={logo.height}
              className="max-h-28 max-w-full w-auto object-contain drop-shadow-sm"
              priority
            />
          </div>

          {/* Name & Subtitle below Logo */}
          <div className="text-center space-y-1 mt-auto">
            <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-amber-600 transition-colors">
              {logo.name}
            </h3>
            <p className="font-mono text-xs text-slate-500 font-medium">
              {logo.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
