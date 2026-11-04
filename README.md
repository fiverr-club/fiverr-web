# Fiverr Web (`fiverr-web`)

Production-grade **Next.js 15 (App Router, TypeScript, Tailwind CSS)** marketplace frontend for the **Fiverr Club** freelance services ecosystem. Connects seamlessly to the **Spring Cloud Gateway (`:8080/api/v1`)** and all 8 downstream Spring Boot 3 Domain-Driven Design (DDD) microservices, with automatic seed data fallback for standalone demos.

---

## Features & Routes

| Route | View | Microservices Integrated |
|---|---|---|
| `/` | **Marketplace Homepage**: Dark emerald hero banner (`#1dbf73`), live search bar, category ribbon, multi-filter bar (Category, Seller Level, Delivery Time, Budget), Featured Gigs grid, and Escrow Guarantee overview | `fiverr-gig-service`, `fiverr-user-service`, `fiverr-review-service` |
| `/gigs/[id]` | **Gig Detail & 3-Tier Configurator**: Media gallery, Seller bio & level badge (`Top Rated Seller`, `Pro Verified`, `Level 2 Seller`), interactive `Basic` / `Standard` / `Premium` package selector, Escrow checkout modal, and 3-criteria Review breakdown (`Communication`, `Service as Described`, `Recommend`) | `fiverr-gig-service`, `fiverr-order-service`, `fiverr-payment-service`, `fiverr-review-service` |
| `/orders` | **Buyer & Seller Order Workspace**: 3-step Escrow lifecycle timeline (`IN_PROGRESS` → `DELIVERED` → `COMPLETED`), delivery countdown, role switcher, "Submit Delivery", "Request Revision", and "Approve & Release Escrow" actions | `fiverr-order-service`, `fiverr-payment-service`, `fiverr-notification-service` |
| `/seller/dashboard` | **Seller Studio & Escrow Wallet**: Available for Withdrawal vs Escrow Pending balances, instant payout trigger, Seller Level evaluation metrics (Response Rate, On-Time Delivery, Order Completion, Rating), Active Orders queue, and "Create New Gig" modal | `fiverr-payment-service`, `fiverr-user-service`, `fiverr-gig-service` |
| `/inbox` | **Real-Time Buyer & Seller Inbox**: Conversation list with online indicators, real-time message thread, and interactive **Send / Accept Custom Offer** milestone widget | `fiverr-messaging-service`, `fiverr-order-service` |

---

## Quick Start

### 1. Local Development
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

### 2. Production Build
```bash
npm run build
npm start
```

### 3. Docker Build
```bash
docker build -t ghcr.io/fiverr-club/fiverr-web:latest .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080/api/v1 ghcr.io/fiverr-club/fiverr-web:latest
```
