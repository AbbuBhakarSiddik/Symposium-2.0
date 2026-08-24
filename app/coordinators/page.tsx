export const dynamic = "force-dynamic";

import { EVENTS, SYMPOSIUM_NAME } from "@/lib/eventsConfig";
import { getLiveCounts } from "@/lib/googleSheets";
import { listUsers, listAnnouncements, listResources } from "@/lib/db";
import SignOutButton from "@/components/SignOutButton";

export default async function CoordinatorsPage() {
  const [{ counts, isLive }, users, announcements, resources] = await Promise.all([
    getLiveCounts(),
    listUsers().catch(() => []),
    listAnnouncements().catch(() => []),
    listResources().catch(() => []),
  ]);

  const admins = users.filter((u) => u.role === "admin");
  const coordinators = users.filter((u) => u.role === "coordinator");

  return (
    <main className="min-h-screen bg-ink px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow mb-2">{SYMPOSIUM_NAME} — internal</p>
        <div className="mb-10 flex items-center justify-between">
          <h1 className="font-display text-3xl font-medium text-paper">Coordinator dashboard</h1>
          <SignOutButton />
        </div>

        {/* Announcements */}
        <section className="mb-10">
          <p className="eyebrow mb-3">Announcements</p>
          {announcements.length === 0 ? (
            <p className="font-mono text-sm text-muted">No announcements yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="rounded-sm border border-ink-line bg-ink-surface p-4">
                  <p className="text-sm text-paper">{a.message}</p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted">
                    {a.created_by} · {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Live events overview */}
        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <p className="eyebrow">Events — live status</p>
            <span className={`h-2 w-2 rounded-full ${isLive ? "bg-ok" : "bg-signal"}`} />
            <span className="font-mono text-[11px] text-muted">
              {isLive ? "live" : "preview data"}
            </span>
          </div>
          <div className="overflow-hidden rounded-sm border border-ink-line">
            <table className="w-full text-left font-mono text-sm">
              <thead className="bg-ink-surface text-xs uppercase tracking-widest text-muted">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Venue</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3">Available</th>
                </tr>
              </thead>
              <tbody>
                {EVENTS.map((e) => {
                  const registered = counts[e.id] ?? 0;
                  return (
                    <tr key={e.id} className="border-t border-ink-line">
                      <td className="px-4 py-3 text-paper">{e.name}</td>
                      <td className="px-4 py-3 text-muted">{e.venue}</td>
                      <td className="px-4 py-3 text-muted">
                        {e.date} · {e.time}
                      </td>
                      <td className="px-4 py-3 text-muted">{registered}</td>
                      <td className="px-4 py-3 text-muted">
                        {Math.max(e.capacity - registered, 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Full schedules */}
        <section className="mb-10">
          <p className="eyebrow mb-3">Full schedules</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {EVENTS.map((e) => (
              <div key={e.id} className="rounded-sm border border-ink-line bg-ink-surface p-5">
                <p className="mb-3 font-display text-lg text-paper">{e.name}</p>
                <ul className="space-y-1 font-mono text-sm text-muted">
                  {e.schedule.map((s, i) => (
                    <li key={i}>
                      {s.time} — {s.item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Directory */}
        <section className="mb-10">
          <p className="eyebrow mb-3">Directory</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-signal">
                Admins ({admins.length})
              </p>
              <ul className="space-y-1 font-mono text-sm text-muted">
                {admins.map((u) => (
                  <li key={u.id}>
                    {u.name}
                    {u.phone ? ` — ${u.phone}` : ""}
                    {u.email ? ` — ${u.email}` : ""}
                  </li>
                ))}
                {admins.length === 0 && <li className="text-muted">None added yet.</li>}
              </ul>
            </div>
            <div>
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-signal">
                Coordinators ({coordinators.length})
              </p>
              <ul className="space-y-1 font-mono text-sm text-muted">
                {coordinators.map((u) => (
                  <li key={u.id}>
                    {u.name}
                    {u.phone ? ` — ${u.phone}` : ""}
                    {u.email ? ` — ${u.email}` : ""}
                  </li>
                ))}
                {coordinators.length === 0 && <li className="text-muted">None added yet.</li>}
              </ul>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section>
          <p className="eyebrow mb-3">Resources</p>
          {resources.length === 0 ? (
            <p className="font-mono text-sm text-muted">No resources uploaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {resources.map((r) => (
                <li key={r.id}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sm text-signal underline underline-offset-4"
                  >
                    {r.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
