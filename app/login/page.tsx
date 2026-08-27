"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SYMPOSIUM_NAME, COLLEGE_NAME } from "@/lib/eventsConfig";

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
    <div className="flex min-h-screen overflow-hidden">
      {/* Left side – branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-ink to-ink-surface/90 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-cyber-cyan/5" />
        <div className="cyber-orb top-1/4 left-1/4 w-96 h-96 bg-cyber-cyan/10" />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyber-cyan to-cyber-purple text-sm font-bold text-ink shadow-glow-cyan">
              {SYMPOSIUM_NAME.split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <span className="font-display text-2xl font-bold text-paper">{SYMPOSIUM_NAME}</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-paper leading-tight">
            Welcome back, <br />
            <span className="gradient-text">Organizer.</span>
          </h1>
          <p className="mt-4 text-muted text-sm leading-relaxed">
            Access the coordinator and admin dashboard to manage events, registrations, and live updates.
          </p>
          <p className="mt-4 font-mono text-xs text-muted">
            {COLLEGE_NAME} • National Symposium
          </p>
        </div>
      </div>

      {/* Right side – login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 sm:px-12 bg-ink-surface/50 backdrop-blur-sm relative">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="font-display text-2xl font-bold text-paper">Sign In</h2>
            <p className="mt-1 text-sm text-muted">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-ink/60 px-4 py-3 font-mono text-sm text-paper outline-none transition-all duration-200 focus:border-cyber-cyan focus:bg-ink focus:shadow-glow-cyan"
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
                className="w-full rounded-xl border border-white/10 bg-ink/60 px-4 py-3 font-mono text-sm text-paper outline-none transition-all duration-200 focus:border-cyber-cyan focus:bg-ink focus:shadow-glow-cyan"
                autoComplete="current-password"
                required
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-full/20 bg-full/5 p-3 font-mono text-xs text-full">
                <span className="h-1.5 w-1.5 rounded-full bg-full animate-pulse" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-cyber w-full justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            Protected • {COLLEGE_NAME} Symposium
          </p>
        </div>
      </div>
    </div>
  );
}