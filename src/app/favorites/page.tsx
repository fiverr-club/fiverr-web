"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Trash2,
  Star,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  SEED_GIGS,
  fiverrApi,
  getSavedGigIds,
  toggleSavedGigId,
  clearSavedGigs,
  type Gig,
} from "@/lib/api";
import { GigCard } from "@/components/GigCard";

export default function FavoritesWishlistPage() {
  const [gigs, setGigs] = useState<Gig[]>(SEED_GIGS);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(getSavedGigIds());
    async function loadGigs() {
      const liveGigs = await fiverrApi.getGigs();
      if (liveGigs && liveGigs.length > 0) {
        setGigs(liveGigs);
      }
    }
    loadGigs();

    const handleFavChange = () => {
      setSavedIds(getSavedGigIds());
    };
    window.addEventListener("fiverrex-favorites-change", handleFavChange);
    return () => {
      window.removeEventListener("fiverrex-favorites-change", handleFavChange);
    };
  }, []);

  const savedGigs = gigs.filter((g) => savedIds.includes(g.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            <span>Saved Gigs &amp; Shortlist Comparison</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            My Saved Gigs Wishlist ({savedGigs.length})
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Compare shortlisted architecture, AI, and design packages side-by-side before funding
            your escrow order.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {savedGigs.length > 0 && (
            <button
              type="button"
              onClick={() => clearSavedGigs()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Wishlist</span>
            </button>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1dbf73] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#19a463]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Explore More Gigs</span>
          </Link>
        </div>
      </div>

      {savedGigs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-gray-900">
            Your Saved Gigs Wishlist is Empty
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-gray-500">
            Click the heart icon on any Gig card across the marketplace to bookmark services and
            compare package tiers side-by-side.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                toggleSavedGigId("gig-101");
                toggleSavedGigId("gig-103");
              }}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:border-[#1dbf73]"
            >
              Restore Demo Shortlist
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1dbf73] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#19a463]"
            >
              <span>Browse Marketplace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Saved Gig Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedGigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>

          {/* Side-by-Side Comparison Matrix */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-[#0a4226] px-6 py-4 text-white">
              <h2 className="text-sm font-bold">
                Shortlist Comparison Matrix ({savedGigs.length} Saved Gigs)
              </h2>
              <p className="text-[11px] text-emerald-200">
                Compare seller ratings, delivery speed, and Basic / Standard / Premium package
                pricing.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                    <th className="p-4 font-bold">Gig &amp; Seller</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Rating</th>
                    <th className="p-4 font-bold">Basic Tier</th>
                    <th className="p-4 font-bold">Standard Tier</th>
                    <th className="p-4 font-bold">Premium Tier</th>
                    <th className="p-4 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {savedGigs.map((gig) => (
                    <tr key={gig.id} className="hover:bg-gray-50/80">
                      <td className="p-4">
                        <Link
                          href={`/gigs/${gig.id}`}
                          className="font-bold text-gray-900 hover:text-[#1dbf73]"
                        >
                          {gig.title}
                        </Link>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                          <Link
                            href={`/sellers/${gig.seller.username}`}
                            className="font-semibold text-gray-700 hover:underline"
                          >
                            {gig.seller.displayName} (@{gig.seller.username})
                          </Link>
                          <span>•</span>
                          <span className="text-[#1dbf73] font-bold">{gig.seller.level}</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-700">{gig.category}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 font-bold text-gray-900">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{gig.rating.toFixed(1)}</span>
                          <span className="font-normal text-gray-400">({gig.reviewCount})</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-gray-900">
                          ${gig.packages.Basic.price}
                        </span>
                        <span className="block text-[10px] text-gray-500">
                          <Clock className="mr-0.5 inline h-3 w-3 text-[#1dbf73]" />
                          {gig.packages.Basic.deliveryDays}d delivery
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-[#0a4226]">
                          ${gig.packages.Standard.price}
                        </span>
                        <span className="block text-[10px] text-gray-500">
                          <CheckCircle2 className="mr-0.5 inline h-3 w-3 text-[#1dbf73]" />
                          {gig.packages.Standard.deliveryDays}d delivery
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-gray-900">
                          ${gig.packages.Premium.price}
                        </span>
                        <span className="block text-[10px] text-gray-500">
                          {gig.packages.Premium.deliveryDays}d delivery
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/gigs/${gig.id}`}
                            className="rounded-lg bg-[#1dbf73] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#19a463]"
                          >
                            Select
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleSavedGigId(gig.id)}
                            title="Remove"
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-rose-300 hover:text-rose-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
