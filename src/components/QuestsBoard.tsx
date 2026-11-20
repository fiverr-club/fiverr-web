"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Coins,
  ExternalLink,
  Gift,
  Send,
  Share2,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  completeCreditQuest,
  CREDIT_QUESTS,
  type CreditQuest,
  type UserCreditAccount,
} from "@/lib/jobs";

interface QuestsBoardProps {
  account: UserCreditAccount;
  loggedIn: boolean;
  onAccountUpdated: (updated: UserCreditAccount) => void;
  compactHeader?: boolean;
}

export function QuestsBoard({
  account,
  loggedIn,
  onAccountUpdated,
  compactHeader = false,
}: QuestsBoardProps) {
  const [proofInputs, setProofInputs] = useState<Record<string, string>>({});
  const [openedQuestUrls, setOpenedQuestUrls] = useState<Record<string, boolean>>({});
  const [feedbackByQuest, setFeedbackByQuest] = useState<
    Record<string, { ok: boolean; text: string }>
  >({});

  const completedMap = account.completedQuests || {};
  const completedCount = CREDIT_QUESTS.filter((q) => Boolean(completedMap[q.id])).length;
  const totalAvailableCredits = CREDIT_QUESTS.reduce((sum, q) => sum + q.rewardCredits, 0);
  const earnedQuestCredits = CREDIT_QUESTS.reduce(
    (sum, q) => sum + (completedMap[q.id] ? q.rewardCredits : 0),
    0
  );
  const progressPct = Math.round((completedCount / CREDIT_QUESTS.length) * 100);

  function handleClaim(quest: CreditQuest) {
    if (!loggedIn) {
      setFeedbackByQuest((prev) => ({
        ...prev,
        [quest.id]: {
          ok: false,
          text: "Please sign in or create a free account first to claim mission credits.",
        },
      }));
      return;
    }

    const res = completeCreditQuest(account.username, quest.id, proofInputs[quest.id]);
    onAccountUpdated(res.account);
    setFeedbackByQuest((prev) => ({
      ...prev,
      [quest.id]: { ok: res.ok, text: res.message },
    }));
  }

  return (
    <section id="quests" className="space-y-6">
      {/* Progress & Header Banner */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#0a4226]">
              <Trophy className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>Missions &amp; Quests</span>
            </div>
            <h2
              className={`mt-2 font-extrabold text-gray-900 ${
                compactHeader ? "text-xl" : "text-2xl"
              }`}
            >
              Complete Missions to Earn up to{" "}
              <span className="text-[#1dbf73]">+{totalAvailableCredits} Credits</span>
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Join our Telegram community, submit proposals, invite friends, and unlock instant
              bidding credits.
            </p>
          </div>

          <div className="min-w-[220px] rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-gray-800">
              <span>
                {completedCount} / {CREDIT_QUESTS.length} Completed
              </span>
              <span className="tabular-nums text-[#1dbf73]">
                {earnedQuestCredits} / {totalAvailableCredits} Credits
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
              <div
                className="h-full rounded-full bg-[#1dbf73] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mission Cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {CREDIT_QUESTS.map((quest, idx) => {
          const completion = completedMap[quest.id];
          const isCompleted = Boolean(completion);
          const isFeatured = idx === 0;
          const feedback = feedbackByQuest[quest.id];
          const opened = Boolean(openedQuestUrls[quest.id]);

          return (
            <div
              key={quest.id}
              className={`flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition ${
                isFeatured ? "lg:col-span-2" : ""
              } ${
                isCompleted
                  ? "border-emerald-300 bg-emerald-50/40"
                  : isFeatured
                  ? "border-emerald-300 bg-gradient-to-br from-white via-emerald-50/30 to-sky-50/40"
                  : "border-gray-200 bg-white hover:border-emerald-200"
              }`}
            >
              <div>
                {/* Top Meta Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#0a4226] px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {quest.badge}
                    </span>
                    <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                      {quest.category}
                    </span>
                    {opened && !isCompleted && (
                      <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-800">
                        Link Opened
                      </span>
                    )}
                  </div>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#1dbf73] px-3 py-1 text-xs font-extrabold text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Claimed +{quest.rewardCredits} Credits</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-extrabold tabular-nums text-amber-900">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      <span>+{quest.rewardCredits} Credits</span>
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[#1dbf73]">
                  {quest.subtitle}
                </p>
                <h3 className="mt-0.5 text-lg font-extrabold text-gray-900">{quest.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{quest.description}</p>

                {/* Steps */}
                <ul className="mt-4 space-y-1.5 rounded-xl border border-gray-200/80 bg-white/80 p-3.5 text-xs text-gray-700">
                  {quest.steps.map((step, stepIdx) => (
                    <li key={stepIdx} className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-extrabold text-[#0a4226]">
                        {stepIdx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>

                {/* Feedback Alert */}
                {feedback && (
                  <div
                    className={`mt-4 flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold ${
                      feedback.ok
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {feedback.ok ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1dbf73]" />
                    ) : (
                      <Sparkles className="h-4 w-4 shrink-0" />
                    )}
                    <span>{feedback.text}</span>
                  </div>
                )}

                {isCompleted && completion?.proof && (
                  <p className="mt-3 text-xs font-semibold text-emerald-800">
                    Verified with: <span className="font-mono">{completion.proof}</span>
                  </p>
                )}
              </div>

              {/* Action Controls */}
              <div className="mt-5 space-y-3 border-t border-gray-200/70 pt-4">
                {!isCompleted && quest.proofLabel && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      {quest.proofLabel}
                    </label>
                    <input
                      type="text"
                      value={proofInputs[quest.id] || ""}
                      onChange={(e) =>
                        setProofInputs((prev) => ({
                          ...prev,
                          [quest.id]: e.target.value,
                        }))
                      }
                      placeholder={quest.proofPlaceholder || "Enter details"}
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-900 focus:border-[#1dbf73] focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2.5">
                  {quest.external ? (
                    <a
                      href={quest.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        setOpenedQuestUrls((prev) => ({ ...prev, [quest.id]: true }))
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2.5 text-xs font-bold text-sky-900 transition hover:bg-sky-100"
                    >
                      <Send className="h-3.5 w-3.5 text-sky-600" />
                      <span>{quest.actionLabel}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <Link
                      href={quest.actionUrl}
                      onClick={() =>
                        setOpenedQuestUrls((prev) => ({ ...prev, [quest.id]: true }))
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-800 transition hover:border-[#1dbf73] hover:text-[#1dbf73]"
                    >
                      <span>{quest.actionLabel}</span>
                    </Link>
                  )}

                  {quest.shareUrl && (
                    <a
                      href={quest.shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        setOpenedQuestUrls((prev) => ({ ...prev, [quest.id]: true }))
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-xs font-bold text-[#0a4226] transition hover:bg-emerald-50"
                    >
                      <Share2 className="h-3.5 w-3.5 text-[#1dbf73]" />
                      <span>Invite Friends on Telegram</span>
                    </a>
                  )}

                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleClaim(quest)}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-[#1dbf73] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#19a463]"
                    >
                      <Gift className="h-3.5 w-3.5" />
                      <span>Verify &amp; Claim +{quest.rewardCredits} Credits</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
