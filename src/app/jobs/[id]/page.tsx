"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Gift,
  Lock,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { fiverrApi, getAuthSession, isLoggedIn } from "@/lib/api";
import {
  awardJobBid,
  getStoredJobs,
  getUserCreditAccount,
  SEED_JOBS,
  submitJobBid,
  type JobProject,
} from "@/lib/jobs";

export default function JobBiddingDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = params?.id || SEED_JOBS[0].id;

  const initialFound = SEED_JOBS.find((j) => j.id === jobId) || null;
  const [job, setJob] = useState<JobProject | null>(initialFound);
  const [checkedStorage, setCheckedStorage] = useState<boolean>(Boolean(initialFound));
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("jordan_taylor");
  const [credits, setCredits] = useState<number>(100);
  const [roleView, setRoleView] = useState<"FREELANCER" | "CLIENT">("FREELANCER");
  const [awardedOrderId, setAwardedOrderId] = useState<string | null>(null);

  // Bid Form State
  const [bidAmount, setBidAmount] = useState<number>(
    initialFound ? Math.round((initialFound.budgetMin + initialFound.budgetMax) / 2) : 2500
  );
  const [bidDays, setBidDays] = useState<number>(initialFound?.deliveryDays ?? 14);
  const [bidMilestones, setBidMilestones] = useState<string>(
    "Milestone 1: Architecture & Setup | Milestone 2: Core Implementation & Tests | Milestone 3: Production Deploy"
  );
  const [bidProposal, setBidProposal] = useState<string>("");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    function sync() {
      const allJobs = getStoredJobs();
      const found = allJobs.find((j) => j.id === jobId) || null;
      setJob(found);
      setCheckedStorage(true);
      if (found) {
        setBidAmount(Math.round((found.budgetMin + found.budgetMax) / 2));
        setBidDays(found.deliveryDays);
      }
      const session = getAuthSession();
      setLoggedIn(isLoggedIn());
      setUsername(session.account.username);
      setCredits(getUserCreditAccount(session.account.username).credits);
    }

    sync();
    window.addEventListener("fiverrex-jobs-change", sync);
    window.addEventListener("fiverrex-credits-change", sync);
    window.addEventListener("fiverrex-session-change", sync);
    return () => {
      window.removeEventListener("fiverrex-jobs-change", sync);
      window.removeEventListener("fiverrex-credits-change", sync);
      window.removeEventListener("fiverrex-session-change", sync);
    };
  }, [jobId]);

  if (!job && checkedStorage) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-gray-900">Project Not Found</h1>
        <p className="mt-2 text-xs text-gray-600">
          We couldn&apos;t find a project matching <code className="font-mono">{jobId}</code>.
        </p>
        <Link
          href="/jobs"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1dbf73] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#19a463]"
        >
          <span>Browse All Open Projects</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (!job) {
    return <div className="mx-auto max-w-7xl px-4 py-12 text-xs text-gray-500">Loading project...</div>;
  }

  const activeJob = job;

  const userBid = activeJob.bids.find(
    (b) => b.bidderUsername.toLowerCase() === username.toLowerCase()
  );

  function handleSubmitBid(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    if (!loggedIn) {
      setFeedback({
        ok: false,
        text: "Please sign in or create a free account (comes with 100 Credits!) before bidding.",
      });
      return;
    }
    if (!bidProposal.trim()) {
      setFeedback({ ok: false, text: "Please write a proposal pitch explaining your approach." });
      return;
    }

    const session = getAuthSession();
    const res = submitJobBid({
      jobId: activeJob.id,
      bidderUsername: session.account.username,
      bidderName: session.displayName,
      bidderAvatar: session.avatarUrl,
      bidderLevel: "Verified Freelancer",
      amount: Number(bidAmount) || activeJob.budgetMin,
      deliveryDays: Number(bidDays) || activeJob.deliveryDays,
      proposal: bidProposal.trim(),
      milestones: bidMilestones.trim(),
    });

    if (!res.ok) {
      setFeedback({ ok: false, text: res.message });
      return;
    }

    if (res.job) setJob(res.job);
    setCredits(res.creditsRemaining);
    setBidProposal("");
    setFeedback({ ok: true, text: res.message });
  }

  async function handleAwardBid(bidId: string) {
    const winningBid = activeJob.bids.find((b) => b.id === bidId);
    const updated = awardJobBid(activeJob.id, bidId);
    if (updated) {
      setJob(updated);
      let createdOrderNumber = "";
      if (winningBid) {
        const order = await fiverrApi.createOrder({
          gigId: "gig-101",
          gigTitle: activeJob.title,
          sellerName: winningBid.bidderName,
          sellerUsername: winningBid.bidderUsername,
          packageTier: "Premium",
          requirements: `Awarded Job Contract (${activeJob.id}): ${winningBid.milestones || activeJob.description}`,
          amount: winningBid.amount,
          deliveryDays: winningBid.deliveryDays,
        });
        await Promise.all([
          fiverrApi.holdEscrow({
            orderId: order.id,
            grossAmount: winningBid.amount,
          }),
          fiverrApi.sendNotification({
            type: "ORDER_CREATED",
            title: `Job Awarded: ${order.orderNumber}`,
            message: `Escrow of $${winningBid.amount.toLocaleString()} locked for ${winningBid.bidderName} on "${activeJob.title}".`,
            channel: "IN_APP",
          }),
        ]);
        setAwardedOrderId(order.id);
        createdOrderNumber = order.orderNumber;
      }
      setFeedback({
        ok: true,
        text: createdOrderNumber
          ? `Project awarded to ${winningBid?.bidderName}! Escrow Order ${createdOrderNumber} created and locked.`
          : "Project awarded and escrow contract locked for the winning freelancer!",
      });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb + Client/Freelancer View Toggle */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <Link href="/" className="hover:text-[#1dbf73]">
            FIVERREX
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/jobs" className="hover:text-[#1dbf73]">
            Open Jobs
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate font-semibold text-gray-800">{job.category}</span>
        </nav>

        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setRoleView("FREELANCER")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              roleView === "FREELANCER"
                ? "bg-[#1dbf73] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Freelancer View (Bid)
          </button>
          <button
            type="button"
            onClick={() => setRoleView("CLIENT")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              roleView === "CLIENT"
                ? "bg-[#0a4226] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Client View (Award Contract)
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-bold ${
            feedback.ok
              ? "border-emerald-300 bg-emerald-50 text-emerald-950"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          <span>{feedback.text}</span>
          {feedback.ok && awardedOrderId && (
            <Link
              href={`/orders?order=${encodeURIComponent(awardedOrderId)}`}
              className="inline-flex items-center gap-1 rounded-lg bg-[#0a4226] px-3 py-1.5 text-white hover:bg-[#1dbf73]"
            >
              <span>View Escrow Order</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {!feedback.ok && loggedIn && (
            <Link
              href="/credits"
              className="inline-flex items-center gap-1 rounded-lg bg-[#1dbf73] px-3 py-1.5 text-white hover:bg-[#19a463]"
            >
              <Gift className="h-3.5 w-3.5" />
              <span>Earn +500 Credits</span>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Project Details + Proposals */}
        <div className="space-y-8 lg:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#0a4226]">
                {job.badge}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                {job.category}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  job.status === "OPEN"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {job.status}
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">
              {job.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-gray-200 pb-4 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
                <ShieldCheck className="h-4 w-4 text-[#1dbf73]" />
                {job.clientCompany} ({job.clientName})
              </span>
              <span>•</span>
              <span>Posted {job.postedAt}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                <Users className="h-3.5 w-3.5 text-indigo-600" />
                {job.bids.length} Proposals
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-4 text-xs sm:grid-cols-3">
              <div>
                <span className="text-gray-500">Client Budget</span>
                <p className="mt-0.5 text-base font-extrabold tabular-nums text-gray-900">
                  ${job.budgetMin.toLocaleString()} – ${job.budgetMax.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Target Timeline</span>
                <p className="mt-0.5 flex items-center gap-1 text-base font-extrabold text-gray-900">
                  <Clock className="h-4 w-4 text-[#1dbf73]" />
                  {job.deliveryDays} Days
                </p>
              </div>
              <div>
                <span className="text-gray-500">Bid Fee</span>
                <p className="mt-0.5 flex items-center gap-1 text-base font-extrabold text-amber-700">
                  <Coins className="h-4 w-4 text-amber-500" />
                  {job.bidCostCredits} Credits
                </p>
              </div>
            </div>

            <h2 className="mt-6 text-base font-bold text-gray-900">Project Scope</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{job.description}</p>

            <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-gray-500">
              Expected Deliverables
            </h3>
            <ul className="mt-3 space-y-2">
              {job.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1dbf73]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-1 text-xs font-bold text-[#0a4226]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Proposals / Bids List */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Submitted Proposals ({job.bids.length})
                </h2>
                <p className="text-xs text-gray-500">
                  Compare freelancer bids, timelines, and proposed milestones.
                </p>
              </div>
            </div>

            {job.bids.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                No proposals submitted yet. Be the first specialist to bid on this project!
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {job.bids.map((bid) => (
                  <div
                    key={bid.id}
                    className={`rounded-xl border p-4 ${
                      bid.status === "AWARDED"
                        ? "border-[#1dbf73] bg-emerald-50/50 ring-2 ring-[#1dbf73]/20"
                        : "border-gray-200 bg-gray-50/50"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={bid.bidderAvatar}
                          alt={bid.bidderName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-gray-900">
                              {bid.bidderName}
                            </span>
                            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-[#0a4226]">
                              {bid.bidderLevel}
                            </span>
                            {bid.status === "AWARDED" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#1dbf73] px-2.5 py-0.5 text-[10px] font-bold text-white">
                                <Award className="h-3 w-3" /> Winning Bid
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            @{bid.bidderUsername} • {bid.createdAt}
                          </p>
                        </div>
                      </div>

                      <div className="text-right tabular-nums">
                        <p className="text-lg font-extrabold text-gray-900">
                          ${bid.amount.toLocaleString()}
                        </p>
                        <p className="text-[11px] font-semibold text-gray-500">
                          in {bid.deliveryDays} days
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-gray-700">{bid.proposal}</p>

                    {bid.milestones && (
                      <div className="mt-3 rounded-lg bg-white px-3 py-2 text-[11px] font-medium text-gray-600">
                        <strong className="text-gray-800">Milestones:</strong> {bid.milestones}
                      </div>
                    )}

                    {roleView === "CLIENT" && job.status === "OPEN" && (
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAwardBid(bid.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a4226] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1dbf73]"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          <span>Award Contract &amp; Lock Escrow</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Bidding Form */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
            <div className="border-b border-gray-200 bg-[#0a4226] px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold">Submit Project Bid</h2>
                  <p className="text-[11px] text-emerald-200">
                    Proposal cost: {job.bidCostCredits} Credits
                  </p>
                </div>
                <Link
                  href="/credits"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white transition hover:bg-white/25"
                >
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  <span>{loggedIn ? `${credits} Credits` : "100 Free"}</span>
                </Link>
              </div>
            </div>

            <div className="p-6">
              {!loggedIn ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[#1dbf73]">
                    <Coins className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900">
                    Sign in to bid with 100 Free Credits
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-600">
                    Every new account starts with 100 Credits, and you earn +500 Credits for every
                    user you invite.
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <Link
                      href={`/register?next=${encodeURIComponent(`/jobs/${job.id}`)}`}
                      className="rounded-xl bg-[#1dbf73] py-2.5 text-xs font-bold text-white hover:bg-[#19a463]"
                    >
                      Join Free (+100)
                    </Link>
                    <Link
                      href={`/login?next=${encodeURIComponent(`/jobs/${job.id}`)}`}
                      className="rounded-xl border border-gray-300 py-2.5 text-xs font-bold text-gray-800 hover:bg-gray-50"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              ) : userBid ? (
                <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs">
                  <div className="flex items-center gap-2 font-extrabold text-[#0a4226]">
                    <CheckCircle2 className="h-4 w-4 text-[#1dbf73]" />
                    <span>Your Proposal is Active!</span>
                  </div>
                  <p className="text-gray-700">
                    Bid Amount: <strong>${userBid.amount.toLocaleString()}</strong> • Delivery:{" "}
                    <strong>{userBid.deliveryDays} days</strong>
                  </p>
                  <p className="text-gray-600">{userBid.proposal}</p>
                </div>
              ) : job.status !== "OPEN" ? (
                <div className="rounded-xl bg-amber-50 p-4 text-xs font-bold text-amber-900">
                  This project has already been awarded to a winning freelancer.
                </div>
              ) : (
                <form onSubmit={handleSubmitBid} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700">
                        Your Bid ($)
                      </label>
                      <input
                        type="number"
                        required
                        min={100}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-extrabold text-gray-900 focus:border-[#1dbf73] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700">
                        Delivery (Days)
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={bidDays}
                        onChange={(e) => setBidDays(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-extrabold text-gray-900 focus:border-[#1dbf73] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Proposed Milestones
                    </label>
                    <input
                      type="text"
                      value={bidMilestones}
                      onChange={(e) => setBidMilestones(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#1dbf73] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Proposal Pitch *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={bidProposal}
                      onChange={(e) => setBidProposal(e.target.value)}
                      placeholder="Explain your relevant experience, architecture plan, and why you are the best fit..."
                      className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-[#1dbf73] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1dbf73] py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#19a463]"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Bid ({job.bidCostCredits} Credits)</span>
                  </button>

                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 text-[11px] text-gray-600">
                    <span>Need more credits?</span>
                    <Link
                      href="/credits"
                      className="inline-flex items-center gap-1 font-bold text-[#1dbf73] hover:underline"
                    >
                      <span>Invite Friends (+500)</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
