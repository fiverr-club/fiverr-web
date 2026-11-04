export type SellerLevel = "Top Rated Seller" | "Level 2 Seller" | "Level 1 Seller" | "Pro Verified";
export type PackageTierName = "Basic" | "Standard" | "Premium";
export type OrderStatus = "IN_PROGRESS" | "DELIVERED" | "REVISION_REQUESTED" | "COMPLETED" | "CANCELLED";

export interface PackageTier {
  tier: PackageTierName;
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number | "Unlimited";
  features: string[];
}

export interface ReviewItem {
  id: string;
  buyerName: string;
  buyerCountry: string;
  buyerAvatar: string;
  ratingOverall: number;
  communicationRating: number;
  serviceAsDescribedRating: number;
  recommendRating: number;
  comment: string;
  packageOrdered: PackageTierName;
  priceRange: string;
  createdAt: string;
  sellerResponse?: string;
}

export interface Gig {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory: string;
  thumbnailUrl: string;
  galleryUrls: string[];
  seller: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    level: SellerLevel;
    tagline: string;
    country: string;
    memberSince: string;
    avgResponseTime: string;
    lastDelivery: string;
    languages: string[];
    bio: string;
  };
  rating: number;
  reviewCount: number;
  ordersInQueue: number;
  startingPrice: number;
  tags: string[];
  description: string;
  highlights: string[];
  packages: Record<PackageTierName, PackageTier>;
  reviews: ReviewItem[];
  criteriaAverages: {
    communication: number;
    serviceAsDescribed: number;
    recommend: number;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  gigId: string;
  gigTitle: string;
  gigThumbnail: string;
  packageTier: PackageTierName;
  buyerName: string;
  buyerUsername: string;
  sellerName: string;
  sellerUsername: string;
  sellerLevel: SellerLevel;
  amount: number;
  serviceFee: number;
  totalEscrow: number;
  status: OrderStatus;
  dueDate: string;
  createdAt: string;
  deliveredAt?: string;
  completedAt?: string;
  revisionsUsed: number;
  revisionsAllowed: number | "Unlimited";
  requirements: string;
  deliveryNote?: string;
  deliveryAttachments?: string[];
}

export interface SellerDashboardStats {
  escrowPendingBalance: number;
  availableForWithdrawal: number;
  clearedThisMonth: number;
  activeOrdersCount: number;
  activeOrdersValue: number;
  sellerLevel: SellerLevel;
  nextEvaluationDate: string;
  metrics: {
    inboxResponseRate: number;
    onTimeDeliveryRate: number;
    orderCompletionRate: number;
    overallRating: number;
  };
}

export interface MessageItem {
  id: string;
  sender: "buyer" | "seller";
  senderName: string;
  text: string;
  timestamp: string;
  customOffer?: {
    title: string;
    packageTier: PackageTierName;
    price: number;
    deliveryDays: number;
    revisions: number;
    status: "PENDING" | "ACCEPTED";
  };
}

export interface Conversation {
  id: string;
  participantName: string;
  participantUsername: string;
  participantAvatar: string;
  participantRole: "Buyer" | "Seller";
  participantLevel?: SellerLevel;
  online: boolean;
  relatedGigTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: MessageItem[];
}

export const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8080/api/v1";

export const CATEGORIES = [
  "All Categories",
  "AI Services",
  "Programming & Tech",
  "Graphics & Design",
  "Digital Marketing",
  "Video & Animation",
  "Writing & Translation",
  "Cloud & DevOps",
] as const;

