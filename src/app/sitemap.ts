import type { MetadataRoute } from "next";
import { SEED_GIGS, SEED_USER_PROFILES } from "@/lib/api";
import { SEED_JOBS } from "@/lib/jobs";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://fiverrex.vercel.app"
  ).replace(/\/+$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/jobs",
    "/quests",
    "/credits",
    "/sellers",
    "/ai-assistant",
    "/orders",
    "/inbox",
    "/favorites",
    "/seller/dashboard",
    "/about",
    "/login",
    "/register",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/jobs" ? "hourly" : "daily",
    priority: path === "" ? 1.0 : path === "/jobs" || path === "/quests" ? 0.9 : 0.75,
  }));

  const gigRoutes: MetadataRoute.Sitemap = SEED_GIGS.map((gig) => ({
    url: `${siteUrl}/gigs/${gig.id}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const sellerRoutes: MetadataRoute.Sitemap = SEED_USER_PROFILES.map((seller) => ({
    url: `${siteUrl}/sellers/${seller.username}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const featuredJobRoutes: MetadataRoute.Sitemap = SEED_JOBS.slice(0, 40).map((job) => ({
    url: `${siteUrl}/jobs/${job.id}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.75,
  }));

  return [...staticRoutes, ...gigRoutes, ...sellerRoutes, ...featuredJobRoutes];
}
