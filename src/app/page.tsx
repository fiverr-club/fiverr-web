"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  ArrowRight,
  Layers,
  Lock,
  Zap,
  Heart,
  Star,
  Award,
  ChevronDown,
  Users,
} from "lucide-react";
import {
  CATEGORIES,
  SEED_GIGS,
  SEED_USER_PROFILES,
  fiverrApi,
  getSavedGigIds,
  type Gig,
  type GatewayStatusInfo,
  type SellerLevel,
  type UserProfileDto,
} from "@/lib/api";
import { GigCard } from "@/components/GigCard";

type SortOption =
  | "RECOMMENDED"
  | "RATING_DESC"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "FASTEST_DELIVERY";

const FAQ_ITEMS = [
  {
    q: "How does FIVERREX Payment Escrow protect my order?",
    a: "When you place an order, funds are held in an isolated PostgreSQL escrow ledger inside `fiverr-payment-service`. The freelancer is only paid after you inspect the deliverables and click 'Approve & Release Escrow', which dispatches an `OrderCompletedEvent` over Apache Kafka.",
  },
  {
    q: "What is the difference between Basic, Standard, and Premium packages?",
    a: "Every Gig on FIVERREX offers a transparent 3-tier package matrix. Basic covers core prototypes or starter deliverables, Standard delivers a full multi-module production implementation, and Premium includes enterprise architecture, Kubernetes/Helm manifests, and priority revisions.",
  },
  {
    q: "Can I request a custom milestone offer before ordering?",
    a: "Yes! Visit any freelancer's profile or open the Real-Time Inbox (`/inbox`) to discuss your requirements and receive a tailored Custom Milestone Offer with custom pricing, delivery days, and revision allowances.",
  },
  {
    q: "How are FIVERREX sellers verified and rated?",
    a: "All reviews are verified against completed escrow orders in `fiverr-review-service` across 3 weighted criteria: Seller Communication Level, Service as Described, and Buy Again / Recommend.",
  },
];

