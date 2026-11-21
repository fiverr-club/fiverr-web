import { timingSafeEqual } from "node:crypto";
import { SEED_JOBS, type JobProject } from "@/lib/jobs";
import {
  AI_AGENT_LESSONS,
  buildAgentBotCommandResponse,
  formatTelegramAgentLessonCard,
  pickAgentLessonForBroadcast,
} from "@/lib/ai-agent-knowledge";
import {
  askGeminiAgentTutor,
  askGeminiReactionBuddy,
  generateFreshAgentLessonWithGemini,
  generateFreshTechNewsPulseWithGemini,
} from "@/lib/gemini";
import {
  buildReactionBotHelpCard,
  COMMUNITY_VIBE_POLLS,
  CURATED_NEWS_PULSES,
  formatTelegramNewsPulseCard,
  incrementReactionButtonInMarkup,
  pickNewsPulseForBroadcast,
  type TelegramInlineKeyboardMarkup,
} from "@/lib/reaction-bot";

export function verifySharedSecret(
  expected: string | undefined,
  provided: string | null | undefined
): boolean {
  if (!expected || !provided) return false;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided.trim(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const DEFAULT_TELEGRAM_CHAT_ID = "-1004477003193";
export const DEFAULT_SITE_URL = "https://fiverrex.vercel.app";
const TEN_MINUTES_MS = 10 * 60 * 1000;

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  siteUrl: string;
  webhookSecret?: string;
  broadcastSecret?: string;
}

function readBotConfigFromEnv(
  prefix: "TELEGRAM" | "AGENT" | "REACTION"
): TelegramConfig | null {
  const tokenKey =
    prefix === "TELEGRAM"
      ? "TELEGRAM_BOT_TOKEN"
      : prefix === "AGENT"
        ? "AGENT_BOT_TOKEN"
        : "REACTION_BOT_TOKEN";
  const webhookKey =
    prefix === "TELEGRAM"
      ? "TELEGRAM_WEBHOOK_SECRET"
      : prefix === "AGENT"
        ? "AGENT_WEBHOOK_SECRET"
        : "REACTION_WEBHOOK_SECRET";
  const broadcastKey =
    prefix === "TELEGRAM"
      ? "TELEGRAM_BROADCAST_SECRET"
      : prefix === "AGENT"
        ? "AGENT_BROADCAST_SECRET"
        : "REACTION_BROADCAST_SECRET";

  const botToken = process.env[tokenKey]?.trim();
  if (!botToken) {
    return null;
  }
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim() || DEFAULT_TELEGRAM_CHAT_ID;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL).replace(
    /\/+$/,
    ""
  );
  return {
    botToken,
    chatId,
    siteUrl,
    webhookSecret: process.env[webhookKey]?.trim(),
    broadcastSecret: process.env[broadcastKey]?.trim(),
  };
}

export function getTelegramConfig(): TelegramConfig | null {
  return readBotConfigFromEnv("TELEGRAM");
}

export function getAgentBotConfig(): TelegramConfig | null {
  return readBotConfigFromEnv("AGENT");
}

export function getReactionBotConfig(): TelegramConfig | null {
  return readBotConfigFromEnv("REACTION");
}

export function getReactionSweepCount(fallback = 10): number {
  const raw = process.env.REACTION_SWEEP_COUNT?.trim();
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(10, parsed));
}

export type ReactionBotRole = "reaction" | "agent" | "fiverrex" | "swarm";

export interface ReactionBotParticipant {
  role: ReactionBotRole;
  label: string;
  token: string;
  slotOffset: number;
}

export function getAllReactionCapableBots(): ReactionBotParticipant[] {
  const seen = new Set<string>();
  const bots: ReactionBotParticipant[] = [];

  const pushUnique = (role: ReactionBotRole, label: string, token?: string | null) => {
    const clean = token?.trim();
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    bots.push({ role, label, token: clean, slotOffset: bots.length });
  };

  pushUnique("reaction", "@reaction_news_bot", process.env.REACTION_BOT_TOKEN);
  pushUnique("agent", "@agent_programming_bot", process.env.AGENT_BOT_TOKEN);
  pushUnique("fiverrex", "@Fiverrex_bot", process.env.TELEGRAM_BOT_TOKEN);

  // Support numbered env vars REACTION_BOT_TOKEN_2 .. REACTION_BOT_TOKEN_10
  for (let i = 2; i <= 10; i++) {
    pushUnique("swarm", `reaction-bot-${i}`, process.env[`REACTION_BOT_TOKEN_${i}`]);
  }

  // Also support comma/newline/space-separated REACTION_SWARM_BOT_TOKENS
  const swarmRaw = process.env.REACTION_SWARM_BOT_TOKENS?.trim();
  if (swarmRaw) {
    swarmRaw
      .split(/[\s,;]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((token, idx) => {
        pushUnique("swarm", `swarm-${idx + 1}`, token);
      });
  }

  return bots;
}

export function escapeTelegramHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function pickJobForBroadcast(params?: {
  jobId?: string;
  slot?: number;
  nowMs?: number;
}): { job: JobProject; slot: number; total: number } {
  const openJobs = SEED_JOBS.filter((j) => j.status === "OPEN");
  const pool = openJobs.length > 0 ? openJobs : SEED_JOBS;

  if (params?.jobId) {
    const idx = pool.findIndex((j) => j.id === params.jobId);
    if (idx !== -1) {
      return { job: pool[idx], slot: idx + 1, total: pool.length };
    }
  }

  const rawBucket =
    typeof params?.slot === "number"
      ? params.slot
      : Math.floor((params?.nowMs ?? Date.now()) / TEN_MINUTES_MS);
  const index = ((rawBucket % pool.length) + pool.length) % pool.length;
  return {
    job: pool[index],
    slot: index + 1,
    total: pool.length,
  };
}

export function formatTelegramJobCard(
  job: JobProject,
  options?: {
    siteUrl?: string;
    slot?: number;
    total?: number;
    header?: string;
  }
) {
  const siteUrl = (options?.siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
  const jobUrl = `${siteUrl}/jobs/${job.id}`;
  const jobsBoardUrl = `${siteUrl}/jobs`;
  const questsUrl = `${siteUrl}/quests`;

  const headerText =
    options?.header ||
    `🔥 <b>FIVERREX • NEW PROJECT OPEN FOR BIDS</b>${
      options?.slot && options?.total ? ` <code>#${options.slot}/${options.total}</code>` : ""
    }`;

  const budgetStr = `$${job.budgetMin.toLocaleString("en-US")} – $${job.budgetMax.toLocaleString(
    "en-US"
  )}`;
  const verifiedBadge = job.clientVerified ? " ✅" : "";
  const deliverablesLines = job.deliverables
    .slice(0, 3)
    .map((d) => `• ${escapeTelegramHtml(d)}`)
    .join("\n");
  const skillsLine = job.skills.map((s) => `#${s.replace(/[^a-zA-Z0-9]/g, "")}`).join(" ");

  const text = [
    headerText,
    "",
    `💼 <b><a href="${jobUrl}">${escapeTelegramHtml(job.title)}</a></b>`,
    `🏷 <b>Category:</b> ${escapeTelegramHtml(job.category)}  |  📌 <b>${escapeTelegramHtml(
      job.badge
    )}</b>`,
    `💰 <b>Budget:</b> <b>${budgetStr}</b>  |  ⏱ <b>Timeline:</b> ${job.deliveryDays} days`,
    `🪙 <b>Bid Fee:</b> ${job.bidCostCredits} Credits  |  👤 <b>Client:</b> ${escapeTelegramHtml(
      job.clientName
    )} (${escapeTelegramHtml(job.clientCompany)})${verifiedBadge}`,
    "",
    `📝 ${escapeTelegramHtml(truncateText(job.description, 220))}`,
    "",
    `📦 <b>Key Deliverables:</b>`,
    deliverablesLines,
    "",
    `🛠 ${escapeTelegramHtml(skillsLine)}`,
    "",
    `🎁 <i>New accounts start with 100 Credits • Complete Telegram &amp; referral quests for +500 Credits!</i>`,
    `💬 <b>Chat with Agent</b> @agent_programming_bot`,
  ].join("\n");

  const reply_markup = {
    inline_keyboard: [
      [{ text: "🚀 Bid on This Project", url: jobUrl }],
      [
        { text: "📋 Browse 500+ Jobs", url: jobsBoardUrl },
        { text: "🎁 Quests (+500 Credits)", url: questsUrl },
      ],
    ],
  };

  return { text, reply_markup };
}

export async function callTelegramApi<T = unknown>(
  botToken: string,
  method: string,
  payload?: Record<string, unknown>
): Promise<{ ok: boolean; result?: T; description?: string; error_code?: number }> {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: payload ? "POST" : "GET",
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
    cache: "no-store",
  });

  const data = (await response.json()) as {
    ok: boolean;
    result?: T;
    description?: string;
    error_code?: number;
  };
  return data;
}

