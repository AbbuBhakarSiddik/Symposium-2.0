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
