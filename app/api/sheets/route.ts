import { NextResponse } from "next/server";
import { getLiveCounts } from "@/lib/googleSheets";
import { listEvents, getSiteSettings } from "@/lib/db";
import { DEFAULT_RULEBOOK_URL } from "@/lib/eventsConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  const [events, settings] = await Promise.all([
    listEvents(),
    getSiteSettings().catch(() => null),
  ]);
  const { counts, isLive, error, totalResponses } = await getLiveCounts(events);

  const data = events.map((e) => ({
    id: e.id,
    registered: counts[e.id] ?? 0,
    capacity: e.capacity,
    available: Math.max(e.capacity - (counts[e.id] ?? 0), 0),
  }));

  return NextResponse.json({
    isLive,
    error: error || null,
    totalResponses: totalResponses ?? null,
    data,
    events,
    registerFormUrl:
      process.env.NEXT_PUBLIC_REGISTER_FORM_URL ||
      process.env.REGISTER_FORM_URL ||
      (settings?.registerFormUrl && settings.registerFormUrl !== "#" ? settings.registerFormUrl : "#"),
    rulebookUrl:
      process.env.NEXT_PUBLIC_RULEBOOK_URL ||
      process.env.RULEBOOK_URL ||
      (settings?.rulebookUrl && settings.rulebookUrl !== "#" ? settings.rulebookUrl : DEFAULT_RULEBOOK_URL),
    fetchedAt: new Date().toISOString(),
  });
}


