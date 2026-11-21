export interface TechNewsPulse {
  id: string;
  category:
    | "AI & Models"
    | "DevTools & Cloud"
    | "Web & Frontend"
    | "Open Source"
    | "Backend & Systems"
    | "Community & Jobs";
  title: string;
  summary: string;
  highlights: string[];
  discussionPrompt: string;
  tags: string[];
}

export const CURATED_NEWS_PULSES: TechNewsPulse[] = [
  {
    id: "news-01",
    category: "AI & Models",
    title: "Multi-Agent Workflows Shift From Demo Chains to Typed Pipelines",
    summary:
      "Production engineering teams are replacing open-ended agent chat loops with deterministic state machines and strict JSON tool contracts to cut latency by 40%+.",
    highlights: [
      "Deterministic routing before LLM calls cuts wasted tokens dramatically",
      "Parallel fan-out workers beat long sequential chains on tail latency",
      "Trajectory evals in CI are becoming standard before prompt rollouts",
    ],
    discussionPrompt: "Are you running single-agent loops or multi-agent swarms in production right now?",
    tags: ["AIAgents", "TechNews", "ProductionAI"],
  },
  {
    id: "news-02",
    category: "DevTools & Cloud",
    title: "MCP Servers Become the Universal Plugin Bus for Coding Agents",
    summary:
      "Model Context Protocol adoption is accelerating across IDEs, CI pipelines, and internal developer platforms, replacing bespoke glue scripts with reusable tool servers.",
    highlights: [
      "Lazy schema loading keeps active context windows clean and fast",
      "Read-only resources vs. state-changing tools enforce safer boundaries",
      "Server-side auth prevents prompt-injected tenant escalation",
    ],
    discussionPrompt: "Which MCP server saves your team the most time every week?",
    tags: ["MCP", "DevTools", "CloudNative"],
  },
  {
    id: "news-03",
    category: "Web & Frontend",
    title: "React Server Components + Streaming UX Raise the Bar for Core Web Vitals",
    summary:
      "Modern Next.js architectures push heavy data fetching and markdown rendering to the server while streaming interactive islands with minimal client JS.",
    highlights: [
      "Zero-waterfall server fetching cuts TTFB and LCP significantly",
      "Edge caching + tag revalidation keeps dynamic feeds instant",
      "Optimistic UI updates make collaborative workspaces feel native",
    ],
    discussionPrompt: "What's your go-to stack for shipping full-stack apps fast in 2026?",
    tags: ["NextJS", "React", "WebPerf"],
  },
  {
    id: "news-04",
    category: "Backend & Systems",
    title: "Hybrid Search (BM25 + Dense Vectors) Outperforms Pure Vector RAG",
    summary:
      "Engineering benchmarks consistently show lexical BM25 + semantic embeddings + reranking beats naive cosine search on codebases, logs, and exact error codes.",
    highlights: [
      "Reciprocal Rank Fusion (RRF) merges keyword and vector precision cleanly",
      "AST-aware code chunking avoids slicing functions and types in half",
      "Metadata filtering enforces per-tenant ACLs before retrieval",
    ],
    discussionPrompt: "Which vector or hybrid search engine are you using: pgvector, Qdrant, or Elasticsearch?",
    tags: ["RAG", "Backend", "SystemDesign"],
  },
  {
    id: "news-05",
    category: "Open Source",
    title: "Ephemeral MicroVM Sandboxes Redefine Safe Code Execution for AI",
    summary:
      "Firecracker-style microVMs boot in sub-second times, letting AI coding assistants install packages, run builds, and execute untrusted scripts safely.",
    highlights: [
      "Per-task isolated filesystems prevent host secret leaks",
      "Egress allowlists block accidental exfiltration during tool runs",
      "Snapshot cloning enables parallel test sharding at low cost",
    ],
    discussionPrompt: "Do you isolate AI-executed commands in containers, microVMs, or cloud sandboxes?",
    tags: ["OpenSource", "Security", "Sandboxes"],
  },
  {
    id: "news-06",
    category: "Community & Jobs",
    title: "High-Demand Skills: AI Systems, Spring Boot DDD, and Full-Stack TypeScript",
    summary:
      "Freelance and contract project budgets are surging for engineers who combine clean backend architecture with practical AI agent integrations and verifiable tests.",
    highlights: [
      "Milestone-based escrow proposals convert 2x faster than vague bids",
      "Shipping observability + tests sets senior freelancers apart immediately",
      "Check live open projects and +500 Credit quests right on FIVERREX",
    ],
    discussionPrompt: "What's the most exciting project you're shipping this week? Drop it below!",
    tags: ["DevCommunity", "Freelance", "FIVERREX"],
  },
  {
    id: "news-07",
    category: "AI & Models",
    title: "Model Routing & Prompt Caching Slash LLM Inference Bills by 65%",
    summary:
      "Smart teams split traffic between fast flash models for classification/routing and frontier models for complex synthesis, while keeping static prefixes cache-hot.",
    highlights: [
      "Stable system instructions + tool headers unlock automatic prefix cache hits",
      "Small models handle extraction, tagging, and triage in <300ms",
      "Fallback chains keep user-facing bots resilient during peak load",
    ],
    discussionPrompt: "How are you balancing speed vs. reasoning depth across your LLM stack?",
    tags: ["LLMOps", "CostOptimization", "Gemini"],
  },
  {
    id: "news-08",
    category: "Backend & Systems",
    title: "Idempotency Keys & Outbox Patterns Stay Non-Negotiable in Distributed Systems",
    summary:
      "Whether handling payments, webhooks, or AI agent tool retries, deterministic idempotency keys and transactional outboxes prevent duplicate side effects.",
    highlights: [
      "Derive deterministic keys from entity + action + step index",
      "Separate transient 429/503 retries from permanent 4xx validation errors",
      "Pair circuit breakers with clear dead-letter alerts for zero silent drops",
    ],
    discussionPrompt: "What's the nastiest retry or duplicate-webhook bug you've ever debugged?",
    tags: ["DistributedSystems", "Architecture", "DDD"],
  },
  {
    id: "news-09",
    category: "DevTools & Cloud",
    title: "OpenTelemetry Tracing Unifies Frontend, API, and LLM Observability",
    summary:
      "End-to-end distributed traces linking HTTP requests, database queries, and LLM tool spans make debugging latency spikes effortless.",
    highlights: [
      "Track P95 latency, token counts, and tool error rates per trace",
      "Always scrub API keys and PII before exporting telemetry spans",
      "Alert on silent quality regressions, not just HTTP 500 spikes",
    ],
    discussionPrompt: "What observability stack do you swear by right now?",
    tags: ["OpenTelemetry", "Observability", "DevOps"],
  },
  {
    id: "news-10",
    category: "Web & Frontend",
    title: "Real-Time Bot Ecosystems Turn Developer Groups Into Live Learning Hubs",
    summary:
      "Interactive Telegram & Discord bots with instant reactions, AI Q&A, live news pulses, and polls keep developer communities active 24/7.",
    highlights: [
      "Instant emoji reactions and interactive polls boost member engagement",
      "Serverless webhooks scale to bursts with near-zero idle cost",
      "Try /hype, /news, or /vibe right here to energize the chat!",
    ],
    discussionPrompt: "Drop a 🔥 if you want more daily tech pulses and interactive dev polls!",
    tags: ["TelegramBot", "Community", "Automation"],
  },
];

