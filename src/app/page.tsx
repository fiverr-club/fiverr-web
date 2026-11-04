"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  ArrowRight,
  Layers,
  Lock,
  Zap,
} from "lucide-react";
import { CATEGORIES, SEED_GIGS, type SellerLevel } from "@/lib/api";
import { GigCard } from "@/components/GigCard";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [maxDeliveryDays, setMaxDeliveryDays] = useState<number>(30);
  const [maxBudget, setMaxBudget] = useState<number>(1500);

  const filteredGigs = useMemo(() => {
    return SEED_GIGS.filter((gig) => {
      if (selectedCategory !== "All Categories" && gig.category !== selectedCategory) {
        return false;
      }
      if (selectedLevel !== "ALL" && gig.seller.level !== (selectedLevel as SellerLevel)) {
        return false;
      }
      if (gig.packages.Basic.deliveryDays > maxDeliveryDays) {
        return false;
      }
      if (gig.startingPrice > maxBudget) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesTitle = gig.title.toLowerCase().includes(q);
        const matchesTags = gig.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = gig.category.toLowerCase().includes(q);
        const matchesSeller = gig.seller.displayName.toLowerCase().includes(q);
        return matchesTitle || matchesTags || matchesCategory || matchesSeller;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedLevel, maxDeliveryDays, maxBudget]);

  const popularTags = [
    "Spring Boot",
    "Next.js 15",
    "AI Agent",
    "Kubernetes",
    "Figma",
    "DDD",
  ];

  return (
    <div>
      {/* Dark Emerald Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a4226] via-[#0d3b24] to-[#072617] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#1dbf73]" />
                <span>FIVERREX Enterprise • Powered by 9 DDD Microservices</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Scale your vision with{" "}
                <span className="italic text-[#1dbf73]">world-class</span> freelance talent.
              </h1>

              <p className="max-w-2xl text-base text-emerald-100/85 sm:text-lg">
                Hire verified architects, AI engineers, and product designers with 3-tier transparent
                packages and milestone-backed Payment Escrow protection.
              </p>

              {/* Hero Search Bar */}
              <div className="flex max-w-2xl flex-col gap-2 rounded-xl bg-white p-2 shadow-xl sm:flex-row">
                <div className="flex flex-1 items-center gap-3 px-3 py-2">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Try "Spring Boot DDD", "Next.js 15", "Kubernetes Helm", or "AI Agent"...'
                    className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#1dbf73] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#19a463]"
                >
                  <span>Search Gigs</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>
              </div>

              {/* Popular Tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-emerald-200/80">Popular:</span>
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearchQuery(tag)}
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1 font-medium text-white transition hover:border-[#1dbf73] hover:bg-[#1dbf73]"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Feature Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-emerald-400/20 bg-white/10 p-6 backdrop-blur-md">
                <div className="mb-4 flex items-center justify-between border-b border-white/15 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1dbf73]">
                      Live Architecture Status
                    </span>
                    <h3 className="text-lg font-bold text-white">Escrow &amp; Event Mesh Ready</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-[#1dbf73]" />
                    Healthy
                  </span>
                </div>
                <div className="space-y-3 text-xs text-emerald-50">
                  <div className="flex items-center justify-between rounded-lg bg-black/25 px-3.5 py-2.5">
                    <span>Spring Cloud Gateway (:8080)</span>
                    <span className="font-mono font-bold text-[#1dbf73]">JWT + RateLimiter</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-black/25 px-3.5 py-2.5">
                    <span>Order &amp; Payment Escrow Saga</span>
                    <span className="font-mono font-bold text-[#1dbf73]">Kafka KRaft Event Bus</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-black/25 px-3.5 py-2.5">
                    <span>Domain Repository Isolation</span>
                    <span className="font-mono font-bold text-[#1dbf73]">domain/repository/*</span>
                  </div>
                </div>
                <div className="mt-5 flex gap-3">
                  <Link
                    href="/orders"
                    className="flex-1 rounded-lg bg-[#1dbf73] py-2.5 text-center text-xs font-bold text-white transition hover:bg-[#19a463]"
                  >
                    View Escrow Orders
                  </Link>
                  <Link
                    href="/seller/dashboard"
                    className="flex-1 rounded-lg border border-white/30 bg-white/5 py-2.5 text-center text-xs font-bold text-white transition hover:bg-white/15"
                  >
                    Open Seller Studio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Ribbon */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  active
                    ? "bg-[#1dbf73] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar & Catalog Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Interactive Filter Controls */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
              <SlidersHorizontal className="h-4 w-4 text-[#1dbf73]" />
              <span>Filters:</span>
            </div>

            {/* Seller Level Filter */}
            <select
              aria-label="Filter by Seller Level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-[#1dbf73] focus:outline-none"
            >
              <option value="ALL">All Seller Levels</option>
              <option value="Top Rated Seller">Top Rated Seller</option>
              <option value="Pro Verified">Pro Verified</option>
              <option value="Level 2 Seller">Level 2 Seller</option>
            </select>

            {/* Delivery Time Filter */}
            <select
              aria-label="Filter by Delivery Time"
              value={maxDeliveryDays}
              onChange={(e) => setMaxDeliveryDays(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-[#1dbf73] focus:outline-none"
            >
              <option value={30}>Any Delivery Time</option>
              <option value={2}>Express 48 Hours (≤ 2 days)</option>
              <option value={3}>Up to 3 Days</option>
              <option value={7}>Up to 7 Days</option>
            </select>

            {/* Max Budget Filter */}
            <select
              aria-label="Filter by Budget"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-[#1dbf73] focus:outline-none"
            >
              <option value={1500}>Any Starting Budget</option>
              <option value={150}>Under $150</option>
              <option value={200}>Under $200</option>
              <option value={300}>Under $300</option>
            </select>

            {(selectedCategory !== "All Categories" ||
              selectedLevel !== "ALL" ||
              maxDeliveryDays !== 30 ||
              maxBudget !== 1500 ||
              searchQuery !== "") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All Categories");
                  setSelectedLevel("ALL");
                  setMaxDeliveryDays(30);
                  setMaxBudget(1500);
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          <p className="text-xs font-semibold text-gray-500">
            Showing <span className="font-bold text-gray-900">{filteredGigs.length}</span> verified
            services available now
          </p>
        </div>

        {/* Gigs Grid */}
        {filteredGigs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-base font-bold text-gray-800">
              No gigs matched your current filter combination.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Try clearing your filters or searching for another skill.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </section>

      {/* How FIVERREX Escrow Works Section */}
      <section className="border-t border-gray-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1dbf73]">
              Trust &amp; Architecture
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              How FIVERREX Escrow Protection Works
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600">
              Every order is orchestrated across our Order, Payment, and Notification microservices
              so funds are only released when you approve the work.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-[#1dbf73]">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">1. Choose a 3-Tier Package</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                Compare Basic, Standard, and Premium deliverables, delivery days, and revision
                allowances upfront.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-[#1dbf73]">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">2. Funds Held in Escrow</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                `fiverr-payment-service` locks your deposit in an isolated PostgreSQL escrow ledger
                until delivery completion.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-[#1dbf73]">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">3. Collaborate &amp; Review</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                Exchange files in real-time via `fiverr-messaging-service` and request revisions if
                needed with one click.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-[#1dbf73]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">4. Approve &amp; Release</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                Once satisfied, approve the delivery to trigger the Kafka `OrderCompletedEvent` and
                credit the seller&apos;s wallet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