export const SEED_GIGS: Gig[] = [
  {
    id: "gig-101",
    title: "I will architect and build a production Spring Boot 3 microservices ecosystem on Kubernetes",
    slug: "architect-spring-boot-3-microservices-kubernetes",
    category: "Programming & Tech",
    subcategory: "Backend & Cloud Architecture",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      id: "seller-01",
      username: "alex_ddd_arch",
      displayName: "Alex Rivera",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
      level: "Top Rated Seller",
      tagline: "Principal Distributed Systems & Java DDD Architect",
      country: "United States",
      memberSince: "Mar 2021",
      avgResponseTime: "1 hour",
      lastDelivery: "about 3 hours ago",
      languages: ["English (Fluent)", "Spanish (Native)"],
      bio: "Former Staff Engineer specializing in Java 21, Spring Boot 3, Domain-Driven Design (DDD), Hexagonal Ports & Adapters, Apache Kafka, and Kubernetes Helm infrastructure. Over 180 enterprise systems delivered with 100% on-time completion.",
    },
    rating: 5.0,
    reviewCount: 248,
    ordersInQueue: 7,
    startingPrice: 195,
    tags: ["Spring Boot", "Microservices", "DDD", "Kubernetes", "Apache Kafka"],
    description:
      "Need a rock-solid, cloud-native backend built with clean Domain-Driven Design (DDD) and Hexagonal Architecture? I will design and implement your Java 21 + Spring Boot 3 microservices with strict layer isolation, PostgreSQL persistence, Redis caching, Kafka event streaming, and complete Kubernetes + Helm deployment manifests.",
    highlights: [
      "Strict DDD & Hexagonal Architecture (domain/repository, application/usecase, infrastructure/persistence)",
      "Spring Cloud Gateway with JWT security, rate limiting, and circuit breakers",
      "Event-driven choreography/orchestration with Apache Kafka KRaft mode",
      "Production-ready Helm charts, HorizontalPodAutoscalers, and GitHub Actions CI/CD",
    ],
    packages: {
      Basic: {
        tier: "Basic",
        title: "Core DDD Microservice",
        description: "1 production Spring Boot 3 microservice with DDD Hexagonal layers, PostgreSQL, and Docker.",
        price: 195,
        deliveryDays: 3,
        revisions: 2,
        features: [
          "1 Spring Boot 3 + Java 21 Service",
          "Strict DDD Hexagonal Architecture",
          "PostgreSQL + Flyway Migrations",
          "OpenAPI / Swagger Documentation",
          "Unit & Integration Test Suite (85%+)",
        ],
      },
      Standard: {
        tier: "Standard",
        title: "Multi-Service + Kafka Event Mesh",
        description: "3 microservices + API Gateway + JWT Auth + Kafka event-driven communication + Docker Compose.",
        price: 490,
        deliveryDays: 7,
        revisions: 5,
        features: [
          "3 DDD Microservices + API Gateway",
          "JWT Authentication & RBAC",
          "Apache Kafka Event Producers/Consumers",
          "Redis Distributed Caching",
          "Complete Docker Compose Stack",
        ],
      },
      Premium: {
        tier: "Premium",
        title: "Full Enterprise Cloud Ecosystem",
        description: "Complete microservices platform + Next.js frontend integration + Kubernetes & Helm v3 infra.",
        price: 1250,
        deliveryDays: 14,
        revisions: "Unlimited",
        features: [
          "Up to 8 DDD Microservices + Gateway",
          "Escrow Ledger & Saga Orchestration",
          "Kubernetes StatefulSets & HPA Manifests",
          "Helm v3 Production Chart + Ingress TLS",
          "GitHub Actions CI/CD & Architecture Docs",
        ],
      },
    },
    criteriaAverages: {
      communication: 5.0,
      serviceAsDescribed: 5.0,
      recommend: 4.9,
    },
    reviews: [
      {
        id: "rev-1",
        buyerName: "Marcus Vance",
        buyerCountry: "United Kingdom",
        buyerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        ratingOverall: 5.0,
        communicationRating: 5.0,
        serviceAsDescribedRating: 5.0,
        recommendRating: 5.0,
        comment:
          "Unbelievable code quality. Every single microservice followed strict DDD Hexagonal rules with domain repositories cleanly separated from infrastructure adapters. Deployed straight to our EKS cluster via Helm on day one!",
        packageOrdered: "Premium",
        priceRange: "Over $1,000",
        createdAt: "2 days ago",
        sellerResponse: "Thank you Marcus! It was a pleasure architecting your fintech escrow platform.",
      },
      {
        id: "rev-2",
        buyerName: "Elena Rostova",
        buyerCountry: "Germany",
        buyerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        ratingOverall: 5.0,
        communicationRating: 5.0,
        serviceAsDescribedRating: 5.0,
        recommendRating: 4.9,
        comment:
          "Alex delivered our Order and Payment escrow services ahead of schedule. The Kafka event flow between services is rock solid and well-tested.",
        packageOrdered: "Standard",
        priceRange: "$400-$600",
        createdAt: "1 week ago",
      },
    ],
  },
  {
    id: "gig-102",
    title: "I will design and develop a high-converting Next.js 15 SaaS or Marketplace web app",
    slug: "design-develop-nextjs-15-saas-marketplace-web-app",
    category: "Programming & Tech",
    subcategory: "Full-Stack Web Development",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      id: "seller-02",
      username: "sophia_ui_craft",
      displayName: "Sophia Chen",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
      level: "Pro Verified",
      tagline: "Staff Frontend Engineer & Product Designer",
      country: "Canada",
      memberSince: "Jan 2022",
      avgResponseTime: "30 mins",
      lastDelivery: "about 1 hour ago",
      languages: ["English (Native)", "Mandarin (Fluent)"],
      bio: "Ex-Shopify & Vercel ecosystem specialist crafting ultra-fast Next.js 15 App Router applications with TypeScript, Tailwind CSS, and seamless REST/GraphQL API integrations.",
    },
    rating: 4.9,
    reviewCount: 184,
    ordersInQueue: 5,
    startingPrice: 150,
    tags: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Marketplace"],
    description:
      "Transform your startup vision into a blazing-fast, responsive Next.js 15 application. I build pixel-perfect marketplaces, dashboards, and AI SaaS platforms with full TypeScript safety and clean API integration.",
    highlights: [
      "Next.js 15 App Router with Server & Client Components",
      "Custom Tailwind CSS design system with responsive breakpoints",
      "Interactive checkout flows, escrow dashboards, and real-time chat UI",
      "Standalone Docker build ready for Kubernetes or Vercel deployment",
    ],
    packages: {
      Basic: {
        tier: "Basic",
        title: "Landing Page + Core UI",
        description: "Up to 3 responsive Next.js 15 pages with custom Tailwind styling and interactive components.",
        price: 150,
        deliveryDays: 2,
        revisions: 3,
        features: [
          "3 Next.js 15 App Router Pages",
          "Responsive Mobile & Desktop UI",
          "TypeScript + Tailwind CSS",
          "SEO Metadata Optimization",
        ],
      },
      Standard: {
        tier: "Standard",
        title: "Full Marketplace Frontend",
        description: "5-7 pages including Catalog, Detail View, Order Workspace, Seller Studio, and API Client.",
        price: 380,
        deliveryDays: 5,
        revisions: 5,
        features: [
          "6 Complete Marketplace Views",
          "3-Tier Package Selector & Checkout",
          "Interactive Order & Escrow Timeline",
          "Typed REST API Client Integration",
          "Multi-stage Production Dockerfile",
        ],
      },
      Premium: {
        tier: "Premium",
        title: "Enterprise SaaS + Custom Design System",
        description: "Full-scale web platform with real-time messaging, analytics studio, and E2E testing.",
        price: 890,
        deliveryDays: 10,
        revisions: "Unlimited",
        features: [
          "12+ Custom Pages & Modals",
          "Real-time Inbox & Custom Offers",
          "Full Figma Design System Included",
          "Performance Optimization (98+ Lighthouse)",
          "CI/CD Pipeline + Kubernetes Manifests",
        ],
      },
    },
    criteriaAverages: {
      communication: 5.0,
      serviceAsDescribed: 4.9,
      recommend: 4.9,
    },
    reviews: [
      {
        id: "rev-3",
        buyerName: "David Kim",
        buyerCountry: "South Korea",
        buyerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        ratingOverall: 5.0,
        communicationRating: 5.0,
        serviceAsDescribedRating: 5.0,
        recommendRating: 5.0,
        comment:
          "Sophia's UI work looks like it came straight from a Series B startup design team. The 3-tier package selector and order workspace work flawlessly.",
        packageOrdered: "Standard",
        priceRange: "$300-$500",
        createdAt: "5 days ago",
      },
    ],
  },
  {
    id: "gig-103",
    title: "I will build a custom RAG AI Agent with LangChain, OpenAI, and Vector Databases",
    slug: "build-custom-rag-ai-agent-langchain-openai-vector-db",
    category: "AI Services",
    subcategory: "AI Agents & LLM Integration",
    thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1000&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      id: "seller-03",
      username: "dr_aryan_ai",
      displayName: "Dr. Aryan Mehta",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80",
      level: "Top Rated Seller",
      tagline: "AI Research Scientist & Production LLM Architect",
      country: "Singapore",
      memberSince: "Aug 2020",
      avgResponseTime: "1 hour",
      lastDelivery: "about 5 hours ago",
      languages: ["English (Native)", "Hindi (Native)"],
      bio: "PhD in Machine Learning with 8+ years deploying low-latency AI agents, semantic search engines, and multi-agent workflows for global enterprises.",
    },
    rating: 4.9,
    reviewCount: 312,
    ordersInQueue: 9,
    startingPrice: 220,
    tags: ["AI Agent", "RAG", "OpenAI", "LangChain", "pgvector"],
    description:
      "Deploy hallucination-free AI agents grounded in your company's private knowledge base. I build end-to-end Retrieval-Augmented Generation (RAG) pipelines with tool-calling, streaming responses, and evaluation guardrails.",
    highlights: [
      "Hybrid semantic + keyword retrieval with PostgreSQL pgvector or Pinecone",
      "Multi-step tool calling for order lookup, CRM actions, and automated support",
      "Token budget controls, prompt caching, and latency optimization",
      "REST/SSE streaming endpoints ready for web and mobile apps",
    ],
    packages: {
      Basic: {
        tier: "Basic",
        title: "RAG Prototype API",
        description: "Document ingestion pipeline + vector search + streaming chat endpoint.",
        price: 220,
        deliveryDays: 3,
        revisions: 2,
        features: [
          "PDF/Markdown Ingestion Pipeline",
          "Vector Database Setup (pgvector)",
          "Streaming Chat API Endpoint",
          "Source Citation Tracking",
        ],
      },
      Standard: {
        tier: "Standard",
        title: "Production Tool-Calling Agent",
        description: "Multi-tool AI agent integrated with your backend APIs, auth, and conversation memory.",
        price: 540,
        deliveryDays: 6,
        revisions: 4,
        features: [
          "Up to 5 Custom Function Tools",
          "Redis Session & Memory Persistence",
          "Hallucination Guardrails & Eval Suite",
          "Dockerized Microservice Deployment",
        ],
      },
      Premium: {
        tier: "Premium",
        title: "Enterprise Multi-Agent Platform",
        description: "Autonomous supervisor + worker agents, analytics dashboard, and fine-tuned embeddings.",
        price: 1150,
        deliveryDays: 12,
        revisions: "Unlimited",
        features: [
          "Multi-Agent Orchestration Graph",
          "Custom Admin & Observability UI",
          "Role-Based Access Control on Docs",
          "Load Tested & Kubernetes Ready",
        ],
      },
    },
    criteriaAverages: {
      communication: 4.9,
      serviceAsDescribed: 5.0,
      recommend: 4.9,
    },
    reviews: [
      {
        id: "rev-4",
        buyerName: "Liam O'Connor",
        buyerCountry: "Ireland",
        buyerAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
        ratingOverall: 5.0,
        communicationRating: 5.0,
        serviceAsDescribedRating: 5.0,
        recommendRating: 5.0,
        comment:
          "Cut our customer support ticket volume by 68% in the first two weeks. Dr. Aryan's RAG pipeline cites exact documentation pages with sub-second latency.",
        packageOrdered: "Premium",
        priceRange: "Over $1,000",
        createdAt: "4 days ago",
      },
    ],
  },
  {
    id: "gig-104",
    title: "I will design a complete brand identity, Figma UI kit, and interactive design system",
    slug: "design-brand-identity-figma-ui-kit-design-system",
    category: "Graphics & Design",
    subcategory: "UI/UX & Brand Identity",
    thumbnailUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1000&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      id: "seller-04",
      username: "claire_studio",
      displayName: "Claire Dubois",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80",
      level: "Level 2 Seller",
      tagline: "Creative Director & Design Systems Lead",
      country: "France",
      memberSince: "May 2022",
      avgResponseTime: "2 hours",
      lastDelivery: "about 6 hours ago",
      languages: ["English (Fluent)", "French (Native)"],
      bio: "Paris-based product designer helping tech startups craft memorable brand identities and scalable Figma component libraries with design tokens.",
    },
    rating: 4.9,
    reviewCount: 142,
    ordersInQueue: 4,
    startingPrice: 120,
    tags: ["Figma", "UI/UX", "Design System", "Branding", "Prototyping"],
    description:
      "Elevate your product with an cohesive brand identity and developer-ready Figma design system. Includes auto-layout components, dark/light mode variables, and interactive user flow prototypes.",
    highlights: [
      "Complete Figma Token Architecture (Colors, Typography, Spacing, Shadows)",
      "50+ Auto-Layout Components with Variant States",
      "Clickable High-Fidelity Prototype for Investor Demos",
      "Developer Handoff Specs aligned with Tailwind CSS",
    ],
    packages: {
      Basic: {
        tier: "Basic",
        title: "Starter Brand + 3 Screens",
        description: "Logo exploration, color/type tokens, and 3 key product screens in Figma.",
        price: 120,
        deliveryDays: 3,
        revisions: 3,
        features: [
          "Brand Color & Typography Guide",
          "3 High-Fidelity UI Screens",
          "Editable Figma Source File",
        ],
      },
      Standard: {
        tier: "Standard",
        title: "Product UI Kit + 10 Screens",
        description: "10 responsive screens + reusable Figma component library + interactive prototype.",
        price: 290,
        deliveryDays: 6,
        revisions: 5,
        features: [
          "10 Desktop & Mobile Screens",
          "35+ Auto-Layout Components",
          "Interactive Clickable Prototype",
          "Tailwind CSS Token Mapping",
        ],
      },
      Premium: {
        tier: "Premium",
        title: "Full Enterprise Design System",
        description: "25+ screens, complete multi-theme variable system, brand book, and motion specs.",
        price: 680,
        deliveryDays: 10,
        revisions: "Unlimited",
        features: [
          "25+ Screens Across All Flows",
          "Light & Dark Mode Figma Variables",
          "Complete Brand Guidelines PDF",
          "Live Handoff Workshop with Devs",
        ],
      },
    },
    criteriaAverages: {
      communication: 5.0,
      serviceAsDescribed: 4.9,
      recommend: 4.8,
    },
    reviews: [],
  },
  {
    id: "gig-105",
    title: "I will automate your Kubernetes cluster, Helm charts, Ingress TLS, and GitHub Actions CI/CD",
    slug: "automate-kubernetes-cluster-helm-charts-github-actions",
    category: "Cloud & DevOps",
    subcategory: "Kubernetes & Infrastructure as Code",
    thumbnailUrl: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1000&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      id: "seller-05",
      username: "k8s_viktor",
      displayName: "Viktor Lindqvist",
      avatarUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=250&q=80",
      level: "Top Rated Seller",
      tagline: "CNCF Kubestronaut & Principal SRE",
      country: "Sweden",
      memberSince: "Nov 2020",
      avgResponseTime: "1 hour",
      lastDelivery: "about 2 hours ago",
      languages: ["English (Fluent)", "Swedish (Native)"],
      bio: "Certified Kubernetes Security Specialist (CKS, CKA, CKAD) helping teams migrate from Docker Compose to zero-downtime Kubernetes clusters with Helm, Kustomize, and NetworkPolicies.",
    },
    rating: 5.0,
    reviewCount: 196,
    ordersInQueue: 6,
    startingPrice: 175,
    tags: ["Kubernetes", "Helm", "Kustomize", "DevOps", "Zero Downtime"],
    description:
      "Stop worrying about production outages. I will package your microservices into hardened Kubernetes manifests and Helm v3 charts with StatefulSets, HorizontalPodAutoscalers, PodDisruptionBudgets, and zero-trust NetworkPolicies.",
    highlights: [
      "Complete Kustomize & Helm v3 Chart hierarchy (dev / staging / prod values)",
      "StatefulSets for PostgreSQL, Redis, and Apache Kafka KRaft mode",
      "Liveness & Readiness probes tuned for Spring Boot Actuator & Next.js",
      "Zero-trust NetworkPolicies and PodDisruptionBudgets for HA",
    ],
    packages: {
      Basic: {
        tier: "Basic",
        title: "K8s Manifests for 3 Services",
        description: "Deployments, Services, ConfigMaps, and Ingress for up to 3 workloads.",
        price: 175,
        deliveryDays: 2,
        revisions: 2,
        features: [
          "Deployments, Services & HPA",
          "NGINX Ingress with TLS",
          "Liveness & Readiness Probes",
        ],
      },
      Standard: {
        tier: "Standard",
        title: "Full Cluster + StatefulSets + Helm",
        description: "Up to 10 services + Postgres/Redis/Kafka StatefulSets + reusable Helm v3 chart.",
        price: 420,
        deliveryDays: 5,
        revisions: 4,
        features: [
          "10 Microservice Workloads + HPAs",
          "Postgres, Redis & Kafka StatefulSets",
          "Umbrella Helm v3 Chart + Kustomize",
          "NetworkPolicies & PodDisruptionBudgets",
        ],
      },
      Premium: {
        tier: "Premium",
        title: "Enterprise GitOps + Observability",
        description: "Full K8s infra + ArgoCD GitOps + Prometheus/Grafana dashboards + CI/CD pipelines.",
        price: 950,
        deliveryDays: 10,
        revisions: "Unlimited",
        features: [
          "Complete Production K8s + Helm Repo",
          "ArgoCD Automated GitOps Sync",
          "Prometheus + Grafana + Loki Stack",
          "Automated Rollback & Load Testing",
        ],
      },
    },
    criteriaAverages: {
      communication: 5.0,
      serviceAsDescribed: 5.0,
      recommend: 5.0,
    },
    reviews: [],
  },
  {
    id: "gig-106",
    title: "I will produce a studio-quality 3D SaaS product explainer video and motion graphics",
    slug: "produce-3d-saas-product-explainer-video-motion-graphics",
    category: "Video & Animation",
    subcategory: "SaaS Explainer Videos",
    thumbnailUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
    ],
    seller: {
      id: "seller-06",
      username: "motion_enzo",
      displayName: "Enzo Moretti",
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80",
      level: "Level 2 Seller",
      tagline: "Motion Director for Tech & Fintech Brands",
      country: "Italy",
      memberSince: "Jul 2022",
      avgResponseTime: "1 hour",
      lastDelivery: "about 12 hours ago",
      languages: ["English (Fluent)", "Italian (Native)"],
      bio: "Creating high-impact 60-second product launch videos for YCombinator startups and global SaaS teams.",
    },
    rating: 4.8,
    reviewCount: 97,
    ordersInQueue: 3,
    startingPrice: 250,
    tags: ["Motion Graphics", "SaaS Video", "After Effects", "3D Product", "Explainer"],
    description:
      "Turn visitors into paying customers with a dynamic SaaS product walkthrough video featuring smooth UI animations, kinetic typography, and professional sound design.",
    highlights: [
      "4K 60fps UI motion capture and 3D camera transitions",
      "Professional voiceover and custom sound effects",
      "Optimized aspect ratios for Hero Landing Page, YouTube, and LinkedIn",
    ],
    packages: {
      Basic: {
        tier: "Basic",
        title: "30s Product Teaser",
        description: "Fast-paced 30-second product sizzle reel with kinetic typography and music.",
        price: 250,
        deliveryDays: 4,
        revisions: 2,
        features: ["30 Seconds 4K Render", "Background Music & SFX", "UI Screen Animations"],
      },
      Standard: {
        tier: "Standard",
        title: "60s Full SaaS Explainer",
        description: "60-second scripted product tour with voiceover, 3D UI mockups, and sound design.",
        price: 520,
        deliveryDays: 7,
        revisions: 4,
        features: ["60 Seconds 4K Render", "Studio Voiceover Included", "Custom 3D Device Scenes"],
      },
      Premium: {
        tier: "Premium",
        title: "90s Launch Campaign Bundle",
        description: "90s flagship launch film + 3 social cutdowns + project source files.",
        price: 980,
        deliveryDays: 12,
        revisions: "Unlimited",
        features: ["90s Flagship Video + 3 Cutdowns", "Scriptwriting & Storyboard", "Full After Effects Source"],
      },
    },
    criteriaAverages: {
      communication: 4.9,
      serviceAsDescribed: 4.8,
      recommend: 4.8,
    },
    reviews: [],
  },
];

