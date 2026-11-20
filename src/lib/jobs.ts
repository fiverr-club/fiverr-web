import { DEFAULT_AUTH_ACCOUNTS, getRegisteredAccounts } from "@/lib/api";

export type JobStatus = "OPEN" | "AWARDED" | "CLOSED";

export interface JobBid {
  id: string;
  jobId: string;
  bidderUsername: string;
  bidderName: string;
  bidderAvatar: string;
  bidderLevel: string;
  amount: number;
  deliveryDays: number;
  proposal: string;
  milestones: string;
  createdAt: string;
  status: "PENDING" | "AWARDED" | "REJECTED";
}

export interface JobProject {
  id: string;
  title: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  deliveryDays: number;
  bidCostCredits: number;
  badge: string;
  clientName: string;
  clientCompany: string;
  clientVerified: boolean;
  postedAt: string;
  description: string;
  deliverables: string[];
  skills: string[];
  status: JobStatus;
  awardedBidId?: string;
  bids: JobBid[];
}

export interface CreditTransaction {
  id: string;
  type: "WELCOME_BONUS" | "REFERRAL_BONUS" | "BID_SPENT" | "POST_BONUS" | "QUEST_BONUS";
  amount: number;
  description: string;
  createdAt: string;
}

export interface QuestCompletion {
  questId: string;
  completedAt: string;
  rewardCredits: number;
  proof?: string;
}

export type QuestVerificationMode =
  | "TELEGRAM_INVITE"
  | "PROOF_INPUT"
  | "AUTO_FIRST_BID"
  | "AUTO_FIRST_INVITE"
  | "INSTANT_VISIT";

export interface CreditQuest {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: "Community" | "Growth" | "Marketplace";
  rewardCredits: number;
  badge: string;
  actionLabel: string;
  actionUrl: string;
  shareUrl?: string;
  external: boolean;
  verificationMode: QuestVerificationMode;
  proofLabel?: string;
  proofPlaceholder?: string;
  steps: string[];
}

export interface ReferralInvite {
  id: string;
  email: string;
  name: string;
  rewardCredits: number;
  status: "CREDITED" | "JOINED";
  createdAt: string;
}

export interface UserCreditAccount {
  username: string;
  credits: number;
  referralCode: string;
  invitedCount: number;
  invites: ReferralInvite[];
  history: CreditTransaction[];
  completedQuests: Record<string, QuestCompletion>;
}

export const NEW_ACCOUNT_CREDITS = 100;
export const REFERRAL_REWARD_CREDITS = 500;
export const TELEGRAM_COMMUNITY_URL = "https://t.me/devcommunity101";

export const CREDIT_QUESTS: CreditQuest[] = [
  {
    id: "quest-telegram-devcommunity101",
    title: "Invite Friends & Join DevCommunity101 Telegram",
    subtitle: "Featured Telegram Community Mission",
    description:
      "Join our official Telegram engineering & freelance group (t.me/devcommunity101), invite your friends or teammates into the community, and submit your Telegram @username to claim +500 Credits.",
    category: "Community",
    rewardCredits: 500,
    badge: "Featured • +500 Credits",
    actionLabel: "Open Telegram Group",
    actionUrl: TELEGRAM_COMMUNITY_URL,
    shareUrl:
      "https://t.me/share/url?url=https%3A%2F%2Ft.me%2Fdevcommunity101&text=Join%20DevCommunity101%20and%20FIVERREX%20freelance%20projects%20board!",
    external: true,
    verificationMode: "TELEGRAM_INVITE",
    proofLabel: "Your Telegram @username (or invited friend's @handle)",
    proofPlaceholder: "e.g. @alex_dev101",
    steps: [
      "Open https://t.me/devcommunity101 and join the DevCommunity101 Telegram group.",
      "Invite a friend or share the group link inside Telegram.",
      "Enter your Telegram @username below and click Verify & Claim +500 Credits.",
    ],
  },
  {
    id: "quest-first-bid",
    title: "Submit Your First Project Proposal",
    subtitle: "Marketplace Bidding Mission",
    description:
      "Explore our 500 active freelance projects on /jobs and submit your first milestone-backed proposal.",
    category: "Marketplace",
    rewardCredits: 150,
    badge: "Bidding • +150 Credits",
    actionLabel: "Browse 500 Jobs",
    actionUrl: "/jobs",
    external: false,
    verificationMode: "AUTO_FIRST_BID",
    steps: [
      "Visit /jobs and open any OPEN project matching your skills.",
      "Submit a proposal with amount, delivery timeline, and milestones.",
      "Click Verify & Claim below to earn +150 bonus credits.",
    ],
  },
  {
    id: "quest-first-referral",
    title: "Refer Your First Teammate to FIVERREX",
    subtitle: "Referral Milestone Bonus",
    description:
      "Invite at least 1 friend via referral link or direct email invite. In addition to +500 referral credits, unlock this +200 milestone bonus.",
    category: "Growth",
    rewardCredits: 200,
    badge: "Milestone • +200 Credits",
    actionLabel: "Open Referral Invite",
    actionUrl: "/credits#invite-section",
    external: false,
    verificationMode: "AUTO_FIRST_INVITE",
    steps: [
      "Invite 1 user from the Credits & Referrals section or share your ?ref= link.",
      "Once invitedCount >= 1, click Verify & Claim +200 Credits.",
    ],
  },
  {
    id: "quest-github-portfolio",
    title: "Verify Your GitHub or Portfolio URL",
    subtitle: "Freelancer Trust Signal",
    description:
      "Link your public GitHub repository, Dribbble, or personal portfolio website to strengthen client trust on your project bids.",
    category: "Marketplace",
    rewardCredits: 150,
    badge: "Profile • +150 Credits",
    actionLabel: "View Seller Studio",
    actionUrl: "/seller/dashboard",
    external: false,
    verificationMode: "PROOF_INPUT",
    proofLabel: "Public GitHub or Portfolio URL",
    proofPlaceholder: "https://github.com/your-handle",
    steps: [
      "Paste your GitHub, portfolio, or LinkedIn profile link below.",
      "Click Verify & Claim +150 Credits.",
    ],
  },
  {
    id: "quest-escrow-academy",
    title: "Review FIVERREX Architecture & Escrow Guide",
    subtitle: "Platform Onboarding Mission",
    description:
      "Read how milestone-backed escrow protection and FIVERREX project bidding protect both clients and freelancers.",
    category: "Community",
    rewardCredits: 100,
    badge: "Quick Start • +100 Credits",
    actionLabel: "Read About FIVERREX",
    actionUrl: "/about",
    external: false,
    verificationMode: "INSTANT_VISIT",
    steps: [
      "Review the About FIVERREX escrow overview.",
      "Click Claim +100 Credits to credit your wallet.",
    ],
  },
];

