"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SYMPOSIUM_NAME } from "@/lib/eventsConfig";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      setError("Incorrect username or password.");
      return;
    }

    // Get current session and check role for dynamic redirect
    const session = await getSession();
    setLoading(false);

    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    if (callbackUrl) {
      router.push(callbackUrl);
    } else {
      const role = (session?.user as any)?.role;
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "coordinator") {
        router.push("/coordinators");
      } else {
        router.push("/");
      }
    }
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-ink px-5 overflow-hidden">
      {/* Background radial gradient glow for a premium aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(253,176,34,0.06)_0%,transparent_65%)] pointer-events-none z-0" />

      {/* Grid backdrop separated from the card so the components are fully visible */}
      <div className="absolute inset-0 grid-backdrop pointer-events-none z-0" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-lg border border-ink-line bg-ink-surface/85 backdrop-blur-md p-8 shadow-2xl transition-all duration-300 hover:border-ink-line/80"
      >
        <div className="mb-6 text-center sm:text-left">
          <p className="eyebrow mb-2">{SYMPOSIUM_NAME}</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
            Coordinator / Admin Login
          </h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-ink-line bg-ink/60 px-3.5 py-2.5 font-mono text-sm text-paper outline-none transition-all duration-200 focus:border-signal focus:bg-ink focus:shadow-[0_0_12px_rgba(253,176,34,0.12)]"
              autoComplete="username"
              required
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-ink-line bg-ink/60 px-3.5 py-2.5 font-mono text-sm text-paper outline-none transition-all duration-200 focus:border-signal focus:bg-ink focus:shadow-[0_0_12px_rgba(253,176,34,0.12)]"
              autoComplete="current-password"
              required
              placeholder="Enter password"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded border border-full/20 bg-full/5 p-3 font-mono text-xs text-full">
            <span className="h-1.5 w-1.5 rounded-full bg-full animate-ping" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-md bg-signal py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-all duration-300 hover:bg-signal-soft hover:shadow-[0_0_15px_rgba(253,176,34,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink border-t-transparent" />
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </main>
  );
}

