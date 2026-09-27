import { EventConfig } from "./eventsConfig";
import { listEvents, getSiteSettings } from "./db";

export type LiveCounts = Record<string, number>; // eventId -> registered count

export type SheetRegistration = {
  rowNumber: number;
  timestamp: string;
  eventName: string;
  eventId?: string;
  teamName?: string;
  collegeName?: string;
  leaderName?: string;
  leaderEmail?: string;
  leaderPhone?: string;
  rawData: Record<string, string>;
};

// In-Memory SWR Cache to stay within Google Sheets API quotas for many concurrent users
let cachedCountsData: { counts: LiveCounts; isLive: boolean; error?: string; totalResponses?: number } | null = null;
let cachedRegistrationsData: { registrations: SheetRegistration[]; isLive: boolean; headers: string[]; error?: string } | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds TTL cache (matches client-side poll interval)

/** Force the next getLiveCounts() call to bypass the cache and fetch fresh data. */
export function invalidateCache() {
  cachedCountsData = null;
  cachedRegistrationsData = null;
  lastFetchTimestamp = 0;
}

/** Helper: Parse a Google Sheet URL or raw ID into ID and optional GID */
export function parseSheetUrlOrId(input: string): { sheetId: string; gid?: string } {
  if (!input) return { sheetId: "" };
  const trimmed = input.trim();
  const matchId = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const matchGid = trimmed.match(/[?&#]gid=([0-9]+)/);
  if (matchId) {
    return {
      sheetId: matchId[1],
      gid: matchGid ? matchGid[1] : undefined,
    };
  }
  return { sheetId: trimmed };
}

/** Parse CSV text into 2D string array (RFC 4180 compliant) */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentCell);
      if (currentRow.some((c) => c.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    if (currentRow.some((c) => c.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/** Fetch raw sheet rows from Google Sheets API v4 or CSV export fallback */
async function fetchSheetRows(): Promise<{ rows: string[][]; error?: string }> {
  const {
    GOOGLE_API_KEY,
    GOOGLE_SHEET_ID: rawSheetId,
    GOOGLE_SHEET_URL,
    GOOGLE_SHEET_GID: rawSheetGid,
    GOOGLE_SHEET_RANGE,
    GOOGLE_SHEETS_CLIENT_EMAIL,
    GOOGLE_SHEETS_PRIVATE_KEY,
  } = process.env;

  // Check site settings for dynamic sheet configuration
  const settings = await getSiteSettings().catch(() => null);
  const configuredUrl = settings?.googleSheetUrl || GOOGLE_SHEET_URL;

  // Resolve sheetId and gid from URL or individual env vars
  let sheetId = rawSheetId || "";
  let gid = rawSheetGid || "";

  if (configuredUrl) {
    const parsed = parseSheetUrlOrId(configuredUrl);
    if (parsed.sheetId) sheetId = parsed.sheetId;
    if (parsed.gid) gid = parsed.gid;
  } else if (sheetId.includes("http")) {
    const parsed = parseSheetUrlOrId(sheetId);
    if (parsed.sheetId) sheetId = parsed.sheetId;
    if (parsed.gid) gid = parsed.gid;
  }

  if (!sheetId) {
    return { rows: [], error: "NO_SHEET_ID" };
  }

  // ── Strategy 1: Google Sheets API v4 with API Key ──
  if (GOOGLE_API_KEY) {
    try {
      let targetRange = GOOGLE_SHEET_RANGE || "A:Z";

      // If we have a specific gid, try to resolve its tab title from spreadsheet metadata
      if (gid) {
        try {
          const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties&key=${GOOGLE_API_KEY}`;
          const metaRes = await fetch(metaUrl, { cache: "no-store" });
          if (metaRes.ok) {
            const metaJson = await metaRes.json();
            const targetSheet = metaJson.sheets?.find(
              (s: any) => String(s.properties?.sheetId) === String(gid)
            );
            if (targetSheet?.properties?.title) {
              const safeTitle = targetSheet.properties.title.replace(/'/g, "''");
              targetRange = `'${safeTitle}'!A:Z`;
            }
          }
        } catch {
          // If metadata lookup fails, continue with default range
        }
      }

      // If range contains spaces and isn't quoted yet, quote it
      let quotedRange = targetRange;
      if (!targetRange.startsWith("'") && targetRange.includes("!")) {
        const [sheetName, cells] = targetRange.split("!");
        quotedRange = `'${sheetName}'!${cells}`;
      }

      let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(quotedRange)}?key=${GOOGLE_API_KEY}`;
      let res = await fetch(url, { cache: "no-store" });

      // Fallback: If specified tab was not found (400), try default first sheet "A:Z"
      if (!res.ok && res.status === 400) {
        url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:Z?key=${GOOGLE_API_KEY}`;
        res = await fetch(url, { cache: "no-store" });
      }

      if (res.ok) {
        const json = await res.json();
        return { rows: (json.values as string[][]) || [] };
      }

      if (res.status === 403 || res.status === 401) {
        console.warn("Google Sheets 403/401: Sheet is not publicly shared or API key lacks access.");
      }
    } catch (err) {
      console.warn("Google Sheets API v4 fetch error, trying CSV fallback:", err);
    }
  }

  // ── Strategy 2: Google Sheets CSV Export Fallback ──
  try {
    const csvUrl = gid
      ? `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
      : `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    const csvRes = await fetch(csvUrl, { cache: "no-store" });
    if (csvRes.ok) {
      const csvText = await csvRes.text();
      // Ensure we received actual CSV content and not an HTML login redirect
      if (!csvText.trim().startsWith("<!DOCTYPE") && !csvText.trim().startsWith("<html")) {
        const rows = parseCsv(csvText);
        if (rows.length > 0) {
          return { rows };
        }
      }
    }
  } catch (err) {
    console.warn("Google Sheets CSV export fallback failed:", err);
  }

  // ── Strategy 3: Service Account Fallback (if configured) ──
  if (GOOGLE_SHEETS_CLIENT_EMAIL && GOOGLE_SHEETS_PRIVATE_KEY) {
    try {
      const { google } = await import("googleapis");
      const auth = new google.auth.JWT({
        email: GOOGLE_SHEETS_CLIENT_EMAIL,
        key: GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });

      const sheets = google.sheets({ version: "v4", auth });
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: GOOGLE_SHEET_RANGE || "A:Z",
      });
      return { rows: (res.data.values as string[][]) || [] };
    } catch (err) {
      console.error("Google Sheets Service Account fetch failed:", err);
    }
  }

  return {
    rows: [],
    error: "PERMISSION_DENIED: Please make sure the Google Sheet is shared with 'Anyone with the link' as 'Viewer'.",
  };
}

/** Clean a string for comparison (removes punctuation, lowercase, trimmed) */
function cleanStr(s: string): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

/** Find the column index that contains the event selection in Google Form responses */
function findEventColumnIndex(headers: string[]): number {
  const normalized = headers.map((h) => (h || "").toLowerCase().trim());

  // 1. Exact matches
  const exactIdx = normalized.findIndex(
    (h) => h === "event" || h === "select event" || h === "choose event" || h === "events"
  );
  if (exactIdx !== -1) return exactIdx;

  // 2. High confidence matches
  const highConfIdx = normalized.findIndex(
    (h) =>
      h.includes("select event") ||
      h.includes("choose event") ||
      h.includes("event name") ||
      h.includes("participating event") ||
      h.includes("competition") ||
      h.includes("which event")
  );
  if (highConfIdx !== -1) return highConfIdx;

  // 3. Fallback: Any column containing "event" excluding date/time/venue/rule/coordinator
  const fallbackIdx = normalized.findIndex((h) => {
    if (!h.includes("event")) return false;
    const ignored = ["date", "time", "venue", "rule", "coordinator", "head", "lead", "flow", "fee", "cost"];
    return !ignored.some((neg) => h.includes(neg));
  });

  return fallbackIdx;
}

/** Match a cell value against configured events */
function matchEventsFromCell(cellValue: string, events: EventConfig[]): EventConfig[] {
  const cell = (cellValue || "").toLowerCase().trim();
  if (!cell) return [];

  // Support multi-event responses (comma, semicolon, or newline separated)
  const parts = cell.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean);
  const matched: EventConfig[] = [];

  for (const part of parts.length > 0 ? parts : [cell]) {
    const cleanPart = cleanStr(part);
    if (!cleanPart) continue;

    for (const e of events) {
      const cleanName = cleanStr(e.name);
      const cleanLabel = cleanStr(e.sheetEventLabel || "");
      const cleanId = cleanStr(e.id);

      // Direct exact match against event name, sheet label, or ID
      if (
        cleanPart === cleanName ||
        (cleanLabel && cleanPart === cleanLabel) ||
        cleanPart === cleanId
      ) {
        if (!matched.some((m) => m.id === e.id)) matched.push(e);
        continue;
      }

      // Substring matching for descriptive choices (e.g. "Paper Presentation (Elevator Pitch)")
      if (
        (cleanLabel && cleanLabel.length >= 4 && cleanPart.includes(cleanLabel)) ||
        (cleanName && cleanName.length >= 4 && cleanPart.includes(cleanName)) ||
        (cleanLabel && cleanLabel.length >= 4 && cleanLabel.includes(cleanPart)) ||
        (cleanName && cleanName.length >= 4 && cleanName.includes(cleanPart))
      ) {
        if (!matched.some((m) => m.id === e.id)) matched.push(e);
      }
    }
  }

  return matched;
}

/** Helper: detect known field from header string */
function detectFieldType(header: string): string {
  const h = header.toLowerCase();
  if (h.includes("timestamp")) return "timestamp";
  if (h.includes("team name") || h.includes("group name")) return "teamName";
  if (h.includes("college") || h.includes("institution") || h.includes("university")) return "collegeName";
  if (h.includes("leader") || h.includes("name of participant") || (h.includes("name") && !h.includes("team") && !h.includes("college") && !h.includes("event"))) return "leaderName";
  if (h.includes("email") || h.includes("mail")) return "leaderEmail";
  if (h.includes("phone") || h.includes("mobile") || h.includes("contact") || h.includes("whatsapp")) return "leaderPhone";
  return "";
}

/**
 * Fetch live seat counts from the connected Google Sheet
 */
export async function getLiveCounts(
  customEvents?: EventConfig[]
): Promise<{ counts: LiveCounts; isLive: boolean; error?: string; totalResponses?: number }> {
  const events = customEvents || (await listEvents().catch(() => []));
  const now = Date.now();

  // Return cached result if fresh (< 30 seconds old)
  if (cachedCountsData && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return cachedCountsData;
  }

  try {
    const { rows, error } = await fetchSheetRows();

    if (error || rows.length < 2) {
      const fallbackCounts = emptyCounts(events);
      const res = {
        counts: fallbackCounts,
        isLive: false,
        error: error || (rows.length < 2 ? "SHEET_EMPTY" : undefined),
        totalResponses: Math.max(0, rows.length - 1),
      };
      // Keep last good cache if available, but update status
      if (cachedCountsData?.isLive) {
        return cachedCountsData;
      }
      return res;
    }

    const headers = rows[0].map((h) => String(h || "").trim());
    let eventColIdx = findEventColumnIndex(headers);

    // If event column header couldn't be determined by name, scan rows to identify which column has event names
    if (eventColIdx === -1 && rows.length > 1) {
      const colScores = new Array(headers.length).fill(0);
      for (const row of rows.slice(1, Math.min(rows.length, 10))) {
        row.forEach((val, idx) => {
          if (matchEventsFromCell(val, events).length > 0) {
            colScores[idx]++;
          }
        });
      }
      const maxScore = Math.max(...colScores);
      if (maxScore > 0) {
        eventColIdx = colScores.indexOf(maxScore);
      }
    }

    const counts: LiveCounts = emptyCounts(events);
    const dataRows = rows.slice(1);

    for (const row of dataRows) {
      // Primary check in event column
      let matchedEvents: EventConfig[] = [];
      if (eventColIdx !== -1 && row[eventColIdx]) {
        matchedEvents = matchEventsFromCell(String(row[eventColIdx]), events);
      }

      // Fallback check across all columns for this row if no match in main event column
      if (matchedEvents.length === 0) {
        for (let c = 0; c < row.length; c++) {
          if (c === eventColIdx) continue;
          const cellVal = String(row[c] || "");
          const candidateMatches = matchEventsFromCell(cellVal, events);
          if (candidateMatches.length > 0) {
            matchedEvents = candidateMatches;
            break;
          }
        }
      }

      for (const e of matchedEvents) {
        counts[e.id] = (counts[e.id] ?? 0) + 1;
      }
    }

    const result = {
      counts,
      isLive: true,
      totalResponses: dataRows.length,
    };

    cachedCountsData = result;
    lastFetchTimestamp = Date.now();
    return result;
  } catch (err: any) {
    console.error("Google Sheets fetch failed, falling back to cached or empty data:", err);
    const fallback = cachedCountsData
      ? { ...cachedCountsData, isLive: false, error: err?.message }
      : { counts: emptyCounts(events), isLive: false, error: err?.message };
    return fallback;
  }
}

/**
 * Fetch detailed registration responses from the connected Google Sheet
 * (Useful for Coordinator / Admin exports and registrant views)
 */
export async function getLiveRegistrations(
  customEvents?: EventConfig[]
): Promise<{
  registrations: SheetRegistration[];
  isLive: boolean;
  headers: string[];
  totalCount: number;
  error?: string;
}> {
  const events = customEvents || (await listEvents().catch(() => []));
  const now = Date.now();

  if (cachedRegistrationsData && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return {
      ...cachedRegistrationsData,
      totalCount: cachedRegistrationsData.registrations.length,
    };
  }

  try {
    const { rows, error } = await fetchSheetRows();
    if (error || rows.length < 2) {
      return {
        registrations: [],
        isLive: false,
        headers: rows[0] || [],
        totalCount: 0,
        error,
      };
    }

    const headers = rows[0].map((h) => String(h || "").trim());
    const eventColIdx = findEventColumnIndex(headers);
    const dataRows = rows.slice(1);

    const registrations: SheetRegistration[] = [];

    dataRows.forEach((row, index) => {
      const rawData: Record<string, string> = {};
      let timestamp = "";
      let teamName = "";
      let collegeName = "";
      let leaderName = "";
      let leaderEmail = "";
      let leaderPhone = "";

      headers.forEach((h, colIdx) => {
        const val = String(row[colIdx] || "").trim();
        rawData[h] = val;
        const fieldType = detectFieldType(h);
        if (fieldType === "timestamp" && !timestamp) timestamp = val;
        else if (fieldType === "teamName" && !teamName) teamName = val;
        else if (fieldType === "collegeName" && !collegeName) collegeName = val;
        else if (fieldType === "leaderName" && !leaderName) leaderName = val;
        else if (fieldType === "leaderEmail" && !leaderEmail) leaderEmail = val;
        else if (fieldType === "leaderPhone" && !leaderPhone) leaderPhone = val;
      });

      // Match event
      let eventVal = eventColIdx !== -1 ? String(row[eventColIdx] || "") : "";
      let matched = matchEventsFromCell(eventVal, events);

      if (matched.length === 0) {
        for (let c = 0; c < row.length; c++) {
          if (c === eventColIdx) continue;
          const candidateMatches = matchEventsFromCell(String(row[c] || ""), events);
          if (candidateMatches.length > 0) {
            matched = candidateMatches;
            break;
          }
        }
      }

      registrations.push({
        rowNumber: index + 2,
        timestamp,
        eventName: matched.map((m) => m.name).join(", ") || eventVal || "General Registration",
        eventId: matched[0]?.id,
        teamName,
        collegeName,
        leaderName,
        leaderEmail,
        leaderPhone,
        rawData,
      });
    });

    const result = {
      registrations,
      isLive: true,
      headers,
      totalCount: registrations.length,
    };

    cachedRegistrationsData = result;
    return result;
  } catch (err: any) {
    return {
      registrations: [],
      isLive: false,
      headers: [],
      totalCount: 0,
      error: err?.message,
    };
  }
}

function emptyCounts(events: EventConfig[]): LiveCounts {
  return Object.fromEntries(events.map((e) => [e.id, 0]));
}
