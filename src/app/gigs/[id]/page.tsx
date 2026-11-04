"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  Clock,
  RefreshCw,
  Check,
  ShieldCheck,
  MessageSquare,
  Globe,
  Award,
  ChevronRight,
  X,
  Lock,
} from "lucide-react";
import { SEED_GIGS, type PackageTierName, fiverrApi } from "@/lib/api";

export default function GigDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const gigId = params?.id || "gig-101";

  const gig = SEED_GIGS.find((g) => g.id === gigId) || SEED_GIGS[0];

  const [selectedTier, setSelectedTier] = useState<PackageTierName>("Standard");
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [requirements, setRequirements] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [orderSuccessNumber, setOrderSuccessNumber] = useState<string | null>(null);

  const activePackage = gig.packages[selectedTier];
  const serviceFee = Number((activePackage.price * 0.055).toFixed(2));
  const totalEscrow = Number((activePackage.price + serviceFee).toFixed(2));

  async function handleConfirmOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const created = await fiverrApi.createOrder({
      gigId: gig.id,
      packageTier: selectedTier,
      requirements,
    });
    setSubmitting(false);
    setOrderSuccessNumber(created.orderNumber);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-gray-500">
        <Link href="/" className="hover:text-[#1dbf73]">
          Fiverr Club
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{gig.category}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-gray-800">{gig.subcategory}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left Column: Gig Overview, Gallery, Seller Bio, Reviews */}
        <div className="space-y-8 lg:col-span-7">
          {/* Title & Seller Bar */}
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">
              {gig.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2.5">
                <img
                  src={gig.seller.avatarUrl}
                  alt={gig.seller.displayName}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-[#1dbf73]/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {gig.seller.displayName}
                    </span>
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                      {gig.seller.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">@{gig.seller.username}</p>
                </div>
              </div>

              <div className="h-5 w-px bg-gray-200" />

              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-gray-900">{gig.rating.toFixed(1)}</span>
                <span className="text-gray-500">({gig.reviewCount} reviews)</span>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#1dbf73]">
                {gig.ordersInQueue} Orders in Queue
              </span>
            </div>
          </div>

          {/* Media Showcase */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 aspect-[16/10]">
              <img
                src={gig.galleryUrls[selectedImageIdx] || gig.thumbnailUrl}
                alt={gig.title}
                className="h-full w-full object-cover"
              />
            </div>
            {gig.galleryUrls.length > 1 && (
              <div className="flex gap-3">
                {gig.galleryUrls.map((url, idx) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`overflow-hidden rounded-lg border-2 transition ${
                      selectedImageIdx === idx
                        ? "border-[#1dbf73] ring-2 ring-[#1dbf73]/30"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="Thumbnail" className="h-16 w-28 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* About This Gig */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">About This Gig</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{gig.description}</p>

            <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-gray-500">
              Architectural &amp; Deliverable Highlights
            </h3>
            <ul className="mt-3 space-y-2">
              {gig.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1dbf73]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              {gig.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* About The Seller Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">About The Seller</h2>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={gig.seller.avatarUrl}
                  alt={gig.seller.displayName}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-[#1dbf73]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">{gig.seller.displayName}</h3>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-[#1dbf73]">
                      <Award className="h-3.5 w-3.5" />
                      {gig.seller.level}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-600">{gig.seller.tagline}</p>
                </div>
              </div>
              <Link
                href="/inbox"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-800 transition hover:border-gray-900"
              >
                <MessageSquare className="h-4 w-4 text-[#1dbf73]" />
                <span>Contact Me</span>
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 text-xs sm:grid-cols-4">
              <div>
                <span className="text-gray-400">From</span>
                <p className="mt-0.5 font-bold text-gray-900">{gig.seller.country}</p>
              </div>
              <div>
                <span className="text-gray-400">Member since</span>
                <p className="mt-0.5 font-bold text-gray-900">{gig.seller.memberSince}</p>
              </div>
              <div>
                <span className="text-gray-400">Avg. response time</span>
                <p className="mt-0.5 font-bold text-gray-900">{gig.seller.avgResponseTime}</p>
              </div>
              <div>
                <span className="text-gray-400">Last delivery</span>
                <p className="mt-0.5 font-bold text-gray-900">{gig.seller.lastDelivery}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-gray-600">{gig.seller.bio}</p>

            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <Globe className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>Languages: {gig.seller.languages.join(", ")}</span>
            </div>
          </div>

          {/* 3-Criteria Review Breakdown */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Verified Buyer Reviews ({gig.reviewCount})
                </h2>
                <p className="text-xs text-gray-500">
                  3-Criteria Rating powered by `fiverr-review-service`
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="text-lg font-extrabold text-gray-900">
                  {gig.rating.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-gray-600">/ 5.0</span>
              </div>
            </div>

            {/* 3 Criteria Grid */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                <p className="text-xs font-medium text-gray-500">Seller communication level</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-base font-bold text-gray-900">
                    {gig.criteriaAverages.communication.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                <p className="text-xs font-medium text-gray-500">Service as described</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-base font-bold text-gray-900">
                    {gig.criteriaAverages.serviceAsDescribed.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                <p className="text-xs font-medium text-gray-500">Buy again or recommend</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-base font-bold text-gray-900">
                    {gig.criteriaAverages.recommend.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="mt-6 space-y-5">
              {gig.reviews.length === 0 ? (
                <p className="text-xs text-gray-500">
                  All {gig.reviewCount} verified ratings average {gig.rating.toFixed(1)} stars across
                  completed escrow orders.
                </p>
              ) : (
                gig.reviews.map((rev) => (
                  <div key={rev.id} className="border-t border-gray-100 pt-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.buyerAvatar}
                          alt={rev.buyerName}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">{rev.buyerName}</p>
                          <p className="text-[11px] text-gray-500">
                            {rev.buyerCountry} • {rev.packageOrdered} Package ({rev.priceRange})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.ratingOverall.toFixed(1)}</span>
                        <span className="ml-2 font-normal text-gray-400">{rev.createdAt}</span>
                      </div>
                    </div>
                    <p className="mt-2.5 text-sm text-gray-700">{rev.comment}</p>
                    {rev.sellerResponse && (
                      <div className="mt-3 rounded-lg bg-emerald-50/70 p-3 text-xs text-gray-700">
                        <span className="font-bold text-[#0a4226]">Seller&apos;s Response: </span>
                        {rev.sellerResponse}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky 3-Tier Package Selector */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
            {/* Tier Tabs */}
            <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50">
              {(["Basic", "Standard", "Premium"] as PackageTierName[]).map((tier) => {
                const active = selectedTier === tier;
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSelectedTier(tier)}
                    className={` border-b-2 py-3.5 text-xs font-extrabold uppercase tracking-wider transition ${
                      active
                        ? "border-[#1dbf73] bg-white text-[#1dbf73]"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tier}
                  </button>
                );
              })}
            </div>

            {/* Active Tier Content */}
            <div className="p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-extrabold text-gray-900">{activePackage.title}</h3>
                <span className="text-2xl font-extrabold text-gray-900">
                  ${activePackage.price}
                </span>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                {activePackage.description}
              </p>

              <div className="mt-4 flex items-center gap-5 text-xs font-bold text-gray-800">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#1dbf73]" />
                  <span>{activePackage.deliveryDays}-Day Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="h-4 w-4 text-[#1dbf73]" />
                  <span>{activePackage.revisions} Revisions</span>
                </div>
              </div>

              {/* Feature Checklist */}
              <ul className="mt-5 space-y-2.5 border-t border-gray-100 pt-4">
                {activePackage.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-xs font-medium text-gray-700">
                    <Check className="h-4 w-4 shrink-0 text-[#1dbf73]" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Continue to Escrow Order Button */}
              <button
                type="button"
                onClick={() => {
                  setOrderSuccessNumber(null);
                  setCheckoutOpen(true);
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1dbf73] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#19a463]"
              >
                <span>Continue (${activePackage.price})</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <Link
                href="/inbox"
                className="mt-3 block w-full rounded-xl border border-gray-300 py-2.5 text-center text-xs font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Contact Seller or Request Custom Offer
              </Link>

              <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-emerald-50/70 p-3 text-[11px] text-emerald-900">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1dbf73]" />
                <div>
                  <span className="font-bold">Fiverr Club Escrow Guarantee:</span> Funds are held in
                  `fiverr-payment-service` and only released after you approve the final delivery.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout / Escrow Creation Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#0a4226] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#1dbf73]" />
                <h3 className="text-sm font-bold">Escrow Order Checkout</h3>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {orderSuccessNumber ? (
              <div className="space-y-4 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-[#1dbf73]">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-extrabold text-gray-900">
                  Escrow Funded &amp; Order Created!
                </h4>
                <p className="text-xs text-gray-600">
                  Order <span className="font-mono font-bold text-gray-900">{orderSuccessNumber}</span>{" "}
                  has been dispatched via `fiverr-order-service` and `$
                  {totalEscrow.toFixed(2)}` is locked in Escrow.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => router.push("/orders")}
                    className="flex-1 rounded-xl bg-[#1dbf73] py-3 text-xs font-bold text-white hover:bg-[#19a463]"
                  >
                    Go to Order Workspace
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(false)}
                    className="rounded-xl border border-gray-300 px-4 py-3 text-xs font-bold text-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmOrder} className="space-y-4 p-6">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1dbf73]">{selectedTier} Package</span>
                    <span className="font-bold text-gray-900">{activePackage.deliveryDays} Days</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-gray-900">{activePackage.title}</p>
                  <div className="mt-3 space-y-1 border-t border-gray-200 pt-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${activePackage.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Escrow Protection &amp; Platform Fee (5.5%)</span>
                      <span>${serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1 text-sm font-extrabold text-gray-900">
                      <span>Total Escrow Deposit</span>
                      <span>${totalEscrow.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Project Requirements for {gig.seller.displayName}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Describe your repository structure, tech stack preferences, and target deadlines..."
                    className="mt-1.5 w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-[#1dbf73] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#1dbf73] py-3.5 text-xs font-bold text-white transition hover:bg-[#19a463] disabled:opacity-50"
                >
                  {submitting
                    ? "Locking Escrow in Payment Service..."
                    : `Fund Escrow & Place Order ($${totalEscrow.toFixed(2)})`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
