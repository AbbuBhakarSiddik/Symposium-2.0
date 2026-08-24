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
  revalidatePath("/admin");
  revalidatePath("/coordinators");
}

export async function deleteAnnouncementAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing id");
  await deleteAnnouncement(id);
  revalidatePath("/admin");
  revalidatePath("/coordinators");
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