export async function sendTelegramJobBroadcast(params?: {
  jobId?: string;
  slot?: number;
  chatId?: string;
  header?: string;
}): Promise<{
  ok: boolean;
  messageId?: number;
  chatId: string;
  jobId: string;
  jobTitle: string;
  slot: number;
  total: number;
  reactedCount?: number;
  error?: string;
}> {
  const config = getTelegramConfig();
  if (!config) {
    return {
      ok: false,
      chatId: DEFAULT_TELEGRAM_CHAT_ID,
      jobId: "",
      jobTitle: "",
      slot: 0,
      total: SEED_JOBS.length,
      error: "TELEGRAM_BOT_TOKEN is not configured on the server.",
    };
  }

  const targetChatId = params?.chatId?.trim() || config.chatId;
  const picked = pickJobForBroadcast({ jobId: params?.jobId, slot: params?.slot });
  const { text, reply_markup } = formatTelegramJobCard(picked.job, {
    siteUrl: config.siteUrl,
    slot: picked.slot,
    total: picked.total,
    header: params?.header,
  });

  const res = await callTelegramApi<{ message_id: number }>(config.botToken, "sendMessage", {
    chat_id: targetChatId,
    text,
    parse_mode: "HTML",
    reply_markup,
    link_preview_options: { is_disabled: true },
  });

  if (!res.ok) {
    return {
      ok: false,
      chatId: targetChatId,
      jobId: picked.job.id,
      jobTitle: picked.job.title,
      slot: picked.slot,
      total: picked.total,
      error: res.description || "Telegram API sendMessage failed.",
    };
  }

  const messageId = res.result?.message_id;
  let reactedCount = 0;
  if (messageId) {
    const fanOut = await fanOutReactionsToMessage(targetChatId, messageId, {
      text: `${picked.job.title} ${picked.job.category} job freelance`,
    });
    reactedCount = fanOut.reactedCount;
  }

  return {
    ok: true,
    messageId,
    chatId: targetChatId,
    jobId: picked.job.id,
    jobTitle: picked.job.title,
    slot: picked.slot,
    total: picked.total,
    reactedCount,
  };
}

export function buildBotCommandResponse(commandRaw: string, siteUrl = DEFAULT_SITE_URL): {
  text: string;
  reply_markup?: { inline_keyboard: Array<Array<{ text: string; url: string }>> };
} | null {
  const cleanUrl = siteUrl.replace(/\/+$/, "");
  const normalized = commandRaw.trim().split(/\s+/)[0].split("@")[0].toLowerCase();

  if (normalized === "/start" || normalized === "/help") {
    return {
      text: [
        `🤖 <b>Welcome to FIVERREX Bot!</b>`,
        ``,
        `Cloud-native tech freelance &amp; project bidding marketplace with <b>500+ open projects</b>.`,
        `• New accounts automatically receive <b>100 Credits</b>`,
        `• Complete community quests to earn <b>+500 Credits</b>`,
        `• Auto-broadcasts fresh open projects to this group every 10 minutes`,
        ``,
        `📌 <b>Available Commands:</b>`,
        `/jobs — View top 5 featured high-budget projects`,
        `/random — Fetch a random open project ready for bids`,
        `/quests — Explore missions to earn +500 Credits`,
        `/help — Show this help message`,
      ].join("\n"),
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📋 Browse 500+ Jobs", url: `${cleanUrl}/jobs` },
            { text: "🎁 Claim +500 Credits", url: `${cleanUrl}/quests` },
          ],
        ],
      },
    };
  }

  if (normalized === "/jobs" || normalized === "/top") {
    const featured = SEED_JOBS.slice(0, 5)
      .map(
        (j, i) =>
          `${i + 1}. <b><a href="${cleanUrl}/jobs/${j.id}">${escapeTelegramHtml(
            j.title
          )}</a></b>\n   💰 $${j.budgetMin.toLocaleString("en-US")}–$${j.budgetMax.toLocaleString(
            "en-US"
          )} • ⏱ ${j.deliveryDays}d • 🪙 ${j.bidCostCredits} Credits`
      )
      .join("\n\n");

    return {
      text: [
        `🔥 <b>FEATURED PROJECTS ON FIVERREX</b> (${SEED_JOBS.length} jobs live)`,
        ``,
        featured,
      ].join("\n"),
      reply_markup: {
        inline_keyboard: [[{ text: "🔎 Explore All 500 Jobs", url: `${cleanUrl}/jobs` }]],
      },
    };
  }

  if (normalized === "/quests") {
    return {
      text: [
        `🎯 <b>EARN BIDDING CREDITS ON FIVERREX</b>`,
        ``,
        `• Join &amp; invite friends to <b>DevCommunity101</b> Telegram: <b>+500 Credits</b>`,
        `• Submit your first proposal on /jobs: <b>+150 Credits</b>`,
        `• Invite teammates via Referral Link: <b>+500 Credits/user</b> (+200 milestone bonus)`,
        `• Verify your GitHub / Portfolio profile: <b>+150 Credits</b>`,
      ].join("\n"),
      reply_markup: {
        inline_keyboard: [[{ text: "🎁 Start Quests Now", url: `${cleanUrl}/quests` }]],
      },
    };
  }

  if (normalized === "/random") {
    const randomIdx = Math.floor(Math.random() * SEED_JOBS.length);
    return formatTelegramJobCard(SEED_JOBS[randomIdx], {
      siteUrl: cleanUrl,
      slot: randomIdx + 1,
      total: SEED_JOBS.length,
      header: "🎲 <b>FIVERREX • RANDOM PROJECT PICK</b>",
    });
  }

  return null;
}

export async function sendAgentLessonBroadcast(params?: {
  lessonId?: string;
  slot?: number;
  chatId?: string;
  header?: string;
  useAi?: boolean;
}): Promise<{
  ok: boolean;
  messageId?: number;
  chatId: string;
  lessonId: string;
  lessonTitle: string;
  slot: number;
  total: number;
  source?: "gemini" | "curated-fallback";
  model?: string;
  reactedCount?: number;
  error?: string;
}> {
  const config = getAgentBotConfig();
  if (!config) {
    return {
      ok: false,
      chatId: DEFAULT_TELEGRAM_CHAT_ID,
      lessonId: "",
      lessonTitle: "",
      slot: 0,
      total: AI_AGENT_LESSONS.length,
      error: "AGENT_BOT_TOKEN is not configured on the server.",
    };
  }

  const targetChatId = params?.chatId?.trim() || config.chatId;
  const picked = pickAgentLessonForBroadcast({ lessonId: params?.lessonId, slot: params?.slot });

  let lessonToSend = picked.lesson;
  let source: "gemini" | "curated-fallback" = "curated-fallback";
  let modelUsed: string | undefined;

  if (params?.useAi !== false && !params?.lessonId) {
    const aiGen = await generateFreshAgentLessonWithGemini(picked.lesson, picked.slot);
    if (aiGen.ok) {
      lessonToSend = aiGen.lesson;
      source = "gemini";
      modelUsed = aiGen.model;
    }
  }

  const headerText =
    params?.header ||
    (source === "gemini"
      ? `🧠 <b>AI AGENT ENGINEERING • GEMINI 5-MIN BRIEFING</b> <code>#${picked.slot}/${picked.total}</code>`
      : `🧠 <b>AI AGENT ENGINEERING • 5-MIN BRIEFING</b> <code>#${picked.slot}/${picked.total}</code>`);

  const { text, reply_markup } = formatTelegramAgentLessonCard(lessonToSend, {
    siteUrl: config.siteUrl,
    slot: picked.slot,
    total: picked.total,
    header: headerText,
  });

  const res = await callTelegramApi<{ message_id: number }>(config.botToken, "sendMessage", {
    chat_id: targetChatId,
    text,
    parse_mode: "HTML",
    reply_markup,
    link_preview_options: { is_disabled: true },
  });

  if (!res.ok) {
    return {
      ok: false,
      chatId: targetChatId,
      lessonId: lessonToSend.id,
      lessonTitle: lessonToSend.title,
      slot: picked.slot,
      total: picked.total,
      source,
      model: modelUsed,
      error: res.description || "Telegram API sendMessage failed.",
    };
  }

  const messageId = res.result?.message_id;
  let reactedCount = 0;
  if (messageId) {
    const fanOut = await fanOutReactionsToMessage(targetChatId, messageId, {
      text: `${lessonToSend.title} ${lessonToSend.category} ai agent`,
    });
    reactedCount = fanOut.reactedCount;
  }

  return {
    ok: true,
    messageId,
    chatId: targetChatId,
    lessonId: lessonToSend.id,
    lessonTitle: lessonToSend.title,
    slot: picked.slot,
    total: picked.total,
    source,
    model: modelUsed,
    reactedCount,
  };
}

