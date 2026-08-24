import { google } from "googleapis";
import { EVENTS } from "./eventsConfig";

export type LiveCounts = Record<string, number>; // eventId -> registered count

/**
 * Reads the linked Google Sheet (the destination sheet of your Google Form)
 * and counts how many response rows belong to each event, matched via the
 * "sheetEventLabel" configured in lib/eventsConfig.ts.
 *
 * Expects the sheet to have a header row with a column literally named
 * "Event" (case-insensitive) — this is the standard column Google Forms
 * creates for a dropdown/multiple-choice question titled "Event".
 *
 * Falls back to deterministic mock numbers if credentials aren't set yet,
 * so the site is fully browsable before Google Sheets is wired up.
 */
export async function getLiveCounts(): Promise<{ counts: LiveCounts; isLive: boolean }> {
  const {
    GOOGLE_SHEETS_CLIENT_EMAIL,
    GOOGLE_SHEETS_PRIVATE_KEY,
    GOOGLE_SHEET_ID,
    GOOGLE_SHEET_RANGE,
  } = process.env;

  if (!GOOGLE_SHEETS_CLIENT_EMAIL || !GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    return { counts: mockCounts(), isLive: false };
  }

  try {
    const auth = new google.auth.JWT({
      email: GOOGLE_SHEETS_CLIENT_EMAIL,
      key: GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: GOOGLE_SHEET_RANGE || "Form Responses 1!A:Z",
    });

    const rows = res.data.values || [];
    if (rows.length < 2) return { counts: mockCounts(), isLive: false };

    const header = rows[0].map((h) => String(h).trim().toLowerCase());
    const eventColIdx = header.findIndex((h) => h === "event");
    if (eventColIdx === -1) return { counts: mockCounts(), isLive: false };

    const counts: LiveCounts = Object.fromEntries(EVENTS.map((e) => [e.id, 0]));
    const labelToId = Object.fromEntries(EVENTS.map((e) => [e.sheetEventLabel.trim().toLowerCase(), e.id]));

    for (const row of rows.slice(1)) {
      const label = String(row[eventColIdx] || "").trim().toLowerCase();
      const id = labelToId[label];
      if (id) counts[id] += 1;
    }

    return { counts, isLive: true };
  } catch (err) {
    console.error("Google Sheets fetch failed, falling back to mock data:", err);
    return { counts: mockCounts(), isLive: false };
  }
}

function mockCounts(): LiveCounts {
  // Deterministic placeholder numbers so the UI looks alive before the
  // real sheet is connected.
  return Object.fromEntries(
    EVENTS.map((e, i) => [e.id, Math.floor(e.capacity * (0.35 + i * 0.15))])
  );
}
