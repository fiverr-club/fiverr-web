import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Cpu,
  Globe,
  Layers,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "100% Milestone Escrow Protection",
    desc: "Every order deposit is locked in an isolated escrow ledger and only released to the freelancer after you review and approve the final deliverables.",
  },
  {
    icon: Layers,
    title: "Transparent 3-Tier Service Packages",
    desc: "Compare Basic, Standard, and Premium deliverables, timelines, and revision allowances side-by-side before placing any order.",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Inbox & Custom Offers",
    desc: "Discuss technical scope directly with specialists and accept tailored custom milestone offers right inside the conversation thread.",
  },
  {
    icon: Award,
    title: "Verified 3-Criteria Seller Ratings",
    desc: "Every review is tied to a completed escrow order and scored across Communication, Service as Described, and Buy Again / Recommend.",
  },
];

const TECH_STACK = [
  { label: "Frontend Experience", value: "Next.js 15 App Router • TypeScript • Tailwind CSS" },
  { label: "API Gateway & Auth", value: "Spring Cloud Gateway • JWT Security • Rate Limiting" },
  { label: "Domain Architecture", value: "9 Spring Boot 3 DDD Microservices (Hexagonal Ports & Adapters)" },
  { label: "Event Streaming & Infra", value: "Apache Kafka KRaft • PostgreSQL • Kubernetes & Helm" },
];

export default function AboutPage() {
  const techDocsUrl =
    process.env.NEXT_PUBLIC_TECH_DOCS_URL ||
    "https://fiverr-technical-doc.vercel.app";

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#0a4226] via-[#0d3b24] to-[#072617] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>About FIVERREX • Enterprise Freelance Marketplace</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Connecting ambitious teams with{" "}
              <span className="italic text-[#1dbf73]">verified</span> engineering, AI &amp; design
              talent.
            </h1>

            <p className="text-base leading-relaxed text-emerald-100/85 sm:text-lg">
              FIVERREX is a cloud-native freelance services marketplace built around transparent
              3-tier packages, verified specialist portfolios, and milestone-backed payment escrow so
              buyers and freelancers can collaborate with total confidence.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1dbf73] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#19a463]"
              >
                <span>Join FIVERREX Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sellers"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                <Users className="h-4 w-4 text-[#1dbf73]" />
                <span>Browse Verified Talent</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-white/10"
              >
                <span>Explore Gigs</span>
              </Link>
            </div>
          </div>

          {/* Highlight Metrics */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-2xl font-extrabold text-white sm:text-3xl">100%</p>
              <p className="mt-1 text-xs font-medium text-emerald-200">Escrow Protected Orders</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-2xl font-extrabold text-[#1dbf73] sm:text-3xl">3-Tier</p>
              <p className="mt-1 text-xs font-medium text-emerald-200">Transparent Package Matrix</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-2xl font-extrabold text-white sm:text-3xl">9</p>
              <p className="mt-1 text-xs font-medium text-emerald-200">DDD Microservices</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-2xl font-extrabold text-[#1dbf73] sm:text-3xl">4.94 / 5</p>
              <p className="mt-1 text-xs font-medium text-emerald-200">Verified Marketplace Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Marketplace Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0a4226]">
            Why FIVERREX
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Designed for clarity, speed, and payment safety
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Whether you are hiring a principal architect for a production sprint or offering
            specialized AI &amp; design services, every step is structured and verifiable.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#1dbf73]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-gray-900">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two-Sided Ecosystem: Buyers & Freelancers */}
      <section className="border-t border-gray-200 bg-white py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-[#0a4226]">
              <Lock className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>For Buyers &amp; Engineering Teams</span>
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-gray-900">
              Hire with predictable scope and zero payment risk
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1dbf73]" />
                <span>Filter services by category, seller level, delivery SLA, and budget.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1dbf73]" />
                <span>Bookmark top gigs into your Wishlist and compare 3-tier pricing side-by-side.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1dbf73]" />
                <span>Approve deliveries or request revisions directly from the Order Workspace.</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1dbf73] hover:underline"
              >
                <span>Start Exploring Services</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0a4226] px-3 py-1 text-xs font-bold text-white">
              <Wallet className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>For Freelancers &amp; Architects</span>
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-gray-900">
              Launch your Seller Studio and get paid on approval
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1dbf73]" />
                <span>Publish structured 3-tier Gigs with clear delivery windows and revision caps.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1dbf73]" />
                <span>Send custom milestone offers inside real-time buyer conversations.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1dbf73]" />
                <span>Track Seller Level metrics, pending escrow, and instant wallet withdrawals.</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/seller/dashboard"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#0a4226] hover:text-[#1dbf73] hover:underline"
              >
                <span>Open Seller Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud-Native Architecture Section */}
      <section className="border-t border-gray-200 bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0a4226]">
                <Cpu className="h-3.5 w-3.5 text-[#1dbf73]" />
                <span>Platform Engineering</span>
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
                Built on Domain-Driven Design &amp; Event-Driven Microservices
              </h2>
            </div>
            <a
              href={techDocsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-800 shadow-sm transition hover:border-[#1dbf73] hover:text-[#1dbf73] sm:self-auto"
            >
              <Globe className="h-4 w-4 text-[#1dbf73]" />
              <span>Read Technical Documentation</span>
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TECH_STACK.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#1dbf73]">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-gray-200 bg-white py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Ready to start on FIVERREX?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
            Create your free account in seconds to hire specialists, save shortlisted gigs, or open
            your Seller Studio.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1dbf73] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#19a463]"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-800 transition hover:border-gray-900"
            >
              <span>Sign In to Existing Account</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