export const BASE_SEED_JOBS: JobProject[] = [
  {
    id: "job-201",
    title: "Build Enterprise AI Agent & RAG Support Copilot for FinTech Operations",
    category: "AI Services",
    budgetMin: 4500,
    budgetMax: 7500,
    deliveryDays: 10,
    bidCostCredits: 15,
    badge: "Featured • Urgent",
    clientName: "Marcus Vance",
    clientCompany: "NovaPay Financial",
    clientVerified: true,
    postedAt: "2 hours ago",
    description:
      "We need a senior AI/LLM engineer to architect a production Retrieval-Augmented Generation copilot integrated with our internal compliance docs, Zendesk tickets, and streaming Next.js 15 operator console with citation grounding and audit logging.",
    deliverables: [
      "Multi-step LangGraph / tool-calling agent workflow with fallback routing",
      "Hybrid vector + keyword search pipeline in PostgreSQL pgvector",
      "Streaming Next.js 15 operator dashboard with human-in-the-loop approval",
      "Evaluation harness covering groundedness and latency SLAs",
    ],
    skills: ["LangGraph", "Next.js 15", "pgvector", "TypeScript", "OpenTelemetry"],
    status: "OPEN",
    bids: [
      {
        id: "bid-901",
        jobId: "job-201",
        bidderUsername: "elena_ai",
        bidderName: "Elena Vance",
        bidderAvatar:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80",
        bidderLevel: "Pro Verified",
        amount: 5800,
        deliveryDays: 9,
        proposal:
          "I have shipped 6 production FinTech RAG copilots with pgvector hybrid retrieval, deterministic citation checks, and real-time Next.js streaming UIs.",
        milestones: "Day 3: Ingestion & pgvector | Day 6: Agent Graph | Day 9: Eval + Prod Deploy",
        createdAt: "1 hour ago",
        status: "PENDING",
      },
      {
        id: "bid-902",
        jobId: "job-201",
        bidderUsername: "kai_ml",
        bidderName: "Kai Takahashi",
        bidderAvatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80",
        bidderLevel: "Top Rated Seller",
        amount: 6200,
        deliveryDays: 10,
        proposal:
          "Can deliver end-to-end compliance RAG pipeline with guardrails, PII redaction, and automated regression evals.",
        milestones: "Milestone 1: Retrieval API | Milestone 2: Guardrails & UI",
        createdAt: "40 mins ago",
        status: "PENDING",
      },
    ],
  },
  {
    id: "job-202",
    title: "Architect Multi-Tenant SaaS Escrow & Payout Engine (Spring Boot 3 + Kafka)",
    category: "Programming & Tech",
    budgetMin: 5500,
    budgetMax: 9000,
    deliveryDays: 14,
    bidCostCredits: 20,
    badge: "Enterprise",
    clientName: "Claire Moreau",
    clientCompany: "LedgerFlow EU",
    clientVerified: true,
    postedAt: "4 hours ago",
    description:
      "Seeking a Principal Java/Spring Boot 3 architect to design an idempotent double-entry escrow ledger, Stripe Connect split payouts, and Kafka outbox event bus following strict Hexagonal DDD boundaries.",
    deliverables: [
      "Spring Boot 3 Hexagonal DDD microservice with PostgreSQL Flyway migrations",
      "Transactional Outbox + Kafka KRaft saga orchestration",
      "Idempotency keys & webhook verification for Stripe payouts",
      "Comprehensive JUnit 5 + Testcontainers integration suite",
    ],
    skills: ["Spring Boot 3", "Java 21", "Kafka", "PostgreSQL", "DDD"],
    status: "OPEN",
    bids: [
      {
        id: "bid-903",
        jobId: "job-202",
        bidderUsername: "alex_architect",
        bidderName: "Alex Rivera",
        bidderAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
        bidderLevel: "Top Rated Seller",
        amount: 7200,
        deliveryDays: 12,
        proposal:
          "I specialize in Spring Boot 3 Hexagonal DDD payment ledgers and Kafka Saga engines with Testcontainers verification.",
        milestones: "Week 1: Domain Model & Ledger | Week 2: Kafka Saga + Stripe Connect",
        createdAt: "2 hours ago",
        status: "PENDING",
      },
    ],
  },
  {
    id: "job-203",
    title: "Redesign High-Converting Crypto & Neobank Mobile App + Design System",
    category: "Graphics & Design",
    budgetMin: 2600,
    budgetMax: 4200,
    deliveryDays: 8,
    bidCostCredits: 10,
    badge: "Hot Project",
    clientName: "Daniel Park",
    clientCompany: "Kinetix Wallet",
    clientVerified: true,
    postedAt: "5 hours ago",
    description:
      "Looking for a senior product designer to craft 35+ polished Figma screens (onboarding, biometric swap, portfolio analytics, card controls) with tokenized dark/light mode variables and interactive prototypes.",
    deliverables: [
      "Complete Figma Design System with variables and component variants",
      "35+ responsive mobile screens with dark & light themes",
      "Interactive click-through prototype for investor demo",
    ],
    skills: ["Figma", "Design Systems", "Fintech UI", "Prototyping"],
    status: "OPEN",
    bids: [
      {
        id: "bid-904",
        jobId: "job-203",
        bidderUsername: "sophia_ux",
        bidderName: "Sophia Lin",
        bidderAvatar:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
        bidderLevel: "Pro Verified",
        amount: 3400,
        deliveryDays: 7,
        proposal:
          "Led design systems for two Series B fintech apps. Ready to deliver clean Figma tokens and interactive flows in 7 days.",
        milestones: "Day 2: Token System | Day 5: Core Flows | Day 7: Prototype Polish",
        createdAt: "3 hours ago",
        status: "PENDING",
      },
    ],
  },
  {
    id: "job-204",
    title: "Zero-Downtime Kubernetes EKS Production Cluster + ArgoCD GitOps Setup",
    category: "Cloud & DevOps",
    budgetMin: 3400,
    budgetMax: 5600,
    deliveryDays: 10,
    bidCostCredits: 15,
    badge: "Verified Client",
    clientName: "Henrik Lindqvist",
    clientCompany: "NordicCloud Ops",
    clientVerified: true,
    postedAt: "6 hours ago",
    description:
      "Migrate 12 Docker Compose services onto AWS EKS with Terraform IaC, ArgoCD GitOps, Karpenter autoscaling, Prometheus/Grafana observability, and automated TLS via cert-manager.",
    deliverables: [
      "Modular Terraform scripts for VPC, EKS, RDS, and IAM IRSA",
      "Helm charts + ArgoCD ApplicationSets for staging & prod",
      "Grafana alerting dashboards & runbook documentation",
    ],
    skills: ["Kubernetes", "AWS EKS", "Terraform", "ArgoCD", "Helm"],
    status: "OPEN",
    bids: [],
  },
  {
    id: "job-205",
    title: "Build Real-Time B2B Freelance Bidding & Escrow Web App in Next.js 15",
    category: "Programming & Tech",
    budgetMin: 3000,
    budgetMax: 4800,
    deliveryDays: 12,
    bidCostCredits: 10,
    badge: "Featured",
    clientName: "Hannah Brooks",
    clientCompany: "TalentGrid Studio",
    clientVerified: true,
    postedAt: "8 hours ago",
    description:
      "Need a Next.js 15 App Router + TypeScript specialist to build a fast marketplace frontend with live filtering, project bidding rooms, wallet credit tracking, and mobile-first Tailwind UI.",
    deliverables: [
      "Next.js 15 App Router frontend with strict TypeScript",
      "Live search, multi-facet filtering & bidding workspace",
      "Responsive mobile drawer, accessibility & Lighthouse 95+ optimization",
    ],
    skills: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS"],
    status: "OPEN",
    bids: [],
  },
  {
    id: "job-206",
    title: "3D Product Launch Film & Interactive Motion Reel for AI Hardware",
    category: "Video & Animation",
    budgetMin: 2000,
    budgetMax: 3500,
    deliveryDays: 7,
    bidCostCredits: 10,
    badge: "Creative",
    clientName: "Lucas Meyer",
    clientCompany: "Vortex Robotics",
    clientVerified: true,
    postedAt: "10 hours ago",
    description:
      "Create a 60-second 4K launch video combining sleek 3D CAD product renders, kinetic UI overlays, and crisp sound design for our upcoming keynote and landing page hero.",
    deliverables: [
      "60s 4K master launch video + 15s social cutdowns",
      "Blender / Cinema4D source files & Lottie web animations",
    ],
    skills: ["3D Motion", "Blender", "After Effects", "Sound Design"],
    status: "OPEN",
    bids: [],
  },
  {
    id: "job-207",
    title: "LLM Guardrails, Hallucination Evaluation & Observability SDK (Python)",
    category: "AI Services",
    budgetMin: 3800,
    budgetMax: 6200,
    deliveryDays: 14,
    bidCostCredits: 15,
    badge: "AI Priority",
    clientName: "Priya Nair",
    clientCompany: "Veritas AI Labs",
    clientVerified: true,
    postedAt: "12 hours ago",
    description:
      "Develop a low-latency FastAPI evaluation microservice that scores prompt-injection attempts, toxicity, and factual grounding across OpenAI, Anthropic, and Gemini endpoints with OpenTelemetry traces.",
    deliverables: [
      "Async FastAPI gateway middleware (<35ms overhead)",
      "Automated benchmark suite with 500+ adversarial test cases",
      "OpenTelemetry trace exporter & Grafana dashboard",
    ],
    skills: ["Python", "FastAPI", "LLM Evals", "OpenTelemetry", "Docker"],
    status: "OPEN",
    bids: [],
  },
  {
    id: "job-208",
    title: "Technical SEO Overhaul, B2B SaaS Copy & Product-Led Funnel",
    category: "Digital Marketing",
    budgetMin: 1400,
    budgetMax: 2400,
    deliveryDays: 10,
    bidCostCredits: 5,
    badge: "Quick Win",
    clientName: "Olivia Bennett",
    clientCompany: "MetricPulse",
    clientVerified: true,
    postedAt: "1 day ago",
    description:
      "Audit Core Web Vitals, schema markup, programmatic comparison pages, and conversion copy for a developer analytics SaaS targeting 3x organic signups in Q1.",
    deliverables: [
      "Full technical SEO + schema & Core Web Vitals remediation checklist",
      "6 high-intent landing/comparison page copy decks",
      "GA4 + PostHog funnel conversion tracking plan",
    ],
    skills: ["Technical SEO", "SaaS Copywriting", "PostHog", "Growth"],
    status: "OPEN",
    bids: [],
  },
];

