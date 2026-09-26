"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Image from "next/image";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SYMPOSIUM_NAME, COLLEGE_NAME } from "@/lib/eventsConfig";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanUsername = username.trim();

    try {
      const res = await signIn("credentials", {
        username: cleanUsername,
        password,
        redirect: false,
      });

      if (res?.error) {
        setLoading(false);
        setError("Incorrect username or password. Please verify your credentials.");
        return;
      }

      // Check callback URL if user was redirected from a protected page
      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
      if (callbackUrl) {
        window.location.href = callbackUrl;
        return;
      }

      // Read session to navigate to correct dashboard
      const session = await getSession();
      const role = (session?.user as any)?.role;

      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "coordinator") {
        window.location.href = "/coordinators";
      } else {
        window.location.href = "/admin";
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "An error occurred during sign in. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#FAF9F5] text-slate-900">
      {/* Left side – branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 to-indigo-950 relative overflow-hidden items-center justify-center p-12 text-white">
        <div className="absolute inset-0 bg-sky-500/10" />
        <div className="cyber-orb top-1/4 left-1/4 w-96 h-96 bg-sky-500/20" />
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-5 mb-8">
            <div className="relative h-24 w-24 shrink-0 rounded-2xl overflow-hidden ring-2 ring-sky-400/40 shadow-2xl shadow-sky-500/30 bg-slate-950 flex items-center justify-center p-2 group">
              <Image
                src="/logos/sympo2.0.jpeg"
                alt="Innovation Ignite Symposium 2.0 Logo"
                width={96}
                height={96}
                className="h-full w-full object-contain rounded-xl drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-display text-2xl xl:text-3xl font-extrabold text-white leading-tight tracking-tight">
                Innovation Ignite
              </span>
              <span className="font-display text-xl xl:text-2xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent leading-tight mt-1">
                Symposium 2.0
              </span>
            </div>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
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
          {/* Mobile Logo Branding Header */}
          <div className="lg:hidden flex items-center justify-center gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden ring-2 ring-sky-400/30 shadow-md bg-slate-950 flex items-center justify-center p-1.5">
              <Image
                src="/logos/sympo2.0.jpeg"
                alt="Innovation Ignite Symposium 2.0 Logo"
                width={64}
                height={64}
                className="h-full w-full object-contain rounded-lg"
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-display text-lg font-bold text-slate-900 leading-tight">
                Innovation Ignite
              </span>
              <span className="font-display text-base font-bold text-sky-600 leading-tight">
                Symposium 2.0
              </span>
            </div>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="font-display text-2xl font-bold text-slate-900">Sign In</h2>
            <p className="mt-1 text-xs font-mono text-slate-500">Enter your credentials to access committee portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest font-bold text-slate-600">
                Username or Email
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs text-slate-900 outline-none transition shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                placeholder="Enter username or email"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest font-bold text-slate-600">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 font-mono text-xs text-slate-900 outline-none transition shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  autoComplete="current-password"
                  required
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 font-mono text-xs text-rose-700">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
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