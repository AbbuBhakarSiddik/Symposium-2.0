// Server Component — no "use client" needed.
// Fetches the single most recent announcement and renders a slim banner.
// Returns null if the table is empty, so no empty banner ever shows.

import { listAnnouncements, type Announcement } from "@/lib/db";

export default async function AnnouncementBar() {
  let latest: Announcement | null = null;

  try {
    const rows = await listAnnouncements();
    latest = rows[0] ?? null;
  } catch {
    // Silently swallow fetch errors on the public page — the banner is
    // non-critical and we never want it to break the landing page render.
    latest = null;
  }

  if (!latest) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="glass rounded-full px-4 py-2 flex items-center gap-2.5 max-w-xl mx-auto w-full"
    >
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
  );
}