export const SEED_ORDERS: Order[] = [
  {
    id: "ord-9001",
    orderNumber: "#FO-8849201",
    gigId: "gig-101",
    gigTitle: "I will architect and build a production Spring Boot 3 microservices ecosystem on Kubernetes",
    gigThumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    packageTier: "Premium",
    buyerName: "Jordan Taylor",
    buyerUsername: "jordan_fintech",
    sellerName: "Alex Rivera",
    sellerUsername: "alex_ddd_arch",
    sellerLevel: "Top Rated Seller",
    amount: 1250,
    serviceFee: 68.75,
    totalEscrow: 1318.75,
    status: "DELIVERED",
    dueDate: "2026-11-08T18:00:00Z",
    createdAt: "2026-10-28T10:15:00Z",
    deliveredAt: "2026-11-04T06:30:00Z",
    revisionsUsed: 1,
    revisionsAllowed: "Unlimited",
    requirements:
      "Build all 9 Spring Boot 3 DDD microservices (API Gateway, Auth, User, Gig, Order, Payment Escrow, Messaging, Review, Notification) plus Kubernetes & Helm v3 deployment manifests.",
    deliveryNote:
      "All 9 Spring Boot 3 microservices with strict DDD Hexagonal architecture (`domain/repository`, `application/usecase`, `infrastructure/persistence`) and the complete `fiverr-k8s-infra` Helm chart have been pushed and verified. Ready for your review and escrow release!",
    deliveryAttachments: [
      "fiverr-microservices-architecture-v1.zip (42.8 MB)",
      "helm-fiverr-ecosystem-chart.tgz (1.4 MB)",
      "escrow-saga-verification-report.pdf (840 KB)",
    ],
  },
  {
    id: "ord-9002",
    orderNumber: "#FO-8849345",
    gigId: "gig-102",
    gigTitle: "I will design and develop a high-converting Next.js 15 SaaS or Marketplace web app",
    gigThumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    packageTier: "Standard",
    buyerName: "Jordan Taylor",
    buyerUsername: "jordan_fintech",
    sellerName: "Sophia Chen",
    sellerUsername: "sophia_ui_craft",
    sellerLevel: "Pro Verified",
    amount: 380,
    serviceFee: 20.9,
    totalEscrow: 400.9,
    status: "IN_PROGRESS",
    dueDate: "2026-11-07T20:00:00Z",
    createdAt: "2026-11-02T14:20:00Z",
    revisionsUsed: 0,
    revisionsAllowed: 5,
    requirements:
      "Implement the Next.js 15 App Router frontend with Fiverr emerald palette (#1dbf73), 3-tier package selector, order escrow workspace, seller studio, and real-time inbox.",
  },
  {
    id: "ord-9003",
    orderNumber: "#FO-8847110",
    gigId: "gig-105",
    gigTitle: "I will automate your Kubernetes cluster, Helm charts, Ingress TLS, and GitHub Actions CI/CD",
    gigThumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=600&q=80",
    packageTier: "Standard",
    buyerName: "Jordan Taylor",
    buyerUsername: "jordan_fintech",
    sellerName: "Viktor Lindqvist",
    sellerUsername: "k8s_viktor",
    sellerLevel: "Top Rated Seller",
    amount: 420,
    serviceFee: 23.1,
    totalEscrow: 443.1,
    status: "COMPLETED",
    dueDate: "2026-10-25T18:00:00Z",
    createdAt: "2026-10-20T09:00:00Z",
    deliveredAt: "2026-10-24T15:10:00Z",
    completedAt: "2026-10-24T19:45:00Z",
    revisionsUsed: 0,
    revisionsAllowed: 4,
    requirements: "Create StatefulSets for PostgreSQL, Redis, and Kafka KRaft mode plus HPA policies.",
    deliveryNote: "Delivered full Kustomize and Helm manifests with zero-downtime rolling updates.",
    deliveryAttachments: ["k8s-stateful-ha-bundle.zip (3.2 MB)"],
  },
];