export default function HomePage() {
  const [gigs, setGigs] = useState<Gig[]>(SEED_GIGS);
  const [sellers, setSellers] = useState<UserProfileDto[]>(SEED_USER_PROFILES);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatusInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [maxDeliveryDays, setMaxDeliveryDays] = useState<number>(30);
  const [maxBudget, setMaxBudget] = useState<number>(1500);
  const [sortBy, setSortBy] = useState<SortOption>("RECOMMENDED");
  const [savedOnly, setSavedOnly] = useState<boolean>(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    setSavedIds(getSavedGigIds());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category");
      const qParam = params.get("q");
      if (catParam && CATEGORIES.includes(catParam as (typeof CATEGORIES)[number])) {
        setSelectedCategory(catParam);
      }
      if (qParam) {
        setSearchQuery(qParam);
      }
    }

    async function loadMarketplace() {
      const [liveGigs, liveGateway, liveSellers] = await Promise.all([
        fiverrApi.getGigs(),
        fiverrApi.getGatewayStatus(),
        fiverrApi.getSellers(),
      ]);
      if (liveGigs && liveGigs.length > 0) {
        setGigs(liveGigs);
      }
      if (liveGateway) {
        setGatewayStatus(liveGateway);
      }
      if (liveSellers && liveSellers.length > 0) {
        setSellers(liveSellers);
      }
    }
    loadMarketplace();

    const handleFavChange = () => {
      setSavedIds(getSavedGigIds());
    };
    window.addEventListener("fiverrex-favorites-change", handleFavChange);
    return () => {
      window.removeEventListener("fiverrex-favorites-change", handleFavChange);
    };
  }, []);

  async function handleRemoteSearch() {
    if (!searchQuery.trim() && selectedCategory === "All Categories") {
      const allGigs = await fiverrApi.getGigs();
      setGigs(allGigs);
      return;
    }
    const results = await fiverrApi.searchGigs(searchQuery, selectedCategory);
    if (results && results.length > 0) {
      setGigs(results);
    }
  }

  const filteredGigs = useMemo(() => {
    const filtered = gigs.filter((gig) => {
      if (savedOnly && !savedIds.includes(gig.id)) {
        return false;
      }
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

    const sorted = [...filtered];
    if (sortBy === "RATING_DESC") {
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else if (sortBy === "PRICE_ASC") {
      sorted.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (sortBy === "PRICE_DESC") {
      sorted.sort((a, b) => b.startingPrice - a.startingPrice);
    } else if (sortBy === "FASTEST_DELIVERY") {
      sorted.sort(
        (a, b) => a.packages.Basic.deliveryDays - b.packages.Basic.deliveryDays
      );
    }
    return sorted;
  }, [
    gigs,
    searchQuery,
    selectedCategory,
    selectedLevel,
    maxDeliveryDays,
    maxBudget,
    sortBy,
    savedOnly,
    savedIds,
  ]);

  const popularTags = [
    "Spring Boot",
    "Next.js 15",
    "AI Agent",
    "Kubernetes",
    "Figma",
    "DDD",
  ];

  const routeCount = gatewayStatus?.routes?.length ?? 9;

  return (
    <div>
      {/* Dark Emerald Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a4226] via-[#0d3b24] to-[#072617] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#1dbf73]" />
                <span>
                  FIVERREX Enterprise • Powered by {routeCount} DDD Microservice Routes
                </span>
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRemoteSearch();
                    }}
                    placeholder='Try "Spring Boot DDD", "Next.js 15", "Kubernetes Helm", or "AI Agent"...'
                    className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoteSearch}
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
                    {gatewayStatus?.status === "UP" ? `Healthy (${routeCount} Routes)` : "Healthy"}
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
                    href="/sellers"
                    className="flex-1 rounded-lg border border-white/30 bg-white/5 py-2.5 text-center text-xs font-bold text-white transition hover:bg-white/15"
                  >
                    Browse Freelancers
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

            {/* Saved Only Toggle */}
            <button
              type="button"
              onClick={() => setSavedOnly((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                savedOnly
                  ? "border-rose-300 bg-rose-50 text-rose-600"
                  : "border-gray-300 bg-white text-gray-700 hover:border-rose-300"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${savedOnly ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>Saved Only ({savedIds.length})</span>
            </button>

            {(selectedCategory !== "All Categories" ||
              selectedLevel !== "ALL" ||
              maxDeliveryDays !== 30 ||
              maxBudget !== 1500 ||
              savedOnly ||
              searchQuery !== "") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All Categories");
                  setSelectedLevel("ALL");
                  setMaxDeliveryDays(30);
                  setMaxBudget(1500);
                  setSavedOnly(false);
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-gray-500">Sort by:</span>
              <select
                aria-label="Sort Gigs"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:border-[#1dbf73] focus:outline-none"
              >
                <option value="RECOMMENDED">Recommended</option>
                <option value="RATING_DESC">Rating: High to Low</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="FASTEST_DELIVERY">Fastest Delivery</option>
              </select>
            </div>
            <p className="text-xs font-semibold text-gray-500">
              Showing <span className="font-bold text-gray-900">{filteredGigs.length}</span>{" "}
              services
            </p>
          </div>
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

      {/* Top Rated Freelancers & Architects Spotlight */}
      <section className="border-t border-gray-200 bg-gray-50/70 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0a4226]">
                Verified Talent (`fiverr-user-service`)
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Top Rated Freelancers &amp; Architects
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Work directly with principal engineers, AI scientists, and creative directors.
              </p>
            </div>
            <Link
              href="/sellers"
              className="inline-flex items-center gap-2 self-start rounded-xl bg-[#0a4226] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#1dbf73] sm:self-auto"
            >
              <Users className="h-4 w-4" />
              <span>View All {sellers.length} Verified Freelancers</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sellers.slice(0, 6).map((seller) => (
              <div
                key={seller.username}
                className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/sellers/${seller.username}`}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={seller.avatarUrl}
                        alt={seller.displayName}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-[#1dbf73]/30"
                      />
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900 hover:text-[#1dbf73]">
                          {seller.displayName}
                        </h3>
                        <p className="text-xs text-gray-500">@{seller.username}</p>
                      </div>
                    </Link>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0a4226]">
                      <Award className="h-3 w-3 text-[#1dbf73]" />
                      {seller.sellerLevel}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs font-semibold text-gray-800">
                    {seller.headline}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(seller.skills || []).slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {Number(seller.ratingAverage || 5.0).toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      {seller.completedOrdersCount} orders
                    </span>
                    <span className="font-bold text-gray-900">${seller.hourlyRate}/hr</span>
                  </div>
                  <Link
                    href={`/sellers/${seller.username}`}
                    className="font-bold text-[#1dbf73] hover:underline"
                  >
                    Portfolio →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
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

      {/* Interactive Marketplace FAQ Accordion */}
      <section className="border-t border-gray-200 bg-gray-50 py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0a4226]">
              Frequently Asked Questions
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
              Everything You Need to Know About FIVERREX.
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={item.q}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-bold text-gray-900 hover:bg-gray-50"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${
                        isOpen ? "rotate-180 text-[#1dbf73]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 py-4 text-xs leading-relaxed text-gray-600">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
