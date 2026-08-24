import { NextResponse } from "next/server";
import { getLiveCounts } from "@/lib/googleSheets";
import { EVENTS } from "@/lib/eventsConfig";

// Polled from the client every so often to keep the "slots available"
// numbers on the home page current. Cheap and cache-free on purpose —
// swap in ISR/revalidate or a webhook-driven cache if traffic grows.
export async function GET() {
  const { counts, isLive } = await getLiveCounts();

  const data = EVENTS.map((e) => ({
    id: e.id,
    registered: counts[e.id] ?? 0,
    capacity: e.capacity,
    available: Math.max(e.capacity - (counts[e.id] ?? 0), 0),
  }));

  return NextResponse.json({ isLive, data, fetchedAt: new Date().toISOString() });
}