export const INTERACTIVE_REACTION_BUTTONS = [
  "🔥",
  "❤️",
  "⚡",
  "🤩",
  "💯",
  "🤯",
  "👏",
  "👀",
] as const;

export interface CommunityVibePoll {
  question: string;
  options: string[];
}

export const COMMUNITY_VIBE_POLLS: CommunityVibePoll[] = [
  {
    question: "🔥 What are you building or shipping today in Dev Community?",
    options: [
      "🤖 AI Agents / LLM Apps",
      "⚡ Next.js / Frontend UI",
      "🛠 Backend / Microservices / DDD",
      "☁️ DevOps / Infra / Bots",
      "📚 Learning & Exploring New Tech",
    ],
  },
  {
    question: "⚡ Which AI engineering topic should we cover next?",
    options: [
      "🔌 MCP Servers & Tool Calling",
      "🧠 Hybrid RAG & Agent Memory",
      "🚀 Multi-Agent Swarms & Evals",
      "🛡 Prompt Injection & Security",
      "💰 Cost Optimization & Model Routing",
    ],
  },
  {
    question: "🚀 How's your developer vibe right now?",
    options: [
      "🔥 Shipping non-stop (10x mode)",
      "⚡ Debugging like a detective",
      "☕ Fueling up with coffee",
      "🧠 Architecting something big",
      "🎉 Just deployed to production!",
    ],
  },
  {
    question: "💼 Favorite way to collaborate on tech projects?",
    options: [
      "⚡ Fast milestone sprints",
      "🤝 Pair programming & code reviews",
      "🤖 AI-assisted solo shipping",
      "🌐 Open-source community PRs",
    ],
  },
];

