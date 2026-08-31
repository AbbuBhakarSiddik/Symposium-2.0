import bcrypt from "bcryptjs";
import { supabaseAdmin } from "./supabase";

export type Role = "admin" | "coordinator";

export type AppUser = {
  id: string;
  username: string;
  name: string;
  role: Role;
  phone: string | null;
  email: string | null;
};

export type Announcement = {
  id: string;
  message: string;
  created_at: string;
  created_by: string; // username
};

export type Resource = {
  id: string;
  title: string;
  url: string;
  created_at: string;
};

// ---------- Auth ----------

export async function verifyLogin(
  username: string,
  password: string
): Promise<AppUser | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("users")
    .select("id, username, password_hash, name, role, phone, email")
    .eq("username", username)
    .maybeSingle();

  if (error || !data) return null;

  const ok = await bcrypt.compare(password, data.password_hash);
  if (!ok) return null;

  const { password_hash, ...user } = data;
  return user as AppUser;
}

// ---------- Users (admin/coordinator directory + management) ----------

export async function listUsers(): Promise<AppUser[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("users")
    .select("id, username, name, role, phone, email")
    .order("role", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return data as AppUser[];
}

export async function createUser(input: {
  username: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
  email?: string;
}) {
  const db = supabaseAdmin();
  const password_hash = await bcrypt.hash(input.password, 10);

  const { error } = await db.from("users").insert({
    username: input.username,
    password_hash,
    name: input.name,
    role: input.role,
    phone: input.phone || null,
    email: input.email || null,
  });

  if (error) throw error;
}

export async function deleteUser(id: string) {
  const db = supabaseAdmin();
  const { error } = await db.from("users").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Announcements ----------

export async function listAnnouncements(): Promise<Announcement[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("announcements")
    .select("id, message, created_at, created_by")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data as Announcement[];
}

export async function createAnnouncement(message: string, createdBy: string) {
  const db = supabaseAdmin();
  const { error } = await db
    .from("announcements")
    .insert({ message, created_by: createdBy });
  if (error) throw error;
}

export async function deleteAnnouncement(id: string) {
  const db = supabaseAdmin();
  const { error } = await db.from("announcements").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Resources ----------

export async function listResources(): Promise<Resource[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("resources")
    .select("id, title, url, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Resource[];
}

export async function createResource(title: string, url: string) {
  const db = supabaseAdmin();
  const { error } = await db.from("resources").insert({ title, url });
  if (error) throw error;
}

export async function deleteResource(id: string) {
  const db = supabaseAdmin();
  const { error } = await db.from("resources").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Events Management ----------
import { EVENTS, EventConfig, SYMPOSIUM_NAME, CLUB_NAME, COLLEGE_NAME, REGISTER_FORM_URL } from "./eventsConfig";

export async function listEvents(): Promise<EventConfig[]> {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("events")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return EVENTS;
    }

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      tagline: item.tagline || "",
      description: item.description || "",
      date: item.date,
      time: item.time,
      venue: item.venue,
      capacity: item.capacity,
      sheetEventLabel: item.sheet_event_label,
      schedule: Array.isArray(item.schedule) ? item.schedule : [],
      coordinators: Array.isArray(item.coordinators) ? item.coordinators : [],
    }));
  } catch {
    return EVENTS;
  }
}

export async function createEvent(input: {
  id?: string;
  name: string;
  tagline?: string;
  description?: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  sheetEventLabel: string;
  schedule?: { time: string; item: string }[];
  coordinators?: { name: string; role: string; phone?: string; email?: string }[];
}) {
  const db = supabaseAdmin();
  const eventId = input.id || `event-${Date.now()}`;
  const { error } = await db.from("events").insert({
    id: eventId,
    name: input.name,
    tagline: input.tagline || "",
    description: input.description || "",
    date: input.date,
    time: input.time,
    venue: input.venue,
    capacity: input.capacity,
    sheet_event_label: input.sheetEventLabel,
    schedule: input.schedule || [],
    coordinators: input.coordinators || [],
  });

  if (error) {
    const msg = (error as any)?.message || JSON.stringify(error);
    throw new Error(`createEvent failed: ${msg}. Ensure the 'events' table exists in Supabase (run supabase/schema.sql).`);
  }
}

export async function updateEvent(
  id: string,
  input: Partial<{
    name: string;
    tagline: string;
    description: string;
    date: string;
    time: string;
    venue: string;
    capacity: number;
    sheetEventLabel: string;
    schedule: { time: string; item: string }[];
    coordinators: { name: string; role: string; phone?: string; email?: string }[];
  }>
) {
  const db = supabaseAdmin();
  const payload: Record<string, any> = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.tagline !== undefined) payload.tagline = input.tagline;
  if (input.description !== undefined) payload.description = input.description;
  if (input.date !== undefined) payload.date = input.date;
  if (input.time !== undefined) payload.time = input.time;
  if (input.venue !== undefined) payload.venue = input.venue;
  if (input.capacity !== undefined) payload.capacity = input.capacity;
  if (input.sheetEventLabel !== undefined) payload.sheet_event_label = input.sheetEventLabel;
  if (input.schedule !== undefined) payload.schedule = input.schedule;
  if (input.coordinators !== undefined) payload.coordinators = input.coordinators;

  const { error } = await db.from("events").update(payload).eq("id", id);
  if (error) {
    const msg = (error as any)?.message || JSON.stringify(error);
    throw new Error(`updateEvent failed: ${msg}. Ensure the 'events' table exists in Supabase (run supabase/schema.sql).`);
  }
}

