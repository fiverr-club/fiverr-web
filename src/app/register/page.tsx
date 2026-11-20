"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Coins,
  Eye,
  EyeOff,
  Gift,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";
import { fiverrApi } from "@/lib/api";
import {
  initializeNewUserCredits,
  NEW_ACCOUNT_CREDITS,
  REFERRAL_REWARD_CREDITS,
} from "@/lib/jobs";

type RoleChoice = "BOTH" | "BUYER" | "SELLER";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [refCode, setRefCode] = useState<string>("");
  const [roleChoice, setRoleChoice] = useState<RoleChoice>("BOTH");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get("ref");
      if (refParam) {
        setRefCode(refParam.trim());
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim().replace(/^@/, "");
    if (cleanUsername.length < 3) {
      setErrorMsg("Username must be at least 3 characters.");
      return;
    }
    if (!email.trim().includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please check again.");
      return;
    }

    const roles =
      roleChoice === "BUYER"
        ? ["BUYER"]
        : roleChoice === "SELLER"
        ? ["SELLER"]
        : ["BUYER", "SELLER"];

    setSubmitting(true);
    try {
      const session = await fiverrApi.register({
        username: cleanUsername,
        email: email.trim(),
        password,
        displayName: displayName.trim() || undefined,
        roles,
      });
      const { referrerAwarded } = initializeNewUserCredits(
        session.account.username,
        refCode
      );
      setSuccessMsg(
        referrerAwarded
          ? `Account @${session.account.username} created with ${NEW_ACCOUNT_CREDITS} Credits! (@${referrerAwarded} earned +${REFERRAL_REWARD_CREDITS} Credits)`
          : `Account @${session.account.username} created with ${NEW_ACCOUNT_CREDITS} FREE Credits!`
      );
      const nextRaw =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")?.trim()
          : null;
      const safeNext =
        nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//")
          ? nextRaw
          : roleChoice === "SELLER"
          ? "/seller/dashboard"
          : "/jobs";
      setTimeout(() => {
        router.push(safeNext);
      }, 850);
    } catch {
      setErrorMsg("Unable to register account right now. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl lg:grid-cols-12">
        {/* Left Brand Panel */}
        <div className="flex flex-col justify-between bg-gradient-to-br from-[#0a4226] via-[#0d3b24] to-[#072617] p-8 text-white lg:col-span-5 lg:p-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>Join Free</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight">
              Start building on FIVERREX<span className="text-[#1dbf73]">.</span>
            </h1>

            <p className="text-sm leading-relaxed text-emerald-100/85">
              Create an account to hire top-rated architects, save services to your wishlist, or
              publish your own 3-tier gigs and receive escrow payouts.
            </p>

            <ul className="space-y-3 pt-2 text-xs text-emerald-50">
              <li className="flex items-center gap-2.5">
                <Coins className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  <strong>{NEW_ACCOUNT_CREDITS} Free Credits</strong> credited immediately on
                  sign-up
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Gift className="h-4 w-4 shrink-0 text-[#1dbf73]" />
                <span>
                  Earn <strong>+{REFERRAL_REWARD_CREDITS} Credits</strong> every time you invite a
                  user
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#1dbf73]" />
                <span>Protected Milestone Escrow on Every Order</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Briefcase className="h-4 w-4 shrink-0 text-[#1dbf73]" />
                <span>Bid on Projects &amp; Access Seller Studio</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 border-t border-white/15 pt-5 text-xs text-emerald-200">
            Want to learn how it works?{" "}
            <Link href="/about" className="font-bold text-white underline hover:text-[#1dbf73]">
              About FIVERREX →
            </Link>
          </div>
        </div>

        {/* Right Registration Form */}
        <div className="p-8 lg:col-span-7 lg:p-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Create a New Account</h2>
              <p className="mt-1 text-xs text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-[#1dbf73] hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#1dbf73]">
              <UserPlus className="h-5 w-5" />
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
            {/* Role Choice */}
            <div>
              <span className="block text-xs font-bold text-gray-700">I want to</span>
              <div className="mt-1.5 grid grid-cols-3 gap-2 text-xs font-bold">
                {[
                  { value: "BOTH" as const, label: "Buy & Sell" },
                  { value: "BUYER" as const, label: "Hire Talent" },
                  { value: "SELLER" as const, label: "Sell Services" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRoleChoice(opt.value)}
                    className={`rounded-xl border py-2.5 transition ${
                      roleChoice === opt.value
                        ? "border-[#1dbf73] bg-emerald-50 text-[#0a4226] ring-2 ring-[#1dbf73]/20"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-displayname" className="block text-xs font-bold text-gray-700">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reg-displayname"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Minh Nguyen"
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1dbf73] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-username" className="block text-xs font-bold text-gray-700">
                  Username *
                </label>
                <input
                  id="reg-username"
                  type="text"
                  required
                  minLength={3}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cloud_architect_99"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1dbf73] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-gray-700">
                Email Address *
              </label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@fiverrex.club"
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1dbf73] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-password" className="block text-xs font-bold text-gray-700">
                  Password (min 8 chars) *
                </label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
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

              <div>
                <label htmlFor="reg-confirm" className="block text-xs font-bold text-gray-700">
                  Confirm Password *
                </label>
                <input
                  id="reg-confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1dbf73] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-ref" className="block text-xs font-bold text-gray-700">
                Referral Code (Optional — awards +{REFERRAL_REWARD_CREDITS} Credits to inviter)
              </label>
              <input
                id="reg-ref"
                type="text"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                placeholder="e.g. FIV-JORDANTAYLOR"
                className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs font-mono uppercase text-gray-900 placeholder-gray-400 focus:border-[#1dbf73] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1dbf73] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#19a463] disabled:opacity-50"
            >
              <span>
                {submitting
                  ? "Creating Account..."
                  : `Create Account & Claim ${NEW_ACCOUNT_CREDITS} Credits`}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