export async function sendReactionNewsBroadcast(params?: {
  pulseId?: string;
  slot?: number;
  chatId?: string;
  header?: string;
  topic?: string;
  useAi?: boolean;
}): Promise<{
  ok: boolean;
  messageId?: number;
  chatId: string;
  pulseId: string;
  pulseTitle: string;
  slot: number;
  total: number;
  source?: "gemini" | "curated-fallback";
  model?: string;
  reactedCount?: number;
  error?: string;
}> {
  const config = getReactionBotConfig();
  if (!config) {
    return {
      ok: false,
      chatId: DEFAULT_TELEGRAM_CHAT_ID,
      pulseId: "",
      pulseTitle: "",
      slot: 0,
      total: CURATED_NEWS_PULSES.length,
      error: "REACTION_BOT_TOKEN is not configured on the server.",
    };
  }

  const targetChatId = params?.chatId?.trim() || config.chatId;
  const picked = pickNewsPulseForBroadcast({ pulseId: params?.pulseId, slot: params?.slot });

  let pulseToSend = picked.pulse;
  let source: "gemini" | "curated-fallback" = "curated-fallback";
  let modelUsed: string | undefined;

  if (params?.useAi !== false && !params?.pulseId) {
    const aiGen = await generateFreshTechNewsPulseWithGemini(
      picked.pulse,
      picked.slot,
      params?.topic
    );
    if (aiGen.ok) {
      pulseToSend = aiGen.pulse;
      source = "gemini";
      modelUsed = aiGen.model;
    }
  }

  const headerText =
    params?.header ||
    (source === "gemini"
      ? `📰 <b>TECH &amp; DEV NEWS PULSE • LIVE AI BRIEF</b> <code>#${picked.slot}/${picked.total}</code>`
      : `📰 <b>TECH &amp; DEV NEWS PULSE</b> <code>#${picked.slot}/${picked.total}</code>`);

  const { text, reply_markup } = formatTelegramNewsPulseCard(pulseToSend, {
    siteUrl: config.siteUrl,
    slot: picked.slot,
    total: picked.total,
    header: headerText,
  });

  const res = await callTelegramApi<{ message_id: number }>(config.botToken, "sendMessage", {
    chat_id: targetChatId,
    text,
    parse_mode: "HTML",
    reply_markup,
    link_preview_options: { is_disabled: true },
  });

  if (!res.ok) {
    return {
      ok: false,
      chatId: targetChatId,
      pulseId: pulseToSend.id,
      pulseTitle: pulseToSend.title,
      slot: picked.slot,
      total: picked.total,
      source,
      model: modelUsed,
      error: res.description || "Telegram API sendMessage failed.",
    };
  }

  const messageId = res.result?.message_id;
  let reactedCount = 0;
  if (messageId) {
    const fanOut = await fanOutReactionsToMessage(targetChatId, messageId, {
      text: `${pulseToSend.title} ${pulseToSend.category} news tech ai`,
    });
    reactedCount = fanOut.reactedCount;
  }

  return {
    ok: true,
    messageId,
    chatId: targetChatId,
    pulseId: pulseToSend.id,
    pulseTitle: pulseToSend.title,
    slot: picked.slot,
    total: picked.total,
    source,
    model: modelUsed,
    reactedCount,
  };
}

export async function fetchBotHealthStatus(
  config: TelegramConfig,
  catalog: { totalItems: number; intervalMinutes: number; itemType: string }
) {
  const meRes = await callTelegramApi<{
    id: number;
    username?: string;
    first_name?: string;
    can_join_groups?: boolean;
  }>(config.botToken, "getMe");

  if (!meRes.ok || !meRes.result) {
    return {
      status: 502,
      body: {
        ok: false,
        configured: true,
        error: meRes.description || "Failed to authenticate with Telegram getMe.",
      },
    };
  }

  const [chatRes, memberRes, webhookRes] = await Promise.all([
    callTelegramApi<{ id: number; title?: string; username?: string; type?: string }>(
      config.botToken,
      `getChat?chat_id=${encodeURIComponent(config.chatId)}`
    ),
    callTelegramApi<{ status: string; can_manage_chat?: boolean }>(
      config.botToken,
      `getChatMember?chat_id=${encodeURIComponent(config.chatId)}&user_id=${meRes.result.id}`
    ),
    callTelegramApi<{ url?: string; pending_update_count?: number }>(
      config.botToken,
      "getWebhookInfo"
    ),
  ]);

  return {
    status: 200,
    body: {
      ok: meRes.ok && Boolean(chatRes.ok),
      bot: {
        id: meRes.result.id,
        username: meRes.result.username,
        firstName: meRes.result.first_name,
        canJoinGroups: meRes.result.can_join_groups,
      },
      targetGroup: chatRes.ok
        ? {
            id: chatRes.result?.id,
            title: chatRes.result?.title,
            username: chatRes.result?.username,
            type: chatRes.result?.type,
            botStatus: memberRes.result?.status || "unknown",
          }
        : { error: chatRes.description || "Unable to access chat" },
      webhook: {
        configured: Boolean(webhookRes.result?.url),
        url: webhookRes.result?.url || null,
        pendingUpdates: webhookRes.result?.pending_update_count ?? 0,
      },
      catalog,
    },
  };
}

export const TELEGRAM_SAFE_REACTION_EMOJIS = [
  "❤️",
  "🔥",
  "⚡",
  "🎉",
  "👏",
  "🤩",
  "💯",
  "🏆",
  "👍",
  "🤯",
  "🥰",
  "😎",
  "😁",
  "👀",
  "🤝",
  "🙏",
  "🤔",
  "🤣",
] as const;

export type TelegramSafeReactionEmoji = (typeof TELEGRAM_SAFE_REACTION_EMOJIS)[number];

export interface TelegramIncomingMessage {
  message_id: number;
  text?: string;
  caption?: string;
  chat?: { id: number | string; type?: string; title?: string };
  from?: { id?: number; is_bot?: boolean; first_name?: string; username?: string };
  photo?: unknown[];
  sticker?: { emoji?: string };
  video?: unknown;
  video_note?: unknown;
  animation?: unknown;
  document?: unknown;
  voice?: unknown;
  audio?: unknown;
  poll?: unknown;
  dice?: unknown;
  location?: unknown;
  contact?: unknown;
  venue?: unknown;
  story?: unknown;
  forward_origin?: unknown;
  new_chat_members?: Array<{ id?: number; is_bot?: boolean; first_name?: string; username?: string }>;
  left_chat_member?: unknown;
  pinned_message?: unknown;
  reply_markup?: TelegramInlineKeyboardMarkup;
  reply_to_message?: {
    message_id?: number;
    text?: string;
    caption?: string;
    from?: { is_bot?: boolean; username?: string };
  };
}

export interface TelegramCallbackQuery {
  id: string;
  from?: { id?: number; is_bot?: boolean; first_name?: string; username?: string };
  message?: TelegramIncomingMessage;
  data?: string;
}

const JOB_TOPIC_REGEX =
  /\b(job|jobs|freelance|bid|bidding|credit|credits|quest|quests|hire|hiring|client|proposal|fiverrex|project|viec|việc|tuyển)\b/i;

const NEWS_TOPIC_REGEX =
  /\b(news|breaking|update|release|launch|announcement|trend|trending|tin|tin tức|cập nhật|mới|hot)\b/i;

