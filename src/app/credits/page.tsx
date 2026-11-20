"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  Gift,
  Send,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { getAuthSession, isLoggedIn } from "@/lib/api";
import {
  CREDIT_QUESTS,
  getUserCreditAccount,
  inviteFriendForCredits,
  NEW_ACCOUNT_CREDITS,
  REFERRAL_REWARD_CREDITS,
  type UserCreditAccount,
} from "@/lib/jobs";
import { QuestsBoard } from "@/components/QuestsBoard";

export default function CreditsAndReferralsPage() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [account, setAccount] = useState<UserCreditAccount>(() =>
    getUserCreditAccount("jordan_taylor")
  );
  const [friendName, setFriendName] = useState<string>("");
  const [friendEmail, setFriendEmail] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [inviteFeedback, setInviteFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [origin, setOrigin] = useState<string>("https://fiverrex.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }

    function sync() {
      const session = getAuthSession();
      setLoggedIn(isLoggedIn());
      setAccount(getUserCreditAccount(session.account.username));
    }

    sync();
    window.addEventListener("fiverrex-credits-change", sync);
    window.addEventListener("fiverrex-session-change", sync);
    return () => {
      window.removeEventListener("fiverrex-credits-change", sync);
      window.removeEventListener("fiverrex-session-change", sync);
    };
  }, []);

  const referralUrl = `${origin}/register?ref=${account.referralCode}`;

  function handleCopyLink() {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInviteFeedback(null);
    if (!loggedIn) {
      setInviteFeedback({
        ok: false,
        text: "Please sign in or register first so referral credits are added to your account.",
      });
      return;
    }

    const res = inviteFriendForCredits(account.username, friendEmail, friendName);
    setAccount(res.account);
    setInviteFeedback({ ok: res.ok, text: res.message });
    if (res.ok) {
      setFriendName("");
      setFriendEmail("");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-[#0a4226] via-[#0d3b24] to-[#072617] p-8 text-white shadow-lg">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Gift className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>FIVERREX Credits &amp; Referral Rewards</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Start with <span className="text-[#1dbf73]">{NEW_ACCOUNT_CREDITS} Credits</span>.
              Earn <span className="text-[#1dbf73]">+{REFERRAL_REWARD_CREDITS}</span> per invite.
            </h1>
            <p className="text-sm text-emerald-100/85">
              Use credits to bid on high-value freelance projects. New accounts receive{" "}
              {NEW_ACCOUNT_CREDITS} credits automatically, and each user you invite rewards your
              wallet with +{REFERRAL_REWARD_CREDITS} credits.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 backdrop-blur">
              <span className="text-xs font-semibold text-emerald-200">Available Credits</span>
              <p className="mt-1 flex items-center gap-2 text-3xl font-extrabold tabular-nums text-white">
                <Coins className="h-6 w-6 text-amber-400" />
                <span>{loggedIn ? account.credits : NEW_ACCOUNT_CREDITS}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 backdrop-blur">
              <span className="text-xs font-semibold text-emerald-200">Users Invited</span>
              <p className="mt-1 flex items-center gap-2 text-3xl font-extrabold tabular-nums text-[#1dbf73]">
                <Users className="h-6 w-6" />
                <span>{loggedIn ? account.invitedCount : 0}</span>
              </p>
            </div>
            <Link
              href="#quests"
              className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 backdrop-blur transition hover:bg-white/15"
            >
              <span className="text-xs font-semibold text-emerald-200">Quests Done</span>
              <p className="mt-1 flex items-center gap-2 text-3xl font-extrabold tabular-nums text-amber-300">
                <Trophy className="h-6 w-6" />
                <span>
                  {loggedIn ? Object.keys(account.completedQuests || {}).length : 0}/
                  {CREDIT_QUESTS.length}
                </span>
              </p>
            </Link>
          </div>
        </div>
      </div>

      {!loggedIn && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#1dbf73]" />
            <div>
              <p className="text-sm font-extrabold text-gray-900">
                Create a free account to claim your {NEW_ACCOUNT_CREDITS} Starter Credits!
              </p>
              <p className="text-xs text-gray-600">
                Sign in or register to unlock your personal referral link and start bidding on
                projects.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Link
              href="/login"
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-800 hover:bg-gray-50"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-[#1dbf73] px-4 py-2 text-xs font-bold text-white hover:bg-[#19a463]"
            >
              Join Free (+100 Credits)
            </Link>
          </div>
        </div>
      )}

      <div id="invite-section" className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Referral Link & Invite Form */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-gray-900">
              Share Your Referral Link (+{REFERRAL_REWARD_CREDITS} Credits / User)
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Share this link with friends or teammates. When they sign up using your referral code,
              you earn +{REFERRAL_REWARD_CREDITS} credits and they start with{" "}
              {NEW_ACCOUNT_CREDITS} credits.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 font-mono text-xs text-gray-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0a4226] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#1dbf73]"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              Referral Code: <strong className="font-mono text-gray-900">{account.referralCode}</strong>
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#1dbf73]" />
              <h2 className="text-lg font-extrabold text-gray-900">
                Invite a User Directly (+{REFERRAL_REWARD_CREDITS} Credits)
              </h2>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Send an invitation by email to instantly credit +{REFERRAL_REWARD_CREDITS} bonus
              bidding credits to your account.
            </p>

            {inviteFeedback && (
              <div
                className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold ${
                  inviteFeedback.ok
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{inviteFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700">Friend&apos;s Name</label>
                <input
                  type="text"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="e.g. Linh Tran"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#1dbf73] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Friend&apos;s Email *
                </label>
                <input
                  type="email"
                  required
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#1dbf73] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1dbf73] py-3 text-xs font-bold text-white transition hover:bg-[#19a463]"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send Invite &amp; Claim +{REFERRAL_REWARD_CREDITS} Credits</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: Invited Users & Credit Transaction Ledger */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-extrabold text-gray-900">
                Invited Users ({account.invites.length})
              </h2>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1dbf73] hover:underline"
              >
                <span>Spend Credits on Jobs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {account.invites.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-500">
                No invited users yet. Invite your first friend to earn +{REFERRAL_REWARD_CREDITS}{" "}
                Credits!
              </p>
            ) : (
              <div className="mt-3 divide-y divide-gray-100">
                {account.invites.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-3 text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{inv.name}</p>
                      <p className="text-[11px] text-gray-500">{inv.email}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 font-bold text-[#1dbf73]">
                      +{inv.rewardCredits} Credits
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="border-b border-gray-100 pb-3 text-base font-extrabold text-gray-900">
              Credit Ledger ({account.history.length})
            </h2>
            <div className="mt-3 max-h-80 divide-y divide-gray-100 overflow-y-auto">
              {account.history.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-3 py-3 text-xs"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{tx.description}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(tx.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-extrabold tabular-nums ${
                      tx.amount >= 0 ? "text-[#1dbf73]" : "text-rose-600"
                    }`}
                  >
                    {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Missions & Quests Hub (Telegram +500 Credits & More) */}
      <div className="mt-10">
        <QuestsBoard
          account={account}
          loggedIn={loggedIn}
          onAccountUpdated={setAccount}
          compactHeader
        />
      </div>
    </div>
  );
}
