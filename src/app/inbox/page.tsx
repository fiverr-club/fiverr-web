"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Send,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck,
  PlusCircle,
  X,
} from "lucide-react";
import {
  FIVERREX_DATA_EVENT,
  SEED_CONVERSATIONS,
  fiverrApi,
  getStoredConversations,
  type Conversation,
  type PackageTierName,
} from "@/lib/api";

function InboxWorkspaceContent() {
  const searchParams = useSearchParams();
  const threadEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>(SEED_CONVERSATIONS[0].id);
  const [convSearch, setConvSearch] = useState<string>("");
  const [messageInput, setMessageInput] = useState<string>("");
  const [offerModalOpen, setOfferModalOpen] = useState<boolean>(false);
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);
  const [inboxToast, setInboxToast] = useState<{ text: string; orderId?: string } | null>(null);

  // Custom Offer Form State
  const [offerTitle, setOfferTitle] = useState<string>(
    "Custom DDD Microservice + Kubernetes Helm Package"
  );
  const [offerTier, setOfferTier] = useState<PackageTierName>("Standard");
  const [offerPrice, setOfferPrice] = useState<number>(450);
  const [offerDays, setOfferDays] = useState<number>(5);
  const [offerRevisions, setOfferRevisions] = useState<number>(4);

  useEffect(() => {
    const sellerParam = searchParams.get("seller")?.trim();
    const gigParam = searchParams.get("gig")?.trim() || undefined;

    async function loadInbox() {
      const liveConvs = await fiverrApi.getConversations();
      let list = liveConvs && liveConvs.length > 0 ? liveConvs : getStoredConversations();

      if (sellerParam) {
        const opened = fiverrApi.openOrCreateConversation({
          sellerUsername: sellerParam,
          gigId: gigParam,
        });
        list = getStoredConversations();
        setConversations(list);
        setActiveConvId(opened.id);
        fiverrApi.markConversationRead(opened.id);
        return;
      }

      setConversations(list);
      setActiveConvId((prev) => (list.some((c) => c.id === prev) ? prev : list[0].id));
    }
    loadInbox();

    const syncLocal = () => {
      setConversations(getStoredConversations());
    };
    window.addEventListener(FIVERREX_DATA_EVENT, syncLocal);
    return () => window.removeEventListener(FIVERREX_DATA_EVENT, syncLocal);
  }, [searchParams]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOfferModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredConversations = useMemo(() => {
    const q = convSearch.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.participantName.toLowerCase().includes(q) ||
        c.participantUsername.toLowerCase().includes(q) ||
        c.relatedGigTitle.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, convSearch]);

  const activeConv =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.id, activeConv?.messages.length]);

  async function handleSelectConversation(convId: string) {
    setActiveConvId(convId);
    fiverrApi.markConversationRead(convId);
    const msgs = await fiverrApi.getConversationMessages(convId);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: msgs && msgs.length > 0 ? msgs : c.messages, unreadCount: 0 }
          : c
      )
    );
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageInput.trim() || sendingMsg) return;
    setSendingMsg(true);
    const text = messageInput.trim();
    setMessageInput("");

    await fiverrApi.sendMessage({
      conversationId: activeConv.id,
      senderId: activeConv.buyerId,
      recipientId: activeConv.sellerId,
      recipientUsername: activeConv.participantUsername,
      gigId: activeConv.gigId,
      content: text,
      messageType: "TEXT",
    });

    setConversations(getStoredConversations());
    setSendingMsg(false);
  }

  async function handleSendCustomOffer(e: React.FormEvent) {
    e.preventDefault();
    setSendingMsg(true);
    const offerContent = `Custom Offer: ${offerTitle} ($${offerPrice} - ${offerDays} days delivery)`;
    await fiverrApi.sendMessage({
      conversationId: activeConv.id,
      senderId: activeConv.sellerId || "22222222-2222-2222-2222-222222222222",
      recipientId: activeConv.buyerId || "11111111-1111-1111-1111-111111111111",
      recipientUsername: activeConv.participantUsername,
      gigId: activeConv.gigId || "33333333-3333-3333-3333-333333333333",
      content: offerContent,
      messageType: "CUSTOM_OFFER",
      customOffer: {
        title: offerTitle,
        packageTier: offerTier,
        price: offerPrice,
        deliveryDays: offerDays,
        revisions: offerRevisions,
      },
    });

    setConversations(getStoredConversations());
    setSendingMsg(false);
    setOfferModalOpen(false);
    setInboxToast({ text: "Custom offer dispatched and saved to thread!" });
  }

  async function handleAcceptOffer(msgId: string) {
    const targetMsg = activeConv.messages.find((m) => m.id === msgId);
    const offer = targetMsg?.customOffer;
    if (offer) {
      const createdOrder = await fiverrApi.createOrder({
        gigId: offer.gigId || activeConv.gigId || "gig-101",
        gigTitle: offer.title,
        sellerName: activeConv.participantName,
        sellerUsername: activeConv.participantUsername,
        packageTier: offer.packageTier || "Standard",
        requirements: `Accepted Custom Offer: ${offer.title}`,
        amount: offer.price,
        deliveryDays: offer.deliveryDays,
        sellerId: activeConv.sellerId,
      });
      await Promise.all([
        fiverrApi.holdEscrow({
          orderId: createdOrder.id,
          sellerId: activeConv.sellerId,
          grossAmount: offer.price,
        }),
        fiverrApi.sendNotification({
          type: "ORDER_CREATED",
          title: `Custom Offer Funded (${createdOrder.orderNumber})`,
          message: `Escrow of $${offer.price} locked with ${activeConv.participantName}.`,
          channel: "IN_APP",
        }),
      ]);
      fiverrApi.acceptCustomOfferInThread(activeConv.id, msgId);
      setConversations(getStoredConversations());
      setInboxToast({
        text: `Custom Offer accepted! Order ${createdOrder.orderNumber} created & $${offer.price} locked in Escrow.`,
        orderId: createdOrder.id,
      });
      window.dispatchEvent(new CustomEvent("fiverrex-session-change"));
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#1dbf73]">
            <Sparkles className="h-3.5 w-3.5" />
            Real-Time Messaging &amp; Custom Offers
          </span>
          <h1 className="mt-1.5 text-2xl font-extrabold text-gray-900">
            Buyer &amp; Seller Inbox
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setOfferModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0a4226] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-900"
        >
          <PlusCircle className="h-4 w-4 text-[#1dbf73]" />
          <span>Send Custom Offer</span>
        </button>
      </div>

      {inboxToast && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#1dbf73]" />
            <span>{inboxToast.text}</span>
          </div>
          <div className="flex items-center gap-3">
            {inboxToast.orderId && (
              <Link
                href={`/orders?order=${encodeURIComponent(inboxToast.orderId)}`}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0a4226] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#1dbf73]"
              >
                <span>Open Order</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setInboxToast(null)}
              className="text-emerald-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid min-h-[600px] grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:h-[640px] lg:grid-cols-12">
        {/* Left Conversation Sidebar */}
        <div className="border-b border-gray-200 bg-gray-50/50 lg:col-span-4 lg:flex lg:min-h-0 lg:flex-col lg:border-b-0 lg:border-r">
          <div className="space-y-2.5 border-b border-gray-200 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              All Conversations ({filteredConversations.length})
            </h2>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
                placeholder="Search threads or freelancers..."
                className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-800 placeholder-gray-400 focus:border-[#1dbf73] focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100 lg:flex-1 lg:overflow-y-auto">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConv.id;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`flex w-full items-start gap-3 p-4 text-left transition ${
                    isSelected ? "bg-emerald-50/70" : "hover:bg-gray-100/70"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.participantAvatar}
                      alt={conv.participantName}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#1dbf73]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-extrabold text-gray-900">
                        {conv.participantName}
                      </p>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {conv.unreadCount > 0 && (
                          <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#1dbf73] px-1 text-[10px] font-bold text-white">
                            {conv.unreadCount}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-gray-400">
                          {conv.lastMessageTime}
                        </span>
                      </div>
                    </div>
                    <p className="truncate text-[11px] font-medium text-[#1dbf73]">
                      {conv.relatedGigTitle}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-600">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Chat Thread */}
        <div className="flex min-h-0 flex-col justify-between lg:col-span-8">
          {/* Thread Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <img
                src={activeConv.participantAvatar}
                alt={activeConv.participantName}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900">
                    {activeConv.participantName}
                  </h3>
                  {activeConv.participantLevel && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      {activeConv.participantLevel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  @{activeConv.participantUsername} • Regarding: {activeConv.relatedGigTitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4 text-[#1dbf73]" />
              <span>Escrow Protected Thread</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {activeConv.messages.map((msg) => {
              const isBuyer = msg.sender === "buyer";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBuyer ? "items-end" : "items-start"}`}
                >
                  <div className="mb-1 flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="font-bold text-gray-700">{msg.senderName}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isBuyer
                        ? "bg-[#1dbf73] text-white"
                        : "border border-gray-200 bg-gray-50 text-gray-800"
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Embedded Custom Offer Widget */}
                    {msg.customOffer && (
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-white p-4 text-gray-800 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[#1dbf73]">
                            Custom Offer • {msg.customOffer.packageTier}
                          </span>
                          <span className="text-base font-extrabold text-gray-900">
                            ${msg.customOffer.price}
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-bold text-gray-900">
                          {msg.customOffer.title}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-[11px] text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-[#1dbf73]" />
                            {msg.customOffer.deliveryDays} Days Delivery
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <RefreshCw className="h-3.5 w-3.5 text-[#1dbf73]" />
                            {msg.customOffer.revisions} Revisions
                          </span>
                        </div>

                        <div className="mt-3 pt-2">
                          {msg.customOffer.status === "ACCEPTED" ? (
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#1dbf73]">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Offer Accepted &amp; Funded in Escrow</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAcceptOffer(msg.id)}
                              className="w-full rounded-lg bg-[#1dbf73] py-2 text-xs font-bold text-white transition hover:bg-[#19a463]"
                            >
                              Accept &amp; Fund Escrow (${msg.customOffer.price})
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={threadEndRef} />
          </div>

          {/* Message Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3 border-t border-gray-200 bg-gray-50 p-4"
          >
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Message ${activeConv.participantName}...`}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs focus:border-[#1dbf73] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setOfferModalOpen(true)}
              className="hidden rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 sm:inline-flex"
            >
              + Custom Offer
            </button>
            <button
              type="submit"
              disabled={sendingMsg}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1dbf73] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#19a463] disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{sendingMsg ? "Sending..." : "Send"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Send Custom Offer Modal */}
      {offerModalOpen && (
        <div
          onClick={() => setOfferModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#0a4226] px-6 py-4 text-white">
              <h3 className="text-sm font-bold">Create Custom Escrow Offer</h3>
              <button
                type="button"
                aria-label="Close custom offer modal"
                onClick={() => setOfferModalOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendCustomOffer} className="space-y-4 p-6">
              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Deliverable Scope Title
                </label>
                <input
                  type="text"
                  required
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700">Tier</label>
                  <select
                    value={offerTier}
                    onChange={(e) => setOfferTier(e.target.value as PackageTierName)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-2.5 py-2 text-xs font-semibold"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">Price ($)</label>
                  <input
                    type="number"
                    min={10}
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">Days</label>
                  <input
                    type="number"
                    min={1}
                    value={offerDays}
                    onChange={(e) => setOfferDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">Revisions Included</label>
                <input
                  type="number"
                  min={0}
                  value={offerRevisions}
                  onChange={(e) => setOfferRevisions(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={sendingMsg}
                className="w-full rounded-xl bg-[#1dbf73] py-3 text-xs font-bold text-white transition hover:bg-[#19a463] disabled:opacity-50"
              >
                {sendingMsg ? "Dispatching Offer..." : "Send Custom Offer to Thread"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <InboxWorkspaceContent />
    </Suspense>
  );
}
