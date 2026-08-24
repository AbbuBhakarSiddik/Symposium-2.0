export const dynamic = "force-dynamic";

import { getLiveCounts } from "@/lib/googleSheets";
import { listUsers, listAnnouncements, listResources } from "@/lib/db";
import { EVENTS, SYMPOSIUM_NAME } from "@/lib/eventsConfig";
import SignOutButton from "@/components/SignOutButton";
import {
  createUserAction,
  deleteUserAction,
  createAnnouncementAction,
  deleteAnnouncementAction,
  createResourceAction,
  deleteResourceAction,
} from "@/lib/actions";

export default async function AdminPage() {
  const [{ counts, isLive }, users, announcements, resources] = await Promise.all([
    getLiveCounts(),
    listUsers().catch(() => []),
    listAnnouncements().catch(() => []),
    listResources().catch(() => []),
  ]);

  return (
    <main className="min-h-screen bg-ink px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow mb-2">{SYMPOSIUM_NAME} — admin</p>
        <div className="mb-10 flex items-center justify-between">
          <h1 className="font-display text-3xl font-medium text-paper">Admin panel</h1>
          <SignOutButton />
        </div>

        {/* Live seats table */}
        <section className="mb-12">
          <div className="mb-3 flex items-center gap-2">
            <p className="eyebrow">Events — live status</p>
            <span className={`h-2 w-2 rounded-full ${isLive ? "bg-ok" : "bg-signal"}`} />
            <span className="font-mono text-[11px] text-muted">
              {isLive ? "connected to Google Sheet" : "preview data — sheet not connected"}
            </span>
          </div>
          <div className="overflow-hidden rounded-sm border border-ink-line">
            <table className="w-full text-left font-mono text-sm">
              <thead className="bg-ink-surface text-xs uppercase tracking-widest text-muted">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3">Available</th>
                  <th className="px-4 py-3">Venue</th>
                </tr>
              </thead>
              <tbody>
                {EVENTS.map((e) => {
                  const registered = counts[e.id] ?? 0;
                  return (
                    <tr key={e.id} className="border-t border-ink-line">
                      <td className="px-4 py-3 text-paper">{e.name}</td>
                      <td className="px-4 py-3 text-muted">{e.capacity}</td>
                      <td className="px-4 py-3 text-muted">{registered}</td>
                      <td className="px-4 py-3 text-muted">
                        {Math.max(e.capacity - registered, 0)}
                      </td>
                      <td className="px-4 py-3 text-muted">{e.venue}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-2xl font-mono text-xs text-muted">
            Capacities/schedules come from <code className="text-signal">lib/eventsConfig.ts</code>{" "}
            — edit that file and redeploy to change them.
          </p>
        </section>

        {/* Manage admins & coordinators */}
        <section className="mb-12">
          <p className="eyebrow mb-3">Admins &amp; coordinators ({users.length})</p>

          <div className="mb-4 overflow-hidden rounded-sm border border-ink-line">
            <table className="w-full text-left font-mono text-sm">
              <thead className="bg-ink-surface text-xs uppercase tracking-widest text-muted">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-ink-line">
                    <td className="px-4 py-3 text-paper">{u.name}</td>
                    <td className="px-4 py-3 text-muted">{u.username}</td>
                    <td className="px-4 py-3 text-muted">{u.role}</td>
                    <td className="px-4 py-3 text-muted">{u.phone || "—"}</td>
                    <td className="px-4 py-3 text-muted">{u.email || "—"}</td>
                    <td className="px-4 py-3">
                      <form action={deleteUserAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="font-mono text-xs uppercase tracking-widest text-full hover:underline">
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-muted">
                      No users yet — add the first admin below, or via{" "}
                      <code className="text-signal">scripts/create-user.mjs</code>.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <form
            action={createUserAction}
            className="grid gap-3 rounded-sm border border-ink-line bg-ink-surface p-5 sm:grid-cols-2"
          >
            <p className="col-span-full font-mono text-xs uppercase tracking-widest text-signal">
              Add admin or coordinator
            </p>
            <Field label="Full name" name="name" required />
            <Field label="Username" name="username" required />
            <Field label="Password" name="password" type="password" required />
            <div>
              <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted">
                Role
              </label>
              <select
                name="role"
                required
                className="w-full rounded-sm border border-ink-line bg-ink px-3 py-2 font-mono text-sm text-paper outline-none focus:border-signal"
              >
                <option value="coordinator">Coordinator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Field label="Phone (optional)" name="phone" />
            <Field label="Email (optional)" name="email" />
            <button
              type="submit"
              className="col-span-full mt-2 w-fit rounded-sm bg-signal px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-ink transition hover:bg-signal-soft"
            >
              Add user
            </button>
          </form>
        </section>

        {/* Announcements */}
        <section className="mb-12">
          <p className="eyebrow mb-3">Announcements</p>
          <div className="mb-4 space-y-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="flex items-start justify-between gap-4 rounded-sm border border-ink-line bg-ink-surface p-4"
              >
                <div>
                  <p className="text-sm text-paper">{a.message}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted">
                    {a.created_by} · {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                <form action={deleteAnnouncementAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="font-mono text-xs uppercase tracking-widest text-full hover:underline">
                    Remove
                  </button>
                </form>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="font-mono text-sm text-muted">No announcements yet.</p>
            )}
          </div>

          <form
            action={createAnnouncementAction}
            className="flex flex-col gap-3 rounded-sm border border-ink-line bg-ink-surface p-5 sm:flex-row"
          >
            <input
              name="message"
              required
              placeholder="Post an announcement for all coordinators…"
              className="flex-1 rounded-sm border border-ink-line bg-ink px-3 py-2 font-mono text-sm text-paper outline-none focus:border-signal"
            />
            <button
              type="submit"
              className="rounded-sm bg-signal px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-ink transition hover:bg-signal-soft"
            >
              Post
            </button>
          </form>
        </section>

        {/* Resources */}
        <section>
          <p className="eyebrow mb-3">Resources</p>
          <div className="mb-4 space-y-2">
            {resources.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-sm border border-ink-line bg-ink-surface p-4"
              >
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-sm text-signal underline underline-offset-4"
                >
                  {r.title}
                </a>
                <form action={deleteResourceAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="font-mono text-xs uppercase tracking-widest text-full hover:underline">
                    Remove
                  </button>
                </form>
              </div>
            ))}
            {resources.length === 0 && (
              <p className="font-mono text-sm text-muted">No resources yet.</p>
            )}
          </div>

          <form
            action={createResourceAction}
            className="grid gap-3 rounded-sm border border-ink-line bg-ink-surface p-5 sm:grid-cols-[1fr_2fr_auto]"
          >
            <Field label="Title" name="title" required compact />
            <Field label="URL (Drive link, PDF, etc.)" name="url" required compact />
            <button
              type="submit"
              className="h-fit self-end rounded-sm bg-signal px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-ink transition hover:bg-signal-soft"
            >
              Add
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  compact = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  compact?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-sm border border-ink-line bg-ink px-3 py-2 font-mono text-sm text-paper outline-none focus:border-signal"
      />
    </div>
  );
}
