"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "./auth";
import {
  createUser,
  deleteUser,
  createAnnouncement,
  deleteAnnouncement,
  createResource,
  deleteResource,
  Role,
} from "./db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const username = (session?.user as any)?.username;
  if (role !== "admin") throw new Error("Not authorized");
  return { username };
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "") as Role;
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();

  if (!username || !password || !name || (role !== "admin" && role !== "coordinator")) {
    throw new Error("Missing or invalid fields");
  }

  await createUser({ username, password, name, role, phone, email });
  revalidatePath("/admin");
  revalidatePath("/coordinators");
}

export async function deleteUserAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing id");
  await deleteUser(id);
  revalidatePath("/admin");
  revalidatePath("/coordinators");
}

export async function createAnnouncementAction(formData: FormData) {
  const { username } = await requireAdmin();
  const message = String(formData.get("message") || "").trim();
  if (!message) throw new Error("Empty announcement");
  await createAnnouncement(message, username || "admin");
  revalidatePath("/announcements");
  revalidatePath("/admin");
  revalidatePath("/coordinators");
  revalidatePath("/");
}

export async function deleteAnnouncementAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing id");
  await deleteAnnouncement(id);
  revalidatePath("/announcements");
  revalidatePath("/admin");
  revalidatePath("/coordinators");
  revalidatePath("/");
}

export async function createResourceAction(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const url = String(formData.get("url") || "").trim();
  if (!title || !url) throw new Error("Missing fields");
  await createResource(title, url);
  revalidatePath("/admin");
  revalidatePath("/coordinators");
}

export async function deleteResourceAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing id");
  await deleteResource(id);
  revalidatePath("/admin");
  revalidatePath("/coordinators");
}

// ---------- Event Actions ----------
import {
  createEvent,
  updateEvent,
  deleteEvent,
  assignCoordinatorToEvent,
  reorderEventCoordinators,
  removeCoordinatorFromEvent,
  updateSiteSetting,
  createGalleryItem,
  deleteGalleryItem,
} from "./db";