export async function deleteEvent(id: string) {
  const db = supabaseAdmin();
  const { error } = await db.from("events").delete().eq("id", id);
  if (error) {
    const msg = (error as any)?.message || JSON.stringify(error);
    throw new Error(`deleteEvent failed: ${msg}. Ensure the 'events' table exists in Supabase (run supabase/schema.sql).`);
  }
}

export async function assignCoordinatorToEvent(
  eventId: string,
  coordinator: { name: string; role: string; phone?: string; email?: string; image?: string }
) {
  const events = await listEvents();
  const event = events.find((e) => e.id === eventId);
  if (!event) throw new Error("Event not found");

  const updatedCoordinators = [...event.coordinators.filter((c) => c.name !== coordinator.name), coordinator];
  await updateEvent(eventId, { coordinators: updatedCoordinators });
}

// ---------- Site Settings ----------

export type SiteSettings = {
  symposiumName: string;
  clubName: string;
  collegeName: string;
  registerFormUrl: string;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const defaults: SiteSettings = {
    symposiumName: SYMPOSIUM_NAME,
    clubName: CLUB_NAME,
    collegeName: COLLEGE_NAME,
    registerFormUrl: REGISTER_FORM_URL,
  };

  try {
    const db = supabaseAdmin();
    const { data, error } = await db.from("site_settings").select("key, value");
    if (error || !data || data.length === 0) return defaults;

    const map = Object.fromEntries(data.map((row) => [row.key, row.value]));
    return {
      symposiumName: map.symposiumName || defaults.symposiumName,
      clubName: map.clubName || defaults.clubName,
      collegeName: map.collegeName || defaults.collegeName,
      registerFormUrl: map.registerFormUrl || defaults.registerFormUrl,
    };
  } catch {
    return defaults;
  }
}

export async function updateSiteSetting(key: keyof SiteSettings, value: string) {
  const db = supabaseAdmin();
  const { error } = await db
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ---------- Gallery Management ----------

export type GalleryItem = {
  id: string;
  type: "photo" | "video";
  url: string;
  title: string;
  caption?: string;
  created_at: string;
};

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g-p1",
    type: "photo",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    title: "Keynote Address 2025",
    caption: "Inaugural ceremony and opening address by chief guests.",
    created_at: new Date().toISOString(),
  },
  {
    id: "g-p2",
    type: "photo",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    title: "Hackathon Coding Arena",
    caption: "Teams collaborating non-stop during 24hr code sprint.",
    created_at: new Date().toISOString(),
  },
  {
    id: "g-p3",
    type: "photo",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    title: "Project Expo & Demo",
    caption: "Students showcasing hardware and software prototypes.",
    created_at: new Date().toISOString(),
  },
  {
    id: "g-p4",
    type: "photo",
    url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
    title: "Prize Distribution & Gala",
    caption: "Celebrating winners across coding, robotics and web events.",
    created_at: new Date().toISOString(),
  },
  {
    id: "g-p5",
    type: "photo",
    url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
    title: "Panel Discussion",
    caption: "Industry experts discussing AI & Future Technologies.",
    created_at: new Date().toISOString(),
  },
  {
    id: "g-p6",
    type: "photo",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    title: "Gaming Championship",
    caption: "High-octane esports tournament stage action.",
    created_at: new Date().toISOString(),
  },
  {
    id: "g-v1",
    type: "video",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Symposium 1.0 Official Aftermovie",
    caption: "Highlights & energy from our previous national level edition.",
    created_at: new Date().toISOString(),
  },
  {
    id: "g-v2",
    type: "video",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Hackathon Highlights & Winner Showcase",
    caption: "24 hours of innovation distilled into a 3-minute recap.",
    created_at: new Date().toISOString(),
  },
];

export async function listGalleryItems(): Promise<GalleryItem[]> {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return DEFAULT_GALLERY_ITEMS;
    }

    return data as GalleryItem[];
  } catch {
    return DEFAULT_GALLERY_ITEMS;
  }
}

export async function createGalleryItem(input: {
  type: "photo" | "video";
  url: string;
  title?: string;
  caption?: string;
}) {
  const db = supabaseAdmin();
  const { error } = await db.from("gallery").insert({
    type: input.type,
    url: input.url,
    title: input.title || "",
    caption: input.caption || "",
  });
  if (error) throw error;
}

export async function deleteGalleryItem(id: string) {
  const db = supabaseAdmin();
  const { error } = await db.from("gallery").delete().eq("id", id);
  if (error) throw error;
}