const JOB_TEMPLATES = [
  {
    category: "AI Services",
    titles: [
      "Build Multi-Agent AI Research & Citation Assistant",
      "Deploy Production RAG Search Engine with pgvector",
      "Fine-Tune Domain LLM & Automated Evaluation Suite",
      "Create Real-Time Voice AI Support Agent (WebRTC)",
      "Architect Autonomous Document Extraction & OCR Pipeline",
      "Build AI Copilot for Enterprise SQL & BI Analytics",
      "Implement LLM Guardrails & Prompt Injection Firewall",
      "Develop Multimodal Product Visual Search & Tagging",
    ],
    skillsPool: ["LangGraph", "Python", "FastAPI", "pgvector", "Next.js 15", "OpenTelemetry", "PyTorch", "TypeScript"],
    deliverablesPool: [
      "Production agent orchestration graph with retry & fallback routing",
      "Hybrid semantic + BM25 retrieval pipeline with citation grounding",
      "Automated evaluation benchmark & latency telemetry dashboard",
    ],
    budgetRanges: [
      [2500, 4500],
      [3800, 6500],
      [4800, 8500],
      [6000, 11000],
    ],
  },
  {
    category: "Programming & Tech",
    titles: [
      "Build High-Throughput Spring Boot 3 Payment & Ledger API",
      "Develop Full-Stack Next.js 15 B2B SaaS Portal & RBAC",
      "Architect Event-Driven Kafka Microservices Ecosystem",
      "Build Cross-Platform React Native FinTech Mobile Wallet",
      "Create Real-Time WebSocket Trading & Orderbook UI",
      "Migrate Legacy Monolith to Hexagonal DDD Services",
      "Develop Multi-Tenant Subscription Billing & Stripe Connect",
      "Build High-Speed Go / Rust Edge API Gateway & Rate Limiter",
    ],
    skillsPool: ["Next.js 15", "TypeScript", "Spring Boot 3", "Java 21", "PostgreSQL", "Kafka", "React Native", "GraphQL"],
    deliverablesPool: [
      "Clean TypeScript / DDD source repository with strict CI checks",
      "End-to-end integration tests & OpenAPI 3.1 documentation",
      "Dockerized staging & production deployment manifests",
    ],
    budgetRanges: [
      [2200, 3800],
      [3500, 6000],
      [5000, 9000],
      [7000, 12500],
    ],
  },
  {
    category: "Cloud & DevOps",
    titles: [
      "Provision Production AWS EKS Cluster with Terraform & ArgoCD",
      "Zero-Downtime Multi-Region PostgreSQL & Kafka Migration",
      "Implement Full OpenTelemetry, Prometheus & Grafana Stack",
      "Automate CI/CD Pipelines with GitHub Actions & Container Signing",
      "Harden Kubernetes Cluster Security & Network Policies (Cilium)",
      "Configure Cloudflare Workers, Zero Trust & Edge Caching",
    ],
    skillsPool: ["Kubernetes", "Terraform", "AWS EKS", "ArgoCD", "Helm", "Docker", "Prometheus", "Cloudflare"],
    deliverablesPool: [
      "Modular Terraform IaC repository with state locking",
      "Helm charts & ArgoCD GitOps sync configuration",
      "Grafana alerting rules & disaster recovery runbook",
    ],
    budgetRanges: [
      [1800, 3200],
      [3000, 5200],
      [4200, 7500],
    ],
  },
  {
    category: "Graphics & Design",
    titles: [
      "Design Complete SaaS Design System & Figma Token Library",
      "Craft High-Converting FinTech & Neobank Mobile App UI",
      "Redesign AI Analytics Dashboard & Interactive Prototypes",
      "Create Brand Identity, Logo Suite & Developer Marketing Kit",
      "Design E-Commerce Checkout Flow & Design Handoff Specs",
    ],
    skillsPool: ["Figma", "Design Systems", "UI/UX", "Prototyping", "Brand Identity", "Tailwind Tokens"],
    deliverablesPool: [
      "Figma component library with light/dark mode variables",
      "30+ responsive desktop & mobile screens ready for dev handoff",
      "Interactive click-through prototype & typography scale",
    ],
    budgetRanges: [
      [1200, 2400],
      [2200, 3800],
      [3200, 5500],
    ],
  },
  {
    category: "Video & Animation",
    titles: [
      "Produce 4K 3D SaaS Product Launch Film & Motion Graphics",
      "Create Interactive Lottie & Rive Micro-Animations for Web App",
      "Edit Keynote Demo Reel with Kinetic Typography & Sound",
      "Animate AI Platform Architecture Explainer Video (60s)",
    ],
    skillsPool: ["Blender", "After Effects", "3D Motion", "Lottie", "Rive", "Sound Design"],
    deliverablesPool: [
      "4K master launch video plus vertical social cutdowns",
      "Lightweight Lottie / Rive JSON assets for production web UI",
    ],
    budgetRanges: [
      [1000, 2000],
      [1800, 3200],
      [2800, 4800],
    ],
  },
  {
    category: "Digital Marketing",
    titles: [
      "Execute Technical SEO & Programmatic Landing Pages for SaaS",
      "Launch B2B Developer Growth Funnel & PostHog Attribution",
      "Optimize Paid Acquisition & Conversion Rate Across Landing Flows",
      "Build Product Hunt & Enterprise Launch Campaign Strategy",
    ],
    skillsPool: ["Technical SEO", "PostHog", "GA4", "B2B Growth", "CRO", "Content Strategy"],
    deliverablesPool: [
      "Core Web Vitals, schema markup & technical SEO audit",
      "Conversion tracking plan & A/B experiment roadmap",
    ],
    budgetRanges: [
      [900, 1800],
      [1500, 2800],
      [2400, 4200],
    ],
  },
  {
    category: "Writing & Translation",
    titles: [
      "Author Developer API Portal Docs, SDK Guides & Quickstarts",
      "Write Technical Whitepaper on Distributed Escrow & AI Security",
      "Localize SaaS Web & Mobile Product Copy (EN / VI / JP / DE)",
      "Draft SOC 2 Type II Security Policies & Architecture Runbooks",
    ],
    skillsPool: ["Technical Writing", "OpenAPI Docs", "MDX", "Localization", "SOC 2", "UX Copy"],
    deliverablesPool: [
      "Structured MDX documentation with runnable code examples",
      "Glossary & tone-of-voice style guide for engineering teams",
    ],
    budgetRanges: [
      [800, 1500],
      [1400, 2500],
      [2200, 3600],
    ],
  },
];