function pickFromUniquePool(
  pool: readonly TelegramSafeReactionEmoji[],
  messageId: number,
  slotOffset = 0
): TelegramSafeReactionEmoji {
  const base = Math.abs(messageId) % pool.length;
  const idx = (base + Math.abs(slotOffset)) % pool.length;
  return pool[idx];
}

export function shouldReactToTelegramMessage(
  msg?: TelegramIncomingMessage | null,
  options?: { allowChannelPost?: boolean }
): boolean {
  if (!msg || !msg.message_id || !msg.chat?.id) return false;
  if (!options?.allowChannelPost && msg.from?.is_bot) return false;
  if (msg.left_chat_member || msg.pinned_message) return false;
  if (msg.new_chat_members && !msg.new_chat_members.some((m) => !m.is_bot)) {
    return false;
  }
  return Boolean(
    msg.text?.trim() ||
      msg.caption?.trim() ||
      msg.photo ||
      msg.sticker ||
      msg.video ||
      msg.video_note ||
      msg.animation ||
      msg.document ||
      msg.voice ||
      msg.audio ||
      msg.poll ||
      msg.dice ||
      msg.location ||
      msg.contact ||
      msg.venue ||
      msg.story ||
      msg.forward_origin ||
      msg.new_chat_members?.length
  );
}

function getContextReactionPool(
  msg: Partial<TelegramIncomingMessage>
): readonly TelegramSafeReactionEmoji[] {
  if (msg.new_chat_members?.some((m) => !m.is_bot)) {
    return ["🎉", "❤️", "🔥", "👏", "🤩", "🏆", "⚡", "🥰", "💯", "😎"];
  }

  const rawText = (msg.text || msg.caption || msg.sticker?.emoji || "").trim();

  if (
    /\b(hi|hello|hey|gm|gn|morning|night|chào|cảm ơn|cam on|thanks|thank you|thx|love|heart|tim|tuyệt|hay quá|nice|good|great|awesome|cool|welcome|ok|okay)\b|[❤️❤💖💗💕🫶🙏🥰😍😘]/iu.test(
      rawText
    )
  ) {
    return ["❤️", "🥰", "🔥", "🙏", "👏", "🤩", "⚡", "👍", "💯", "🎉"];
  }

  if (
    /\b(ship|shipped|deploy|deployed|launch|launched|win|won|congrats|congratulations|chúc mừng|done|fixed|solved|xong|complete|completed|milestone|passed)\b|[🎉🏆🥳👏🚀💯]/u.test(
      rawText
    )
  ) {
    return ["🎉", "🏆", "🔥", "👏", "💯", "⚡", "🤩", "❤️", "👍", "😎"];
  }

  if (/\b(haha|hehe|hihi|lol|lmao|rofl|lmfao)\b|[😂🤣😹]/u.test(rawText)) {
    return ["🤣", "😁", "🔥", "❤️", "👏", "🤩", "😎", "👍", "⚡", "💯"];
  }

  if (
    /\b(agent|agents|ai|llm|gemini|claude|gpt|code|coding|dev|api|mcp|rag|prompt|token|react|next|nextjs|python|typescript|rust|docker|sql|tool|memory|eval|bot|bug|debug)\b/i.test(
      rawText
    )
  ) {
    return ["⚡", "🔥", "🤯", "💯", "❤️", "🤩", "👍", "🏆", "👏", "😎"];
  }

  if (JOB_TOPIC_REGEX.test(rawText)) {
    return ["🔥", "🤝", "🏆", "⚡", "❤️", "💯", "👏", "👍", "👀", "🤩"];
  }

  if (NEWS_TOPIC_REGEX.test(rawText)) {
    return ["🔥", "⚡", "👀", "🤩", "💯", "🤯", "❤️", "👏", "🏆", "👍"];
  }

  if (/\?|\b(how|why|what|when|which|anyone|help|làm sao|tại sao|thế nào|sao vậy|hỏi)\b/i.test(rawText)) {
    return ["🤔", "👀", "⚡", "❤️", "👍", "🙏", "🔥", "🤝", "👏", "💯"];
  }

  if (msg.sticker || msg.animation) {
    return ["❤️", "🤩", "😁", "🔥", "🤣", "👏", "⚡", "🥰", "😎", "💯"];
  }

  if (msg.photo || msg.video || msg.video_note || msg.document || msg.voice || msg.audio || msg.poll) {
    return ["❤️", "🔥", "👀", "👏", "🤩", "⚡", "💯", "👍", "🏆", "🎉"];
  }

  return ["❤️", "🔥", "⚡", "🤩", "👏", "💯", "👍", "🥰", "🏆", "😎"];
}

