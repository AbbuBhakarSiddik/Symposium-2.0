import Link from "next/link";
import { SYMPOSIUM_NAME, CLUB_NAME } from "@/lib/eventsConfig";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-line/80 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-signal/50 font-mono text-xs font-bold text-signal">
            {CLUB_NAME.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </span>
          <span className="font-display text-lg font-medium tracking-tight">
            {SYMPOSIUM_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-widest text-muted sm:flex">
          <a href="#events" className="hover:text-paper">Events</a>
          <a href="#gallery" className="hover:text-paper">Gallery</a>
          <a href="#achievements" className="hover:text-paper">Achievements</a>
          <a href="#coordinators" className="hover:text-paper">Coordinators</a>
          <a href="#contact" className="hover:text-paper">Contact</a>
        </nav>

        <Link
          href="/login"
          className="rounded-sm border border-ink-line px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-muted transition hover:border-signal hover:text-signal"
        >
          Coordinator / Admin
        </Link>
      </div>
    </header>
  );
}
