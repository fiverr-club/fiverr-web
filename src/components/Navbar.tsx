"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Explore Marketplace", icon: Sparkles },
    { href: "/orders", label: "Orders & Escrow", icon: Briefcase, badge: "3" },
    { href: "/inbox", label: "Inbox", icon: MessageSquare, badge: "1" },
    { href: "/seller/dashboard", label: "Seller Studio", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center whitespace-nowrap text-2xl font-extrabold tracking-tight text-gray-900"
          >
            <span>FIVERREX</span>
            <span className="text-[#1dbf73]">.</span>
          </Link>

          <div className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-xs font-medium text-emerald-900 xl:flex">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#1dbf73]" />
            <span className="whitespace-nowrap">100% Escrow Protected</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-[#1dbf73]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden whitespace-nowrap md:inline">{item.label}</span>
                {item.badge && (
                  <span className="ml-0.5 inline-flex h-4 min-w-[16px] shrink-0 items-center justify-center rounded-full bg-[#1dbf73] px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / Gateway Status Pill */}
        <div className="flex shrink-0 items-center gap-2.5">
          <Link
            href="/seller/dashboard"
            className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-[#1dbf73] px-3 py-1.5 text-xs font-bold text-[#1dbf73] transition hover:bg-[#1dbf73] hover:text-white sm:inline-flex"
          >
            <UserCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">Switch to Selling</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 py-1 pl-1 pr-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Profile"
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
            <div className="hidden text-left text-xs leading-tight sm:block">
              <p className="whitespace-nowrap font-bold text-gray-900">Jordan Taylor</p>
              <p className="whitespace-nowrap text-[10px] font-semibold text-[#1dbf73]">
                $8,420.50 Balance
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
