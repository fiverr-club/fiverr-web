"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Briefcase,
  Check,
  Copy,
  ExternalLink,
  RotateCcw,
  Send,
  Sparkles,
  Terminal,
  Trophy,
  Zap,
} from "lucide-react";
import { TELEGRAM_COMMUNITY_URL } from "@/lib/jobs";

interface UiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp: string;
}

const STARTER_PROMPTS: Record<"engineering" | "scoping", string[]> = {
  engineering: [
    "How should I design idempotent tool calls for an autonomous AI agent?",
    "Compare ReAct vs Plan-and-Execute loops for a multi-step coding agent.",
    "Design an MCP server architecture with strict schema validation and auth.",
    "How do I structure Hybrid RAG (BM25 + pgvector + reranking) with citations?",
  ],
  scoping: [
    "Scope an AI Customer Support Agent project into Basic, Standard, and Premium Escrow tiers.",
    "Write a winning 150-word bid proposal for a Next.js 15 + Spring Boot SaaS portal.",
    "Estimate milestones, timeline, and deliverables for a Kubernetes + OpenTelemetry setup.",
    "What deliverables should a client verify before approving final Escrow release?",
  ],
};

const WELCOME_MSG: UiChatMessage = {
  id: "welcome-ai",
  role: "assistant",
  content:
    "Hi! I am FIVERREX AI Copilot — powered by Gemini and synced with @agent_programming_bot in Dev Community.\n\nSwitch between AI Engineering Tutor mode (MCP, RAG, Agents, Spring Boot DDD, Next.js) and Project & Bid Scoping mode (3-tier Escrow breakdowns & winning proposals). Ask anything below!",
  timestamp: "Online",
};

export default function AiAssistantPage() {
  const [mode, setMode] = useState<"engineering" | "scoping">("engineering");
  const [messages, setMessages] = useState<UiChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendPrompt(promptText: string) {
    const clean = promptText.trim();
    if (!clean || loading) return;

    const nowLabel = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const userMsg: UiChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: clean,
      timestamp: nowLabel,
    };

    const nextHistory = [...messages.filter((m) => m.id !== "welcome-ai"), userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          mode,
          history: nextHistory.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        reply?: string;
        model?: string;
        error?: string;
      };
      const replyText =
        data.reply || data.error || "Unable to generate a response right now. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: replyText,
          model: data.model,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "Network error reaching /api/ai/chat. Please check your connection and try again.",
          timestamp: "Now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(id: string, text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-[#0a4226] via-[#0d3b24] to-[#072617] p-7 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Bot className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>Gemini-Powered FIVERREX AI Copilot</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              AI Agent Engineering &amp;{" "}
              <span className="text-[#1dbf73]">Project Scoping Copilot</span>
            </h1>
            <p className="text-sm text-emerald-100/85">
              Ask technical questions about AI Agents, MCP, RAG, and microservices — or draft
              milestone-backed Escrow scopes and winning proposals in seconds.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <a
              href="https://t.me/agent_programming_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1dbf73] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#19a463]"
            >
              <Bot className="h-4 w-4" />
              <span>Chat on Telegram (@agent_programming_bot)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"
            >
              <span>Join DevCommunity101</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Sidebar: Mode Switcher + Starter Prompts + Community Links */}
        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Copilot Mode
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("engineering")}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition ${
                  mode === "engineering"
                    ? "border-[#1dbf73] bg-emerald-50 text-[#0a4226] ring-2 ring-[#1dbf73]/20"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <Terminal className="h-4 w-4 text-[#1dbf73]" />
                <span className="text-xs font-extrabold">AI Engineering</span>
                <span className="text-[10px] text-gray-500">Agents, MCP, RAG</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("scoping")}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition ${
                  mode === "scoping"
                    ? "border-[#1dbf73] bg-emerald-50 text-[#0a4226] ring-2 ring-[#1dbf73]/20"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <Briefcase className="h-4 w-4 text-[#1dbf73]" />
                <span className="text-xs font-extrabold">Project Scoping</span>
                <span className="text-[10px] text-gray-500">Bids &amp; Milestones</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Zap className="h-3.5 w-3.5 text-[#1dbf73]" />
              <span>Quick Starter Prompts</span>
            </div>
            <div className="mt-3 space-y-2">
              {STARTER_PROMPTS[mode].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={loading}
                  onClick={() => sendPrompt(prompt)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-left text-xs font-semibold text-gray-700 transition hover:border-[#1dbf73] hover:bg-emerald-50/60 hover:text-[#0a4226] disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-xs">
            <h3 className="flex items-center gap-2 font-extrabold text-[#0a4226]">
              <Trophy className="h-4 w-4 text-[#1dbf73]" />
              <span>Ready to Bid or Earn Credits?</span>
            </h3>
            <p className="mt-1.5 leading-relaxed text-gray-600">
              Put your AI architecture skills to work on 500+ open projects or claim +500 free
              credits via Telegram quests.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/jobs?category=AI+Services"
                className="inline-flex items-center gap-1 rounded-lg bg-[#1dbf73] px-3 py-2 font-bold text-white hover:bg-[#19a463]"
              >
                <span>AI Jobs Board</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/quests"
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 py-2 font-bold text-[#0a4226] hover:bg-emerald-50"
              >
                <span>+500 Credits</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Chat Workspace */}
        <section className="flex min-h-[580px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-8 lg:h-[660px]">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a4226] text-[#1dbf73]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-gray-900">
                  {mode === "engineering"
                    ? "AI Agent Engineering Tutor"
                    : "Escrow Project & Bid Scoping Copilot"}
                </h2>
                <p className="text-[11px] text-gray-500">
                  Live Gemini inference • Multi-turn context enabled
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMessages([WELCOME_MSG])}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div className="mb-1 flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="font-bold text-gray-600">
                      {isUser ? "You" : "FIVERREX AI Copilot"}
                    </span>
                    {msg.model && (
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#0a4226]">
                        {msg.model}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                  <div
                    className={`group relative max-w-2xl whitespace-pre-wrap rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isUser
                        ? "bg-[#1dbf73] text-white"
                        : "border border-gray-200 bg-gray-50 text-gray-800"
                    }`}
                  >
                    {msg.content}
                    {!isUser && msg.id !== "welcome-ai" && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="mt-2 inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-bold text-gray-500 hover:text-gray-900"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-[#1dbf73]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Response</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs font-semibold text-[#0a4226]">
                  <span className="h-2 w-2 animate-ping rounded-full bg-[#1dbf73]" />
                  <span>Gemini is drafting a technical answer...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendPrompt(input);
            }}
            className="flex items-center gap-2.5 border-t border-gray-200 bg-gray-50 p-4"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "engineering"
                  ? "Ask about AI Agents, MCP servers, RAG, Evals, or microservices..."
                  : "Describe a project to estimate milestones, pricing, or draft a bid..."
              }
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#1dbf73] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1dbf73] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#19a463] disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? "Thinking..." : "Ask AI"}</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