export function pickTelegramReactionEmoji(
  msg: Partial<TelegramIncomingMessage> & { message_id: number },
  botRole: ReactionBotRole = "agent",
  slotOffsetOverride?: number
): TelegramSafeReactionEmoji {
  const defaultOffset =
    botRole === "reaction" ? 0 : botRole === "agent" ? 1 : botRole === "fiverrex" ? 2 : 3;
  const slotOffset =
    typeof slotOffsetOverride === "number" ? slotOffsetOverride : defaultOffset;
  const pool = getContextReactionPool(msg);
  return pickFromUniquePool(pool, msg.message_id, slotOffset);
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function reactToTelegramMessageDetailed(
  botToken: string,
  chatId: number | string,
  messageId: number,
  emoji: TelegramSafeReactionEmoji,
  options?: { isBig?: boolean }
): Promise<{
  ok: boolean;
  emoji: TelegramSafeReactionEmoji;
  rateLimited?: boolean;
  retryAfter?: number;
  error?: string;
}> {
  const isBig = options?.isBig ?? true;

  const tryReact = async (targetEmoji: TelegramSafeReactionEmoji) => {
    const res = await callTelegramApi(botToken, "setMessageReaction", {
      chat_id: chatId,
      message_id: messageId,
      reaction: [{ type: "emoji", emoji: targetEmoji }],
      is_big: isBig,
    });
    return res;
  };

  try {
    let res = await tryReact(emoji);
    if (res.ok) {
      return { ok: true, emoji };
    }

    if (res.error_code === 429) {
      const retryMatch = res.description?.match(/retry after (\d+)/i);
      return {
        ok: false,
        emoji,
        rateLimited: true,
        retryAfter: retryMatch ? Number.parseInt(retryMatch[1], 10) : 5,
        error: res.description,
      };
    }

    if (emoji !== "❤️" && /REACTION_INVALID/i.test(res.description || "")) {
      res = await tryReact("❤️");
      if (res.ok) {
        return { ok: true, emoji: "❤️" };
      }
    }

    return { ok: false, emoji, error: res.description };
  } catch (err) {
    return {
      ok: false,
      emoji,
      error: err instanceof Error ? err.message : "setMessageReaction failed",
    };
  }
}

export async function reactToTelegramMessage(
  botToken: string,
  chatId: number | string,
  messageId: number,
  emoji: TelegramSafeReactionEmoji,
  options?: { isBig?: boolean }
): Promise<boolean> {
  const res = await reactToTelegramMessageDetailed(botToken, chatId, messageId, emoji, options);
  return res.ok;
}

export async function sweepRecentMessageReactions(
  botToken: string,
  chatId: number | string,
  anchorMessageId: number,
  options?: {
    count?: number;
    startOffset?: number;
    botRole?: ReactionBotRole;
    slotOffset?: number;
    anchorMsg?: Partial<TelegramIncomingMessage>;
    isBig?: boolean;
  }
): Promise<{
  reactedCount: number;
  attemptedCount: number;
  primaryEmoji?: TelegramSafeReactionEmoji;
  reactedMessageIds: number[];
  rateLimited: boolean;
}> {
  const count = Math.max(0, Math.min(10, options?.count ?? 10));
  const startOffset = Math.max(0, options?.startOffset ?? 0);
  const botRole = options?.botRole ?? "reaction";
  const slotOffset = options?.slotOffset;
  const isBig = options?.isBig ?? true;

  const targetIds: number[] = [];
  for (let i = 0; i < count; i++) {
    const id = anchorMessageId - (startOffset + i);
    if (id >= 1) {
      targetIds.push(id);
    }
  }

  if (targetIds.length === 0) {
    return {
      reactedCount: 0,
      attemptedCount: 0,
      primaryEmoji: undefined,
      reactedMessageIds: [],
      rateLimited: false,
    };
  }

  let reactedCount = 0;
  let primaryEmoji: TelegramSafeReactionEmoji | undefined;
  let rateLimited = false;
  const reactedMessageIds: number[] = [];

  // Process in fast batches of 5 with a tiny pause to stay snappy on Vercel while respecting rate limits.
  const batchSize = 5;
  for (let i = 0; i < targetIds.length; i += batchSize) {
    const slice = targetIds.slice(i, i + batchSize);
    const results = await Promise.all(
      slice.map((mid) => {
        const msgSeed: Partial<TelegramIncomingMessage> & { message_id: number } =
          mid === anchorMessageId && options?.anchorMsg
            ? { ...options.anchorMsg, message_id: mid }
            : { message_id: mid };
        const emoji = pickTelegramReactionEmoji(msgSeed, botRole, slotOffset);
        return reactToTelegramMessageDetailed(botToken, chatId, mid, emoji, { isBig }).then(
          (res) => ({ mid, res })
        );
      })
    );

    for (const { mid, res } of results) {
      if (res.ok) {
        reactedCount += 1;
        reactedMessageIds.push(mid);
        if (mid === anchorMessageId) {
          primaryEmoji = res.emoji;
        }
      }
      if (res.rateLimited) {
        rateLimited = true;
      }
    }

    if (rateLimited) {
      break;
    }

    if (i + batchSize < targetIds.length) {
      await sleepMs(40);
    }
  }

  return {
    reactedCount,
    attemptedCount: targetIds.length,
    primaryEmoji,
    reactedMessageIds,
    rateLimited,
  };
}

export async function fanOutReactionsToMessage(
  chatId: number | string,
  messageId: number,
  contextHint?: Partial<TelegramIncomingMessage>,
  options?: { excludeRoles?: ReactionBotRole[]; isBig?: boolean }
): Promise<{
  reactedCount: number;
  totalBots: number;
  emojis: Array<{ bot: string; emoji: TelegramSafeReactionEmoji }>;
}> {
  const excluded = new Set(options?.excludeRoles || []);
  const bots = getAllReactionCapableBots().filter((b) => !excluded.has(b.role));
  if (bots.length === 0) {
    return { reactedCount: 0, totalBots: 0, emojis: [] };
  }

  const results = await Promise.all(
    bots.map(async (bot) => {
      const emoji = pickTelegramReactionEmoji(
        { ...contextHint, message_id: messageId },
        bot.role,
        bot.slotOffset
      );
      const res = await reactToTelegramMessageDetailed(bot.token, chatId, messageId, emoji, {
        isBig: options?.isBig ?? true,
      });
      return { bot: bot.label, ok: res.ok, emoji: res.emoji };
    })
  );

  const succeeded = results.filter((r) => r.ok);
  return {
    reactedCount: succeeded.length,
    totalBots: bots.length,
    emojis: succeeded.map((r) => ({ bot: r.bot, emoji: r.emoji })),
  };
}

export async function fanOutReactionWave(
  chatId: number | string,
  anchorMessageId: number,
  countPerBot = 8,
  anchorMsg?: Partial<TelegramIncomingMessage>
): Promise<{
  totalReactions: number;
  botCount: number;
  perBot: Array<{ bot: string; reactedCount: number; attemptedCount: number; rateLimited: boolean }>;
}> {
  const bots = getAllReactionCapableBots();
  const clampedCount = Math.max(1, Math.min(10, countPerBot));

  const perBot = await Promise.all(
    bots.map(async (bot) => {
      const sweep = await sweepRecentMessageReactions(bot.token, chatId, anchorMessageId, {
        count: clampedCount,
        botRole: bot.role,
        slotOffset: bot.slotOffset,
        anchorMsg,
        isBig: true,
      });
      return {
        bot: bot.label,
        reactedCount: sweep.reactedCount,
        attemptedCount: sweep.attemptedCount,
        rateLimited: sweep.rateLimited,
      };
    })
  );

  const totalReactions = perBot.reduce((sum, item) => sum + item.reactedCount, 0);
  return {
    totalReactions,
    botCount: bots.length,
    perBot,
  };
}

export async function handleBotWebhookRequest(
  req: Request,
  config: TelegramConfig | null,
  commandBuilder: (
    text: string,
    siteUrl: string
  ) => { text: string; reply_markup?: { inline_keyboard: Array<Array<{ text: string; url: string }>> } } | null
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (!config) {
    return { status: 503, body: { ok: false, error: "Bot not configured" } };
  }

  const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
  if (config.webhookSecret && !verifySharedSecret(config.webhookSecret, secretHeader)) {
    return { status: 401, body: { ok: false, error: "Unauthorized webhook" } };
  }

  let update: {
    message?: TelegramIncomingMessage;
  };
  try {
    update = (await req.json()) as typeof update;
  } catch {
    return { status: 200, body: { ok: true, ignored: true } };
  }

  const msg = update.message;
  const chatId = msg?.chat?.id;
  const text = (msg?.text || msg?.caption || "").trim();
  if (!msg || !chatId) {
    return { status: 200, body: { ok: true } };
  }

  let reactedEmoji: string | undefined;
  let reactedCount = 0;
  if (shouldReactToTelegramMessage(msg)) {
    const isGroupChat = msg.chat?.type === "group" || msg.chat?.type === "supergroup";
    const sweep = await sweepRecentMessageReactions(config.botToken, chatId, msg.message_id, {
      count: isGroupChat ? 5 : 1,
      botRole: "fiverrex",
      slotOffset: 2,
      anchorMsg: msg,
      isBig: true,
    });
    reactedEmoji = sweep.primaryEmoji;
    reactedCount = sweep.reactedCount;
  }

  if (!text || !text.startsWith("/")) {
    return {
      status: 200,
      body: {
        ok: true,
        ...(reactedEmoji ? { reacted: reactedEmoji } : {}),
        ...(reactedCount > 0 ? { reactedCount } : {}),
      },
    };
  }

  const reply = commandBuilder(text, config.siteUrl);
  if (reply) {
    const sent = await callTelegramApi<{ message_id: number }>(config.botToken, "sendMessage", {
      chat_id: chatId,
      text: reply.text,
      parse_mode: "HTML",
      reply_markup: reply.reply_markup,
      reply_parameters: msg.message_id ? { message_id: msg.message_id } : undefined,
      link_preview_options: { is_disabled: true },
    });
    if (sent.ok && sent.result?.message_id) {
      await fanOutReactionsToMessage(chatId, sent.result.message_id, { text: reply.text });
    }
  }

  return {
    status: 200,
    body: {
      ok: true,
      ...(reactedEmoji ? { reacted: reactedEmoji } : {}),
      ...(reactedCount > 0 ? { reactedCount } : {}),
    },
  };
}

export function formatTelegramMemberMentions(
  members: Array<{ id?: number; is_bot?: boolean; first_name?: string; username?: string }>
): string {
  return members
    .filter((m) => !m.is_bot)
    .map((m) => {
      if (m.username) {
        return `@${escapeTelegramHtml(m.username.replace(/^@+/, ""))}`;
      }
      const name = escapeTelegramHtml(m.first_name?.trim() || "Developer");
      return typeof m.id === "number" ? `<a href="tg://user?id=${m.id}">${name}</a>` : name;
    })
    .join(", ");
}

export async function handleAgentBotWebhookRequest(
  req: Request
): Promise<{ status: number; body: Record<string, unknown> }> {
  const config = getAgentBotConfig();
  if (!config) {
    return { status: 503, body: { ok: false, error: "Agent bot not configured" } };
  }

  const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
  if (config.webhookSecret && !verifySharedSecret(config.webhookSecret, secretHeader)) {
    return { status: 401, body: { ok: false, error: "Unauthorized webhook" } };
  }

  let update: {
    message?: TelegramIncomingMessage;
  };
  try {
    update = (await req.json()) as typeof update;
  } catch {
    return { status: 200, body: { ok: true, ignored: true } };
  }

  const msg = update.message;
  const chatId = msg?.chat?.id;
  const text = (msg?.text || msg?.caption || "").trim();
  if (!msg || !chatId || msg.from?.is_bot) {
    return { status: 200, body: { ok: true } };
  }

  let reactedEmoji: string | undefined;
  let reactedCount = 0;
  if (shouldReactToTelegramMessage(msg)) {
    const isGroupChat = msg.chat?.type === "group" || msg.chat?.type === "supergroup";
    const sweep = await sweepRecentMessageReactions(config.botToken, chatId, msg.message_id, {
      count: isGroupChat ? 5 : 1,
      botRole: "agent",
      slotOffset: 1,
      anchorMsg: msg,
      isBig: true,
    });
    reactedEmoji = sweep.primaryEmoji;
    reactedCount = sweep.reactedCount;
  }

  const joinedHumans = (msg.new_chat_members || []).filter((m) => !m.is_bot);
  if (joinedHumans.length > 0 && !text) {
    const mentions = formatTelegramMemberMentions(joinedHumans);
    const welcomeSent = await callTelegramApi<{ message_id: number }>(
      config.botToken,
      "sendMessage",
      {
        chat_id: chatId,
        text: [
          `👋 <b>Welcome to Dev Community, ${mentions}!</b>`,
          ``,
          `🤖 Come chat anytime with <b>@agent_programming_bot</b> — our Gemini-powered AI Agent Engineering assistant:`,
          `• Use <code>/ask &lt;your question&gt;</code> right here in chat`,
          `• Mention <code>@agent_programming_bot</code> or reply directly to any bot briefing`,
          `• Or tap below to start a 1-on-1 AI chat`,
        ].join("\n"),
        parse_mode: "HTML",
        reply_parameters: { message_id: msg.message_id },
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "💬 Chat with @agent_programming_bot",
                url: "https://t.me/agent_programming_bot",
              },
            ],
          ],
        },
        link_preview_options: { is_disabled: true },
      }
    );
    if (welcomeSent.ok && welcomeSent.result?.message_id) {
      await fanOutReactionsToMessage(chatId, welcomeSent.result.message_id, {
        text: "welcome congratulations",
      });
    }
    return {
      status: 200,
      body: { ok: true, mode: "welcome-member", reacted: reactedEmoji ?? null, reactedCount },
    };
  }

  if (!text) {
    return {
      status: 200,
      body: {
        ok: true,
        ...(reactedEmoji ? { reacted: reactedEmoji } : {}),
        ...(reactedCount > 0 ? { reactedCount } : {}),
      },
    };
  }

  const senderName = msg.from?.first_name || msg.from?.username;
  const replyParameters = { message_id: msg.message_id };

  // Handle explicit slash commands first.
  if (text.startsWith("/")) {
    const cmd = text.split(/\s+/)[0].split("@")[0].toLowerCase();

    if (cmd === "/ask") {
      const question = text.replace(/^\/ask(?:@[a-zA-Z0-9_]+)?\s*/i, "").trim();
      await callTelegramApi(config.botToken, "sendChatAction", {
        chat_id: chatId,
        action: "typing",
      });
      const aiReply = await askGeminiAgentTutor({
        question,
        senderName,
        replyToText: msg.reply_to_message?.text || msg.reply_to_message?.caption,
      });
      const sent = await callTelegramApi<{ message_id: number }>(config.botToken, "sendMessage", {
        chat_id: chatId,
        text: aiReply.htmlText,
        parse_mode: "HTML",
        reply_parameters: replyParameters,
        link_preview_options: { is_disabled: true },
      });
      if (sent.ok && sent.result?.message_id) {
        await fanOutReactionsToMessage(chatId, sent.result.message_id, { text: question });
      }
      return {
        status: 200,
        body: {
          ok: true,
          mode: "ai-ask",
          model: aiReply.model,
          reacted: reactedEmoji ?? null,
          reactedCount,
        },
      };
    }

    if (cmd === "/lesson" || cmd === "/random") {
      await callTelegramApi(config.botToken, "sendChatAction", {
        chat_id: chatId,
        action: "typing",
      });
      const idx = Math.floor(Math.random() * AI_AGENT_LESSONS.length);
      const aiGen = await generateFreshAgentLessonWithGemini(AI_AGENT_LESSONS[idx], idx + 1);
      const card = formatTelegramAgentLessonCard(aiGen.lesson, {
        slot: idx + 1,
        total: AI_AGENT_LESSONS.length,
        siteUrl: config.siteUrl,
        header: aiGen.ok
          ? "🎲 <b>AI AGENT ENGINEERING • GEMINI BRIEFING</b>"
          : "🎲 <b>AI AGENT ENGINEERING • ON-DEMAND LESSON</b>",
      });
      const sent = await callTelegramApi<{ message_id: number }>(config.botToken, "sendMessage", {
        chat_id: chatId,
        text: card.text,
        parse_mode: "HTML",
        reply_markup: card.reply_markup,
        reply_parameters: replyParameters,
        link_preview_options: { is_disabled: true },
      });
      if (sent.ok && sent.result?.message_id) {
        await fanOutReactionsToMessage(chatId, sent.result.message_id, {
          text: `${aiGen.lesson.title} ai agent`,
        });
      }
      return {
        status: 200,
        body: {
          ok: true,
          mode: "lesson",
          ai: aiGen.ok,
          reacted: reactedEmoji ?? null,
          reactedCount,
        },
      };
    }

    const staticReply = buildAgentBotCommandResponse(text, config.siteUrl);
    if (staticReply) {
      await callTelegramApi(config.botToken, "sendMessage", {
        chat_id: chatId,
        text: staticReply.text,
        parse_mode: "HTML",
        reply_markup: staticReply.reply_markup,
        reply_parameters: replyParameters,
        link_preview_options: { is_disabled: true },
      });
    }
    return {
      status: 200,
      body: { ok: true, mode: "command", reacted: reactedEmoji ?? null, reactedCount },
    };
  }

  // Conversational AI mode: reply in private DMs, when @agent_programming_bot is mentioned,
  // or when someone replies directly to one of @agent_programming_bot's messages in group chat.
  const isPrivateChat = msg.chat?.type === "private";
  const isMentioned = /@agent_programming_bot\b/i.test(text);
  const isReplyToBot =
    msg.reply_to_message?.from?.username?.toLowerCase() === "agent_programming_bot";

  if (!isPrivateChat && !isMentioned && !isReplyToBot) {
    return {
      status: 200,
      body: {
        ok: true,
        ignoredReply: true,
        ...(reactedEmoji ? { reacted: reactedEmoji } : {}),
        ...(reactedCount > 0 ? { reactedCount } : {}),
      },
    };
  }

  const question = text.replace(/@agent_programming_bot\b/gi, "").trim();
  if (!question) {
    return {
      status: 200,
      body: {
        ok: true,
        ...(reactedEmoji ? { reacted: reactedEmoji } : {}),
        ...(reactedCount > 0 ? { reactedCount } : {}),
      },
    };
  }

  await callTelegramApi(config.botToken, "sendChatAction", {
    chat_id: chatId,
    action: "typing",
  });

  const aiReply = await askGeminiAgentTutor({
    question,
    senderName,
    replyToText: msg.reply_to_message?.text || msg.reply_to_message?.caption,
  });

  await callTelegramApi(config.botToken, "sendMessage", {
    chat_id: chatId,
    text: aiReply.htmlText,
    parse_mode: "HTML",
    reply_parameters: replyParameters,
    link_preview_options: { is_disabled: true },
  });

  return {
    status: 200,
    body: {
      ok: true,
      mode: "ai-chat",
      model: aiReply.model,
      reacted: reactedEmoji ?? null,
      reactedCount,
    },
  };
}