const CLIENT_COMPANIES = [
  ["Marcus Vance", "NovaPay Financial"],
  ["Claire Moreau", "LedgerFlow EU"],
  ["Daniel Park", "Kinetix Labs"],
  ["Henrik Lindqvist", "NordicCloud Ops"],
  ["Hannah Brooks", "TalentGrid Studio"],
  ["Lucas Meyer", "Vortex Robotics"],
  ["Priya Nair", "Veritas AI Labs"],
  ["Olivia Bennett", "MetricPulse"],
  ["Minh Tran", "SaigonFinTech"],
  ["Sofia Rossi", "Aether Commerce"],
  ["Liam O'Connor", "Helios Data"],
  ["Kenji Sato", "Kuroda Systems"],
];

const JOB_BADGES = [
  "Featured • Urgent",
  "Enterprise",
  "Hot Project",
  "Verified Client",
  "AI Priority",
  "High Budget",
  "Quick Win",
  "Long-Term",
];

const POSTED_TIMES = [
  "15 mins ago",
  "1 hour ago",
  "3 hours ago",
  "6 hours ago",
  "12 hours ago",
  "1 day ago",
  "2 days ago",
  "3 days ago",
];

const BID_COSTS = [5, 10, 15, 20, 25];

const SAMPLE_BIDDERS = [
  {
    username: "alex_architect",
    name: "Alex Rivera",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    level: "Top Rated Seller",
  },
  {
    username: "elena_ai",
    name: "Elena Vance",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80",
    level: "Pro Verified",
  },
  {
    username: "kai_ml",
    name: "Kai Takahashi",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80",
    level: "Top Rated Seller",
  },
  {
    username: "sophia_ux",
    name: "Sophia Lin",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
    level: "Pro Verified",
  },
];

