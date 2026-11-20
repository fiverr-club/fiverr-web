export interface AgentKnowledgeLesson {
  id: string;
  category:
    | "Architecture"
    | "Tool Use & MCP"
    | "Memory & RAG"
    | "Multi-Agent"
    | "Evals & Safety"
    | "Production & Ops";
  title: string;
  summary: string;
  keyPoints: string[];
  codeSnippet?: string;
  antiPattern: string;
  tags: string[];
}

export const AI_AGENT_LESSONS: AgentKnowledgeLesson[] = [
  {
    id: "lesson-01",
    category: "Architecture",
    title: "ReAct vs. Plan-and-Execute: Choosing the Right Control Loop",
    summary:
      "ReAct interleaves Thought -> Action -> Observation step by step, while Plan-and-Execute outlines a multi-step plan upfront before running sub-tasks.",
    keyPoints: [
      "Use ReAct for exploratory tasks that adapt dynamically to unexpected observations (debugging, triage).",
      "Use Plan-and-Execute for repeatable workflows of 5+ steps to reduce repeated system prompt tokens.",
      "Always enforce a hard maxIterations ceiling (e.g., 8-12 steps) with a graceful partial-result fallback.",
    ],
    codeSnippet: `for (let step = 0; step < MAX_STEPS; step++) {
  const res = await llm.step(state);
  if (res.done) return res.finalAnswer;
  state.observations.push(await runTool(res.toolCall));
}`,
    antiPattern:
      "Running an unbounded while(true) loop with no step cap or token budget, letting failing tools burn infinite credits.",
    tags: ["AIAgents", "ReAct", "Architecture"],
  },
  {
    id: "lesson-02",
    category: "Tool Use & MCP",
    title: "Designing Bulletproof Tool Schemas for Accurate Function Calling",
    summary:
      "Over 70% of tool-calling accuracy comes from narrow single-purpose functions, clear parameter descriptions, and strict enums.",
    keyPoints: [
      "Keep each tool single-purpose instead of overloading 5 unrelated modes into one mega-tool.",
      "Prefer strict enums over open-ended strings for statuses, sort modes, and resource types.",
      "Return actionable recovery hints on validation errors so the agent can self-correct on its next turn.",
    ],
    codeSnippet: `{
  name: "search_jobs",
  parameters: { category: z.enum(["AI", "Web", "DevOps"]), maxBudget: z.number().int().positive() }
}`,
    antiPattern:
      "Returning raw stack traces or vague '400 Bad Request' strings that force the LLM to guess parameter formats.",
    tags: ["ToolCalling", "JSONSchema", "MCP"],
  },
  {
    id: "lesson-03",
    category: "Tool Use & MCP",
    title: "Model Context Protocol (MCP): Decoupling Agents from Integrations",
    summary:
      "MCP standardizes how AI hosts discover tools, read-only resources, and prompt templates across IDE clients and backend services.",
    keyPoints: [
      "Expose state-changing operations or parameterized queries as Tools, and read-only URIs as Resources.",
      "Enforce authorization and tenant isolation inside the MCP server boundary, never trust model-supplied user IDs.",
      "Keep active tool definitions concise (<15-20 eager tools) or lazy-load schemas to preserve reasoning bandwidth.",
    ],
    antiPattern:
      "Dumping 80+ verbose tool schemas into every prompt, diluting attention and inflating input token costs.",
    tags: ["MCP", "Protocol", "AgentTools"],
  },
  {
    id: "lesson-04",
    category: "Memory & RAG",
    title: "Hybrid Search (BM25 + Vector) + Reranking for Agentic RAG",
    summary:
      "Dense embeddings capture semantics well but miss exact error codes, identifiers, and symbol names that BM25 lexical search nails.",
    keyPoints: [
      "Fuse top-k lexical BM25 and dense vector hits using Reciprocal Rank Fusion (RRF).",
      "Apply a Cross-Encoder Reranker to narrow the top 30 candidates down to the best 5-8 chunks.",
      "Attach source URIs, timestamps, and ACL permissions to every indexed document chunk.",
    ],
    codeSnippet: `const candidates = rrfMerge(await bm25Search(q, 30), await vectorSearch(q, 30));
const topDocs = await reranker.rerank(q, candidates, { topN: 6 });`,
    antiPattern:
      "Taking raw top-3 cosine similarity hits and wondering why ticket IDs or exact API flags never show up.",
    tags: ["RAG", "HybridSearch", "pgvector"],
  },
  {
    id: "lesson-05",
    category: "Memory & RAG",
    title: "Three Memory Tiers: Working, Episodic, and Semantic Memory",
    summary:
      "Separating short-term working context from durable episodic logs and semantic facts keeps agents sharp across long horizons.",
    keyPoints: [
      "Working Memory: current turn messages plus a compact structured scratchpad of active state.",
      "Episodic Memory: past run trajectories, tool outcomes, and resolved issues indexed per user/workspace.",
      "Semantic Memory: durable user preferences, architecture constraints, and glossary facts with upsert semantics.",
    ],
    antiPattern:
      "Appending raw chat transcripts indefinitely until the context window fills with stale noise.",
    tags: ["AgentMemory", "ContextEngineering"],
  },
  {
    id: "lesson-06",
    category: "Evals & Safety",
    title: "Human-in-the-Loop (HITL) Gates for High-Impact Actions",
    summary:
      "Any external or destructive side effect (payments, DB deletes, mass emails, production deploys) requires an explicit approval pause.",
    keyPoints: [
      "Tier tools by risk: Read-only runs autonomously; Mutating or External calls pause for confirmation.",
      "Persist graph checkpoints by thread_id so execution resumes cleanly without re-running completed steps.",
      "Display the exact payload diff or target recipients in the approval UI instead of a vague confirmation prompt.",
    ],
    antiPattern:
      "Granting autonomous bots unrestricted production write/delete credentials without an approval checkpoint.",
    tags: ["Safety", "HITL", "Guardrails"],
  },
  {
    id: "lesson-07",
    category: "Multi-Agent",
    title: "Supervisor vs. Swarm vs. Pipeline: Pick the Simplest Topology",
    summary:
      "Multiple agents introduce coordination overhead; only split roles when distinct context windows, tools, or security scopes are needed.",
    keyPoints: [
      "A single agent with well-scoped tools usually beats a complex multi-agent graph on latency and reliability.",
      "Pipelines (Research -> Draft -> Verify) shine for deterministic sequential stages with typed handoffs.",
      "Supervisor/Worker swarms shine when independent slices (files, modules, checks) can run in parallel.",
    ],
    antiPattern:
      "Chaining 5 chatty agents with free-form prose handoffs that drop constraints and multiply end-to-end latency 5x.",
    tags: ["MultiAgent", "Orchestration", "Swarm"],
  },
  {
    id: "lesson-08",
    category: "Evals & Safety",
    title: "Trajectory Evals: Grade the Reasoning Path, Not Just the Final Answer",
    summary:
      "An agent can stumble onto a lucky answer while calling wasteful or dangerous tools; production evals must assert on tool trajectories.",
    keyPoints: [
      "Measure three layers: Tool Selection Accuracy, Argument Validity, and Final Output Groundedness.",
      "Run a curated golden dataset (30-50 real edge cases) in CI before shipping prompt or model upgrades.",
      "Track P95 latency and cost per solved task alongside pass rate to catch silent efficiency regressions.",
    ],
    antiPattern:
      "Shipping prompt edits after eyeballing two manual happy-path chat examples.",
    tags: ["Evals", "AIQuality", "CI"],
  },
  {
    id: "lesson-09",
    category: "Production & Ops",
    title: "Idempotency Keys & Exponential Backoff for Reliable Tool Execution",
    summary:
      "Network blips and worker retries happen constantly; side-effecting agent tools must safely tolerate duplicate delivery.",
    keyPoints: [
      "Derive deterministic idempotency keys from (runId + stepIndex + toolName) on every mutating call.",
      "Distinguish transient failures (429/503/timeout -> retry) from schema errors (400 -> feed back to the LLM).",
      "Add circuit breakers around flaky external APIs so the agent fails fast or routes to a fallback.",
    ],
    antiPattern:
      "Blindly retrying email, payment, or credit-deduction calls and double-charging end users.",
    tags: ["Reliability", "Idempotency", "Production"],
  },
  {
    id: "lesson-10",
    category: "Production & Ops",
    title: "Model Routing & Prompt Caching: Cut Agent Token Spend by 60-70%",
    summary:
      "Route lightweight classification, extraction, and summarization turns to fast small models while reserving frontier models for hard reasoning.",
    keyPoints: [
      "Fast/Lite tier: intent routing, query rewriting, chunk filtering, and structured extraction.",
      "Pro/Reasoning tier: multi-file code synthesis, architectural planning, and subtle bug diagnosis.",
      "Structure prompts with stable static prefixes (rules + tool specs) first to maximize provider prompt cache hits.",
    ],
    antiPattern:
      "Sending every trivial yes/no routing decision to your slowest, most expensive frontier model.",
    tags: ["CostOptimization", "ModelRouting", "Caching"],
  },
  {
    id: "lesson-11",
    category: "Architecture",
    title: "Structured Context Compaction for Long-Running Agent Sessions",
    summary:
      "Once a session reaches 60-75% of its context limit, compact history into structured state rather than blindly truncating early messages.",
    keyPoints: [
      "Always preserve the user goal, pinned constraints, file paths, and latest test/error outputs.",
      "Summarize or prune stale terminal logs, raw HTML dumps, and already-verified intermediate diffs.",
      "Re-ground by checking live files or state after compaction instead of trusting vague summary memory.",
    ],
    antiPattern:
      "Using a naive sliding window that drops the original system requirements on turn 20.",
    tags: ["ContextWindow", "Compaction", "LLM"],
  },
  {
    id: "lesson-12",
    category: "Evals & Safety",
    title: "Defending Agents Against Indirect Prompt Injection",
    summary:
      "Untrusted emails, web pages, PR comments, or support tickets can embed adversarial instructions targeting tool calls.",
    keyPoints: [
      "Wrap retrieved external content in explicit untrusted delimiters separate from system instructions.",
      "Enforce policy checks outside the LLM so reading untrusted data cannot trigger sensitive data exfiltration.",
      "Restrict outbound URL fetches and webhooks using strict domain allowlists.",
    ],
    antiPattern:
      "Interpolating scraped webpage text directly into privileged prompt instructions without boundary isolation.",
    tags: ["Security", "PromptInjection", "AppSec"],
  },
  {
    id: "lesson-13",
    category: "Memory & RAG",
    title: "Structure-Aware Chunking (AST & Headings) Beats Fixed Character Splits",
    summary:
      "Naive 500-character chunking slices functions, JSON configs, and markdown tables in half, crippling retrieval precision.",
    keyPoints: [
      "Chunk source code by AST boundaries (functions, classes, modules) using Tree-sitter.",
      "Prepend Markdown section breadcrumbs (H1 > H2 > H3) to every prose chunk for self-contained context.",
      "Use contextual enrichment (1 concise framing sentence per chunk) prior to generating embeddings.",
    ],
    antiPattern:
      "Splitting right across a TypeScript interface definition so the retriever drops field types and doc comments.",
    tags: ["Chunking", "AST", "RAGPipeline"],
  },
  {
    id: "lesson-14",
    category: "Production & Ops",
    title: "Agent Observability with OpenTelemetry: Trace -> LLM Span -> Tool Span",
    summary:
      "You cannot optimize agent reliability or tail latency without full distributed traces connecting every model turn to every tool call.",
    keyPoints: [
      "Bind one root traceId per agent invocation with child spans for each LLM step, retriever lookup, and tool call.",
      "Record structured attributes: model, input/output/cached tokens, durationMs, stopReason, and toolStatus.",
      "Scrub PII, JWTs, and API secrets before exporting telemetry spans to your observability backend.",
    ],
    antiPattern:
      "Relying on scattered console.log lines that cannot correlate overlapping async agent runs.",
    tags: ["OpenTelemetry", "Tracing", "LLMOps"],
  },
  {
    id: "lesson-15",
    category: "Architecture",
    title: "Strict Structured Outputs (JSON Schema) Over Fragile Regex Parsing",
    summary:
      "Schema-constrained decoding guarantees valid typed payloads at system boundaries and eliminates 99% of JSON.parse failures.",
    keyPoints: [
      "Define explicit Zod or JSON Schemas on every decision node, classifier, and UI-rendered card payload.",
      "Keep nesting shallow and attach concise descriptions to guide enum selection and formatting.",
      "Place a short `reasoning` string property before `decision` so the model thinks before committing.",
    ],
    antiPattern:
      "Asking for 'raw JSON only, no markdown fences' and hoping string slicing never breaks in production.",
    tags: ["StructuredOutput", "Zod", "TypeScript"],
  },
  {
    id: "lesson-16",
    category: "Multi-Agent",
    title: "Generator-Verifier Loops: Separate Creation from Verification",
    summary:
      "An independent reviewer pass backed by real compiler, linter, and test outputs catches far more bugs than self-praise.",
    keyPoints: [
      "Let the Generator implement changes, then run deterministic build/test tools before a Verifier inspects diffs.",
      "Cap refinement cycles at 2-3 passes to avoid infinite polish loops on diminishing returns.",
      "Require concrete evidence from test exit codes or DOM assertions rather than speculative prose.",
    ],
    antiPattern:
      "Prompting the same generation pass to reply 'looks great!' without executing any verification tool.",
    tags: ["Verifier", "AgenticWorkflow", "CodeQuality"],
  },
  {
    id: "lesson-17",
    category: "Tool Use & MCP",
    title: "Ephemeral Sandboxes: Never Execute LLM-Generated Code on Host Infra",
    summary:
      "Code-execution and data-analysis agents need isolated microVMs or locked-down containers (Firecracker, gVisor, Docker) per session.",
    keyPoints: [
      "Enforce strict CPU, memory, disk, and wall-clock execution timeouts with egress network disabled by default.",
      "Mount disposable workspace snapshots rather than shared persistent host directories.",
      "Never inject database passwords or bot tokens into environments running user-influenced or model code.",
    ],
    antiPattern:
      "Passing LLM-generated scripts directly into `eval()` or host shell runners beside production secrets.",
    tags: ["Sandbox", "MicroVM", "AgentSecurity"],
  },
  {
    id: "lesson-18",
    category: "Production & Ops",
    title: "Streaming Agent UX: Surface Live Progress & Cancellation",
    summary:
      "Multi-step agent runs take 10-40 seconds; streaming intermediate tool progress prevents users from assuming the app froze.",
    keyPoints: [
      "Emit typed stream events (step-start, tool-call, tool-result, text-delta) over SSE or AI SDK UI streams.",
      "Wire AbortSignal cancellation cleanly down to both LLM requests and downstream tool fetches.",
      "Persist completed messages/artifacts incrementally after each step to survive client disconnects.",
    ],
    antiPattern:
      "Blocking an HTTP POST handler for 45 seconds before returning one giant JSON payload that hits gateway timeouts.",
    tags: ["Streaming", "SSE", "VercelAISDK"],
  },
  {
    id: "lesson-19",
    category: "Architecture",
    title: "Deterministic Code First, LLM Reasoning Second",
    summary:
      "Never ask an LLM to perform tasks that deterministic code handles faster, cheaper, and with 100% repeatability.",
    keyPoints: [
      "Use pure code for sorting, pagination, math totals, regex validation, and HTML/SQL escaping.",
      "Reserve LLM inference for ambiguous natural-language intent, synthesis, and adaptive tool selection.",
      "Anchor your workflow in a deterministic state machine with bounded LLM nodes inside each state.",
    ],
    antiPattern:
      "Delegating invoice arithmetic, sorting 500 records, or email format checks to probabilistic token generation.",
    tags: ["StateMachine", "Engineering", "CleanArchitecture"],
  },
  {
    id: "lesson-20",
    category: "Evals & Safety",
    title: "Deterministic Citation Verification to Prevent Hallucinations",
    summary:
      "In enterprise copilots, every factual policy claim or numeric metric should link back to an inspected source ID.",
    keyPoints: [
      "Instruct the agent to cite `[doc_id]` right after claims derived from retrieved tool results.",
      "Run a post-generation verifier check ensuring every cited `[doc_id]` actually exists in the turn's evidence.",
      "Explicitly reward 'Information not found in verified sources' over confident fabrication during evals.",
    ],
    antiPattern:
      "Instructing models to always give a complete answer even when retrieval returned zero relevant records.",
    tags: ["Grounding", "Hallucination", "RAG"],
  },
];