export async function createEventAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const tagline = String(formData.get("tagline") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const date = String(formData.get("date") || "").trim();
  const time = String(formData.get("time") || "").trim();
  const venue = String(formData.get("venue") || "").trim();
  const capacity = parseInt(String(formData.get("capacity") || "50"), 10);
  const sheetEventLabel = String(formData.get("sheetEventLabel") || name).trim();
  const rulebookUrl = String(formData.get("rulebookUrl") || "").trim() || null;

  if (!name || !date || !time || !venue || !sheetEventLabel) {
    throw new Error("Missing required event fields");
  }

  await createEvent({
    name,
    tagline,
    description,
    date,
    time,
    venue,
    capacity: isNaN(capacity) ? 50 : capacity,
    sheetEventLabel,
    schedule: [
      { time, item: "Reporting & start" },
      { time: "TBD", item: "Finals & results" },
    ],
    coordinators: [],
    rulebookUrl,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/coordinators");
}

export async function updateEventAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Missing event id");

  const name = String(formData.get("name") || "").trim();
  const tagline = String(formData.get("tagline") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const date = String(formData.get("date") || "").trim();
  const time = String(formData.get("time") || "").trim();
  const venue = String(formData.get("venue") || "").trim();
  const capacityStr = formData.get("capacity");
  const sheetEventLabel = String(formData.get("sheetEventLabel") || "").trim();
  const rulebookUrl = formData.get("rulebookUrl");

  const payload: any = {};
  if (name) payload.name = name;
  if (tagline !== undefined) payload.tagline = tagline;
  if (description !== undefined) payload.description = description;
  if (date) payload.date = date;
  if (time) payload.time = time;
  if (venue) payload.venue = venue;
  if (capacityStr !== null && capacityStr !== "") {
    payload.capacity = parseInt(String(capacityStr), 10);
  }
  if (sheetEventLabel) payload.sheetEventLabel = sheetEventLabel;
  if (rulebookUrl !== null) payload.rulebookUrl = String(rulebookUrl).trim() || null;

  await updateEvent(id, payload);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/coordinators");
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Missing event id");
  await deleteEvent(id);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/coordinators");
}

export async function assignCoordinatorAction(formData: FormData) {
  await requireAdmin();

  const eventId = String(formData.get("eventId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "Event Lead").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const image = String(formData.get("image") || "").trim();
  const positionRaw = String(formData.get("position") || "end").trim();

  if (!eventId || !name) throw new Error("Missing eventId or coordinator name");

  let position: "start" | "end" | number = "end";
  if (positionRaw === "start" || positionRaw === "0") {
    position = "start";
  } else if (!isNaN(Number(positionRaw))) {
    position = Number(positionRaw);
  }

  await assignCoordinatorToEvent(
    eventId,
    {
      name,
      role,
      phone: phone || undefined,
      email: email || undefined,
      image: image || undefined,
    },
    position
  );

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/coordinators");
}

export async function reorderEventCoordinatorsAction(formData: FormData) {
  await requireAdmin();

  const eventId = String(formData.get("eventId") || "").trim();
  const coordinatorsJson = String(formData.get("coordinatorsJson") || "").trim();

  if (!eventId || !coordinatorsJson) throw new Error("Missing eventId or coordinators data");

  const reordered = JSON.parse(coordinatorsJson);
  await reorderEventCoordinators(eventId, reordered);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/coordinators");
}

export async function removeCoordinatorFromEventAction(formData: FormData) {
  await requireAdmin();

  const eventId = String(formData.get("eventId") || "").trim();
  const coordinatorName = String(formData.get("coordinatorName") || "").trim();

  if (!eventId || !coordinatorName) throw new Error("Missing eventId or coordinatorName");

  await removeCoordinatorFromEvent(eventId, coordinatorName);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/coordinators");
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requireAdmin();

  const symposiumName = String(formData.get("symposiumName") || "").trim();
  const clubName = String(formData.get("clubName") || "").trim();
  const collegeName = String(formData.get("collegeName") || "").trim();
  const registerFormUrl = String(formData.get("registerFormUrl") || "").trim();
  const googleSheetUrl = String(formData.get("googleSheetUrl") || "").trim();
  const rulebookUrl = formData.get("rulebookUrl");

  if (symposiumName) await updateSiteSetting("symposiumName", symposiumName);
  if (clubName) await updateSiteSetting("clubName", clubName);
  if (collegeName) await updateSiteSetting("collegeName", collegeName);
  if (registerFormUrl) await updateSiteSetting("registerFormUrl", registerFormUrl);
  if (googleSheetUrl) await updateSiteSetting("googleSheetUrl", googleSheetUrl);
  if (rulebookUrl !== null) {
    await updateSiteSetting("rulebookUrl", String(rulebookUrl).trim());
  }

  const runningAnnouncement = formData.get("runningAnnouncement");
  if (runningAnnouncement !== null) {
    await updateSiteSetting("runningAnnouncement", String(runningAnnouncement).trim());
  }
  const runningAnnouncementActive = formData.get("runningAnnouncementActive");
  if (runningAnnouncementActive !== null) {
    await updateSiteSetting("runningAnnouncementActive", String(runningAnnouncementActive).trim());
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/coordinators");
}

export async function updateRunningAnnouncementAction(formData: FormData) {
  await requireAdmin();

  const runningAnnouncement = String(formData.get("runningAnnouncement") || "").trim();
  const runningAnnouncementActive = String(formData.get("runningAnnouncementActive") || "true").trim();

  await updateSiteSetting("runningAnnouncement", runningAnnouncement);
  await updateSiteSetting("runningAnnouncementActive", runningAnnouncementActive);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/announcements");
  revalidatePath("/coordinators");
}

// ---------- Gallery Actions ----------

export async function createGalleryItemAction(formData: FormData) {
  await requireAdmin();

  let type = String(formData.get("type") || "photo") as "photo" | "video";
  let url = String(formData.get("url") || "").trim();
  let title = String(formData.get("title") || "").trim();
  const caption = String(formData.get("caption") || "").trim();
  const file = formData.get("file") as File | null;

  if (file && file.size > 0) {
    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|ogg|mkv)$/i.test(file.name);
    type = isVideo ? "video" : "photo";
    if (!title) {
      title = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    }

    const sanitizedBase = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}-${sanitizedBase}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try Supabase Storage first
    try {
      const { supabaseAdmin } = await import("@/lib/supabase");
      const db = supabaseAdmin();
      const { error: uploadError } = await db.storage
        .from("gallery")
        .upload(uniqueFileName, buffer, {
          contentType: file.type || (isVideo ? "video/mp4" : "image/jpeg"),
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = db.storage.from("gallery").getPublicUrl(uniqueFileName);
        if (publicUrlData?.publicUrl) {
          url = publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn("Supabase storage upload error in action:", err);
    }

    // Fallback to /public/uploads
    if (!url) {
      const fs = await import("fs");
      const path = await import("path");
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadsDir, uniqueFileName), buffer);
      url = `/uploads/${uniqueFileName}`;
    }
  }

  if (!url) throw new Error("A media file or valid URL is required");

  await createGalleryItem({ type, url, title: title || "Gallery Media", caption });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteGalleryItemAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Missing gallery item ID");

  await deleteGalleryItem(id);

  revalidatePath("/");
  revalidatePath("/admin");
}


