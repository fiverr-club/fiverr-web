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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center text-2xl font-extrabold tracking-tight text-gray-900">
            <span>fiverr</span>
            <span className="text-[#1dbf73]">.</span>
            <span className="ml-1.5 rounded bg-[#0a4226] px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#1dbf73]">
              club
            </span>
          </Link>

          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-xs font-medium text-emerald-900 lg:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-[#1dbf73]" />
            <span>100% Escrow Protected</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-[#1dbf73]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
                {item.badge && (
                  <span className="ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#1dbf73] px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / Gateway Status Pill */}
        <div className="flex items-center gap-3">
          <Link
            href="/seller/dashboard"
            className="hidden items-center gap-1.5 rounded-md border border-[#1dbf73] px-3.5 py-1.5 text-xs font-bold text-[#1dbf73] transition hover:bg-[#1dbf73] hover:text-white sm:inline-flex"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Switch to Selling</span>
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-1 pl-1 pr-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Profile"
              className="h-7 w-7 rounded-full object-cover"
            />
            <div className="hidden text-left text-xs leading-tight sm:block">
              <p className="font-bold text-gray-900">Jordan Taylor</p>
              <p className="text-[10px] font-semibold text-[#1dbf73]">$8,420.50 Balance</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
