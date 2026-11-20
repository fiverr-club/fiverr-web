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
  generateFreshAgentLessonWithGemini,
} from "@/lib/gemini";

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

function readBotConfigFromEnv(prefix: "TELEGRAM" | "AGENT"): TelegramConfig | null {
  const tokenKey = prefix === "TELEGRAM" ? "TELEGRAM_BOT_TOKEN" : "AGENT_BOT_TOKEN";
  const webhookKey = prefix === "TELEGRAM" ? "TELEGRAM_WEBHOOK_SECRET" : "AGENT_WEBHOOK_SECRET";
  const broadcastKey =
    prefix === "TELEGRAM" ? "TELEGRAM_BROADCAST_SECRET" : "AGENT_BROADCAST_SECRET";

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

  return {
    ok: true,
    messageId: res.result?.message_id,
    chatId: targetChatId,
    jobId: picked.job.id,
    jobTitle: picked.job.title,
    slot: picked.slot,
    total: picked.total,
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

  return {
    ok: true,
    messageId: res.result?.message_id,
    chatId: targetChatId,
    lessonId: lessonToSend.id,
    lessonTitle: lessonToSend.title,
    slot: picked.slot,
    total: picked.total,
    source,
    model: modelUsed,
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
  "👍",
  "🔥",
  "👏",
  "🎉",
  "🤩",
  "😁",
  "🤔",
  "🤯",
  "⚡",
  "💯",
  "🙏",
  "👀",
  "🤝",
  "😎",
  "🥰",
  "🏆",
  "🤣",
] as const;

export type TelegramSafeReactionEmoji = (typeof TELEGRAM_SAFE_REACTION_EMOJIS)[number];

export interface TelegramIncomingMessage {
  message_id: number;
  text?: string;
  caption?: string;
  chat?: { id: number | string; type?: string };
  from?: { id?: number; is_bot?: boolean; first_name?: string; username?: string };
  photo?: unknown[];
  sticker?: { emoji?: string };
  video?: unknown;
  animation?: unknown;
  document?: unknown;
  voice?: unknown;
  audio?: unknown;
  poll?: unknown;
  new_chat_members?: Array<{ id?: number; is_bot?: boolean; first_name?: string; username?: string }>;
  left_chat_member?: unknown;
  pinned_message?: unknown;
  reply_to_message?: {
    text?: string;
    caption?: string;
    from?: { is_bot?: boolean; username?: string };
  };
}

const JOB_TOPIC_REGEX =
  /\b(job|jobs|freelance|bid|bidding|credit|credits|quest|quests|hire|hiring|client|proposal|fiverrex|project|viec|việc|tuyển)\b/i;

function pickFromPool(
  pool: readonly TelegramSafeReactionEmoji[],
  messageId: number
): TelegramSafeReactionEmoji {
  const idx = Math.abs(messageId) % pool.length;
  return pool[idx];
}

export function shouldReactToTelegramMessage(msg?: TelegramIncomingMessage | null): boolean {
  if (!msg || !msg.message_id || !msg.chat?.id) return false;
  if (msg.from?.is_bot) return false;
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
      msg.animation ||
      msg.document ||
      msg.voice ||
      msg.audio ||
      msg.poll ||
      msg.new_chat_members?.length
  );
}

export function pickTelegramReactionEmoji(
  msg: TelegramIncomingMessage,
  botRole: "agent" | "fiverrex" = "agent"
): TelegramSafeReactionEmoji {
  if (msg.new_chat_members?.some((m) => !m.is_bot)) {
    return "🎉";
  }

  const rawText = (msg.text || msg.caption || msg.sticker?.emoji || "").trim();

  if (
    /\b(hi|hello|hey|gm|gn|morning|night|chào|cảm ơn|cam on|thanks|thank you|thx|love|heart|tim|tuyệt|hay quá|nice|good|great|awesome|cool|welcome|ok|okay)\b|[❤️❤💖💗💕🫶🙏🥰😍😘]/iu.test(
      rawText
    )
  ) {
    return pickFromPool(["❤️", "❤️", "🥰", "❤️", "🙏"], msg.message_id);
  }

  if (
    /\b(ship|shipped|deploy|deployed|launch|launched|win|won|congrats|congratulations|chúc mừng|done|fixed|solved|xong|complete|completed|milestone|passed)\b|[🎉🏆🥳👏🚀💯]/u.test(
      rawText
    )
  ) {
    return pickFromPool(["🎉", "🏆", "👏", "🔥", "💯"], msg.message_id);
  }

  if (/\b(haha|hehe|hihi|lol|lmao|rofl|lmfao)\b|[😂🤣😹]/u.test(rawText)) {
    return pickFromPool(["🤣", "😁", "❤️", "🔥"], msg.message_id);
  }

  if (
    /\b(agent|agents|ai|llm|gemini|claude|gpt|code|coding|dev|api|mcp|rag|prompt|token|react|next|nextjs|python|typescript|rust|docker|sql|tool|memory|eval|bot|bug|debug)\b/i.test(
      rawText
    )
  ) {
    return botRole === "fiverrex"
      ? pickFromPool(["🔥", "⚡", "👍", "❤️"], msg.message_id)
      : pickFromPool(["⚡", "🤯", "🔥", "💯", "❤️"], msg.message_id);
  }

  if (JOB_TOPIC_REGEX.test(rawText)) {
    return pickFromPool(["🔥", "🤝", "🏆", "👍", "❤️"], msg.message_id);
  }

  if (/\?|\b(how|why|what|when|which|anyone|help|làm sao|tại sao|thế nào|sao vậy|hỏi)\b/i.test(rawText)) {
    return pickFromPool(["🤔", "👀", "❤️", "⚡"], msg.message_id);
  }

  if (msg.sticker || msg.animation) {
    return pickFromPool(["❤️", "🤩", "😁", "🔥"], msg.message_id);
  }

  if (msg.photo || msg.video || msg.document || msg.voice || msg.audio || msg.poll) {
    return pickFromPool(["❤️", "🔥", "👀", "👏"], msg.message_id);
  }

  return pickFromPool(["❤️", "❤️", "❤️", "🔥", "👍", "🤩", "👏", "🥰"], msg.message_id);
}

export async function reactToTelegramMessage(
  botToken: string,
  chatId: number | string,
  messageId: number,
  emoji: TelegramSafeReactionEmoji
): Promise<boolean> {
  try {
    const res = await callTelegramApi(botToken, "setMessageReaction", {
      chat_id: chatId,
      message_id: messageId,
      reaction: [{ type: "emoji", emoji }],
    });
    return res.ok;
  } catch {
    return false;
  }
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
  if (shouldReactToTelegramMessage(msg)) {
    const isPrivateChat = msg.chat?.type === "private";
    const isSharedGroup = String(chatId) === config.chatId;
    const isMentioned = /@fiverrex_bot\b/i.test(text);
    const isReplyToFiverrex =
      msg.reply_to_message?.from?.username?.toLowerCase() === "fiverrex_bot";
    const shouldReact =
      isPrivateChat ||
      !isSharedGroup ||
      text.startsWith("/") ||
      isMentioned ||
      isReplyToFiverrex ||
      JOB_TOPIC_REGEX.test(text);

    if (shouldReact) {
      const candidate = pickTelegramReactionEmoji(msg, "fiverrex");
      const ok = await reactToTelegramMessage(config.botToken, chatId, msg.message_id, candidate);
      if (ok) reactedEmoji = candidate;
    }
  }

  if (!text || !text.startsWith("/")) {
    return { status: 200, body: { ok: true, ...(reactedEmoji ? { reacted: reactedEmoji } : {}) } };
  }

  const reply = commandBuilder(text, config.siteUrl);
  if (reply) {
    await callTelegramApi(config.botToken, "sendMessage", {
      chat_id: chatId,
      text: reply.text,
      parse_mode: "HTML",
      reply_markup: reply.reply_markup,
      reply_parameters: msg.message_id ? { message_id: msg.message_id } : undefined,
      link_preview_options: { is_disabled: true },
    });
  }

  return { status: 200, body: { ok: true, ...(reactedEmoji ? { reacted: reactedEmoji } : {}) } };
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
  if (shouldReactToTelegramMessage(msg)) {
    const candidate = pickTelegramReactionEmoji(msg, "agent");
    const ok = await reactToTelegramMessage(config.botToken, chatId, msg.message_id, candidate);
    if (ok) reactedEmoji = candidate;
  }

  const joinedHumans = (msg.new_chat_members || []).filter((m) => !m.is_bot);
  if (joinedHumans.length > 0 && !text) {
    const mentions = formatTelegramMemberMentions(joinedHumans);
    await callTelegramApi(config.botToken, "sendMessage", {
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
    });
    return { status: 200, body: { ok: true, mode: "welcome-member", reacted: reactedEmoji ?? null } };
  }

  if (!text) {
    return { status: 200, body: { ok: true, ...(reactedEmoji ? { reacted: reactedEmoji } : {}) } };
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
      await callTelegramApi(config.botToken, "sendMessage", {
        chat_id: chatId,
        text: aiReply.htmlText,
        parse_mode: "HTML",
        reply_parameters: replyParameters,
        link_preview_options: { is_disabled: true },
      });
      return {
        status: 200,
        body: { ok: true, mode: "ai-ask", model: aiReply.model, reacted: reactedEmoji ?? null },
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
      await callTelegramApi(config.botToken, "sendMessage", {
        chat_id: chatId,
        text: card.text,
        parse_mode: "HTML",
        reply_markup: card.reply_markup,
        reply_parameters: replyParameters,
        link_preview_options: { is_disabled: true },
      });
      return {
        status: 200,
        body: { ok: true, mode: "lesson", ai: aiGen.ok, reacted: reactedEmoji ?? null },
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
    return { status: 200, body: { ok: true, mode: "command", reacted: reactedEmoji ?? null } };
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
      body: { ok: true, ignoredReply: true, ...(reactedEmoji ? { reacted: reactedEmoji } : {}) },
    };
  }

  const question = text.replace(/@agent_programming_bot\b/gi, "").trim();
  if (!question) {
    return { status: 200, body: { ok: true, ...(reactedEmoji ? { reacted: reactedEmoji } : {}) } };
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
    body: { ok: true, mode: "ai-chat", model: aiReply.model, reacted: reactedEmoji ?? null },
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
}> {
  const url = new URL(req.url);
  let itemId =
    url.searchParams.get("jobId") || url.searchParams.get("lessonId") || undefined;
  let chatId = url.searchParams.get("chatId") || undefined;
  let slot: number | undefined;
  let header: string | undefined;

  if (req.method === "POST") {
    try {
      const body = (await req.json()) as {
        jobId?: string;
        lessonId?: string;
        chatId?: string;
        slot?: number;
        header?: string;
      };
      itemId = body?.jobId || body?.lessonId || itemId;
      chatId = body?.chatId || chatId;
      slot = typeof body?.slot === "number" ? body.slot : undefined;
      header = body?.header;
    } catch {
      // Optional JSON body
    }
  }

  return { itemId, chatId, slot, header };
}