function parseRequestedReactionCount(rawArgs: string, fallback = 8): number {
  const match = rawArgs.match(/\d+/);
  if (!match) return fallback;
  const parsed = Number.parseInt(match[0], 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(10, parsed));
}

async function sendVibePollToChat(
  botToken: string,
  chatId: number | string,
  replyToMessageId?: number
): Promise<{ ok: boolean; messageId?: number; reactedCount: number }> {
  const poll = COMMUNITY_VIBE_POLLS[Math.floor(Math.random() * COMMUNITY_VIBE_POLLS.length)];
  const sent = await callTelegramApi<{ message_id: number }>(botToken, "sendPoll", {
    chat_id: chatId,
    question: poll.question,
    options: poll.options.map((text) => ({ text })),
    is_anonymous: false,
    allows_multiple_answers: true,
    ...(replyToMessageId ? { reply_parameters: { message_id: replyToMessageId } } : {}),
  });

  let reactedCount = 0;
  if (sent.ok && sent.result?.message_id) {
    const fanOut = await fanOutReactionsToMessage(chatId, sent.result.message_id, {
      text: poll.question,
    });
    reactedCount = fanOut.reactedCount;
  }

  return { ok: sent.ok, messageId: sent.result?.message_id, reactedCount };
}

export async function handleReactionBotWebhookRequest(
  req: Request
): Promise<{ status: number; body: Record<string, unknown> }> {
  const config = getReactionBotConfig();
  if (!config) {
    return { status: 503, body: { ok: false, error: "Reaction bot not configured" } };
  }

  const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
  if (config.webhookSecret && !verifySharedSecret(config.webhookSecret, secretHeader)) {
    return { status: 401, body: { ok: false, error: "Unauthorized webhook" } };
  }

  let update: {
    message?: TelegramIncomingMessage;
    edited_message?: TelegramIncomingMessage;
    channel_post?: TelegramIncomingMessage;
    callback_query?: TelegramCallbackQuery;
  };
  try {
    update = (await req.json()) as typeof update;
  } catch {
    return { status: 200, body: { ok: true, ignored: true } };
  }

  // 1) Handle interactive reaction action bar & quick utility buttons.
  if (update.callback_query) {
    const cb = update.callback_query;
    const data = cb.data || "";
    const cbMsg = cb.message;
    const cbChatId = cbMsg?.chat?.id;

    if (data.startsWith("rb:react:") && cbChatId && cbMsg?.message_id) {
      const emoji = data.slice("rb:react:".length);
      const { updated, newCount } = incrementReactionButtonInMarkup(cbMsg.reply_markup, emoji);

      await Promise.all([
        callTelegramApi(config.botToken, "editMessageReplyMarkup", {
          chat_id: cbChatId,
          message_id: cbMsg.message_id,
          reply_markup: updated,
        }),
        callTelegramApi(config.botToken, "answerCallbackQuery", {
          callback_query_id: cb.id,
          text: `${emoji} +1! (${newCount} total)`,
          show_alert: false,
        }),
        reactToTelegramMessageDetailed(
          config.botToken,
          cbChatId,
          cbMsg.message_id,
          (TELEGRAM_SAFE_REACTION_EMOJIS.includes(emoji as TelegramSafeReactionEmoji)
            ? emoji
            : "🔥") as TelegramSafeReactionEmoji,
          { isBig: true }
        ),
      ]);

      return { status: 200, body: { ok: true, mode: "callback-react", emoji, newCount } };
    }

    if (data.startsWith("rb:hype:") && cbChatId && cbMsg?.message_id) {
      const requested = parseRequestedReactionCount(data.slice("rb:hype:".length), 10);
      const wave = await fanOutReactionWave(cbChatId, cbMsg.message_id, requested, cbMsg);
      await callTelegramApi(config.botToken, "answerCallbackQuery", {
        callback_query_id: cb.id,
        text: `🔥 Blasted ${wave.totalReactions} big reactions across recent posts!`,
        show_alert: false,
      });
      return { status: 200, body: { ok: true, mode: "callback-hype", wave } };
    }

    if (data === "rb:news" && cbChatId) {
      await callTelegramApi(config.botToken, "answerCallbackQuery", {
        callback_query_id: cb.id,
        text: "📰 Fetching fresh Tech & AI News Pulse...",
        show_alert: false,
      });
      const idx = Math.floor(Math.random() * CURATED_NEWS_PULSES.length);
      const sent = await sendReactionNewsBroadcast({
        slot: idx,
        chatId: String(cbChatId),
        header: "📰 <b>TECH &amp; DEV NEWS PULSE • ON-DEMAND</b>",
      });
      return { status: 200, body: { ok: true, mode: "callback-news", sent } };
    }

    if (data === "rb:vibe" && cbChatId) {
      await callTelegramApi(config.botToken, "answerCallbackQuery", {
        callback_query_id: cb.id,
        text: "📊 Launching a fresh community vibe poll!",
        show_alert: false,
      });
      const pollRes = await sendVibePollToChat(config.botToken, cbChatId);
      return { status: 200, body: { ok: true, mode: "callback-vibe", pollRes } };
    }

    await callTelegramApi(config.botToken, "answerCallbackQuery", {
      callback_query_id: cb.id,
      text: "⚡ Done!",
    });
    return { status: 200, body: { ok: true, mode: "callback-ack" } };
  }

  // 2) Handle channel posts (instant ALL-bot parallel blast + recent post sweep!).
  if (update.channel_post) {
    const post = update.channel_post;
    const chatId = post.chat?.id;
    if (chatId && shouldReactToTelegramMessage(post, { allowChannelPost: true })) {
      const sweepCount = getReactionSweepCount(10);
      // Phase 1: Instant parallel blast on the new channel post across ALL configured bots.
      const instantBlast = await fanOutReactionsToMessage(chatId, post.message_id, post, {
        isBig: true,
      });
      // Phase 2: Sweep previous posts so recent items stay fully reacted too.
      const sweep =
        sweepCount > 1
          ? await sweepRecentMessageReactions(config.botToken, chatId, post.message_id, {
              count: sweepCount - 1,
              startOffset: 1,
              botRole: "reaction",
              slotOffset: 0,
              isBig: true,
            })
          : { reactedCount: 0 };
      return {
        status: 200,
        body: {
          ok: true,
          mode: "channel-post-react",
          instantReactedBots: instantBlast.reactedCount,
          emojis: instantBlast.emojis,
          reactedCount: instantBlast.reactedCount + sweep.reactedCount,
        },
      };
    }
    return { status: 200, body: { ok: true } };
  }

  const msg = update.message || update.edited_message;
  const chatId = msg?.chat?.id;
  const text = (msg?.text || msg?.caption || "").trim();
  if (!msg || !chatId || msg.from?.is_bot) {
    return { status: 200, body: { ok: true } };
  }

  const isEdited = Boolean(update.edited_message && !update.message);
  const isGroupChat = msg.chat?.type === "group" || msg.chat?.type === "supergroup";
  const autoSweepCount = getReactionSweepCount(10);

  let reactedEmoji: string | undefined;
  let reactedCount = 0;
  let instantBotsReacted = 0;

  // 3) INSTANT multi-bot reaction blast on EVERY incoming message, followed by recent-message sweep!
  if (shouldReactToTelegramMessage(msg)) {
    // Phase 1 (<150ms): Immediately fire ALL configured bots (reaction + agent + fiverrex + all swarm bots)
    // in parallel on msg.message_id with guaranteed distinct big reactions!
    const instantBlast = await fanOutReactionsToMessage(chatId, msg.message_id, msg, {
      isBig: true,
    });
    instantBotsReacted = instantBlast.reactedCount;
    reactedEmoji = instantBlast.emojis[0]?.emoji;
    reactedCount = instantBlast.reactedCount;

    // Phase 2: Immediately sweep preceding messages (msg_id - 1 .. msg_id - 9) so every bot/user post stays covered!
    if (isGroupChat && !isEdited && autoSweepCount > 1) {
      const sweep = await sweepRecentMessageReactions(config.botToken, chatId, msg.message_id, {
        count: autoSweepCount - 1,
        startOffset: 1,
        botRole: "reaction",
        slotOffset: 0,
        isBig: true,
      });
      reactedCount += sweep.reactedCount;
    }
  }

  if (isEdited || !text) {
    return {
      status: 200,
      body: {
        ok: true,
        ...(reactedEmoji ? { reacted: reactedEmoji } : {}),
        ...(instantBotsReacted > 0 ? { instantBotsReacted } : {}),
        ...(reactedCount > 0 ? { reactedCount } : {}),
      },
    };
  }

  const senderName = msg.from?.first_name || msg.from?.username;
  const replyParameters = { message_id: msg.message_id };

  // 4) Slash Commands for @reaction_news_bot
  if (text.startsWith("/")) {
    const parts = text.split(/\s+/);
    const cmd = parts[0].split("@")[0].toLowerCase();
    const rawArgs = text.replace(/^\/[a-zA-Z0-9_]+(?:@[a-zA-Z0-9_]+)?\s*/i, "").trim();

    if (cmd === "/start" || cmd === "/help") {
      const bots = getAllReactionCapableBots();
      const card = buildReactionBotHelpCard(config.siteUrl, bots.length, autoSweepCount);
      const sent = await callTelegramApi<{ message_id: number }>(config.botToken, "sendMessage", {
        chat_id: chatId,
        text: card.text,
        parse_mode: "HTML",
        reply_markup: card.reply_markup,
        reply_parameters: replyParameters,
        link_preview_options: { is_disabled: true },
      });
      if (sent.ok && sent.result?.message_id) {
        await fanOutReactionsToMessage(chatId, sent.result.message_id, { text: "welcome hype" });
      }
      return {
        status: 200,
        body: { ok: true, mode: "help", reacted: reactedEmoji ?? null, reactedCount },
      };
    }

    if (cmd === "/hype" || cmd === "/react" || cmd === "/boost" || cmd === "/wave") {
      const requestedCount = parseRequestedReactionCount(rawArgs, 10);
      const anchorId = msg.reply_to_message?.message_id || msg.message_id;
      const wave = await fanOutReactionWave(chatId, anchorId, requestedCount, msg);

      const perBotSummary = wave.perBot
        .map((b) => `• <b>${escapeTelegramHtml(b.bot)}</b>: ${b.reactedCount}/${b.attemptedCount} reactions`)
        .join("\n");

      const sent = await callTelegramApi<{ message_id: number }>(config.botToken, "sendMessage", {
        chat_id: chatId,
        text: [
          `🔥 <b>REACTION WAVE ACTIVATED!</b>`,
          ``,
          `⚡ Dropped <b>${wave.totalReactions} big animated reactions</b> across the latest <b>${requestedCount}</b> messages (${wave.botCount} coordinated bots):`,
          perBotSummary,
          ``,
          `💡 <i>Tip: Reply to any post with <code>/hype 10</code> or tap an emoji button below!</i>`,
        ].join("\n"),
        parse_mode: "HTML",
        reply_parameters: replyParameters,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🔥 1", callback_data: "rb:react:🔥" },
              { text: "❤️ 1", callback_data: "rb:react:❤️" },
              { text: "⚡ 1", callback_data: "rb:react:⚡" },
              { text: "🤩 1", callback_data: "rb:react:🤩" },
            ],
            [
              { text: "💯 1", callback_data: "rb:react:💯" },
              { text: "🤯 1", callback_data: "rb:react:🤯" },
              { text: "👏 1", callback_data: "rb:react:👏" },
              { text: "👀 1", callback_data: "rb:react:👀" },
            ],
            [
              { text: "🔥 Hype 10 Again", callback_data: "rb:hype:10" },
              { text: "📰 Tech News Pulse", callback_data: "rb:news" },
            ],
          ],
        },
        link_preview_options: { is_disabled: true },
      });
      if (sent.ok && sent.result?.message_id) {
        await fanOutReactionsToMessage(chatId, sent.result.message_id, { text: "hype congrats" });
      }
      return {
        status: 200,
        body: { ok: true, mode: "hype-wave", requestedCount, wave },
      };
    }

    if (cmd === "/news") {
      await callTelegramApi(config.botToken, "sendChatAction", {
        chat_id: chatId,
        action: "typing",
      });
      const randomSlot = Math.floor(Math.random() * CURATED_NEWS_PULSES.length);
      const sent = await sendReactionNewsBroadcast({
        slot: randomSlot,
        chatId: String(chatId),
        topic: rawArgs || undefined,
        header: rawArgs
          ? `📰 <b>TECH &amp; DEV NEWS PULSE • ${escapeTelegramHtml(rawArgs.toUpperCase())}</b>`
          : "📰 <b>TECH &amp; DEV NEWS PULSE • LIVE BRIEF</b>",
      });
      return {
        status: 200,
        body: { ok: true, mode: "news", sent, reactedCount },
      };
    }

    if (cmd === "/vibe" || cmd === "/poll") {
      const pollRes = await sendVibePollToChat(config.botToken, chatId, msg.message_id);
      return {
        status: 200,
        body: { ok: true, mode: "vibe-poll", pollRes, reactedCount },
      };
    }

    if (cmd === "/status" || cmd === "/ping") {
      const bots = getAllReactionCapableBots();
      const botList = bots.map((b) => `• <b>${escapeTelegramHtml(b.label)}</b> (slot #${b.slotOffset + 1})`).join("\n");
      const sent = await callTelegramApi<{ message_id: number }>(config.botToken, "sendMessage", {
        chat_id: chatId,
        text: [
          `⚡ <b>REACTION NEWS BOT • ONLINE</b>`,
          ``,
          `✅ <b>Auto-Sweep per message:</b> ${autoSweepCount} recent messages (big animations ON)`,
          `🔥 <b>Max Hype Wave:</b> 10 reactions/bot via <code>/hype 10</code>`,
          `🤝 <b>Coordinated Bots (${bots.length}):</b>`,
          botList,
          ``,
          `📰 <b>News Pulses Ready:</b> ${CURATED_NEWS_PULSES.length} curated + Gemini Live AI`,
        ].join("\n"),
        parse_mode: "HTML",
        reply_parameters: replyParameters,
        link_preview_options: { is_disabled: true },
      });
      if (sent.ok && sent.result?.message_id) {
        await fanOutReactionsToMessage(chatId, sent.result.message_id, { text: "status online" });
      }
      return {
        status: 200,
        body: { ok: true, mode: "status", activeBots: bots.length, reactedCount },
      };
    }

    return {
      status: 200,
      body: { ok: true, mode: "unknown-command", reacted: reactedEmoji ?? null, reactedCount },
    };
  }

  // 5) Conversational Engagement Mode: DMs, @reaction_news_bot mentions, or direct replies to the bot.
  const isPrivateChat = msg.chat?.type === "private";
  const isMentioned = /@reaction_news_bot\b/i.test(text);
  const isReplyToBot =
    msg.reply_to_message?.from?.username?.toLowerCase() === "reaction_news_bot";

  if (!isPrivateChat && !isMentioned && !isReplyToBot) {
    return {
      status: 200,
      body: {
        ok: true,
        mode: "auto-react-sweep",
        reacted: reactedEmoji ?? null,
        reactedCount,
      },
    };
  }

  const cleanPrompt = text.replace(/@reaction_news_bot\b/gi, "").trim();
  await callTelegramApi(config.botToken, "sendChatAction", {
    chat_id: chatId,
    action: "typing",
  });

  const aiReply = await askGeminiReactionBuddy({
    message: cleanPrompt,
    senderName,
    replyToText: msg.reply_to_message?.text || msg.reply_to_message?.caption,
  });

  const sent = await callTelegramApi<{ message_id: number }>(config.botToken, "sendMessage", {
    chat_id: chatId,
    text: aiReply.htmlText,
    parse_mode: "HTML",
    reply_parameters: replyParameters,
    link_preview_options: { is_disabled: true },
  });
  if (sent.ok && sent.result?.message_id) {
    await fanOutReactionsToMessage(chatId, sent.result.message_id, { text: cleanPrompt });
  }

  return {
    status: 200,
    body: {
      ok: true,
      mode: "reaction-buddy-chat",
      model: aiReply.model,
      reacted: reactedEmoji ?? null,
      reactedCount,
    },
  };
}

