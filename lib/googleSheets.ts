import { google } from "googleapis";
import { EventConfig } from "./eventsConfig";
import { listEvents } from "./db";

export type LiveCounts = Record<string, number>; // eventId -> registered count

export async function getLiveCounts(customEvents?: EventConfig[]): Promise<{ counts: LiveCounts; isLive: boolean }> {
  const events = customEvents || (await listEvents());

  const {
    GOOGLE_SHEETS_CLIENT_EMAIL,
    GOOGLE_SHEETS_PRIVATE_KEY,
    GOOGLE_SHEET_ID,
    GOOGLE_SHEET_RANGE,
  } = process.env;

  if (!GOOGLE_SHEETS_CLIENT_EMAIL || !GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    return { counts: mockCounts(events), isLive: false };
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
    if (rows.length < 2) return { counts: mockCounts(events), isLive: false };

    const header = rows[0].map((h) => String(h).trim().toLowerCase());
    const eventColIdx = header.findIndex((h) => h === "event");
    if (eventColIdx === -1) return { counts: mockCounts(events), isLive: false };

    const counts: LiveCounts = Object.fromEntries(events.map((e) => [e.id, 0]));
    const labelToId = Object.fromEntries(events.map((e) => [e.sheetEventLabel.trim().toLowerCase(), e.id]));

    for (const row of rows.slice(1)) {
      const label = String(row[eventColIdx] || "").trim().toLowerCase();
      const id = labelToId[label];
      if (id) counts[id] += 1;
    }

    return { counts, isLive: true };
  } catch (err) {
    console.error("Google Sheets fetch failed, falling back to mock data:", err);
    return { counts: mockCounts(events), isLive: false };
  }
}

function mockCounts(events: EventConfig[]): LiveCounts {
  return Object.fromEntries(
    events.map((e, i) => [e.id, Math.floor(e.capacity * (0.35 + (i % 3) * 0.15))])
  );
}

