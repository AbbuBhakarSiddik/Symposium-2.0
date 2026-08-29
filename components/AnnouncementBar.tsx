import Link from "next/link";
import { listAnnouncements, type Announcement } from "@/lib/db";

export default async function AnnouncementBar() {
  let latest: Announcement | null = null;

  try {
    const rows = await listAnnouncements();
    latest = rows[0] ?? null;
  } catch {
    latest = null;
  }

  if (!latest) return null;

  return (
    <Link
      href="/announcements"
      role="status"
      aria-live="polite"
      className="glass rounded-full px-4 py-2 flex items-center justify-between gap-2.5 max-w-xl mx-auto w-full transition hover:border-cyber-cyan/50 hover:shadow-glow-cyan group"
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        {/* Pulsing dot indicator */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyber-cyan opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyber-cyan" />
        </span>

        {/* Announcement text — truncate on overflow */}
        <p className="font-mono text-xs text-paper/80 truncate leading-tight">
          <span className="text-cyber-cyan font-semibold uppercase tracking-widest mr-1.5">
            Notice
          </span>
          {latest.message}
        </p>
      </div>

      <span className="font-mono text-[10px] uppercase text-muted group-hover:text-cyber-cyan transition shrink-0">
        View All →
      </span>
    </Link>
  );
}

