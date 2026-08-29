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
    <div className="flex min-h-screen overflow-hidden bg-[#FAF9F5] text-slate-900">
      {/* Left side – branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 to-indigo-950 relative overflow-hidden items-center justify-center p-12 text-white">
        <div className="absolute inset-0 bg-sky-500/10" />
        <div className="cyber-orb top-1/4 left-1/4 w-96 h-96 bg-sky-500/20" />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 text-sm font-bold text-white shadow-lg">
              {SYMPOSIUM_NAME.split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <span className="font-display text-2xl font-bold text-white">{SYMPOSIUM_NAME}</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            Welcome back, <br />
            <span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">Organizer.</span>
          </h1>
          <p className="mt-4 text-slate-300 text-sm leading-relaxed font-body">
            Access the coordinator and admin dashboard to manage events, registrations, and live updates.
          </p>
          <p className="mt-4 font-mono text-xs text-slate-400">
            {COLLEGE_NAME} • National Symposium
          </p>
        </div>
      </div>

      {/* Right side – login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 sm:px-12 relative">
        <div className="w-full max-w-md glass rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-depth bg-white">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="font-display text-2xl font-bold text-slate-900">Sign In</h2>
            <p className="mt-1 text-xs font-mono text-slate-500">Enter your credentials to access committee portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest font-bold text-slate-600">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs text-slate-900 outline-none transition shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                autoComplete="username"
                required
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest font-bold text-slate-600">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs text-slate-900 outline-none transition shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                autoComplete="current-password"
                required
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 font-mono text-xs text-rose-700">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-cyber w-full justify-center shadow-md py-3 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs font-mono text-slate-400">
            Protected • {COLLEGE_NAME} Symposium
          </p>
        </div>
      </div>
    </div>
  );
}