export function escapeAgentTelegramHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function pickAgentLessonForBroadcast(params?: {
  lessonId?: string;
  slot?: number;
  nowMs?: number;
}): { lesson: AgentKnowledgeLesson; slot: number; total: number } {
  const pool = AI_AGENT_LESSONS;

  if (params?.lessonId) {
    const idx = pool.findIndex((l) => l.id === params.lessonId);
    if (idx !== -1) {
      return { lesson: pool[idx], slot: idx + 1, total: pool.length };
    }
  }

  const rawBucket =
    typeof params?.slot === "number"
      ? params.slot
      : Math.floor((params?.nowMs ?? Date.now()) / FIVE_MINUTES_MS);
  const index = ((rawBucket % pool.length) + pool.length) % pool.length;

  return {
    lesson: pool[index],
    slot: index + 1,
    total: pool.length,
  };
}

export function formatTelegramAgentLessonCard(
  lesson: AgentKnowledgeLesson,
  options?: {
    slot?: number;
    total?: number;
    siteUrl?: string;
    header?: string;
  }
) {
  const siteUrl = (options?.siteUrl || "https://fiverrex.vercel.app").replace(/\/+$/, "");
  const header =
    options?.header ||
    `🧠 <b>AI AGENT ENGINEERING • 5-MIN BRIEFING</b>${
      options?.slot && options?.total ? ` <code>#${options.slot}/${options.total}</code>` : ""
    }`;

  const keyPointsText = lesson.keyPoints
    .map((pt, i) => `${i + 1}. ${escapeAgentTelegramHtml(pt)}`)
    .join("\n");

  const codeBlockLines = lesson.codeSnippet
    ? [
        ``,
        `💻 <b>Reference Pattern:</b>`,
        `<pre><code>${escapeAgentTelegramHtml(lesson.codeSnippet)}</code></pre>`,
      ]
    : [];

  const tagsLine = lesson.tags.map((t) => `#${t}`).join(" ");

  const text = [
    header,
    ``,
    `📌 <b>Topic:</b> [${escapeAgentTelegramHtml(
      lesson.category
    )}] <b>${escapeAgentTelegramHtml(lesson.title)}</b>`,
    ``,
    `💡 ${escapeAgentTelegramHtml(lesson.summary)}`,
    ``,
    `✅ <b>Key Takeaways:</b>`,
    keyPointsText,
    ...codeBlockLines,
    ``,
    `⚠️ <b>Anti-Pattern to Avoid:</b> ${escapeAgentTelegramHtml(lesson.antiPattern)}`,
    ``,
    `🏷 ${escapeAgentTelegramHtml(tagsLine)}`,
    ``,
    `💬 <b>Chat with Agent</b> @agent_programming_bot`,
  ].join("\n");

  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: "🤖 Explore AI Agent Jobs",
          url: `${siteUrl}/jobs?category=AI+Services`,
        },
        {
          text: "🎁 Quests (+500 Credits)",
          url: `${siteUrl}/quests`,
        },
      ],
    ],
  };

  return { text, reply_markup };
}