function generateRemainingJobs(count: number): JobProject[] {
  const generated: JobProject[] = [];
  for (let i = 0; i < count; i++) {
    const tpl = JOB_TEMPLATES[i % JOB_TEMPLATES.length];
    const titleBase = tpl.titles[Math.floor(i / JOB_TEMPLATES.length) % tpl.titles.length];
    const [budgetMin, budgetMax] = tpl.budgetRanges[i % tpl.budgetRanges.length];
    const [clientName, clientCompany] = CLIENT_COMPANIES[i % CLIENT_COMPANIES.length];
    const badge = JOB_BADGES[i % JOB_BADGES.length];
    const postedAt = POSTED_TIMES[i % POSTED_TIMES.length];
    const deliveryDays = 5 + ((i * 3) % 21);
    const bidCostCredits = BID_COSTS[i % BID_COSTS.length];
    const id = `job-${209 + i}`;
    const phaseNumber = Math.floor(i / (JOB_TEMPLATES.length * tpl.titles.length)) + 1;
    const title =
      phaseNumber > 1
        ? `${titleBase} — Phase ${phaseNumber} (${clientCompany})`
        : `${titleBase} (${clientCompany})`;

    const skills = [
      tpl.skillsPool[i % tpl.skillsPool.length],
      tpl.skillsPool[(i + 1) % tpl.skillsPool.length],
      tpl.skillsPool[(i + 2) % tpl.skillsPool.length],
      tpl.skillsPool[(i + 3) % tpl.skillsPool.length],
    ].filter((v, idx, arr) => arr.indexOf(v) === idx);

    const seedBidCount = i % 3 === 0 ? 2 : i % 2 === 0 ? 1 : 0;
    const bids: JobBid[] = [];
    for (let b = 0; b < seedBidCount; b++) {
      const bidder = SAMPLE_BIDDERS[(i + b) % SAMPLE_BIDDERS.length];
      bids.push({
        id: `seed-bid-${id}-${b}`,
        jobId: id,
        bidderUsername: bidder.username,
        bidderName: bidder.name,
        bidderAvatar: bidder.avatar,
        bidderLevel: bidder.level,
        amount: Math.round((budgetMin + budgetMax) / 2) - b * 150,
        deliveryDays: Math.max(3, deliveryDays - b),
        proposal: `Experienced specialist in ${skills.slice(0, 2).join(" & ")}. Ready to deliver production quality within ${Math.max(3, deliveryDays - b)} days with milestone escrow checkpoints.`,
        milestones: "Milestone 1: Kickoff & Specs | Milestone 2: Core Build | Milestone 3: QA & Handoff",
        createdAt: b === 0 ? "1 hour ago" : "35 mins ago",
        status: "PENDING",
      });
    }

    generated.push({
      id,
      title,
      category: tpl.category,
      budgetMin,
      budgetMax,
      deliveryDays,
      bidCostCredits,
      badge,
      clientName,
      clientCompany,
      clientVerified: true,
      postedAt,
      description: `${clientCompany} is hiring a senior specialist to ${titleBase.toLowerCase()}. Clear scope, verified escrow funding, and fast technical feedback cycles with ${skills.join(", ")}.`,
      deliverables: tpl.deliverablesPool,
      skills,
      status: "OPEN",
      bids,
    });
  }
  return generated;
}

