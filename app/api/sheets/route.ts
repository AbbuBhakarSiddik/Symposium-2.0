import { NextResponse } from "next/server";
import { getLiveCounts } from "@/lib/googleSheets";
import { listEvents } from "@/lib/db";

export async function GET() {
  const events = await listEvents();
  const { counts, isLive } = await getLiveCounts(events);

  const data = events.map((e) => ({
    id: e.id,
    registered: counts[e.id] ?? 0,
    capacity: e.capacity,
    available: Math.max(e.capacity - (counts[e.id] ?? 0), 0),
  }));

  return NextResponse.json({ isLive, data, events, fetchedAt: new Date().toISOString() });
}