export function buildAgentBotCommandResponse(
  commandRaw: string,
  siteUrl = "https://fiverrex.vercel.app"
): {
  text: string;
  reply_markup?: { inline_keyboard: Array<Array<{ text: string; url: string }>> };
} | null {
  const cleanUrl = siteUrl.replace(/\/+$/, "");
  const normalized = commandRaw.trim().split(/\s+/)[0].split("@")[0].toLowerCase();

  if (normalized === "/start" || normalized === "/help") {
    return {
      text: [
        `🧠 <b>Welcome to AI Agent Programming Bot!</b>`,
        ``,
        `Powered by Gemini AI — sharing practical English engineering insights on <b>AI Agents, MCP, RAG, Multi-Agent Systems &amp; Evals</b> every 5 minutes in Dev Community.`,
        ``,
        `💬 <b>Ask Me Anything (AI Q&amp;A):</b>`,
        `• Use <code>/ask &lt;your question&gt;</code> in this group`,
        `• Or reply directly to any message from @agent_programming_bot`,
        `• Or DM me directly in private chat`,
        ``,
        `📌 <b>Commands:</b>`,
        `/ask — Ask any AI Agent engineering question`,
        `/lesson — Generate a fresh AI Agent briefing now`,
        `/topics — Browse all ${AI_AGENT_LESSONS.length} curated topic tracks`,
        `/tip — Quick best practice &amp; anti-pattern reminder`,
        `/help — Show this help guide`,
      ].join("\n"),
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🤖 Browse AI Agent Jobs", url: `${cleanUrl}/jobs` },
            { text: "🎁 Claim +500 Credits", url: `${cleanUrl}/quests` },
          ],
        ],
      },
    };
  }

  if (normalized === "/lesson" || normalized === "/random") {
    const idx = Math.floor(Math.random() * AI_AGENT_LESSONS.length);
    return formatTelegramAgentLessonCard(AI_AGENT_LESSONS[idx], {
      slot: idx + 1,
      total: AI_AGENT_LESSONS.length,
      siteUrl: cleanUrl,
      header: "🎲 <b>AI AGENT ENGINEERING • ON-DEMAND LESSON</b>",
    });
  }

  if (normalized === "/tip") {
    const idx = Math.floor(Math.random() * AI_AGENT_LESSONS.length);
    const l = AI_AGENT_LESSONS[idx];
    return {
      text: [
        `⚡ <b>AI AGENT QUICK TIP</b> (${escapeAgentTelegramHtml(l.category)})`,
        ``,
        `<b>${escapeAgentTelegramHtml(l.title)}</b>`,
        `✅ ${escapeAgentTelegramHtml(l.keyPoints[0])}`,
        `⚠️ <i>Avoid: ${escapeAgentTelegramHtml(l.antiPattern)}</i>`,
      ].join("\n"),
    };
  }

  if (normalized === "/topics") {
    const grouped = Array.from(new Set(AI_AGENT_LESSONS.map((l) => l.category)));
    const lines = grouped.map((cat) => {
      const count = AI_AGENT_LESSONS.filter((l) => l.category === cat).length;
      return `• <b>${escapeAgentTelegramHtml(cat)}</b> (${count} lessons)`;
    });
    return {
      text: [
        `📚 <b>AI AGENT ENGINEERING CURRICULUM (${AI_AGENT_LESSONS.length} LESSONS)</b>`,
        ``,
        ...lines,
        ``,
        `Send <code>/lesson</code> anytime to pull a detailed engineering briefing!`,
      ].join("\n"),
    };
  }

  return null;
}
