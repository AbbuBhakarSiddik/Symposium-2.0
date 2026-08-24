// One-off CLI to create a user directly in Supabase — mainly for creating
// your very first admin (the admin panel can create everyone after that).
//
// Usage:
//   node scripts/create-user.mjs <username> <password> <name> <role> [phone] [email]
//   node scripts/create-user.mjs admin1 "S3curePass!" "Dr. Rao" admin
//   node scripts/create-user.mjs raj "coord123" "Raj Kumar" coordinator "+91 90000 00001"
//
// Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import fs from "fs";

// Load .env.local specifically (dotenv/config above loads .env by default).
if (fs.existsSync(".env.local")) {
  const { config } = await import("dotenv");
  config({ path: ".env.local", override: true });
}

const [, , username, password, name, role, phone, email] = process.argv;

if (!username || !password || !name || !role) {
  console.error(
    "Usage: node scripts/create-user.mjs <username> <password> <name> <role:admin|coordinator> [phone] [email]"
  );
  process.exit(1);
}

if (role !== "admin" && role !== "coordinator") {
  console.error('Role must be exactly "admin" or "coordinator"');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, key);
const password_hash = await bcrypt.hash(password, 10);

const { error } = await db.from("users").insert({
  username,
  password_hash,
  name,
  role,
  phone: phone || null,
  email: email || null,
});

if (error) {
  console.error("Failed to create user:", error.message);
  process.exit(1);
}

console.log(`Created ${role} "${username}" (${name}).`);