export function extractBroadcastBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice("Bearer ".length).trim();
  }
  return req.headers.get("x-broadcast-secret")?.trim() || null;
}

export async function parseBroadcastParams(req: Request): Promise<{
  itemId?: string;
  chatId?: string;
  slot?: number;
  header?: string;
  topic?: string;
}> {
  const url = new URL(req.url);
  let itemId =
    url.searchParams.get("jobId") ||
    url.searchParams.get("lessonId") ||
    url.searchParams.get("pulseId") ||
    undefined;
  let chatId = url.searchParams.get("chatId") || undefined;
  let slot: number | undefined;
  let header: string | undefined;
  let topic = url.searchParams.get("topic") || undefined;

  if (req.method === "POST") {
    try {
      const body = (await req.json()) as {
        jobId?: string;
        lessonId?: string;
        pulseId?: string;
        chatId?: string;
        slot?: number;
        header?: string;
        topic?: string;
      };
      itemId = body?.jobId || body?.lessonId || body?.pulseId || itemId;
      chatId = body?.chatId || chatId;
      slot = typeof body?.slot === "number" ? body.slot : undefined;
      header = body?.header;
      topic = body?.topic || topic;
    } catch {
      // Optional JSON body
    }
  }

  return { itemId, chatId, slot, header, topic };
}
