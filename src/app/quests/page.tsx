"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Coins, Gift, Sparkles, Trophy, UserPlus } from "lucide-react";
import { getAuthSession, isLoggedIn } from "@/lib/api";
import {
  CREDIT_QUESTS,
  getUserCreditAccount,
  NEW_ACCOUNT_CREDITS,
  REFERRAL_REWARD_CREDITS,
  TELEGRAM_COMMUNITY_URL,
  type UserCreditAccount,
} from "@/lib/jobs";
import { QuestsBoard } from "@/components/QuestsBoard";

export default function QuestsPage() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [account, setAccount] = useState<UserCreditAccount>(() =>
    getUserCreditAccount("jordan_taylor")
  );

  useEffect(() => {
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

  const completedCount = Object.keys(account.completedQuests || {}).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-[#0a4226] via-[#0d3b24] to-[#072617] p-8 text-white shadow-lg">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Trophy className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>FIVERREX Quests &amp; Community Missions</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Complete Quests, Invite to{" "}
              <span className="text-[#1dbf73]">Telegram DevCommunity101</span> &amp; Earn Credits
            </h1>
            <p className="text-sm text-emerald-100/85">
              Join our developer Telegram community at{" "}
              <a
                href={TELEGRAM_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-white underline hover:text-[#1dbf73]"
              >
                {TELEGRAM_COMMUNITY_URL}
              </a>{" "}
              and invite your friends to unlock <strong className="text-white">+500 Credits</strong>{" "}
              instantly for bidding on 500 live freelance projects.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <Link
                href="/credits"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20"
              >
                <UserPlus className="h-3.5 w-3.5 text-[#1dbf73]" />
                <span>Referral Hub (+{REFERRAL_REWARD_CREDITS} / User)</span>
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1dbf73] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#19a463]"
              >
                <span>Bid on 500 Jobs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
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
              <span className="text-xs font-semibold text-emerald-200">Missions Done</span>
              <p className="mt-1 flex items-center gap-2 text-3xl font-extrabold tabular-nums text-[#1dbf73]">
                <Gift className="h-6 w-6" />
                <span>
                  {loggedIn ? completedCount : 0}/{CREDIT_QUESTS.length}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {!loggedIn && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#1dbf73]" />
            <div>
              <p className="text-sm font-extrabold text-gray-900">
                Sign in or create a free account ({NEW_ACCOUNT_CREDITS} Starter Credits) to claim
                mission rewards!
              </p>
              <p className="text-xs text-gray-600">
                Mission completions and Telegram rewards are credited straight to your FIVERREX
                account balance.
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
              Join Free (+{NEW_ACCOUNT_CREDITS} Credits)
            </Link>
          </div>
        </div>
      )}

      <QuestsBoard account={account} loggedIn={loggedIn} onAccountUpdated={setAccount} />
    </div>
  );
}