export function escapeReactionHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export function pickNewsPulseForBroadcast(params?: {
  pulseId?: string;
  slot?: number;
  nowMs?: number;
}): { pulse: TechNewsPulse; slot: number; total: number } {
  const pool = CURATED_NEWS_PULSES;

  if (params?.pulseId) {
    const idx = pool.findIndex((p) => p.id === params.pulseId);
    if (idx !== -1) {
      return { pulse: pool[idx], slot: idx + 1, total: pool.length };
    }
  }

  const rawBucket =
    typeof params?.slot === "number"
      ? params.slot
      : Math.floor((params?.nowMs ?? Date.now()) / FIFTEEN_MINUTES_MS);
  const index = ((rawBucket % pool.length) + pool.length) % pool.length;

  return {
    pulse: pool[index],
    slot: index + 1,
    total: pool.length,
  };
}

export interface TelegramInlineButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineButton[][];
}

export function buildReactionActionKeyboard(options?: {
  counts?: Partial<Record<string, number>>;
  includeUtilityRow?: boolean;
  siteUrl?: string;
}): TelegramInlineKeyboardMarkup {
  const counts = options?.counts || {};
  const row1 = INTERACTIVE_REACTION_BUTTONS.slice(0, 4).map((emoji) => ({
    text: `${emoji} ${counts[emoji] ?? 0}`,
    callback_data: `rb:react:${emoji}`,
  }));
  const row2 = INTERACTIVE_REACTION_BUTTONS.slice(4, 8).map((emoji) => ({
    text: `${emoji} ${counts[emoji] ?? 0}`,
    callback_data: `rb:react:${emoji}`,
  }));

  const inline_keyboard: TelegramInlineButton[][] = [row1, row2];

  if (options?.includeUtilityRow !== false) {
    inline_keyboard.push([
      { text: "⚡ Hype 10 Posts", callback_data: "rb:hype:10" },
      { text: "📰 Fresh News", callback_data: "rb:news" },
    ]);
  }

  if (options?.siteUrl) {
    const cleanUrl = options.siteUrl.replace(/\/+$/, "");
    inline_keyboard.push([
      { text: "📋 FIVERREX Jobs", url: `${cleanUrl}/jobs` },
      { text: "🎁 Quests (+500 Credits)", url: `${cleanUrl}/quests` },
    ]);
  }

  return { inline_keyboard };
}

export function incrementReactionButtonInMarkup(
  markup: TelegramInlineKeyboardMarkup | undefined,
  targetEmoji: string
): { updated: TelegramInlineKeyboardMarkup; newCount: number } {
  const callbackTarget = `rb:react:${targetEmoji}`;
  let newCount = 1;

  if (!markup?.inline_keyboard?.length) {
    return {
      updated: buildReactionActionKeyboard({ counts: { [targetEmoji]: 1 } }),
      newCount,
    };
  }

  const nextRows = markup.inline_keyboard.map((row) =>
    row.map((btn) => {
      if (btn.callback_data !== callbackTarget) {
        return btn;
      }
      const match = btn.text.match(/(\d+)\s*$/);
      const current = match ? Number.parseInt(match[1], 10) : 0;
      newCount = Number.isFinite(current) ? current + 1 : 1;
      return {
        ...btn,
        text: `${targetEmoji} ${newCount}`,
      };
    })
  );

  return {
    updated: { inline_keyboard: nextRows },
    newCount,
  };
}

