"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  DEFAULT_AUTH_ACCOUNTS,
  buildSessionForAccount,
  fiverrApi,
  setAuthSession,
  type AuthAccountDto,
} from "@/lib/api";

function getSafeNextPath(fallback = "/"): string {
  if (typeof window === "undefined") return fallback;
  const raw = new URLSearchParams(window.location.search).get("next")?.trim();
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }
  return fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!identifier.trim()) {
      setErrorMsg("Please enter your username or email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const session = await fiverrApi.login({
        emailOrUsername: identifier.trim(),
        password,
      });
      setSuccessMsg(`Welcome back, ${session.displayName}! Redirecting...`);
      const nextPath = getSafeNextPath("/");
      setTimeout(() => {
        router.push(nextPath);
      }, 600);
    } catch {
      setErrorMsg("Unable to sign in right now. Please try again.");
      setSubmitting(false);
    }
  }

  function handleQuickDemoLogin(acc: AuthAccountDto) {
    setErrorMsg(null);
    const session = buildSessionForAccount(acc, `jwt-${acc.id}`, `refresh-${acc.id}`);
    setAuthSession(session);
    setSuccessMsg(`Signed in as @${acc.username}. Redirecting...`);
    const nextPath = getSafeNextPath("/");
    setTimeout(() => {
      router.push(nextPath);
    }, 500);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl lg:grid-cols-12">
        {/* Left Brand Panel */}
        <div className="flex flex-col justify-between bg-gradient-to-br from-[#0a4226] via-[#0d3b24] to-[#072617] p-8 text-white lg:col-span-5 lg:p-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>Welcome Back</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight">
              Sign in to FIVERREX<span className="text-[#1dbf73]">.</span>
            </h1>

            <p className="text-sm leading-relaxed text-emerald-100/85">
              Access your escrow orders, real-time inbox conversations, saved wishlist, and Seller
              Studio wallet in one place.
            </p>

            <ul className="space-y-3 pt-2 text-xs text-emerald-50">
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#1dbf73]" />
                <span>100% Milestone Escrow Protection</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1dbf73]" />
                <span>Instant Custom Offers &amp; Delivery Tracking</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Users className="h-4 w-4 shrink-0 text-[#1dbf73]" />
                <span>Seamless Buyer &amp; Seller Role Switching</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 border-t border-white/15 pt-5 text-xs text-emerald-200">
            New to the platform?{" "}
            <Link href="/about" className="font-bold text-white underline hover:text-[#1dbf73]">
              Learn about FIVERREX →
            </Link>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 lg:col-span-7 lg:p-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Sign In to Your Account</h2>
              <p className="mt-1 text-xs text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-bold text-[#1dbf73] hover:underline">
                  Create a free account
                </Link>
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#1dbf73]">
              <KeyRound className="h-5 w-5" />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1dbf73]" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-identifier" className="block text-xs font-bold text-gray-700">
                Username or Email
              </label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="login-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. alex_architect or alex@fiverrex.club"
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1dbf73] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1dbf73] focus:outline-none"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1dbf73] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#19a463] disabled:opacity-50"
            >
              <span>{submitting ? "Signing In..." : "Sign In"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* 1-Click Demo Quick Access */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Quick Demo Sign-In (1-Click)
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {DEFAULT_AUTH_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(acc)}
                  className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-left transition hover:border-[#1dbf73] hover:bg-emerald-50/40"
                >
                  <p className="truncate text-xs font-extrabold text-gray-900">@{acc.username}</p>
                  <p className="mt-0.5 truncate text-[11px] text-gray-500">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