export const SEED_JOBS: JobProject[] = [
  ...BASE_SEED_JOBS,
  ...generateRemainingJobs(500 - BASE_SEED_JOBS.length),
];

const JOBS_DELTA_STORAGE_KEY = "fiverrex_jobs_delta_v2";
const CREDITS_STORAGE_KEY = "fiverrex_credits_v1";

interface JobsDeltaState {
  customJobs: JobProject[];
  addedBids: Record<string, JobBid[]>;
  awarded: Record<string, string>;
}

function readJobsDelta(): JobsDeltaState {
  const empty: JobsDeltaState = { customJobs: [], addedBids: {}, awarded: {} };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(JOBS_DELTA_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<JobsDeltaState>;
    return {
      customJobs: Array.isArray(parsed.customJobs) ? parsed.customJobs : [],
      addedBids:
        parsed.addedBids && typeof parsed.addedBids === "object" ? parsed.addedBids : {},
      awarded: parsed.awarded && typeof parsed.awarded === "object" ? parsed.awarded : {},
    };
  } catch {
    return empty;
  }
}

function writeJobsDelta(delta: JobsDeltaState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(JOBS_DELTA_STORAGE_KEY, JSON.stringify(delta));
    window.dispatchEvent(new CustomEvent("fiverrex-jobs-change"));
  } catch {
    // ignore
  }
}

function buildDefaultCreditAccount(username: string): UserCreditAccount {
  const cleanUser = username.trim() || "guest_user";
  return {
    username: cleanUser,
    credits: NEW_ACCOUNT_CREDITS,
    referralCode: `FIV-${cleanUser.toUpperCase().replace(/[^A-Z0-9]/g, "")}`,
    invitedCount: 0,
    invites: [],
    completedQuests: {},
    history: [
      {
        id: `tx-welcome-${cleanUser}`,
        type: "WELCOME_BONUS",
        amount: NEW_ACCOUNT_CREDITS,
        description: "New account welcome bonus (+100 Credits)",
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function readAllCreditAccounts(): Record<string, UserCreditAccount> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CREDITS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, UserCreditAccount>;
    if (!parsed || typeof parsed !== "object") return {};
    const normalized: Record<string, UserCreditAccount> = {};
    for (const [k, acc] of Object.entries(parsed)) {
      if (acc && typeof acc === "object") {
        normalized[k] = {
          ...acc,
          invites: Array.isArray(acc.invites) ? acc.invites : [],
          history: Array.isArray(acc.history) ? acc.history : [],
          completedQuests:
            acc.completedQuests && typeof acc.completedQuests === "object"
              ? acc.completedQuests
              : {},
        };
      }
    }
    return normalized;
  } catch {
    return {};
  }
}

function writeAllCreditAccounts(map: Record<string, UserCreditAccount>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent("fiverrex-credits-change"));
  } catch {
    // ignore storage quota errors
  }
}

export function getUserCreditAccount(username: string): UserCreditAccount {
  const key = (username || "jordan_taylor").toLowerCase();
  if (typeof window === "undefined") {
    return buildDefaultCreditAccount(key);
  }
  const all = readAllCreditAccounts();
  if (!all[key]) {
    const created = buildDefaultCreditAccount(key);
    all[key] = created;
    writeAllCreditAccounts(all);
    return created;
  }
  return all[key];
}

export function initializeNewUserCredits(
  username: string,
  referredByCode?: string
): { account: UserCreditAccount; referrerAwarded?: string } {
  const key = username.trim().toLowerCase();
  const all = readAllCreditAccounts();
  if (!all[key]) {
    all[key] = buildDefaultCreditAccount(key);
  }

  let referrerAwarded: string | undefined;
  if (referredByCode && referredByCode.trim()) {
    const cleanCode = referredByCode.trim().toUpperCase();
    const normalizedTarget = cleanCode.replace(/^FIV-/, "").replace(/[^A-Z0-9]/g, "");
    const normalizedSelf = key.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const knownUsernames = Array.from(
      new Set([
        ...Object.keys(all),
        ...getRegisteredAccounts().map((a) => a.username.toLowerCase()),
        ...DEFAULT_AUTH_ACCOUNTS.map((a) => a.username.toLowerCase()),
      ])
    );

    const matchedKnown = knownUsernames.find(
      (u) =>
        u !== key &&
        (all[u]?.referralCode.toUpperCase() === cleanCode ||
          u.toUpperCase().replace(/[^A-Z0-9]/g, "") === normalizedTarget)
    );
    const targetKey =
      matchedKnown ||
      (normalizedTarget && normalizedTarget !== normalizedSelf
        ? normalizedTarget.toLowerCase()
        : undefined);

    if (targetKey) {
      if (!all[targetKey]) {
        all[targetKey] = buildDefaultCreditAccount(targetKey);
      }
      const alreadyCredited = all[targetKey].invites.some(
        (inv) => inv.name.toLowerCase() === `@${key}` || inv.email.toLowerCase() === `${key}@fiverrex.club`
      );
      if (!alreadyCredited) {
        all[targetKey].credits += REFERRAL_REWARD_CREDITS;
        all[targetKey].invitedCount += 1;
        all[targetKey].invites.unshift({
          id: `inv-${Date.now()}`,
          email: `${key}@fiverrex.club`,
          name: `@${key}`,
          rewardCredits: REFERRAL_REWARD_CREDITS,
          status: "JOINED",
          createdAt: new Date().toISOString(),
        });
        all[targetKey].history.unshift({
          id: `tx-ref-${Date.now()}`,
          type: "REFERRAL_BONUS",
          amount: REFERRAL_REWARD_CREDITS,
          description: `Referral bonus: @${key} joined via your invite (+${REFERRAL_REWARD_CREDITS} Credits)`,
          createdAt: new Date().toISOString(),
        });
        referrerAwarded = targetKey;
      }
    }
  }

  writeAllCreditAccounts(all);
  return { account: all[key], referrerAwarded };
}

