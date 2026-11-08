"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Award,
  Star,
  Globe,
  MessageSquare,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Edit3,
  ChevronRight,
  Send,
  X,
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
import { GigCard } from "@/components/GigCard";

export default function SellerProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const rawUsername = decodeURIComponent(params?.username || "alex_architect");
  const canonicalUsername = resolveCanonicalUsername(rawUsername);

  const initialSeller =
    SEED_USER_PROFILES.find(
      (u) => resolveCanonicalUsername(u.username) === canonicalUsername
    ) || SEED_USER_PROFILES[0];

  const [profile, setProfile] = useState<UserProfileDto>(initialSeller);
  const [gigs, setGigs] = useState<Gig[]>(SEED_GIGS);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);

  // Edit Profile Form State
  const [editDisplayName, setEditDisplayName] = useState<string>(initialSeller.displayName);
  const [editHeadline, setEditHeadline] = useState<string>(initialSeller.headline);
  const [editBio, setEditBio] = useState<string>(initialSeller.bio);
  const [editCountry, setEditCountry] = useState<string>(initialSeller.country);
  const [editSkills, setEditSkills] = useState<string>((initialSeller.skills || []).join(", "));
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Contact / Custom Offer Modal State
  const [inquiryMessage, setInquiryMessage] = useState<string>("");
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);

  useEffect(() => {
    async function loadSellerData() {
      const [liveProfile, liveGigs] = await Promise.all([
        fiverrApi.getUserByUsername(rawUsername),
        fiverrApi.getGigs(),
      ]);
      if (liveProfile) {
        setProfile(liveProfile);
        setEditDisplayName(liveProfile.displayName);
        setEditHeadline(liveProfile.headline);
        setEditBio(liveProfile.bio);
        setEditCountry(liveProfile.country);
        setEditSkills((liveProfile.skills || []).join(", "));
      }
      if (liveGigs && liveGigs.length > 0) {
        setGigs(liveGigs);
      }
    }
    loadSellerData();
  }, [rawUsername]);

  const sellerGigs = gigs.filter(
    (g) =>
      resolveCanonicalUsername(g.seller.username) ===
        resolveCanonicalUsername(profile.username) ||
      g.seller.displayName.toLowerCase() === profile.displayName.toLowerCase()
  );

  const displayedGigs = sellerGigs.length > 0 ? sellerGigs : gigs.slice(0, 2);

  const sellerReviews = displayedGigs.flatMap((g) => g.reviews || []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    const updatedSkills = editSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const updated = await fiverrApi.updateProfile(profile.id, {
      displayName: editDisplayName.trim() || profile.displayName,
      headline: editHeadline.trim() || profile.headline,
      bio: editBio.trim() || profile.bio,
      country: editCountry.trim() || profile.country,
      skills: updatedSkills.length > 0 ? updatedSkills : profile.skills,
      languages: profile.languages,
      avatarUrl: profile.avatarUrl,
      availabilityStatus: "AVAILABLE",
    });

    setProfile({
      ...profile,
      ...updated,
      displayName: editDisplayName.trim() || profile.displayName,
      headline: editHeadline.trim() || profile.headline,
      bio: editBio.trim() || profile.bio,
      country: editCountry.trim() || profile.country,
      skills: updatedSkills.length > 0 ? updatedSkills : profile.skills,
    });
    setSavingProfile(false);
    setEditModalOpen(false);
    setStatusToast(
      `Profile updated via PUT /api/v1/profiles/${profile.id} (fiverr-user-service)`
    );
  }

  async function handleSendDirectInquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!inquiryMessage.trim()) return;
    setSendingMessage(true);
    await fiverrApi.sendMessage({
      recipientId: profile.accountId || profile.id,
      gigId: displayedGigs[0]?.id,
      content: inquiryMessage.trim(),
      messageType: "TEXT",
    });
    setSendingMessage(false);
    setInquiryMessage("");
    setContactModalOpen(false);
    setStatusToast(
      `Message sent to @${profile.username} via POST /api/v1/messages! Redirecting to Inbox...`
    );
    setTimeout(() => {
      router.push("/inbox");
    }, 900);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-gray-500">
        <Link href="/" className="hover:text-[#1dbf73]">
          FIVERREX
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/sellers" className="hover:text-[#1dbf73]">
          Verified Freelancers
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-gray-900">@{profile.username}</span>
      </nav>

      {statusToast && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-950">
          <span>{statusToast}</span>
          <button
            type="button"
            onClick={() => setStatusToast(null)}
            className="text-emerald-700 hover:text-emerald-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Sidebar: Seller Identity Card */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-[#1dbf73]/30"
                />
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-[#1dbf73]" />
              </div>

              <h1 className="mt-4 text-xl font-extrabold text-gray-900">
                {profile.displayName}
              </h1>
              <p className="text-xs font-medium text-gray-500">@{profile.username}</p>

              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#0a4226]">
                <Award className="h-3.5 w-3.5 text-[#1dbf73]" />
                <span>{profile.sellerLevel}</span>
              </div>

              <p className="mt-3 text-xs font-semibold leading-relaxed text-gray-800">
                {profile.headline}
              </p>

              {/* Rating & Orders Summary */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1 font-bold text-gray-900">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{Number(profile.ratingAverage || 5.0).toFixed(2)}</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="font-semibold text-gray-600">
                  {profile.completedOrdersCount} Orders Completed
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex w-full flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1dbf73] py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#19a463]"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Contact / Request Custom Offer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-2.5 text-xs font-bold text-gray-700 transition hover:border-gray-900"
                >
                  <Edit3 className="h-3.5 w-3.5 text-[#1dbf73]" />
                  <span>Edit Profile (`PUT /api/v1/profiles`)</span>
                </button>
              </div>
            </div>

            {/* Metadata Breakdown */}
            <div className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-500">
                  <Globe className="h-3.5 w-3.5 text-[#1dbf73]" />
                  Location
                </span>
                <span className="font-bold text-gray-900">{profile.country}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-500">
                  <Clock className="h-3.5 w-3.5 text-[#1dbf73]" />
                  Avg. Response Time
                </span>
                <span className="font-bold text-gray-900">~1 Hour</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1dbf73]" />
                  Hourly Consulting Rate
                </span>
                <span className="font-extrabold text-gray-900">${profile.hourlyRate}/hr</span>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                About Me
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">{profile.bio}</p>
            </div>

            {/* Languages */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                Languages
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(profile.languages || ["English (Fluent)"]).map((lang) => (
                  <span
                    key={lang}
                    className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                Verified Technical Skills
              </h2>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(profile.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-2.5 py-1 text-xs font-bold text-[#0a4226]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-950">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="h-4 w-4 text-[#1dbf73]" />
              <span>100% Escrow Protected Seller</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-800">
              All orders placed with {profile.displayName} are protected by `fiverr-payment-service`
              escrow until milestone completion.
            </p>
          </div>
        </div>

        {/* Right Column: Active Gigs & Verified Reviews */}
        <div className="space-y-8 lg:col-span-8">
          {/* Active Gigs Section */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  {profile.displayName}&apos;s Active Gigs ({displayedGigs.length})
                </h2>
                <p className="text-xs text-gray-500">
                  Select a 3-tier package to start an escrow-backed order immediately.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#1dbf73]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Available Now</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {displayedGigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          </div>

          {/* Client Reviews Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Verified Client Reviews ({profile.completedOrdersCount})
                </h3>
                <p className="text-xs text-gray-500">
                  Aggregated across all completed escrow orders for @{profile.username}
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-extrabold text-gray-900">
                  {Number(profile.ratingAverage || 5.0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {sellerReviews.length === 0 ? (
                <p className="text-xs text-gray-500">
                  {profile.displayName} maintains a {Number(profile.ratingAverage || 5.0).toFixed(2)}{" "}
                  star average across {profile.completedOrdersCount} completed enterprise orders.
                </p>
              ) : (
                sellerReviews.map((rev) => (
                  <div key={rev.id} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.buyerAvatar}
                          alt={rev.buyerName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">{rev.buyerName}</p>
                          <p className="text-[11px] text-gray-500">
                            {rev.buyerCountry} • {rev.packageOrdered} Tier
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.ratingOverall.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-gray-700">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#0a4226] px-6 py-4 text-white">
              <h3 className="text-sm font-bold">
                Update Seller Profile (`PUT /api/v1/profiles/{profile.id.slice(0, 8)}...`)
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#1dbf73] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">Country</label>
                  <input
                    type="text"
                    required
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#1dbf73] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">Professional Headline</label>
                <input
                  type="text"
                  required
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#1dbf73] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">Biography</label>
                <textarea
                  rows={3}
                  required
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-[#1dbf73] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#1dbf73] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-xl bg-[#1dbf73] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#19a463] disabled:opacity-50"
                >
                  {savingProfile ? "Saving..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact / Custom Offer Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#0a4226] px-6 py-4 text-white">
              <h3 className="text-sm font-bold">Message {profile.displayName}</h3>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSendDirectInquiry} className="space-y-4 p-6">
              <p className="text-xs text-gray-600">
                Send a direct project brief or custom offer inquiry to{" "}
                <span className="font-bold text-gray-900">@{profile.username}</span> via{" "}
                `POST /api/v1/messages`:
              </p>
              <textarea
                rows={4}
                required
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                placeholder={`Hi ${profile.displayName}, we need help architecting our microservices and Next.js platform...`}
                className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-[#1dbf73] focus:outline-none"
              />
              <button
                type="submit"
                disabled={sendingMessage}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1dbf73] py-3 text-xs font-bold text-white hover:bg-[#19a463] disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{sendingMessage ? "Sending..." : "Send Message & Open Inbox"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
