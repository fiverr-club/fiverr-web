"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  Check,
  Coins,
  FolderKanban,
  Heart,
  Info,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Trophy,
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
  clearAuthSession,
  DEFAULT_AUTH_ACCOUNTS,
  FIVERREX_DATA_EVENT,
  fiverrApi,
  getAuthSession,
  getDefaultAuthSession,
  getRegisteredAccounts,
  getSavedGigIds,
  getStoredConversations,
  getStoredNotifications,
  getStoredOrders,
  getStoredWallets,
  isLoggedIn,
  SEED_NOTIFICATIONS,
  setAuthSession,
} from "@/lib/api";
import {
  getUserCreditAccount,
  initializeNewUserCredits,
  NEW_ACCOUNT_CREDITS,
} from "@/lib/jobs";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const notifContainerRef = useRef<HTMLDivElement>(null);

  const [session, setSession] = useState<AuthSession>(getDefaultAuthSession);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [credits, setCredits] = useState<number>(NEW_ACCOUNT_CREDITS);
  const [walletBalance, setWalletBalance] = useState<number>(1476.0);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(SEED_NOTIFICATIONS);
  const [accounts, setAccounts] = useState<AuthAccountDto[]>(DEFAULT_AUTH_ACCOUNTS);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);
  const [unreadInboxCount, setUnreadInboxCount] = useState<number>(0);

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
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
    function syncLocalCounters() {
      const currentSession = getAuthSession();
      setSavedCount(getSavedGigIds().length);
      const localOrders = getStoredOrders();
      setActiveOrdersCount(
        localOrders.filter((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED").length
      );
      const localConvs = getStoredConversations();
      setUnreadInboxCount(
        localConvs.reduce((sum, c) => sum + Number(c.unreadCount || 0), 0)
      );
      const localNotifs = getStoredNotifications();
      setNotifications(localNotifs);
      const localWallets = getStoredWallets();
      if (localWallets.length > 0) {
        const matched =
          localWallets.find(
            (w) =>
              w.sellerId === currentSession.account.id ||
              w.sellerId === currentSession.sellerId
          ) || localWallets[0];
        setWalletBalance(Number(matched?.availableBalance ?? 1476.0));
      }
    }

    const initialSession = getAuthSession();
    setSession(initialSession);
    setLoggedIn(isLoggedIn());
    setCredits(getUserCreditAccount(initialSession.account.username).credits);
    syncLocalCounters();

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

      const localRegistered = getRegisteredAccounts();
      const remoteOrDefault =
        fetchedAccounts && fetchedAccounts.length > 0 ? fetchedAccounts : DEFAULT_AUTH_ACCOUNTS;
      const merged = [...localRegistered];
      for (const acc of remoteOrDefault) {
        if (!merged.some((m) => m.username.toLowerCase() === acc.username.toLowerCase())) {
          merged.push(acc);
        }
      }
      setAccounts(merged);
    }

    loadNavbarData();

    const handleSessionChange = () => {
      const next = getAuthSession();
      setSession(next);
      setLoggedIn(isLoggedIn());
      setCredits(getUserCreditAccount(next.account.username).credits);
      syncLocalCounters();
      loadNavbarData();
    };
    const handleCreditsChange = () => {
      const current = getAuthSession();
      setCredits(getUserCreditAccount(current.account.username).credits);
    };
    const handleFavChange = () => {
      setSavedCount(getSavedGigIds().length);
    };
    const handleDataChange = () => {
      syncLocalCounters();
    };
    window.addEventListener("fiverrex-session-change", handleSessionChange);
    window.addEventListener("fiverrex-credits-change", handleCreditsChange);
    window.addEventListener("fiverrex-favorites-change", handleFavChange);
    window.addEventListener(FIVERREX_DATA_EVENT, handleDataChange);
    return () => {
      window.removeEventListener("fiverrex-session-change", handleSessionChange);
      window.removeEventListener("fiverrex-credits-change", handleCreditsChange);
      window.removeEventListener("fiverrex-favorites-change", handleFavChange);
      window.removeEventListener(FIVERREX_DATA_EVENT, handleDataChange);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setAuthModalOpen(false);
        setMobileMenuOpen(false);
      }
    }
    function handleClickOutside(e: MouseEvent) {
      if (
        notifContainerRef.current &&
        !notifContainerRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleMarkRead(id: string) {
    const updated = await fiverrApi.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, readAt: updated.readAt } : n))
    );
  }

  function handleMarkAllRead() {
    const updated = fiverrApi.markAllNotificationsRead();
    setNotifications(updated);
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
    setAuthFeedback(`Signed in as @${nextSession.account.username}`);
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
    initializeNewUserCredits(nextSession.account.username);
    setSession(nextSession);
    setLoggedIn(true);
    setAccounts((prev) => [nextSession.account, ...prev]);
    setAuthFeedback(
      `Account @${nextSession.account.username} created with ${NEW_ACCOUNT_CREDITS} Credits!`
    );
    setRegUsername("");
    setRegEmail("");
    setTimeout(() => {
      setAuthFeedback(null);
      setAuthModalOpen(false);
    }, 900);
  }

  function handleSignOut() {
    clearAuthSession();
    setLoggedIn(false);
    setAuthModalOpen(false);
    setMobileMenuOpen(false);
  }

  const navItems = [
    { href: "/", label: "Explore", icon: Sparkles },
    { href: "/jobs", label: "Jobs", icon: FolderKanban },
    { href: "/quests", label: "Quests", icon: Trophy, badge: "+500" },
    { href: "/ai-assistant", label: "AI Copilot", icon: Bot },
    { href: "/sellers", label: "Freelancers", icon: Users },
    {
      href: "/orders",
      label: "Orders",
      icon: Briefcase,
      badge: activeOrdersCount > 0 ? String(activeOrdersCount) : undefined,
    },
    {
      href: "/inbox",
      label: "Inbox",
      icon: MessageSquare,
      badge: unreadInboxCount > 0 ? String(unreadInboxCount) : undefined,
    },
    { href: "/seller/dashboard", label: "Studio", icon: LayoutDashboard },
  ];

  const techDocsUrl =
    process.env.NEXT_PUBLIC_TECH_DOCS_URL ||
    "https://fiverr-technical-doc.vercel.app";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo + Mobile Menu Toggle */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 transition hover:border-[#1dbf73] hover:text-[#1dbf73] lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <Link
            href="/"
            className="flex shrink-0 items-center whitespace-nowrap text-2xl font-extrabold tracking-tight text-gray-900"
          >
            <span>FIVERREX</span>
            <span className="text-[#1dbf73]">.</span>
          </Link>

          <div className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-xs font-medium text-emerald-900 2xl:flex">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#1dbf73]" />
            <span className="whitespace-nowrap">100% Escrow Protected</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden shrink-0 items-center gap-0.5 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-[#1dbf73]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
                {item.badge && (
                  <span className="ml-0.5 inline-flex h-4 min-w-[16px] shrink-0 items-center justify-center rounded-full bg-[#1dbf73] px-1 text-[10px] font-bold tabular-nums text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <a
            href={techDocsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 2xl:flex"
          >
            <BookOpen className="h-4 w-4 shrink-0 text-[#1dbf73]" />
            <span className="whitespace-nowrap">Tech Docs</span>
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {loggedIn && (
            <Link
              href="/credits"
              title="Bidding Credits & Referral Rewards (+500 per invite)"
              className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold tabular-nums text-amber-900 transition hover:border-amber-300 hover:bg-amber-100 sm:inline-flex"
            >
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              <span>{credits} Credits</span>
            </Link>
          )}

          {loggedIn && (
            <button
              type="button"
              onClick={handleSwitchToSelling}
              disabled={upgradingSeller}
              className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#1dbf73] px-3 py-1.5 text-xs font-bold text-[#1dbf73] transition hover:bg-[#1dbf73] hover:text-white disabled:opacity-50 2xl:inline-flex"
            >
              <UserCheck className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">
                {upgradingSeller ? "Upgrading..." : "Switch to Selling"}
              </span>
            </button>
          )}

          {/* Saved / Wishlist Link */}
          <Link
            href="/favorites"
            aria-label="Saved Gigs Wishlist"
            title="Saved Gigs Wishlist"
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
              pathname === "/favorites"
                ? "border-rose-300 bg-rose-50 text-rose-500"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:border-rose-400 hover:text-rose-500"
            }`}
          >
            <Heart
              className={`h-4 w-4 shrink-0 ${
                savedCount > 0 ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
            {savedCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold tabular-nums text-white">
                {savedCount}
              </span>
            )}
          </Link>

          {/* Notification Bell Popover (when signed in) */}
          {loggedIn && (
            <div ref={notifContainerRef} className="relative shrink-0">
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={notifOpen}
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 transition hover:border-[#1dbf73] hover:text-[#1dbf73]"
              >
                <Bell className="h-4 w-4 shrink-0" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#1dbf73] px-1 text-[10px] font-bold tabular-nums text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-xs overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl sm:w-80">
                  <div className="flex items-center justify-between border-b border-gray-100 bg-[#0a4226] px-4 py-3 text-white">
                    <div>
                      <p className="text-xs font-bold">Notifications</p>
                      <p className="text-[10px] text-emerald-200">
                        {unreadCount} unread updates
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold text-white transition hover:bg-white/25"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Close notifications"
                        onClick={() => setNotifOpen(false)}
                        className="rounded p-1 text-white/80 hover:bg-white/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
          )}

          {loggedIn ? (
            /* User Profile & Auth Switcher Pill */
            <button
              type="button"
              onClick={() => {
                setAuthFeedback(null);
                setAuthModalOpen(true);
              }}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 p-1 text-left transition hover:border-[#1dbf73] sm:pr-3"
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
                <p className="whitespace-nowrap text-[10px] font-semibold tabular-nums text-[#1dbf73]">
                  ${walletBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} Balance
                </p>
              </div>
            </button>
          ) : (
            /* Sign In + Join Free Buttons */
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition ${
                  pathname === "/login"
                    ? "bg-emerald-50 text-[#1dbf73]"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="whitespace-nowrap rounded-lg bg-[#1dbf73] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#19a463]"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-emerald-50 text-[#1dbf73]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1dbf73] px-1.5 text-[11px] font-bold tabular-nums text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                pathname === "/about"
                  ? "bg-emerald-50 text-[#1dbf73]"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Info className="h-4 w-4 shrink-0 text-[#1dbf73]" />
              <span>About FIVERREX</span>
            </Link>

            <a
              href={techDocsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <BookOpen className="h-4 w-4 shrink-0 text-[#1dbf73]" />
              <span>Tech Docs</span>
            </a>

            <div className="mt-2 space-y-2 border-t border-gray-100 pt-3">
              {loggedIn ? (
                <>
                  <Link
                    href="/credits"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-900"
                  >
                    <span className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-amber-500" />
                      <span>My Bidding Credits</span>
                    </span>
                    <span className="tabular-nums">{credits} Credits (+500/invite)</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSwitchToSelling();
                    }}
                    disabled={upgradingSeller}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1dbf73] bg-emerald-50/50 py-2.5 text-xs font-bold text-[#0a4226] transition hover:bg-[#1dbf73] hover:text-white disabled:opacity-50"
                  >
                    <UserCheck className="h-4 w-4 shrink-0" />
                    <span>{upgradingSeller ? "Upgrading..." : "Switch to Selling"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>Sign Out (@{session.account.username})</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-gray-300 py-2.5 text-center text-xs font-bold text-gray-800 hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl bg-[#1dbf73] py-2.5 text-center text-xs font-bold text-white hover:bg-[#19a463]"
                  >
                    Join Free
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Account & JWT Auth Modal */}
      {authModalOpen && (
        <div
          onClick={() => setAuthModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#0a4226] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#1dbf73]" />
                <div>
                  <h3 className="text-sm font-bold">
                    FIVERREX Account &amp; Session
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    Active: @{session.account.username}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close account modal"
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
                className={`flex items-center justify-center gap-1.5 border-b-2 py-3 transition ${
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
                className={`flex items-center justify-center gap-1.5 border-b-2 py-3 transition ${
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
                className={`flex items-center justify-center gap-1.5 border-b-2 py-3 transition ${
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
                    Select an active workspace account to switch roles:
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
                    Sign In to Workspace
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
                    Create FIVERREX Account
                  </button>
                </form>
              )}

              {loggedIn && (
                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <Link
                    href="/about"
                    onClick={() => setAuthModalOpen(false)}
                    className="text-xs font-semibold text-gray-500 hover:text-[#1dbf73]"
                  >
                    About FIVERREX
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
