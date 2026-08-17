# Nestora — AI-Powered Student Accommodation & Decision Platform for College Students in India

**Nestora** is a production-quality, AI-powered two-sided accommodation marketplace designed specifically for college students across major university hubs in India (**Nitte Meenakshi Institute of Technology (NMIT) Yelahanka/Bagalur Cross**, Delhi University North Campus, IIT Bombay Powai, Christ University Koramangala, VIT Vellore).

Nestora solves the core problem every incoming college student faces: deciding whether to stay in a college hostel or choosing between multiple nearby PGs by comparing true monthly costs, distance/commute time, room sharing, AC, food menus, verified owner photos, student reviews, and AI-driven decision support.

---

## Key Architecture & Highlights

### 1. Two-Sided Marketplace & Role-Based Access Control (RBAC)
- **Student Role**: College selection, multi-filter PG discovery, split-screen interactive Google Vector Maps, True Monthly Cost Calculator, PG-to-PG side-by-side comparison matrix, saved PGs, direct inquiry submission, and AI decision assistant.
- **Owner Role**: Full PG listing management, room type configuration (single/double/triple/four sharing, AC vs non-AC), photo uploads, weekly mess menu management, and inquiry status tracking.
- **Admin Role**: Platform governance, user analytics, listing verification audits, and DEMO seed data transparency tracking.

### 2. Multilingual i18n Support
- Full multilingual switching support across **English (en)**, **Hindi (hi)**, **Telugu (te)**, and **Kannada (kn)**.

### 3. Google Routes API v2 (`computeRouteMatrix`) & Vector Maps Synergy
- Uses the current **Google Routes API v2** (`https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix`) for exact walking, driving, and transit travel time calculation.
- Includes interactive Google Maps JavaScript API with auto-pan and InfoWindow popups on card hover.

### 4. PG True Monthly Cost Calculator & Multi-PG Comparison Matrix
- Itemized cost breakdown utility:
  $$\text{True Monthly Cost} = \text{Base Rent} + \text{Food Charges} + \text{Est. Electricity} + \text{Est. Maintenance} + \text{Est. Commute Cost}$$
- Side-by-side comparison matrix allowing students to select up to 4 PGs and compare total cost, rent, deposit, room sharing, AC, food, amenities, distance, commute time, ratings, and availability.

### 5. Multi-Agent AI System (LangGraph Architecture)
- Central **Supervisor Router** with dynamic intent classification and specialized intelligence agents (Student Profiler, PG Matcher, Commute Analyst, Food Intelligence, Review Intelligence, Budget Analyst).

---

## Demo Login Credentials

| Role | Email | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **PG Owner / Host** | `ramesh.owner@nestora.demo` | `password123` | [http://localhost:3000/en/owner/dashboard](http://localhost:3000/en/owner/dashboard) |
| **PG Owner / Host** | `sunita.owner@nestora.demo` | `password123` | [http://localhost:3000/en/owner/dashboard](http://localhost:3000/en/owner/dashboard) |
| **System Admin** | `admin@nestora.demo` | `password123` | [http://localhost:3000/en/admin](http://localhost:3000/en/admin) |
| **Student** | `aarav.student@nestora.demo` | `password123` | [http://localhost:3000/en](http://localhost:3000/en) |

---

## Tech Stack & Monorepo Structure

- **Frontend**: Next.js 14, React 18, TailwindCSS, Lucide/Heroicons, TanStack Query, tRPC Client.
- **Backend**: Node.js, Express, tRPC Server v11, Prisma ORM, SQLite / MySQL.
- **AI Infrastructure**: LangGraph Multi-Agent Architecture, LLM Provider Abstraction (`LLMProviderWrapper` supporting Gemini 1.5 Flash & Mock Provider).
- **Location Services**: Google Maps JavaScript API, Google Routes API v2.

```text
pgfinder/
├── packages/
│   ├── shared/         # Prisma schema, database client, cost calculator, shared types
│   ├── backend/        # tRPC server, express server, AI multi-agent system, services, tests
│   └── frontend/       # Next.js web application, UI components, AI drawer, comparison modal
└── .env.example
```

---

## Quick Start & Installation

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Initialize Database & Seed Data
```bash
cd packages/shared
npx prisma db push
npx tsx scripts/seedData.ts
```

### 4. Start Development Servers
```bash
# Start backend (Port 3201)
cd packages/backend
pnpm dev

# Start frontend (Port 3000)
cd packages/frontend
pnpm dev
```

---

## Automated Test Verification Matrix

Run the comprehensive test suite:

```bash
cd packages/backend
npx tsx tests/runFinalQATest.ts
```
## License

MIT License Copyright Nestora Team 2026.