export function inviteFriendForCredits(
  inviterUsername: string,
  friendEmail: string,
  friendName?: string
): { ok: boolean; message: string; account: UserCreditAccount } {
  const key = (inviterUsername || "jordan_taylor").toLowerCase();
  const cleanEmail = friendEmail.trim().toLowerCase();
  const account = getUserCreditAccount(key);

  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { ok: false, message: "Please enter a valid email address.", account };
  }
  if (account.invites.some((i) => i.email.toLowerCase() === cleanEmail)) {
    return {
      ok: false,
      message: `${cleanEmail} has already been invited.`,
      account,
    };
  }

  const all = readAllCreditAccounts();
  const updated: UserCreditAccount = {
    ...account,
    credits: account.credits + REFERRAL_REWARD_CREDITS,
    invitedCount: account.invitedCount + 1,
    invites: [
      {
        id: `inv-${Date.now()}`,
        email: cleanEmail,
        name: friendName?.trim() || cleanEmail.split("@")[0],
        rewardCredits: REFERRAL_REWARD_CREDITS,
        status: "CREDITED",
        createdAt: new Date().toISOString(),
      },
      ...account.invites,
    ],
    history: [
      {
        id: `tx-inv-${Date.now()}`,
        type: "REFERRAL_BONUS",
        amount: REFERRAL_REWARD_CREDITS,
        description: `Invited ${cleanEmail} (+${REFERRAL_REWARD_CREDITS} Credits)`,
        createdAt: new Date().toISOString(),
      },
      ...account.history,
    ],
  };

  all[key] = updated;
  writeAllCreditAccounts(all);
  return {
    ok: true,
    message: `Invite sent to ${cleanEmail}! +${REFERRAL_REWARD_CREDITS} Credits added to your balance.`,
    account: updated,
  };
}

export function completeCreditQuest(
  username: string,
  questId: string,
  proof?: string
): { ok: boolean; message: string; account: UserCreditAccount } {
  const key = (username || "jordan_taylor").toLowerCase();
  const account = getUserCreditAccount(key);
  const quest = CREDIT_QUESTS.find((q) => q.id === questId);

  if (!quest) {
    return { ok: false, message: "Mission not found.", account };
  }

  if (account.completedQuests?.[questId]) {
    return {
      ok: false,
      message: "You have already completed this mission and claimed its reward.",
      account,
    };
  }

  const cleanProof = proof?.trim() || "";

  if (quest.verificationMode === "TELEGRAM_INVITE") {
    const stripped = cleanProof.replace(/^@+/, "");
    if (stripped.length < 2) {
      return {
        ok: false,
        message: "Please enter your Telegram @username or invited friend's @handle first.",
        account,
      };
    }
  } else if (quest.verificationMode === "PROOF_INPUT") {
    if (cleanProof.length < 5) {
      return {
        ok: false,
        message: "Please enter a valid GitHub or portfolio URL (e.g. https://github.com/...).",
        account,
      };
    }
  } else if (quest.verificationMode === "AUTO_FIRST_BID") {
    const hasBidTx = account.history.some((t) => t.type === "BID_SPENT");
    const hasBidOnJob = getStoredJobs().some((j) =>
      j.bids.some((b) => b.bidderUsername.toLowerCase() === key)
    );
    if (!hasBidTx && !hasBidOnJob) {
      return {
        ok: false,
        message: "Submit at least 1 proposal on /jobs first to unlock this +150 Credits mission.",
        account,
      };
    }
  } else if (quest.verificationMode === "AUTO_FIRST_INVITE") {
    if (account.invitedCount < 1) {
      return {
        ok: false,
        message:
          "Invite at least 1 friend via referral link or email first to unlock this +200 Credits bonus.",
        account,
      };
    }
  }

  const normalizedProof =
    quest.verificationMode === "TELEGRAM_INVITE"
      ? `@${cleanProof.replace(/^@+/, "")}`
      : cleanProof || undefined;

  const now = new Date().toISOString();
  const all = readAllCreditAccounts();
  const updated: UserCreditAccount = {
    ...account,
    credits: account.credits + quest.rewardCredits,
    completedQuests: {
      ...(account.completedQuests || {}),
      [quest.id]: {
        questId: quest.id,
        completedAt: now,
        rewardCredits: quest.rewardCredits,
        proof: normalizedProof,
      },
    },
    history: [
      {
        id: `tx-quest-${quest.id}-${Date.now()}`,
        type: "QUEST_BONUS",
        amount: quest.rewardCredits,
        description: normalizedProof
          ? `Mission: ${quest.title} (${normalizedProof}) (+${quest.rewardCredits} Credits)`
          : `Mission: ${quest.title} (+${quest.rewardCredits} Credits)`,
        createdAt: now,
      },
      ...account.history,
    ],
  };

  all[key] = updated;
  writeAllCreditAccounts(all);
  return {
    ok: true,
    message: `Mission completed! +${quest.rewardCredits} Credits added to your balance.`,
    account: updated,
  };
}

