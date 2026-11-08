"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Award,
  Star,
  Globe,
  MessageSquare,
  SlidersHorizontal,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  SEED_USER_PROFILES,
  SEED_GIGS,
  fiverrApi,
  resolveCanonicalUsername,
  type UserProfileDto,
  type Gig,
} from "@/lib/api";

export default function SellersDirectoryPage() {
  const [sellers, setSellers] = useState<UserProfileDto[]>(SEED_USER_PROFILES);
  const [gigs, setGigs] = useState<Gig[]>(SEED_GIGS);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [maxHourlyRate, setMaxHourlyRate] = useState<number>(300);
  const [selectedSkill, setSelectedSkill] = useState<string>("ALL");

  useEffect(() => {
    async function loadDirectory() {
      const [liveSellers, liveGigs] = await Promise.all([
        fiverrApi.getSellers(),
        fiverrApi.getGigs(),
      ]);
      if (liveSellers && liveSellers.length > 0) {
        setSellers(liveSellers);
      }
      if (liveGigs && liveGigs.length > 0) {
        setGigs(liveGigs);
      }
    }
    loadDirectory();
  }, []);

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    sellers.forEach((s) => {
      (s.skills || []).forEach((sk) => set.add(sk));
    });
    return ["ALL", ...Array.from(set).slice(0, 10)];
  }, [sellers]);

  const filteredSellers = useMemo(() => {
    return sellers.filter((s) => {
      if (selectedLevel !== "ALL") {
        const normLevel = (s.sellerLevel || "").toUpperCase();
        if (
          selectedLevel === "TOP_RATED" &&
          !normLevel.includes("TOP")
        ) {
          return false;
        }
        if (
          selectedLevel === "PRO" &&
          !normLevel.includes("PRO")
        ) {
          return false;
        }
        if (
          selectedLevel === "LEVEL_2" &&
          !normLevel.includes("2")
        ) {
          return false;
        }
      }
      if (Number(s.hourlyRate || 0) > maxHourlyRate) {
        return false;
      }
      if (
        selectedSkill !== "ALL" &&
        !(s.skills || []).some((sk) => sk.toLowerCase() === selectedSkill.toLowerCase())
      ) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName =
          s.displayName.toLowerCase().includes(q) ||
          s.username.toLowerCase().includes(q);
        const matchesHeadline = (s.headline || "").toLowerCase().includes(q);
        const matchesSkill = (s.skills || []).some((sk) =>
          sk.toLowerCase().includes(q)
        );
        const matchesCountry = (s.country || "").toLowerCase().includes(q);
        return matchesName || matchesHeadline || matchesSkill || matchesCountry;
      }
      return true;
    });
  }, [sellers, searchQuery, selectedLevel, maxHourlyRate, selectedSkill]);

  function getSellerGigsCount(username: string): number {
    const canonical = resolveCanonicalUsername(username);
    const count = gigs.filter(
      (g) => resolveCanonicalUsername(g.seller.username) === canonical
    ).length;
    return count || 1;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a4226] via-[#0d3b24] to-[#072617] p-8 text-white shadow-lg">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>Verified Talent Directory • `GET /api/v1/sellers`</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Hire Verified Freelancers &amp; Principal Architects
            </h1>
            <p className="max-w-2xl text-sm text-emerald-100/85">
              Browse top-rated Spring Boot DDD architects, AI/LLM research scientists, CNCF
              Kubernetes engineers, and Next.js 15 product designers backed by 100% Escrow
              protection.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <span className="block text-emerald-200">Verified Freelancers</span>
              <span className="text-xl font-extrabold text-white">{sellers.length}</span>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <span className="block text-emerald-200">Avg. Marketplace Rating</span>
              <span className="text-xl font-extrabold text-[#1dbf73]">4.94 / 5.0</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Row */}
        <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl bg-white p-3 text-gray-900 shadow-md md:grid-cols-12">
          <div className="flex items-center gap-2.5 border-b border-gray-200 px-3 py-2 md:col-span-5 md:border-b-0 md:border-r">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, @username, skill (Java 21, Next.js, RAG), or country..."
              className="w-full text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 px-2 md:col-span-3">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#1dbf73]" />
            <select
              aria-label="Filter by Seller Level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-bold text-gray-700 focus:border-[#1dbf73] focus:outline-none"
            >
              <option value="ALL">All Seller Levels</option>
              <option value="TOP_RATED">Top Rated Seller</option>
              <option value="PRO">Pro Verified</option>
              <option value="LEVEL_2">Level 2 Seller</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-2 md:col-span-4">
            <span className="shrink-0 text-xs font-bold text-gray-600">
              Max Rate: ${maxHourlyRate}/hr
            </span>
            <input
              type="range"
              min={100}
              max={250}
              step={15}
              value={maxHourlyRate}
              onChange={(e) => setMaxHourlyRate(Number(e.target.value))}
              className="w-full accent-[#1dbf73]"
            />
          </div>
        </div>
      </div>

      {/* Skill Filter Pills */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        {allSkills.map((skill) => {
          const active = selectedSkill === skill;
          return (
            <button
              key={skill}
              type="button"
              onClick={() => setSelectedSkill(skill)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                active
                  ? "bg-[#1dbf73] text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-[#1dbf73] hover:text-gray-900"
              }`}
            >
              {skill === "ALL" ? "All Specialties" : skill}
            </button>
          );
        })}
      </div>

      {/* Freelancers Grid */}
      {filteredSellers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-base font-bold text-gray-800">
            No freelancers match your current filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedLevel("ALL");
              setMaxHourlyRate(300);
              setSelectedSkill("ALL");
            }}
            className="mt-3 rounded-lg bg-[#1dbf73] px-4 py-2 text-xs font-bold text-white"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSellers.map((seller) => {
            const gigCount = getSellerGigsCount(seller.username);
            return (
              <div
                key={seller.username}
                className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  {/* Top Row: Avatar + Name + Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/sellers/${seller.username}`}
                      className="flex items-center gap-3.5"
                    >
                      <div className="relative">
                        <img
                          src={seller.avatarUrl}
                          alt={seller.displayName}
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-[#1dbf73]/40"
                        />
                        <span
                          title={seller.availabilityStatus || "AVAILABLE"}
                          className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#1dbf73]"
                        />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-gray-900 hover:text-[#1dbf73]">
                          {seller.displayName}
                        </h2>
                        <p className="text-xs font-medium text-gray-500">@{seller.username}</p>
                        <div className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0a4226]">
                          <Award className="h-3 w-3 text-[#1dbf73]" />
                          <span>{seller.sellerLevel}</span>
                        </div>
                      </div>
                    </Link>

                    <div className="text-right">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Hourly
                      </span>
                      <span className="text-lg font-extrabold text-gray-900">
                        ${seller.hourlyRate}
                      </span>
                      <span className="text-[11px] text-gray-500">/hr</span>
                    </div>
                  </div>

                  {/* Headline & Bio */}
                  <p className="mt-4 text-xs font-bold text-gray-900">{seller.headline}</p>
                  <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-gray-600">
                    {seller.bio}
                  </p>

                  {/* Skills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(seller.skills || []).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 space-y-4 border-t border-gray-100 pt-4">
                  {/* KPIs Row */}
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-2.5 text-center text-xs">
                    <div>
                      <div className="flex items-center justify-center gap-1 font-extrabold text-gray-900">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{Number(seller.ratingAverage || 5.0).toFixed(2)}</span>
                      </div>
                      <span className="text-[10px] text-gray-500">Rating</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 font-extrabold text-gray-900">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#1dbf73]" />
                        <span>{seller.completedOrdersCount}</span>
                      </div>
                      <span className="text-[10px] text-gray-500">Orders Done</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 font-extrabold text-gray-900">
                        <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                        <span>{gigCount}</span>
                      </div>
                      <span className="text-[10px] text-gray-500">Active Gigs</span>
                    </div>
                  </div>

                  {/* Country & Languages */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 text-[#1dbf73]" />
                      {seller.country}
                    </span>
                    <span className="truncate">
                      {(seller.languages || ["English"]).slice(0, 2).join(" • ")}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/sellers/${seller.username}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1dbf73] py-2.5 text-xs font-bold text-white transition hover:bg-[#19a463]"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href="/inbox"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 transition hover:border-gray-900"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-[#1dbf73]" />
                      <span>Contact</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
