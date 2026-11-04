import React from "react";
import Link from "next/link";
import { Star, Heart, Award, Clock } from "lucide-react";
import type { Gig } from "@/lib/api";

export function GigCard({ gig }: { gig: Gig }) {
  const isTopRated = gig.seller.level === "Top Rated Seller";
  const isPro = gig.seller.level === "Pro Verified";

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      {/* Thumbnail */}
      <Link href={`/gigs/${gig.id}`} className="relative block aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <img
          src={gig.thumbnailUrl}
          alt={gig.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {isPro && (
            <span className="inline-flex items-center gap-1 rounded bg-indigo-950/90 px-2.5 py-1 text-[11px] font-bold text-white shadow">
              <Award className="h-3 w-3 text-[#1dbf73]" />
              Pro Verified
            </span>
          )}
          <span className="rounded bg-black/65 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            {gig.category}
          </span>
        </div>
        <button
          type="button"
          aria-label="Save to favorites"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow transition hover:text-rose-500"
        >
          <Heart className="h-4 w-4" />
        </button>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {/* Seller Header */}
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={gig.seller.avatarUrl}
                alt={gig.seller.displayName}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-gray-200"
              />
              <div>
                <p className="text-xs font-bold text-gray-900">{gig.seller.displayName}</p>
                <p className="text-[11px] text-gray-500">@{gig.seller.username}</p>
              </div>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                isTopRated
                  ? "bg-amber-100 text-amber-800"
                  : isPro
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {gig.seller.level}
            </span>
          </div>

          {/* Title */}
          <Link
            href={`/gigs/${gig.id}`}
            className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800 transition-colors group-hover:text-[#1dbf73]"
          >
            {gig.title}
          </Link>

          {/* Rating & Delivery */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-gray-900">{gig.rating.toFixed(1)}</span>
              <span className="text-gray-500">({gig.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>{gig.packages.Basic.deliveryDays}d delivery</span>
            </div>
          </div>
        </div>

        {/* Footer Price */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex flex-wrap gap-1">
            {gig.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              From
            </span>
            <span className="text-base font-extrabold text-gray-900">${gig.startingPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
