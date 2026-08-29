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

  if (error) throw error;
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
  if (error) throw error;
}

export async function deleteEvent(id: string) {
  const db = supabaseAdmin();
  const { error } = await db.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function assignCoordinatorToEvent(
  eventId: string,
  coordinator: { name: string; role: string; phone?: string; email?: string }
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