export function getStoredJobs(): JobProject[] {
  if (typeof window === "undefined") {
    return SEED_JOBS;
  }
  const delta = readJobsDelta();
  const baseList = [...delta.customJobs, ...SEED_JOBS];
  return baseList.map((job) => {
    const extraBids = delta.addedBids[job.id] || [];
    const mergedBids = [...extraBids, ...job.bids];
    const awardedBidId = delta.awarded[job.id] || job.awardedBidId;
    if (!awardedBidId && extraBids.length === 0) {
      return job;
    }
    return {
      ...job,
      status: awardedBidId ? "AWARDED" : job.status,
      awardedBidId,
      bids: awardedBidId
        ? mergedBids.map((b) => ({
            ...b,
            status: b.id === awardedBidId ? "AWARDED" : "REJECTED",
          }))
        : mergedBids,
    };
  });
}

export function createNewJob(
  payload: Omit<JobProject, "id" | "postedAt" | "status" | "bids">
): JobProject {
  const delta = readJobsDelta();
  const created: JobProject = {
    ...payload,
    id: `job-${Date.now()}`,
    postedAt: "Just now",
    status: "OPEN",
    bids: [],
  };
  writeJobsDelta({
    ...delta,
    customJobs: [created, ...delta.customJobs],
  });
  return created;
}

export function submitJobBid(params: {
  jobId: string;
  bidderUsername: string;
  bidderName: string;
  bidderAvatar: string;
  bidderLevel?: string;
  amount: number;
  deliveryDays: number;
  proposal: string;
  milestones: string;
}): { ok: boolean; message: string; job?: JobProject; creditsRemaining: number } {
  const jobs = getStoredJobs();
  const targetIdx = jobs.findIndex((j) => j.id === params.jobId);
  const creditAcc = getUserCreditAccount(params.bidderUsername);

  if (targetIdx === -1) {
    return {
      ok: false,
      message: "Project not found.",
      creditsRemaining: creditAcc.credits,
    };
  }

  const targetJob = jobs[targetIdx];
  if (targetJob.status !== "OPEN") {
    return {
      ok: false,
      message: "This project is no longer accepting new bids.",
      creditsRemaining: creditAcc.credits,
    };
  }

  if (
    targetJob.bids.some(
      (b) => b.bidderUsername.toLowerCase() === params.bidderUsername.toLowerCase()
    )
  ) {
    return {
      ok: false,
      message: "You have already submitted a proposal for this project.",
      creditsRemaining: creditAcc.credits,
    };
  }

  if (creditAcc.credits < targetJob.bidCostCredits) {
    return {
      ok: false,
      message: `Insufficient credits. You need ${targetJob.bidCostCredits} credits (current balance: ${creditAcc.credits}). Invite friends to earn +500 credits!`,
      creditsRemaining: creditAcc.credits,
    };
  }

  const allCredits = readAllCreditAccounts();
  const key = params.bidderUsername.toLowerCase();
  const updatedAcc: UserCreditAccount = {
    ...creditAcc,
    credits: creditAcc.credits - targetJob.bidCostCredits,
    history: [
      {
        id: `tx-bid-${Date.now()}`,
        type: "BID_SPENT",
        amount: -targetJob.bidCostCredits,
        description: `Submitted bid on "${targetJob.title}" (-${targetJob.bidCostCredits} Credits)`,
        createdAt: new Date().toISOString(),
      },
      ...creditAcc.history,
    ],
  };
  allCredits[key] = updatedAcc;
  writeAllCreditAccounts(allCredits);

  const newBid: JobBid = {
    id: `bid-${Date.now()}`,
    jobId: targetJob.id,
    bidderUsername: params.bidderUsername,
    bidderName: params.bidderName,
    bidderAvatar: params.bidderAvatar,
    bidderLevel: params.bidderLevel || "Verified Freelancer",
    amount: params.amount,
    deliveryDays: params.deliveryDays,
    proposal: params.proposal,
    milestones: params.milestones,
    createdAt: "Just now",
    status: "PENDING",
  };

  const delta = readJobsDelta();
  writeJobsDelta({
    ...delta,
    addedBids: {
      ...delta.addedBids,
      [targetJob.id]: [newBid, ...(delta.addedBids[targetJob.id] || [])],
    },
  });

  const updatedJob: JobProject = {
    ...targetJob,
    bids: [newBid, ...targetJob.bids],
  };

  return {
    ok: true,
    message: `Proposal submitted! ${targetJob.bidCostCredits} credits used.`,
    job: updatedJob,
    creditsRemaining: updatedAcc.credits,
  };
}

export function awardJobBid(jobId: string, bidId: string): JobProject | undefined {
  const jobs = getStoredJobs();
  const target = jobs.find((j) => j.id === jobId);
  if (!target) return undefined;

  const delta = readJobsDelta();
  writeJobsDelta({
    ...delta,
    awarded: {
      ...delta.awarded,
      [jobId]: bidId,
    },
  });

  return {
    ...target,
    status: "AWARDED",
    awardedBidId: bidId,
    bids: target.bids.map((b) => ({
      ...b,
      status: b.id === bidId ? "AWARDED" : "REJECTED",
    })),
  };
}
