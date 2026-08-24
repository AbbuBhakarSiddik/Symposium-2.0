"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-sm border border-ink-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted transition hover:border-full hover:text-full"
    >
      Sign out
    </button>
  );
}