export const SEED_SELLER_STATS: SellerDashboardStats = {
  escrowPendingBalance: 1630.0,
  availableForWithdrawal: 8420.5,
  clearedThisMonth: 4890.0,
  activeOrdersCount: 4,
  activeOrdersValue: 2365.0,
  sellerLevel: "Top Rated Seller",
  nextEvaluationDate: "Nov 15, 2026",
  metrics: {
    inboxResponseRate: 99,
    onTimeDeliveryRate: 100,
    orderCompletionRate: 98,
    overallRating: 5.0,
  },
};

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    participantName: "Alex Rivera",
    participantUsername: "alex_ddd_arch",
    participantAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    participantRole: "Seller",
    participantLevel: "Top Rated Seller",
    online: true,
    relatedGigTitle: "Spring Boot 3 Microservices Ecosystem on Kubernetes",
    lastMessage: "I've just uploaded the Helm chart and Kafka Saga verification report to Order #FO-8849201!",
    lastMessageTime: "10:42 AM",
    unreadCount: 1,
    messages: [
      {
        id: "msg-1",
        sender: "buyer",
        senderName: "Jordan Taylor",
        text: "Hi Alex! Just checking in on the Payment Service escrow ledger and Kafka event consumers. Are all repository interfaces inside domain/repository?",
        timestamp: "10:15 AM",
      },
      {
        id: "msg-2",
        sender: "seller",
        senderName: "Alex Rivera",
        text: "Hey Jordan! Yes, 100%. Every microservice strictly keeps Repository interfaces in `domain/repository/` and JPA implementations in `infrastructure/persistence/repository/`. Port Out is reserved exclusively for external adapters.",
        timestamp: "10:22 AM",
      },
      {
        id: "msg-3",
        sender: "seller",
        senderName: "Alex Rivera",
        text: "I've just uploaded the Helm chart and Kafka Saga verification report to Order #FO-8849201!",
        timestamp: "10:42 AM",
      },
    ],
  },
  {
    id: "conv-2",
    participantName: "Sophia Chen",
    participantUsername: "sophia_ui_craft",
    participantAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
    participantRole: "Seller",
    participantLevel: "Pro Verified",
    online: true,
    relatedGigTitle: "Next.js 15 SaaS or Marketplace Web App",
    lastMessage: "Here is the custom offer for the interactive Seller Studio & Escrow Workspace module.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "msg-201",
        sender: "buyer",
        senderName: "Jordan Taylor",
        text: "Hi Sophia, can we include the 3-criteria review breakdown and custom offer widget in the inbox?",
        timestamp: "Yesterday, 4:10 PM",
      },
      {
        id: "msg-202",
        sender: "seller",
        senderName: "Sophia Chen",
        text: "Here is the custom offer for the interactive Seller Studio & Escrow Workspace module.",
        timestamp: "Yesterday, 4:18 PM",
        customOffer: {
          title: "Next.js 15 Marketplace + Escrow Workspace + Real-Time Inbox",
          packageTier: "Standard",
          price: 380,
          deliveryDays: 5,
          revisions: 5,
          status: "ACCEPTED",
        },
      },
    ],
  },
  {
    id: "conv-3",
    participantName: "Dr. Aryan Mehta",
    participantUsername: "dr_aryan_ai",
    participantAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80",
    participantRole: "Seller",
    participantLevel: "Top Rated Seller",
    online: false,
    relatedGigTitle: "Custom RAG AI Agent with LangChain & pgvector",
    lastMessage: "Sounds great, let me know when you're ready to kick off the semantic gig search indexing.",
    lastMessageTime: "Nov 1",
    unreadCount: 0,
    messages: [
      {
        id: "msg-301",
        sender: "seller",
        senderName: "Dr. Aryan Mehta",
        text: "Sounds great, let me know when you're ready to kick off the semantic gig search indexing.",
        timestamp: "Nov 1, 2:00 PM",
      },
    ],
  },
];