export function formatTelegramNewsPulseCard(
  pulse: TechNewsPulse,
  options?: {
    slot?: number;
    total?: number;
    siteUrl?: string;
    header?: string;
    initialCounts?: Partial<Record<string, number>>;
  }
): { text: string; reply_markup: TelegramInlineKeyboardMarkup } {
  const header =
    options?.header ||
    `📰 <b>TECH &amp; DEV NEWS PULSE</b>${
      options?.slot && options?.total ? ` <code>#${options.slot}/${options.total}</code>` : ""
    }`;

  const highlightsText = pulse.highlights
    .map((h) => `• ${escapeReactionHtml(h)}`)
    .join("\n");
  const tagsLine = pulse.tags.map((t) => `#${t.replace(/^#+/, "")}`).join(" ");

  const text = [
    header,
    ``,
    `⚡ <b>[${escapeReactionHtml(pulse.category)}] ${escapeReactionHtml(pulse.title)}</b>`,
    ``,
    `💡 ${escapeReactionHtml(pulse.summary)}`,
    ``,
    `🔥 <b>Key Highlights:</b>`,
    highlightsText,
    ``,
    `💬 <i>${escapeReactionHtml(pulse.discussionPrompt)}</i>`,
    ``,
    `🏷 ${escapeReactionHtml(tagsLine)}`,
    `✨ <b>React below or tap an action button!</b> • @reaction_news_bot`,
  ].join("\n");

  const reply_markup = buildReactionActionKeyboard({
    counts: options?.initialCounts || { "🔥": 1, "❤️": 1, "⚡": 1 },
    includeUtilityRow: true,
    siteUrl: options?.siteUrl,
  });

  return { text, reply_markup };
}

export function buildReactionBotHelpCard(
  siteUrl = "https://fiverrex.vercel.app",
  activeBotCount = 3,
  defaultSweepCount = 7
): { text: string; reply_markup: TelegramInlineKeyboardMarkup } {
  const cleanUrl = siteUrl.replace(/\/+$/, "");

  const text = [
    `⚡ <b>Welcome to Reaction News Bot!</b> (@reaction_news_bot)`,
    ``,
    `High-energy community interaction &amp; tech news reaction engine for <b>Dev Community</b> &amp; <b>FIVERREX</b>.`,
    ``,
    `🔥 <b>Auto-Reaction Engine:</b>`,
    `• Drops <b>big animated reactions</b> automatically on community messages &amp; broadcasts`,
    `• Sweeps <b>${defaultSweepCount}–10 recent messages</b> per wave so no post or broadcast is missed`,
    `• Coordinates <b>${activeBotCount} active community bots</b> with distinct non-overlapping emojis`,
    `• Interactive <b>8-button reaction bars</b> on every Tech News &amp; Hype card`,
    ``,
    `📌 <b>Commands:</b>`,
    `/hype [5-10] — Blast 5–10 big reactions per bot across recent posts`,
    `/react [5-10] — Alias for /hype (reply to any message to super-boost it)`,
    `/news [topic] — Publish a fresh AI/Tech News Pulse with reaction buttons`,
    `/vibe — Launch an interactive community developer poll`,
    `/status — Check live reaction engine &amp; coordinated bots status`,
    `/help — Show this guide`,
  ].join("\n");

  const reply_markup: TelegramInlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: "🔥 Hype 10 Recent Posts", callback_data: "rb:hype:10" },
        { text: "📰 Tech News Pulse", callback_data: "rb:news" },
      ],
      [
        { text: "📊 Vibe Poll", callback_data: "rb:vibe" },
        { text: "📋 FIVERREX Jobs", url: `${cleanUrl}/jobs` },
      ],
    ],
  };

  return { text, reply_markup };
}
