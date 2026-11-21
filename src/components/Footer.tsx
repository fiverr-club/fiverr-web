import React from "react";
import Link from "next/link";
import { Shield, Server, Cpu, Lock, ExternalLink } from "lucide-react";

export function Footer() {
  const techDocsUrl =
    process.env.NEXT_PUBLIC_TECH_DOCS_URL ||
    "https://fiverr-technical-doc.vercel.app";

  return (
    <footer className="border-t border-gray-200 bg-white text-gray-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center whitespace-nowrap text-2xl font-extrabold tracking-tight text-gray-900">
              <span>FIVERREX</span>
              <span className="text-[#1dbf73]">.</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              Cloud-native freelance services marketplace for engineering, AI, DevOps, and design
              teams with milestone-backed escrow protection.
            </p>
            <div className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-emerald-700">
              <Shield className="h-4 w-4 shrink-0 text-[#1dbf73]" />
              <span>100% Payment Escrow Protected</span>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-900">
              Categories
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/?category=Programming+%26+Tech" className="transition hover:text-[#1dbf73]">
                  Programming &amp; Tech
                </Link>
              </li>
              <li>
                <Link href="/?category=AI+Services" className="transition hover:text-[#1dbf73]">
                  AI Agents &amp; LLM Services
                </Link>
              </li>
              <li>
                <Link href="/?category=Cloud+%26+DevOps" className="transition hover:text-[#1dbf73]">
                  Kubernetes &amp; DevOps
                </Link>
              </li>
              <li>
                <Link href="/?category=Graphics+%26+Design" className="transition hover:text-[#1dbf73]">
                  UI/UX &amp; Design Systems
                </Link>
              </li>
              <li>
                <Link href="/?category=Video+%26+Animation" className="transition hover:text-[#1dbf73]">
                  Video &amp; 3D Motion
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-900">
              Marketplace &amp; Account
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="transition hover:text-[#1dbf73]">
                  About FIVERREX
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="transition hover:text-[#1dbf73]">
                  Open Jobs &amp; Project Bidding
                </Link>
              </li>
              <li>
                <Link href="/credits" className="transition hover:text-[#1dbf73]">
                  Credits &amp; Invite (+500 Credits)
                </Link>
              </li>
              <li>
                <Link href="/quests" className="transition hover:text-[#1dbf73]">
                  Quests &amp; Telegram (+500 Credits)
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="font-semibold text-[#1dbf73] hover:underline">
                  AI Agent Copilot (Gemini)
                </Link>
              </li>
              <li>
                <Link href="/sellers" className="transition hover:text-[#1dbf73]">
                  Verified Freelancers Directory
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="transition hover:text-[#1dbf73]">
                  Saved Gigs Wishlist
                </Link>
              </li>
              <li>
                <Link href="/inbox" className="transition hover:text-[#1dbf73]">
                  Real-Time Inbox &amp; Custom Offers
                </Link>
              </li>
              <li>
                <Link href="/orders" className="transition hover:text-[#1dbf73]">
                  Buyer &amp; Seller Order Escrow
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="transition hover:text-[#1dbf73]">
                  Seller Studio &amp; Wallet
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-[#1dbf73]">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="font-semibold text-[#1dbf73] hover:underline">
                  Join FIVERREX Free
                </Link>
              </li>
              <li>
                <a
                  href={techDocsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-gray-600 transition hover:text-[#1dbf73]"
                >
                  <span>Technical Documentation</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-900">
              Platform Architecture
            </h4>
            <div className="space-y-2.5 rounded-xl border border-gray-200 bg-gray-50/80 p-4 text-xs">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Server className="h-4 w-4 shrink-0 text-[#1dbf73]" />
                <span>Spring Cloud API Gateway</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Cpu className="h-4 w-4 shrink-0 text-indigo-600" />
                <span>9 Spring Boot 3 DDD Services</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Lock className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Escrow Saga + Kafka KRaft</span>
              </div>
              <div className="mt-3 space-y-1.5 border-t border-gray-200 pt-3">
                <a
                  href="https://t.me/devcommunity101"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between font-semibold text-[#0a4226] hover:text-[#1dbf73]"
                >
                  <span>Telegram DevCommunity101</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://t.me/agent_programming_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-gray-600 hover:text-[#1dbf73]"
                >
                  <span>@agent_programming_bot</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://t.me/Fiverrex_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-gray-600 hover:text-[#1dbf73]"
                >
                  <span>@Fiverrex_bot (Job Feed)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://t.me/reaction_news_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-gray-600 hover:text-[#1dbf73]"
                >
                  <span>@reaction_news_bot (Reaction &amp; News)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} FIVERREX International Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 whitespace-nowrap">
            <span>Escrow Protection Guarantee</span>
            <span className="text-gray-300">•</span>
            <span>Verified Talent</span>
            <span className="text-gray-300">•</span>
            <span>USD ($)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
