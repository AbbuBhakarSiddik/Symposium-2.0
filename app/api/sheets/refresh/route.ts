import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { invalidateCache, getLiveCounts } from "@/lib/googleSheets";
import { listEvents } from "@/lib/db";

export async function POST() {
  // Only authenticated admins or coordinators can force a cache refresh
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Bust the server-side in-memory cache
  invalidateCache();

  // Immediately fetch fresh data
  const events = await listEvents();
  const { counts, isLive } = await getLiveCounts(events);

  const data = events.map((e) => ({
    id: e.id,
    registered: counts[e.id] ?? 0,
    capacity: e.capacity,
    available: Math.max(e.capacity - (counts[e.id] ?? 0), 0),
  }));

  return NextResponse.json({
    isLive,
    data,
    fetchedAt: new Date().toISOString(),
  });
}
