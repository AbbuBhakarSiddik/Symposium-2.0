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
      className="glass rounded-full px-4 py-2 flex items-center justify-between gap-2.5 max-w-xl mx-auto w-full transition hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/10 group"
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        {/* Pulsing dot indicator */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
        </span>

        {/* Announcement text — truncate on overflow */}
        <p className="font-mono text-xs text-slate-800 truncate leading-tight font-medium">
          <span className="text-amber-600 font-bold uppercase tracking-widest mr-1.5">
            Notice
          </span>
          {latest.message}
        </p>
      </div>

      <span className="font-mono text-[10px] uppercase text-slate-500 group-hover:text-amber-600 transition shrink-0 font-bold">
        View All →
      </span>
    </Link>
  );
}

