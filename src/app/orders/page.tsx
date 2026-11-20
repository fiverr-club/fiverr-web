"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  UploadCloud,
  RefreshCw,
  FileText,
  Lock,
  ArrowUpRight,
  AlertCircle,
  MessageSquare,
  Search,
  Star,
  XCircle,
} from "lucide-react";
import {
  FIVERREX_DATA_EVENT,
  SEED_ORDERS,
  SEED_ESCROW_TRANSACTIONS,
  fiverrApi,
  getStoredEscrows,
  getStoredOrders,
  type Order,
  type OrderStatus,
  type EscrowTransactionItem,
} from "@/lib/api";

function OrdersWorkspaceContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [escrows, setEscrows] = useState<EscrowTransactionItem[]>(SEED_ESCROW_TRANSACTIONS);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(SEED_ORDERS[0].id);
  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [orderSearch, setOrderSearch] = useState<string>("");
  const [roleView, setRoleView] = useState<"BUYER" | "SELLER">("BUYER");
  const [deliveryInput, setDeliveryInput] = useState<string>("");
  const [revisionOpen, setRevisionOpen] = useState<boolean>(false);
  const [revisionReason, setRevisionReason] = useState<string>("");
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<boolean>(false);

  useEffect(() => {
    const requestedOrderId = searchParams.get("order")?.trim();

    async function loadOrdersAndEscrow() {
      const [liveOrders, liveEscrows] = await Promise.all([
        fiverrApi.getOrders(),
        fiverrApi.getEscrowTransactions(),
      ]);
      const list = liveOrders && liveOrders.length > 0 ? liveOrders : getStoredOrders();
      setOrders(list);
      if (requestedOrderId && list.some((o) => o.id === requestedOrderId)) {
        setSelectedOrderId(requestedOrderId);
      } else {
        setSelectedOrderId((prev) => (list.some((o) => o.id === prev) ? prev : list[0]?.id || ""));
      }
      if (liveEscrows && liveEscrows.length > 0) {
        setEscrows(liveEscrows);
      }
    }
    loadOrdersAndEscrow();

    const syncLocal = () => {
      setOrders(getStoredOrders());
      setEscrows(getStoredEscrows());
    };
    window.addEventListener(FIVERREX_DATA_EVENT, syncLocal);
    return () => window.removeEventListener(FIVERREX_DATA_EVENT, syncLocal);
  }, [searchParams]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((ord) => {
      if (statusFilter !== "ALL" && ord.status !== statusFilter) return false;
      if (q) {
        return (
          ord.orderNumber.toLowerCase().includes(q) ||
          ord.gigTitle.toLowerCase().includes(q) ||
          ord.sellerName.toLowerCase().includes(q) ||
          ord.buyerName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, statusFilter, orderSearch]);

  const activeOrder =
    orders.find((o) => o.id === selectedOrderId) || filteredOrders[0] || orders[0];
  const activeEscrow = escrows.find((e) => e.orderId === activeOrder?.id);

  async function handleSubmitDelivery(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrder) return;
    setBusyAction(true);
    const note =
      deliveryInput.trim() ||
      "Updated build artifacts and Helm release manifests uploaded for verification.";
    await fiverrApi.deliverOrder(activeOrder.id, {
      sellerId: activeOrder.sellerId,
      deliveryNote: note,
      deliverableUrl: "https://github.com/fiverrex/deliverables-release-v1.zip",
    });
    await fiverrApi.sendNotification({
      type: "ORDER_DELIVERED",
      title: `Delivery Submitted (${activeOrder.orderNumber})`,
      message: `${activeOrder.sellerName} submitted deliverables for "${activeOrder.gigTitle}".`,
      channel: "IN_APP",
    });
    setOrders(getStoredOrders());
    setDeliveryInput("");
    setBusyAction(false);
    setActionToast(`Order ${activeOrder.orderNumber} marked as DELIVERED and buyer notified!`);
  }

  async function handleRequestRevision(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!activeOrder) return;
    setBusyAction(true);
    const reason =
      revisionReason.trim() ||
      "Please add additional integration test coverage and deployment documentation.";
    await fiverrApi.requestRevision(activeOrder.id, {
      buyerId: activeOrder.buyerId,
      reason,
    });
    setOrders(getStoredOrders());
    setRevisionReason("");
    setRevisionOpen(false);
    setBusyAction(false);
    setActionToast(`Revision requested on ${activeOrder.orderNumber}. Seller has been notified.`);
  }

  async function handleApproveAndReleaseEscrow() {
    if (!activeOrder) return;
    setBusyAction(true);
    await Promise.all([
      fiverrApi.completeOrder(activeOrder.id, activeOrder.buyerId),
      fiverrApi.releaseEscrow(activeOrder.id),
      fiverrApi.sendNotification({
        type: "ESCROW_RELEASED",
        title: `Escrow Released (${activeOrder.orderNumber})`,
        message: `$${activeOrder.totalEscrow.toFixed(2)} released to ${activeOrder.sellerName}'s Seller Studio wallet.`,
        channel: "IN_APP",
      }),
    ]);
    setOrders(getStoredOrders());
    setEscrows(getStoredEscrows());
    setBusyAction(false);
    window.dispatchEvent(new CustomEvent("fiverrex-session-change"));
    setActionToast(
      `Escrow of $${activeOrder.totalEscrow.toFixed(2)} released to ${activeOrder.sellerName}'s wallet!`
    );
  }

  async function handleCancelOrder() {
    if (!activeOrder || activeOrder.status === "COMPLETED" || activeOrder.status === "CANCELLED") {
      return;
    }
    setBusyAction(true);
    await fiverrApi.cancelOrder(activeOrder.id);
    await fiverrApi.sendNotification({
      type: "ORDER_CANCELLED",
      title: `Order Cancelled & Refunded (${activeOrder.orderNumber})`,
      message: `Escrow deposit of $${activeOrder.totalEscrow.toFixed(2)} has been refunded.`,
      channel: "IN_APP",
    });
    setOrders(getStoredOrders());
    setEscrows(getStoredEscrows());
    setBusyAction(false);
    setActionToast(`Order ${activeOrder.orderNumber} cancelled and escrow refunded.`);
  }

  const timelineSteps: { key: OrderStatus; label: string; desc: string }[] = [
    {
      key: "IN_PROGRESS",
      label: "1. Escrow Funded & In Progress",
      desc: "Funds locked in fiverr-payment-service ledger",
    },
    {
      key: "DELIVERED",
      label: "2. Work Delivered",
      desc: "Artifacts submitted by Seller for inspection",
    },
    {
      key: "COMPLETED",
      label: "3. Approved & Escrow Released",
      desc: "Payout settled to Seller Available Balance",
    },
  ];

  function getStepState(stepKey: OrderStatus, currentStatus: OrderStatus) {
    const rank: Record<OrderStatus, number> = {
      IN_PROGRESS: 1,
      REVISION_REQUESTED: 1,
      DELIVERED: 2,
      COMPLETED: 3,
      CANCELLED: 0,
    };
    const currentRank = rank[currentStatus];
    const stepRank = rank[stepKey];
    if (currentRank > stepRank || currentStatus === "COMPLETED") return "DONE";
    if (currentRank === stepRank) return "ACTIVE";
    return "PENDING";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Role Switcher */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#1dbf73]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Order &amp; Escrow Saga Workspace
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Manage Orders &amp; Escrow Releases
          </h1>
        </div>

        {/* Buyer vs Seller Interactive Mode Toggle */}
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setRoleView("BUYER")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              roleView === "BUYER"
                ? "bg-[#1dbf73] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Buyer View (Approve / Revision)
          </button>
          <button
            type="button"
            onClick={() => setRoleView("SELLER")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              roleView === "SELLER"
                ? "bg-[#0a4226] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Seller View (Submit Delivery)
          </button>
        </div>
      </div>

      {actionToast && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-950 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#1dbf73]" />
            <span>{actionToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionToast(null)}
            className="text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left List of Orders */}
        <div className="space-y-3 lg:col-span-4">
          <div className="space-y-2.5 rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order # or service..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-xs text-gray-800 focus:border-[#1dbf73] focus:bg-white focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {(["ALL", "IN_PROGRESS", "DELIVERED", "REVISION_REQUESTED", "COMPLETED", "CANCELLED"] as const).map(
                (st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${
                      statusFilter === st
                        ? "bg-[#0a4226] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {st === "ALL" ? `All (${orders.length})` : st.replace("_", " ")}
                  </button>
                )
              )}
            </div>
          </div>

          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Matching Orders ({filteredOrders.length})
          </h2>
          {filteredOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-xs text-gray-500">
              No orders match this filter.
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isSelected = ord.id === activeOrder.id;
              return (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? "border-[#1dbf73] bg-emerald-50/40 ring-2 ring-[#1dbf73]/20"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-gray-900">
                      {ord.orderNumber}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        ord.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : ord.status === "DELIVERED"
                          ? "bg-amber-100 text-amber-800"
                          : ord.status === "REVISION_REQUESTED"
                          ? "bg-rose-100 text-rose-800"
                          : ord.status === "CANCELLED"
                          ? "bg-gray-200 text-gray-600"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {ord.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-bold text-gray-800">
                    {ord.gigTitle}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-[11px] text-gray-500">
                    <span>
                      {ord.packageTier} • Seller: @{ord.sellerUsername}
                    </span>
                    <span className="font-extrabold text-gray-900">
                      ${ord.totalEscrow.toFixed(2)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Order Detail & Escrow Action Panel */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Top Order Banner */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-5">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <img
                  src={activeOrder.gigThumbnail}
                  alt={activeOrder.gigTitle}
                  className="h-16 w-24 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-gray-900">
                      {activeOrder.orderNumber}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
                      {activeOrder.packageTier} Tier
                    </span>
                    {activeEscrow?.gatewayChargeId && (
                      <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                        {activeEscrow.gatewayChargeId}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/gigs/${activeOrder.gigId}`}
                    className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-gray-900 hover:text-[#1dbf73]"
                  >
                    <span>{activeOrder.gigTitle}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <p className="mt-1 text-xs text-gray-500">
                    Seller:{" "}
                    <span className="font-semibold text-gray-800">{activeOrder.sellerName}</span> (
                    {activeOrder.sellerLevel}) • Buyer:{" "}
                    <span className="font-semibold text-gray-800">{activeOrder.buyerName}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-right">
                <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-emerald-800">
                  <Lock className="h-3.5 w-3.5 text-[#1dbf73]" />
                  <span>
                    {activeOrder.status === "COMPLETED" || activeEscrow?.status === "RELEASED"
                      ? "Escrow Released"
                      : "Held in Escrow"}
                  </span>
                </div>
                <p className="text-xl font-extrabold text-gray-900">
                  ${activeOrder.totalEscrow.toFixed(2)}
                </p>
              </div>
            </div>

            {/* 3-Step Escrow Status Timeline */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Escrow Lifecycle Timeline
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {timelineSteps.map((step) => {
                  const state = getStepState(step.key, activeOrder.status);
                  return (
                    <div
                      key={step.key}
                      className={`rounded-xl border p-3.5 ${
                        state === "DONE"
                          ? "border-emerald-300 bg-emerald-50/70"
                          : state === "ACTIVE"
                          ? "border-[#1dbf73] bg-white ring-2 ring-[#1dbf73]/20"
                          : "border-gray-200 bg-gray-50 opacity-65"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-gray-900">{step.label}</span>
                        <CheckCircle2
                          className={`h-4 w-4 ${
                            state === "DONE" || state === "ACTIVE"
                              ? "text-[#1dbf73]"
                              : "text-gray-300"
                          }`}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-gray-600">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Countdown & Revisions Info */}
            <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 text-xs sm:grid-cols-3">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[#1dbf73]" />
                <div>
                  <span className="text-gray-500">Target Delivery Date</span>
                  <p className="font-bold text-gray-900">
                    {new Date(activeOrder.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshCw className="h-4 w-4 text-[#1dbf73]" />
                <div>
                  <span className="text-gray-500">Revisions Used</span>
                  <p className="font-bold text-gray-900">
                    {activeOrder.revisionsUsed} / {activeOrder.revisionsAllowed}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 text-[#1dbf73]" />
                <div>
                  <span className="text-gray-500">Current Saga State</span>
                  <p className="font-mono font-bold text-gray-900">{activeOrder.status}</p>
                </div>
              </div>
            </div>

            {/* Buyer Requirements */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Submitted Project Requirements
              </h4>
              <p className="mt-2 rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 text-xs leading-relaxed text-gray-700">
                {activeOrder.requirements}
              </p>
            </div>

            {/* Delivery Package Box */}
            {activeOrder.deliveryNote && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0a4226]">
                  <UploadCloud className="h-4 w-4 text-[#1dbf73]" />
                  <span>Latest Delivery from {activeOrder.sellerName}</span>
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-gray-700">
                  {activeOrder.deliveryNote}
                </p>
                {activeOrder.deliveryAttachments && activeOrder.deliveryAttachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeOrder.deliveryAttachments.map((file) => (
                      <span
                        key={file}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm"
                      >
                        <FileText className="h-3.5 w-3.5 text-[#1dbf73]" />
                        {file}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Interactive Actions based on Role View */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              {roleView === "BUYER" ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Buyer Escrow Controls
                  </h4>
                  {activeOrder.status === "COMPLETED" ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-900">
                      <span>
                        This order is COMPLETED and the ${activeOrder.totalEscrow.toFixed(2)} escrow
                        has been released to the seller.
                      </span>
                      <Link
                        href={`/gigs/${activeOrder.gigId}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1dbf73] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#19a463]"
                      >
                        <Star className="h-3.5 w-3.5" />
                        <span>Leave Verified Review</span>
                      </Link>
                    </div>
                  ) : activeOrder.status === "CANCELLED" ? (
                    <div className="rounded-xl bg-gray-100 p-4 text-xs font-bold text-gray-700">
                      This order was CANCELLED and the ${activeOrder.totalEscrow.toFixed(2)} escrow
                      deposit has been refunded.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={busyAction}
                          onClick={handleApproveAndReleaseEscrow}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#1dbf73] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#19a463] disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>
                            {busyAction
                              ? "Releasing Escrow..."
                              : `Approve Delivery & Release Escrow ($${activeOrder.totalEscrow.toFixed(
                                  2
                                )})`}
                          </span>
                        </button>

                        <button
                          type="button"
                          disabled={busyAction}
                          onClick={() => setRevisionOpen((prev) => !prev)}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                          <RefreshCw className="h-4 w-4 text-amber-600" />
                          <span>Request Revision</span>
                        </button>

                        <Link
                          href={`/inbox?seller=${encodeURIComponent(activeOrder.sellerUsername)}&gig=${encodeURIComponent(activeOrder.gigId)}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs font-bold text-gray-700 transition hover:border-[#1dbf73] hover:text-[#0a4226]"
                        >
                          <MessageSquare className="h-4 w-4 text-[#1dbf73]" />
                          <span>Message Seller</span>
                        </Link>

                        <button
                          type="button"
                          disabled={busyAction}
                          onClick={handleCancelOrder}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Cancel &amp; Refund</span>
                        </button>
                      </div>

                      {revisionOpen && (
                        <form
                          onSubmit={handleRequestRevision}
                          className="space-y-2.5 rounded-xl border border-amber-200 bg-amber-50/60 p-4"
                        >
                          <label className="block text-xs font-bold text-amber-950">
                            Describe what needs to be revised:
                          </label>
                          <textarea
                            rows={2}
                            required
                            value={revisionReason}
                            onChange={(e) => setRevisionReason(e.target.value)}
                            placeholder="e.g. Please add integration tests for the refund flow and update README steps..."
                            className="w-full rounded-lg border border-amber-300 bg-white p-2.5 text-xs focus:border-[#1dbf73] focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={busyAction}
                              className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50"
                            >
                              Send Revision Request
                            </button>
                            <button
                              type="button"
                              onClick={() => setRevisionOpen(false)}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmitDelivery} className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Seller Delivery Submission
                  </h4>
                  <textarea
                    rows={3}
                    value={deliveryInput}
                    onChange={(e) => setDeliveryInput(e.target.value)}
                    placeholder="Write your release notes, Git commit SHA, or deployment verification summary..."
                    className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-[#1dbf73] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={busyAction}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0a4226] px-5 py-3 text-xs font-bold text-white transition hover:bg-emerald-900 disabled:opacity-50"
                  >
                    <UploadCloud className="h-4 w-4 text-[#1dbf73]" />
                    <span>
                      {busyAction ? "Uploading Delivery..." : "Submit Delivery & Notify Buyer"}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersWorkspacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <OrdersWorkspaceContent />
    </Suspense>
  );
}
