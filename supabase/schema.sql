-- Run this once in your Supabase project's SQL editor
-- (Project → SQL Editor → New query → paste → Run).

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  name text not null,
  role text not null check (role in ('admin', 'coordinator')),
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id text primary key,
  name text not null,
  tagline text,
  description text,
  date text not null,
  time text not null,
  venue text not null,
  capacity integer not null default 50,
  sheet_event_label text not null,
  schedule jsonb default '[]'::jsonb,
  coordinators jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Row-level security is ON by default with no policies, which blocks all
-- access from Supabase's public/anon client. That's intentional: this app
-- only ever talks to these tables from the server using the service role
-- key (lib/supabase.ts), which bypasses RLS entirely.
alter table users enable row level security;
alter table announcements enable row level security;
alter table resources enable row level security;
alter table events enable row level security;
alter table site_settings enable row level security;

