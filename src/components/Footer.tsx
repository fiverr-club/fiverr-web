import React from "react";
import Link from "next/link";
import { Shield, Server, Cpu, Lock, ExternalLink } from "lucide-react";

export function Footer() {
  const techDocsUrl =
    process.env.NEXT_PUBLIC_TECH_DOCS_URL ||
    "https://fiverr-technical-doc.vercel.app";

  return (
    <footer className="border-t border-gray-200 bg-[#0d084d]/5 text-gray-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center whitespace-nowrap text-2xl font-extrabold tracking-tight text-gray-900">
              <span>FIVERREX</span>
              <span className="text-[#1dbf73]">.</span>
            </div>
            <p className="text-sm text-gray-600">
              Cloud-native freelance services marketplace powered by 9 Spring Boot 3 DDD
              microservices, Apache Kafka event streaming, and Kubernetes Helm orchestration.
            </p>
            <div className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-emerald-700">
              <Shield className="h-4 w-4 shrink-0 text-[#1dbf73]" />
              <span>DDD Hexagonal Architecture Verified</span>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-900">
              Categories
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/?category=Programming+%26+Tech" className="hover:text-[#1dbf73]">
                  Programming &amp; Tech
                </Link>
              </li>
              <li>
                <Link href="/?category=AI+Services" className="hover:text-[#1dbf73]">
                  AI Agents &amp; LLM Services
                </Link>
              </li>
              <li>
                <Link href="/?category=Cloud+%26+DevOps" className="hover:text-[#1dbf73]">
                  Kubernetes &amp; DevOps
                </Link>
              </li>
              <li>
                <Link href="/?category=Graphics+%26+Design" className="hover:text-[#1dbf73]">
                  UI/UX &amp; Design Systems
                </Link>
              </li>
              <li>
                <Link href="/?category=Video+%26+Animation" className="hover:text-[#1dbf73]">
                  Video &amp; 3D Motion
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-900">
              Marketplace &amp; Studio
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sellers" className="hover:text-[#1dbf73]">
                  Verified Freelancers Directory
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-[#1dbf73]">
                  Saved Gigs Wishlist
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#1dbf73]">
                  Buyer &amp; Seller Order Escrow
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="hover:text-[#1dbf73]">
                  Seller Studio &amp; Wallet
                </Link>
              </li>
              <li>
                <Link href="/inbox" className="hover:text-[#1dbf73]">
                  Real-Time Messaging &amp; Custom Offers
                </Link>
              </li>
              <li>
                <a
                  href={techDocsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#1dbf73] hover:underline"
                >
                  <span>Technical Documentation</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-900">
              Microservice Gateway
            </h4>
            <div className="space-y-2.5 rounded-xl border border-gray-200 bg-white p-4 text-xs shadow-sm">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Server className="h-4 w-4 text-[#1dbf73]" />
                <span>API Gateway: :8080/api/v1</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Cpu className="h-4 w-4 text-indigo-600" />
                <span>9 Spring Boot 3 DDD Services</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Lock className="h-4 w-4 text-amber-600" />
                <span>Escrow Saga + Kafka KRaft</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t border-gray-200 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} FIVERREX International Ltd. Built with Next.js 15 &amp; Spring Boot 3 DDD.</p>
          <div className="mt-2 flex gap-4 whitespace-nowrap sm:mt-0">
            <span>Escrow Protection Guarantee</span>
            <span>•</span>
            <span>Kubernetes Ready</span>
            <span>•</span>
            <span>USD ($)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
