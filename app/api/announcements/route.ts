import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listAnnouncements, createAnnouncement, deleteAnnouncement } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const announcements = await listAnnouncements();
    return NextResponse.json({ announcements, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ announcements: [], error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const message = String(body.message || "").trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const createdBy = (session.user as any)?.username || session.user?.name || "admin";
    await createAnnouncement(message, createdBy);

    revalidatePath("/announcements");
    revalidatePath("/admin");
    revalidatePath("/");

    const updated = await listAnnouncements();
    return NextResponse.json({ success: true, announcements: updated });
  } catch (err: any) {
    console.error("Failed to create announcement:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing announcement id" }, { status: 400 });
    }

    await deleteAnnouncement(id);

    revalidatePath("/announcements");
    revalidatePath("/admin");
    revalidatePath("/");

    const updated = await listAnnouncements();
    return NextResponse.json({ success: true, announcements: updated });
  } catch (err: any) {
    console.error("Failed to delete announcement:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