async function fetchWithFallback<T>(endpoint: string, fallbackData: T, init?: RequestInit): Promise<T> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);
    const response = await fetch(`${API_GATEWAY_URL}${endpoint}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return fallbackData;
    }
    const json = await response.json();
    return (json?.data ?? json) as T;
  } catch {
    return fallbackData;
  }
}

export const fiverrApi = {
  async getGigs(params?: { category?: string; search?: string; maxPrice?: number }): Promise<Gig[]> {
    const gigs = await fetchWithFallback<Gig[]>("/gigs", SEED_GIGS);
    return gigs.filter((g) => {
      if (params?.category && params.category !== "All Categories" && g.category !== params.category) {
        return false;
      }
      if (params?.maxPrice && g.startingPrice > params.maxPrice) {
        return false;
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        const matchesTitle = g.title.toLowerCase().includes(q);
        const matchesTag = g.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = g.category.toLowerCase().includes(q);
        return matchesTitle || matchesTag || matchesCategory;
      }
      return true;
    });
  },

  async getGigById(id: string): Promise<Gig> {
    const fallback = SEED_GIGS.find((g) => g.id === id) || SEED_GIGS[0];
    return fetchWithFallback<Gig>(`/gigs/${id}`, fallback);
  },

  async getOrders(): Promise<Order[]> {
    return fetchWithFallback<Order[]>("/orders", SEED_ORDERS);
  },

  async createOrder(payload: {
    gigId: string;
    packageTier: PackageTierName;
    requirements: string;
  }): Promise<Order> {
    const gig = SEED_GIGS.find((g) => g.id === payload.gigId) || SEED_GIGS[0];
    const pkg = gig.packages[payload.packageTier];
    const serviceFee = Number((pkg.price * 0.055).toFixed(2));
    const fallbackOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `#FO-${Math.floor(1000000 + Math.random() * 9000000)}`,
      gigId: gig.id,
      gigTitle: gig.title,
      gigThumbnail: gig.thumbnailUrl,
      packageTier: payload.packageTier,
      buyerName: "Jordan Taylor",
      buyerUsername: "jordan_fintech",
      sellerName: gig.seller.displayName,
      sellerUsername: gig.seller.username,
      sellerLevel: gig.seller.level,
      amount: pkg.price,
      serviceFee,
      totalEscrow: Number((pkg.price + serviceFee).toFixed(2)),
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + pkg.deliveryDays * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      revisionsUsed: 0,
      revisionsAllowed: pkg.revisions,
      requirements: payload.requirements || "Please follow the architectural guidelines discussed.",
    };
    return fetchWithFallback<Order>("/orders", fallbackOrder, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getSellerDashboard(): Promise<SellerDashboardStats> {
    return fetchWithFallback<SellerDashboardStats>("/sellers/me/dashboard", SEED_SELLER_STATS);
  },

  async getConversations(): Promise<Conversation[]> {
    return fetchWithFallback<Conversation[]>("/messages/conversations", SEED_CONVERSATIONS);
  },
};
