import { NextResponse } from "next/server";
import { listAnnouncements } from "@/lib/db";

export async function GET() {
  try {
    const announcements = await listAnnouncements();
    return NextResponse.json({ announcements, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ announcements: [], error: String(err) }, { status: 500 });
  }
}
