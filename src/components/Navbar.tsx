"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  Check,
  KeyRound,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  type AuthAccountDto,
  type AuthSession,
  type NotificationItem,
  buildSessionForAccount,
  DEFAULT_AUTH_ACCOUNTS,
  fiverrApi,
  getAuthSession,
  SEED_NOTIFICATIONS,
  setAuthSession,
} from "@/lib/api";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [session, setSession] = useState<AuthSession>(getAuthSession);
  const [walletBalance, setWalletBalance] = useState<number>(1476.0);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(SEED_NOTIFICATIONS);
  const [accounts, setAccounts] = useState<AuthAccountDto[]>(DEFAULT_AUTH_ACCOUNTS);

  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<"SWITCH" | "LOGIN" | "REGISTER">("SWITCH");
  const [upgradingSeller, setUpgradingSeller] = useState<boolean>(false);

  // Login / Register Form States
  const [loginInput, setLoginInput] = useState<string>("alex_architect");
  const [loginPassword, setLoginPassword] = useState<string>("Password123!");
  const [regUsername, setRegUsername] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("Password123!");
  const [authFeedback, setAuthFeedback] = useState<string | null>(null);

  useEffect(() => {
    setSession(getAuthSession());

    async function loadNavbarData() {
      const currentSession = getAuthSession();
      const [wallets, notifs, fetchedAccounts] = await Promise.all([
        fiverrApi.getWallets(),
        fiverrApi.getNotifications(),
        fiverrApi.getAccounts(),
      ]);

      if (wallets && wallets.length > 0) {
        const matchedWallet =
          wallets.find(
            (w) =>
              w.sellerId === currentSession.account.id ||
              w.sellerId === currentSession.sellerId
          ) || wallets[0];
        const totalAvailable = wallets.reduce(
          (sum, w) => sum + Number(w.availableBalance || 0),
          0
        );
        setWalletBalance(
          Number(matchedWallet?.availableBalance ?? totalAvailable ?? 1476.0)
        );
      }

      if (notifs && notifs.length > 0) {
        setNotifications(notifs);
      }

      if (fetchedAccounts && fetchedAccounts.length > 0) {
        setAccounts(fetchedAccounts);
      }
    }

    loadNavbarData();

    const handleSessionChange = () => {
      setSession(getAuthSession());
      loadNavbarData();
    };
    window.addEventListener("fiverrex-session-change", handleSessionChange);
    return () => {
      window.removeEventListener("fiverrex-session-change", handleSessionChange);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleMarkRead(id: string) {
    const updated = await fiverrApi.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, readAt: updated.readAt } : n))
    );
  }

  async function handleSwitchToSelling() {
    setUpgradingSeller(true);
    await fiverrApi.upgradeToSeller(session.profileId, {
      headline: "Principal Distributed Systems & Full-Stack Architect",
      bio: "Verified FIVERREX Seller delivering enterprise Spring Boot 3 & Next.js 15 solutions.",
      skills: ["Spring Boot", "Next.js 15", "Kubernetes", "DDD"],
      hourlyRate: 165,
    });
    setUpgradingSeller(false);
    router.push("/seller/dashboard");
  }

  function handleSelectAccount(acc: AuthAccountDto) {
    const nextSession = buildSessionForAccount(acc, `jwt-${acc.id}`, `refresh-${acc.id}`);
    setAuthSession(nextSession);
    setSession(nextSession);
    setAuthFeedback(`Switched active session to @${acc.username} (${acc.email})`);
    setTimeout(() => {
      setAuthFeedback(null);
      setAuthModalOpen(false);
    }, 700);
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextSession = await fiverrApi.login({
      emailOrUsername: loginInput,
      password: loginPassword,
    });
    setSession(nextSession);
    setAuthFeedback(`Authenticated via POST /api/v1/auth/login as @${nextSession.account.username}`);
    setTimeout(() => {
      setAuthFeedback(null);
      setAuthModalOpen(false);
    }, 800);
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!regUsername.trim() || !regEmail.trim()) return;
    const nextSession = await fiverrApi.register({
      username: regUsername.trim(),
      email: regEmail.trim(),
      password: regPassword,
      roles: ["BUYER", "SELLER"],
    });
    setSession(nextSession);
    setAccounts((prev) => [nextSession.account, ...prev]);
    setAuthFeedback(`Registered @${nextSession.account.username} via POST /api/v1/auth/register!`);
    setRegUsername("");
    setRegEmail("");
    setTimeout(() => {
      setAuthFeedback(null);
      setAuthModalOpen(false);
    }, 900);
  }

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

        {/* Right Actions: Switch to Selling + Notification Bell + Account Switcher Pill */}
        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={handleSwitchToSelling}
            disabled={upgradingSeller}
            className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-[#1dbf73] px-3 py-1.5 text-xs font-bold text-[#1dbf73] transition hover:bg-[#1dbf73] hover:text-white disabled:opacity-50 sm:inline-flex"
          >
            <UserCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">
              {upgradingSeller ? "Upgrading..." : "Switch to Selling"}
            </span>
          </button>

          {/* Notification Bell Popover */}
          <div className="relative shrink-0">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setNotifOpen((prev) => !prev)}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 transition hover:border-[#1dbf73] hover:text-[#1dbf73]"
            >
              <Bell className="h-4 w-4 shrink-0" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#1dbf73] px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl z-50">
                <div className="flex items-center justify-between border-b border-gray-100 bg-[#0a4226] px-4 py-3 text-white">
                  <div>
                    <p className="text-xs font-bold">Notifications</p>
                    <p className="text-[10px] text-emerald-200">
                      fiverr-notification-service ({unreadCount} unread)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="rounded p-1 text-white/80 hover:bg-white/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className={`w-full p-3.5 text-left transition hover:bg-gray-50 ${
                        n.read ? "opacity-70" : "bg-emerald-50/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-900">
                          {n.type.replace(/_/g, " ")}
                        </span>
                        {!n.read ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1dbf73]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#1dbf73]" />
                            Mark read
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
                            <Check className="h-3 w-3" /> Read
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-bold text-gray-900">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-600">
                        {n.message}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Auth Switcher Pill */}
          <button
            type="button"
            onClick={() => {
              setAuthFeedback(null);
              setAuthModalOpen(true);
            }}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 py-1 pl-1 pr-3 text-left transition hover:border-[#1dbf73]"
          >
            <img
              src={session.avatarUrl}
              alt={session.displayName}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
            <div className="hidden text-left text-xs leading-tight sm:block">
              <p className="whitespace-nowrap font-bold text-gray-900">
                {session.displayName}
              </p>
              <p className="whitespace-nowrap text-[10px] font-semibold text-[#1dbf73]">
                ${walletBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} Balance
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Account & JWT Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#0a4226] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#1dbf73]" />
                <div>
                  <h3 className="text-sm font-bold">
                    FIVERREX Identity &amp; Auth (`fiverr-auth-service`)
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    Active: @{session.account.username}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthTab("SWITCH")}
                className={`flex items-center justify-center gap-1.5 py-3 border-b-2 transition ${
                  authTab === "SWITCH"
                    ? "border-[#1dbf73] bg-white text-[#1dbf73]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Switch Account</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthTab("LOGIN")}
                className={`flex items-center justify-center gap-1.5 py-3 border-b-2 transition ${
                  authTab === "LOGIN"
                    ? "border-[#1dbf73] bg-white text-[#1dbf73]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthTab("REGISTER")}
                className={`flex items-center justify-center gap-1.5 py-3 border-b-2 transition ${
                  authTab === "REGISTER"
                    ? "border-[#1dbf73] bg-white text-[#1dbf73]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Register</span>
              </button>
            </div>

            <div className="p-6">
              {authFeedback && (
                <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-bold text-emerald-900">
                  {authFeedback}
                </div>
              )}

              {authTab === "SWITCH" && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    Select a live PostgreSQL account from `GET /api/v1/auth/accounts`:
                  </p>
                  {accounts.map((acc) => {
                    const isCurrent = acc.id === session.account.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleSelectAccount(acc)}
                        className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition ${
                          isCurrent
                            ? "border-[#1dbf73] bg-emerald-50/50 ring-2 ring-[#1dbf73]/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-gray-900">
                              @{acc.username}
                            </span>
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700">
                              {Array.isArray(acc.roles) ? acc.roles.join(" • ") : "BUYER"}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-gray-500">{acc.email}</p>
                        </div>
                        {isCurrent && (
                          <span className="rounded-full bg-[#1dbf73] px-2.5 py-0.5 text-[10px] font-bold text-white">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {authTab === "LOGIN" && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Username or Email
                    </label>
                    <input
                      type="text"
                      required
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#1dbf73] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Password</label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#1dbf73] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#1dbf73] py-3 text-xs font-bold text-white transition hover:bg-[#19a463]"
                  >
                    Sign In via `POST /api/v1/auth/login`
                  </button>
                </form>
              )}

              {authTab === "REGISTER" && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Username</label>
                    <input
                      type="text"
                      required
                      minLength={3}
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. cloud_architect_99"
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#1dbf73] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="architect@fiverrex.club"
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#1dbf73] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Password (min 8 chars)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#1dbf73] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#1dbf73] py-3 text-xs font-bold text-white transition hover:bg-[#19a463]"
                  >
                    Create Account (`POST /api/v1/auth/register`)
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
