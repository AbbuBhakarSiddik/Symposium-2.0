# Symposium website — starter build

Next.js 14 (App Router) + TypeScript + Tailwind. Dark "signal board" theme,
responsive down to phone width. Live seat counts read from a Google Sheet
(the response sheet behind your Google Form). Role-based login for admin vs
per-event coordinators.

## What's actually built right now

- **Home page** (`/`): hero, live event board (departure-board style rows
  with a seats-available readout + a "⋮" menu per row that expands to show
  schedule, register link, coordinator contact), achievements/about, photo
  gallery placeholders, public coordinator preview, contact section.
- **`/login`**: single login form for both admins and coordinators, checked
  against a Supabase `users` table (passwords hashed with bcrypt).
- **`/coordinators`** (protected, admin or coordinator): a **shared
  dashboard all 10 coordinators + 4 admins see the same version of** — live
  status for all 4 events, full schedules, an admin/coordinator directory,
  an announcements feed, and a resources list. No per-event restriction.
- **`/admin`** (protected, admin-only): the live events table, plus
  management forms to add/remove admins & coordinators, post/remove
  announcements, and add/remove resource links — all backed by Supabase.
- **`/api/sheets`**: polled every 15s by the home page to keep seat counts
  current.

Everything is placeholder content (college name, club name, 4 event names)
— see **"Fill in your real content"** below for the one file to edit.

## What's intentionally a stub (next steps for you)

- Capacities/schedules/event names still live in code
  (`lib/eventsConfig.ts`), not the database — edit that file and redeploy
  to change them. Only *people* (admins/coordinators), announcements, and
  resources are database-backed so far.
- Google Sheets access is **read-only**.
- There's no self-service "forgot password" — if someone forgets theirs, an
  admin removes them from `/admin` and re-adds them with a new password.

## 1. Install

```bash
npm install
cp .env.example .env.local
```

## 2. Fill in your real content

Open `lib/eventsConfig.ts` and replace:
- `CLUB_NAME`, `COLLEGE_NAME`, `SYMPOSIUM_NAME`
- The 4 entries in `EVENTS`: name, description, date, time, venue,
  `capacity`.
- `sheetEventLabel` on each event **must exactly match** the option text
  you use in your Google Form's "Event" question (see step 5).

Swap real photos/videos into `public/media` and update `components/Gallery.tsx`.

## 3. Set up Supabase (stores logins, announcements, resources)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard: **SQL Editor** → New query → paste the
   contents of `supabase/schema.sql` → Run. This creates the `users`,
   `announcements`, and `resources` tables.
3. In **Project Settings → API**, copy:
   - **Project URL** → `SUPABASE_URL` in `.env.local`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY` in
     `.env.local` (this key is powerful — never commit it, never put it in
     a `NEXT_PUBLIC_` variable, never send it to the browser).
4. Generate `NEXTAUTH_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

## 4. Create your first admin

The admin panel can create every user *after* the first one exists — so
bootstrap that one from the command line:

```bash
node scripts/create-user.mjs admin1 "a-real-password" "Dr. Rao" admin
```

Then log in at `/login` with that username/password, go to `/admin`, and
add the rest of your 4 admins and 10 coordinators from the "Add admin or
coordinator" form — no more scripts needed after this.

## 5. Connect the Google Sheet (live seat counts)

1. Build your registration Google Form with a question titled **"Event"**
   (dropdown/multiple choice, one option per event, text matching
   `sheetEventLabel` in step 2).
2. Link the form's responses to a Google Sheet.
3. In [Google Cloud Console](https://console.cloud.google.com/), create a
   project → enable the **Google Sheets API** → create a **Service
   Account** → generate a JSON key for it.
4. Open the response Sheet → **Share** → add the service account's
   `client_email` (from the JSON key) as a **Viewer**.
5. In `.env.local`:
   ```
   GOOGLE_SHEETS_CLIENT_EMAIL=xxx@yyy.iam.gserviceaccount.com
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEET_ID=<the long ID in the sheet's URL>
   GOOGLE_SHEET_RANGE=Form Responses 1!A:Z
   ```
   Keep the quotes and `\n` characters in the private key exactly as
   Google gives them.

Until this is filled in, the site runs fine and shows realistic-looking
placeholder counts, clearly marked "preview data" in the UI.

## 6. Run locally

```bash
npm run dev
```
Visit `http://localhost:3000`.

## 7. Deploy

Easiest path with this stack is **Vercel** (built by the Next.js team,
free tier is enough for a symposium site):

1. Push this folder to a GitHub repo.
2. Import it at vercel.com → it auto-detects Next.js.
3. Add every variable from `.env.local` under Project Settings → Environment
   Variables — `NEXTAUTH_SECRET`, `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, and the four `GOOGLE_SHEETS_*` /
   `GOOGLE_SHEET_*` ones (paste the private key as one value, Vercel
   handles the newlines).
4. Set `NEXTAUTH_URL` to your real deployed URL (e.g.
   `https://your-symposium.vercel.app`).
5. Deploy.

Your Supabase data (logins, announcements, resources) is separate from
Vercel and persists across deploys automatically — no extra step needed.

## Notes on what's tracked as a "student registration"

This starter reads **counts only** (how many rows have each event in the
"Event" column) — it does not build a separate student database, since you
said you're already collecting details via Google Forms → Sheets and doing
calculations there. If later you want the website itself (not the Sheet) to
be the source of truth for registrations — e.g. so it can block
registration once a slot is full — that's a bigger change (a real
database + a registration API route) and is a good follow-up task once the
rest of the site is live.
