"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Gift,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { CATEGORIES, getAuthSession, isLoggedIn } from "@/lib/api";
import {
  createNewJob,
  getStoredJobs,
  getUserCreditAccount,
  NEW_ACCOUNT_CREDITS,
  REFERRAL_REWARD_CREDITS,
  type JobProject,
} from "@/lib/jobs";

type JobSort = "NEWEST" | "BUDGET_DESC" | "FEWEST_BIDS";
const PAGE_SIZE = 20;

export default function JobsMarketplacePage() {
  const [jobs, setJobs] = useState<JobProject[]>([]);
  const [credits, setCredits] = useState<number>(NEW_ACCOUNT_CREDITS);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("jordan_taylor");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [minBudget, setMinBudget] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "MY_BIDS" | "AWARDED">("ALL");
  const [sortBy, setSortBy] = useState<JobSort>("NEWEST");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Post a Project Modal
  const [postModalOpen, setPostModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("AI Services");
  const [newBudgetMin, setNewBudgetMin] = useState<number>(2000);
  const [newBudgetMax, setNewBudgetMax] = useState<number>(4500);
  const [newDays, setNewDays] = useState<number>(10);
  const [newBidCost, setNewBidCost] = useState<number>(10);
  const [newSkills, setNewSkills] = useState<string>("Next.js 15, TypeScript, Spring Boot");
  const [newDesc, setNewDesc] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    function syncState() {
      const activeSession = getAuthSession();
      const userLoggedIn = isLoggedIn();
      setLoggedIn(userLoggedIn);
      setUsername(activeSession.account.username);
      setJobs(getStoredJobs());
      setCredits(getUserCreditAccount(activeSession.account.username).credits);
    }

    syncState();
    window.addEventListener("fiverrex-jobs-change", syncState);
    window.addEventListener("fiverrex-credits-change", syncState);
    window.addEventListener("fiverrex-session-change", syncState);
    return () => {
      window.removeEventListener("fiverrex-jobs-change", syncState);
      window.removeEventListener("fiverrex-credits-change", syncState);
      window.removeEventListener("fiverrex-session-change", syncState);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPostModalOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredJobs = useMemo(() => {
    const filtered = jobs.filter((job) => {
      if (selectedCategory !== "All Categories" && job.category !== selectedCategory) {
        return false;
      }
      if (job.budgetMax < minBudget) {
        return false;
      }
      if (statusFilter === "OPEN" && job.status !== "OPEN") {
        return false;
      }
      if (statusFilter === "AWARDED" && job.status !== "AWARDED") {
        return false;
      }
      if (
        statusFilter === "MY_BIDS" &&
        !job.bids.some((b) => b.bidderUsername.toLowerCase() === username.toLowerCase())
      ) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const hitTitle = job.title.toLowerCase().includes(q);
        const hitDesc = job.description.toLowerCase().includes(q);
        const hitSkills = job.skills.some((s) => s.toLowerCase().includes(q));
        const hitCompany = job.clientCompany.toLowerCase().includes(q);
        return hitTitle || hitDesc || hitSkills || hitCompany;
      }
      return true;
    });

    const sorted = [...filtered];
    if (sortBy === "BUDGET_DESC") {
      sorted.sort((a, b) => b.budgetMax - a.budgetMax);
    } else if (sortBy === "FEWEST_BIDS") {
      sorted.sort((a, b) => a.bids.length - b.bids.length);
    }
    return sorted;
  }, [jobs, selectedCategory, minBudget, statusFilter, searchQuery, sortBy, username]);

  const totalEscrowPool = useMemo(
    () => jobs.filter((j) => j.status === "OPEN").reduce((sum, j) => sum + j.budgetMax, 0),
    [jobs]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, minBudget, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const paginatedJobs = useMemo(
    () => filteredJobs.slice(startIdx, startIdx + PAGE_SIZE),
    [filteredJobs, startIdx]
  );

  function goToPage(page: number) {
    const next = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    const session = getAuthSession();
    const created = createNewJob({
      title: newTitle.trim(),
      category: newCategory,
      budgetMin: Number(newBudgetMin) || 1000,
      budgetMax: Math.max(Number(newBudgetMax) || 2000, Number(newBudgetMin) || 1000),
      deliveryDays: Number(newDays) || 7,
      bidCostCredits: Number(newBidCost) || 10,
      badge: "New Project",
      clientName: loggedIn ? session.displayName : "Enterprise Client",
      clientCompany: "FIVERREX Verified Client",
      clientVerified: true,
      description: newDesc.trim(),
      deliverables: [
        "Production-ready architecture & source code",
        "Automated tests and deployment verification",
        "Handoff documentation & walkthrough",
      ],
      skills: newSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });

    setJobs(getStoredJobs());
    setNewTitle("");
    setNewDesc("");
    setPostModalOpen(false);
    setToastMsg(`Project "${created.title}" published for freelancer bidding!`);
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#0a4226] via-[#0d3b24] to-[#072617] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 text-[#1dbf73]" />
                <span>Open Projects &amp; Competitive Bidding Board</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Bid on high-value <span className="italic text-[#1dbf73]">tech &amp; AI</span>{" "}
                projects.
              </h1>

              <p className="text-sm leading-relaxed text-emerald-100/85 sm:text-base">
                Submit tailored proposals on verified client projects with milestone escrow
                protection. Every new account starts with{" "}
                <strong className="text-white">{NEW_ACCOUNT_CREDITS} free credits</strong> — and
                each invited friend earns you{" "}
                <strong className="text-[#1dbf73]">+{REFERRAL_REWARD_CREDITS} credits</strong>!
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setPostModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1dbf73] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#19a463]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Post a Project for Bids</span>
                </button>
                <Link
                  href="/credits"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  <Gift className="h-4 w-4 text-[#1dbf73]" />
                  <span>Invite Friends (+500 Credits)</span>
                </Link>
                <Link
                  href="/quests"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-400/15 px-5 py-2.5 text-xs font-bold text-amber-100 transition hover:bg-amber-400/25"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Telegram Quests (+500 Credits)</span>
                </Link>
              </div>
            </div>

            {/* Stats & Credits Card */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[440px] lg:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <span className="text-[11px] font-semibold text-emerald-200">Open Projects</span>
                <p className="mt-1 text-2xl font-extrabold tabular-nums text-white">
                  {jobs.filter((j) => j.status === "OPEN").length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <span className="text-[11px] font-semibold text-emerald-200">Budget Pool</span>
                <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#1dbf73]">
                  ${totalEscrowPool.toLocaleString()}
                </p>
              </div>
              <div className="col-span-2 rounded-2xl border border-emerald-400/30 bg-black/25 p-4 backdrop-blur sm:col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-200">
                      {loggedIn ? `Your Credits (@${username})` : "New Account Starter"}
                    </span>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xl font-extrabold tabular-nums text-white">
                      <Coins className="h-5 w-5 text-amber-400" />
                      <span>{loggedIn ? credits : NEW_ACCOUNT_CREDITS} Credits</span>
                    </p>
                  </div>
                  <Link
                    href={loggedIn ? "/credits" : "/register"}
                    className="rounded-lg bg-[#1dbf73] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#19a463]"
                  >
                    {loggedIn ? "+500 / Invite" : "Claim 100 Free"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Filter & Jobs List */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {toastMsg && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-950">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#1dbf73]" />
              <span>{toastMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMsg(null)}
              className="text-emerald-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="mb-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 md:col-span-5">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title, skill (LangGraph, Spring Boot, Figma)..."
                className="w-full bg-transparent text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <select
              aria-label="Filter jobs by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-[#1dbf73] focus:outline-none md:col-span-3"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter jobs by minimum budget"
              value={minBudget}
              onChange={(e) => setMinBudget(Number(e.target.value))}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-[#1dbf73] focus:outline-none md:col-span-2"
            >
              <option value={0}>Any Budget</option>
              <option value={2500}>$2,500+ Projects</option>
              <option value={4000}>$4,000+ Projects</option>
              <option value={6000}>$6,000+ Projects</option>
            </select>

            <select
              aria-label="Sort jobs"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as JobSort)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-[#1dbf73] focus:outline-none md:col-span-2"
            >
              <option value="NEWEST">Newest First</option>
              <option value="BUDGET_DESC">Highest Budget</option>
              <option value="FEWEST_BIDS">Fewest Bids</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "ALL" as const, label: "All Projects" },
                { key: "OPEN" as const, label: "Open for Bids" },
                { key: "MY_BIDS" as const, label: "My Submitted Bids" },
                { key: "AWARDED" as const, label: "Awarded" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                    statusFilter === tab.key
                      ? "bg-[#1dbf73] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold tabular-nums text-gray-500">
              Showing{" "}
              <strong className="text-gray-900">
                {filteredJobs.length === 0
                  ? 0
                  : `${startIdx + 1}–${Math.min(startIdx + PAGE_SIZE, filteredJobs.length)}`}
              </strong>{" "}
              of <strong className="text-gray-900">{filteredJobs.length}</strong> projects
            </span>
          </div>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-base font-bold text-gray-800">
              No projects match your current filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
                setMinBudget(0);
                setStatusFilter("ALL");
              }}
              className="mt-3 rounded-lg bg-[#1dbf73] px-4 py-2 text-xs font-bold text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {paginatedJobs.map((job) => {
              const userAlreadyBid = job.bids.some(
                (b) => b.bidderUsername.toLowerCase() === username.toLowerCase()
              );
              return (
                <div
                  key={job.id}
                  className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#0a4226]">
                          {job.badge}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
                          {job.category}
                        </span>
                        {job.status === "AWARDED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                            <Award className="h-3 w-3" /> Awarded
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-gray-400">
                        {job.postedAt}
                      </span>
                    </div>

                    <Link
                      href={`/jobs/${job.id}`}
                      className="mt-3 block text-lg font-extrabold leading-snug text-gray-900 transition hover:text-[#1dbf73]"
                    >
                      {job.title}
                    </Link>

                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-600">
                      {job.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 space-y-4 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3 text-xs tabular-nums">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-gray-400">
                          Budget Range
                        </span>
                        <span className="font-extrabold text-gray-900">
                          ${job.budgetMin.toLocaleString()}–${job.budgetMax.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-gray-400">
                          Timeline
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                          <Clock className="h-3.5 w-3.5 text-[#1dbf73]" />
                          {job.deliveryDays} Days
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-gray-400">
                          Proposals
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                          <Users className="h-3.5 w-3.5 text-indigo-600" />
                          {job.bids.length} bids
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <ShieldCheck className="h-4 w-4 text-[#1dbf73]" />
                        <span className="font-semibold text-gray-800">{job.clientCompany}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                          <Coins className="h-3.5 w-3.5 text-amber-500" />
                          {job.bidCostCredits} Credits to Bid
                        </span>
                      </div>

                      <Link
                        href={`/jobs/${job.id}`}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                          userAlreadyBid
                            ? "border border-[#1dbf73] bg-emerald-50 text-[#0a4226] hover:bg-emerald-100"
                            : "bg-[#1dbf73] text-white hover:bg-[#19a463]"
                        }`}
                      >
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>
                          {userAlreadyBid
                            ? "Bid Submitted • View"
                            : job.status === "OPEN"
                            ? "Bid on Project"
                            : "View Proposals"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold tabular-nums text-gray-600">
                  Page <strong className="text-gray-900">{safePage}</strong> of{" "}
                  <strong className="text-gray-900">{totalPages}</strong> ({filteredJobs.length}{" "}
                  projects)
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => goToPage(safePage - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:border-[#1dbf73] disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - safePage) <= 1
                    )
                    .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) {
                        acc.push("ellipsis");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "ellipsis" ? (
                        <span key={`e-${idx}`} className="px-2 text-xs text-gray-400">
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => goToPage(item)}
                          className={`min-w-[32px] rounded-lg px-2.5 py-1.5 text-xs font-bold tabular-nums transition ${
                            item === safePage
                              ? "bg-[#1dbf73] text-white"
                              : "border border-gray-200 text-gray-700 hover:border-[#1dbf73]"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => goToPage(safePage + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:border-[#1dbf73] disabled:opacity-40"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Post a Project Modal */}
      {postModalOpen && (
        <div
          onClick={() => setPostModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#0a4226] px-6 py-4 text-white">
              <h3 className="text-sm font-bold">Post a New Project for Bidding</h3>
              <button
                type="button"
                aria-label="Close post project modal"
                onClick={() => setPostModalOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="max-h-[80vh] space-y-4 overflow-y-auto p-6">
              <div>
                <label className="block text-xs font-bold text-gray-700">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Build Real-Time Analytics Dashboard in Next.js 15"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#1dbf73] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold"
                  >
                    {CATEGORIES.filter((c) => c !== "All Categories").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Bid Cost (Credits)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={newBidCost}
                    onChange={(e) => setNewBidCost(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700">Min Budget ($)</label>
                  <input
                    type="number"
                    min={100}
                    value={newBudgetMin}
                    onChange={(e) => setNewBudgetMin(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">Max Budget ($)</label>
                  <input
                    type="number"
                    min={200}
                    value={newBudgetMax}
                    onChange={(e) => setNewBudgetMax(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">Target Days</label>
                  <input
                    type="number"
                    min={1}
                    value={newDays}
                    onChange={(e) => setNewDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Required Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Project Scope &amp; Requirements *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe architecture, deliverables, integrations, and timeline..."
                  className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-[#1dbf73] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#1dbf73] py-3 text-xs font-bold text-white transition hover:bg-[#19a463]"
              >
                Publish Project &amp; Open Bidding
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
