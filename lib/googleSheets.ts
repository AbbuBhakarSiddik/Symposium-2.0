import { EventConfig } from "./eventsConfig";
import { listEvents } from "./db";

export type LiveCounts = Record<string, number>; // eventId -> registered count

// In-Memory SWR Cache to stay within Google Sheets API quotas for many concurrent users
let cachedCountsData: { counts: LiveCounts; isLive: boolean } | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds TTL cache (matches client-side poll interval)

/** Force the next getLiveCounts() call to bypass the cache and fetch fresh data. */
export function invalidateCache() {
  cachedCountsData = null;
  lastFetchTimestamp = 0;
}

export async function getLiveCounts(
  customEvents?: EventConfig[]
): Promise<{ counts: LiveCounts; isLive: boolean }> {
  const events = customEvents || (await listEvents());
  const now = Date.now();

  // Return cached result if fresh (< 30 seconds old)
  if (cachedCountsData && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return cachedCountsData;
  }

  const { GOOGLE_API_KEY, GOOGLE_SHEET_ID, GOOGLE_SHEET_RANGE } = process.env;

  // --- Also support legacy service-account auth if those vars are set ---
  const {
    GOOGLE_SHEETS_CLIENT_EMAIL,
    GOOGLE_SHEETS_PRIVATE_KEY,
  } = process.env;

  const hasApiKey = Boolean(GOOGLE_API_KEY && GOOGLE_SHEET_ID);
  const hasServiceAccount = Boolean(
    GOOGLE_SHEETS_CLIENT_EMAIL && GOOGLE_SHEETS_PRIVATE_KEY && GOOGLE_SHEET_ID
  );

  if (!hasApiKey && !hasServiceAccount) {
    return { counts: emptyCounts(events), isLive: false };
  }

  try {
    let rows: string[][] = [];

    if (hasApiKey) {
      // ── Preferred path: API Key + public sheet (no service account needed) ──
      const rawRange = GOOGLE_SHEET_RANGE || "Form Responses 1!A:Z";

      // Google Sheets REST API requires sheet names with spaces to be wrapped in single quotes
      let quotedRange = rawRange;
      if (!rawRange.startsWith("'") && rawRange.includes("!")) {
        const [sheetName, cells] = rawRange.split("!");
        quotedRange = `'${sheetName}'!${cells}`;
      }

      let url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${encodeURIComponent(quotedRange)}?key=${GOOGLE_API_KEY}`;
      let res = await fetch(url, { cache: "no-store" });

      // Fallback: If the tab name "Form Responses 1" does not exist in the user's sheet (e.g. it's named "Sheet1"),
      // fetch the default first sheet using "A:Z"
      if (!res.ok && res.status === 400) {
        console.warn(`Google Sheets tab '${quotedRange}' not found. Trying default first sheet 'A:Z'...`);
        url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/A:Z?key=${GOOGLE_API_KEY}`;
        res = await fetch(url, { cache: "no-store" });
      }

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 403) {
          console.error("Google Sheets 403 Forbidden: Make sure your Sheet is set to 'Anyone with the link -> Viewer' under Share settings.");
        } else {
          console.error(`Google Sheets API error (${res.status}):`, errText);
        }
        throw new Error(`Sheets API responded with ${res.status}`);
      }

      const json = await res.json();
      rows = (json.values as string[][]) || [];
    } else {
      // ── Fallback: legacy service account (JWT) ──
      const { google } = await import("googleapis");
      const auth = new google.auth.JWT({
        email: GOOGLE_SHEETS_CLIENT_EMAIL!,
        key: GOOGLE_SHEETS_PRIVATE_KEY!.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });

      const sheets = google.sheets({ version: "v4", auth });
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID!,
        range: GOOGLE_SHEET_RANGE || "Form Responses 1!A:Z",
      });
      rows = (res.data.values as string[][]) || [];
    }

    if (rows.length < 2) return { counts: emptyCounts(events), isLive: true };

    // Find the "Event" column (case-insensitive)
    const header = rows[0].map((h) => String(h).trim().toLowerCase());
    const eventColIdx = header.findIndex((h) => h === "event");
    if (eventColIdx === -1) return { counts: emptyCounts(events), isLive: true };

    // Count rows per event by matching sheetEventLabel
    const counts: LiveCounts = Object.fromEntries(events.map((e) => [e.id, 0]));
    const labelToId = Object.fromEntries(
      events.map((e) => [e.sheetEventLabel.trim().toLowerCase(), e.id])
    );

    for (const row of rows.slice(1)) {
      const label = String(row[eventColIdx] || "").trim().toLowerCase();
      const id = labelToId[label];
      if (id) counts[id] += 1;
    }

    const result = { counts, isLive: true };
    cachedCountsData = result;
    lastFetchTimestamp = Date.now();
    return result;
  } catch (err) {
    console.error("Google Sheets fetch failed, falling back to cached or empty data:", err);
    if (cachedCountsData) {
      return { ...cachedCountsData, isLive: false };
    }
    return { counts: emptyCounts(events), isLive: false };
  }
}

function emptyCounts(events: EventConfig[]): LiveCounts {
  return Object.fromEntries(events.map((e) => [e.id, 0]));
}
