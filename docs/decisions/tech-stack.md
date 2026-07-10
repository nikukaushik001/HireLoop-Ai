# Technology Decisions — HireLoop AI

## Overview

This document captures every significant technology decision, the rationale, alternatives considered, and tradeoffs.

---

## Decision 1: Monorepo Structure

**Decision:** Single repository with `apps/` for services and `packages/` for shared code.

**Why:**
- Three services (Express, FastAPI, Next.js) share types and constants
- Single PR shows full feature impact
- Easier code review for a small team
- Shared `.gitignore`, CI config, documentation

**Alternatives:**
- **Multi-repo:** Better CI isolation, but harder to share types across TS services
- **Turborepo/Nx:** Adds build orchestration overhead — overkill for 3 services

**Tradeoff:** Slightly larger clone, but coherent version history.

---

## Decision 2: Drizzle ORM over Prisma

**Decision:** Use Drizzle ORM for all database operations.

**Why:**
- No code generation step (`prisma generate` is eliminated)
- SQL-like query builder — easier to debug, closer to metal
- Excellent TypeScript inference without codegen
- Smaller bundle size (~35KB vs Prisma's ~2MB runtime)
- Schema defined in TypeScript — single source of truth

**Alternatives:**
- **Prisma:** More mature, better docs, but heavy runtime and codegen dependency
- **Knex.js:** Query builder only, no schema management
- **TypeORM:** Decorator-heavy, worse TS inference

**Tradeoff:** Drizzle's community is smaller than Prisma's, but the DX advantage is significant.

---

## Decision 3: JWT over Session-Based Auth

**Decision:** Stateless JWT with access/refresh token pattern.

**Why:**
- No session store required (no Redis dependency for auth)
- Works naturally with microservices (FastAPI can verify independently)
- Horizontal scaling without sticky sessions
- Access token (15min) limits exposure window
- Refresh token (7d) provides seamless UX

**Alternatives:**
- **Session + Redis:** More secure (revocable), but adds infrastructure
- **OAuth2/OIDC:** Over-engineered for internal tools

**Tradeoff:** JWT revocation is harder — mitigated by short access token expiry and refresh token rotation.

---

## Decision 4: Express.js as Single DB Writer

**Decision:** Only Express writes to PostgreSQL. FastAPI never touches the DB.

**Why:**
- Prevents distributed transaction bugs
- Single point of truth for data integrity
- Simplifies migration management (one service owns schema)
- FastAPI stays stateless — easier to scale/replace

**Alternatives:**
- **Both services write:** Requires distributed transactions or saga pattern
- **Shared DB library:** Coupling between services, Python + TS both need Drizzle/SQLAlchemy

**Tradeoff:** Extra HTTP hop (FastAPI → Express → DB), but data integrity is worth it.

---

## Decision 5: LangGraph over Plain LangChain

**Decision:** Use LangGraph for the AI agent pipeline.

**Why:**
- Graph-based workflow allows conditional branching
- Built-in state management across nodes
- Each agent node is independently testable
- Error handling per node (partial results on failure)
- Supports human-in-the-loop patterns

**Alternatives:**
- **Plain LangChain:** Sequential chains only, no branching
- **Custom orchestration:** More control, but re-inventing the wheel
- **CrewAI:** Less flexible graph structure

**Tradeoff:** LangGraph adds complexity, but our pipeline has 5+ sequential agents with potential branching — a perfect fit.

---

## Decision 6: Provider Pattern for LLMs

**Decision:** Abstract LLM providers behind a factory pattern.

**Why:**
- Swap Gemini ↔ HuggingFace without changing business logic
- Add new providers by creating one file
- Test with mock providers
- Different models for different tasks (e.g., Gemini for parsing, HF for embeddings)

**Alternatives:**
- **Hard-coded providers:** Faster initial development, but vendor lock-in
- **LangChain's native abstraction:** Less control over retry/fallback logic

**Tradeoff:** Extra abstraction layer, but pays off immediately when switching providers.

---

## Decision 7: pgvector over Dedicated Vector DB

**Decision:** Use PostgreSQL's pgvector extension instead of Pinecone/Weaviate/Qdrant.

**Why:**
- No additional infrastructure to manage
- Vectors live alongside relational data — simpler queries
- JOIN vector results with candidate/role tables directly
- IVFFlat indexing handles our scale (up to ~1M vectors)
- One database to backup/restore

**Alternatives:**
- **Pinecone:** Managed, faster at scale, but adds SaaS dependency + cost
- **Weaviate:** Feature-rich, but another service to manage
- **Qdrant:** Excellent performance, but separate deployment

**Tradeoff:** pgvector is slower than dedicated vector DBs at extreme scale, but our candidate volume (< 1M) is well within its sweet spot.

---

## Decision 8: TailwindCSS v4 + shadcn/ui

**Decision:** Use TailwindCSS v4 for styling with shadcn/ui component library.

**Why:**
- TailwindCSS v4: New engine (Oxide), CSS-first config, faster builds
- shadcn/ui: Copy-paste components — full ownership, no dependency
- Accessible by default (built on Radix UI primitives)
- Dark mode built-in
- Consistent design system without a designer

**Alternatives:**
- **CSS Modules:** Good isolation, but slower iteration
- **Chakra UI / Mantine:** Full libraries — less control, harder to customize
- **Material UI:** Google-branded look, heavy bundle

**Tradeoff:** TailwindCSS v4 is newer (some ecosystem lag), but shadcn/ui already supports it well.

---

## Decision 9: TanStack Query for Server State

**Decision:** Use TanStack Query (React Query) for all API data fetching.

**Why:**
- Automatic caching and cache invalidation
- Background refetching keeps data fresh
- Loading/error/success states out of the box
- Deduplication of concurrent requests
- Excellent devtools for debugging

**Alternatives:**
- **SWR:** Simpler API, but less powerful
- **RTK Query:** Tied to Redux, over-engineered for our case
- **Server Components only:** No client-side caching for interactive features

**Tradeoff:** Additional dependency, but eliminates enormous amounts of manual state management code.

---

## Decision 10: Zod as Universal Validator

**Decision:** Use Zod for validation on both frontend and backend.

**Why:**
- Same schema validates Express requests AND React Hook Form
- TypeScript-first — infers types from schemas
- Composable — extend/merge schemas easily
- Works with both platforms (Node.js + Browser)

**Alternatives:**
- **Joi:** No TypeScript inference
- **Yup:** Weaker TS support, less composable
- **Express-validator:** Backend only, can't share with frontend

**Tradeoff:** Slightly larger bundle on frontend, but the shared validation contract eliminates a whole class of bugs.
