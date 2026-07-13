# Day 1-2: Project Setup, Auth & Database

## What was built:
1. **Monorepo Structure**: `backend/` (Express.js API) and `ai/` (FastAPI AI Service) directories.
2. **Express.js API** initialized with TypeScript, Prisma ORM, and all core dependencies.
3. **6-Table Prisma Schema** deployed to Supabase PostgreSQL:
   - `User` (Recruiters)
   - `Job` (Job Openings)
   - `ResumeUpload` (Uploaded resume tracking)
   - `Candidate` (AI-parsed talent pool)
   - `JobApplication` (Candidate-Job match with percentage)
   - `Interview` (Schedule, feedback, ratings)
4. **JWT Authentication System** (Register + Login with access/refresh tokens).
5. **Clean Architecture**: Controllers → Services → Prisma → Database.
6. **Middleware**: Auth guard (`requireAuth`), global error handler, API response helpers.

## Files Created:
- `backend/prisma/schema.prisma` - Database schema
- `backend/src/config/db.ts` - Prisma client singleton
- `backend/src/config/env.ts` - Environment variable validation
- `backend/src/services/auth.service.ts` - Auth business logic
- `backend/src/controllers/auth.controller.ts` - Auth HTTP handlers
- `backend/src/routes/auth.routes.ts` - Auth API endpoints
- `backend/src/middleware/auth.middleware.ts` - JWT verification
- `backend/src/middleware/error.middleware.ts` - Global error handler
- `backend/src/utils/api-error.ts` - Custom error classes
- `backend/src/utils/api-response.ts` - Standardized response format
- `backend/src/app.ts` - Express app setup
- `backend/src/index.ts` - Server entry point

## API Endpoints:
- `POST /api/v1/auth/register` - Register a new recruiter
- `POST /api/v1/auth/login` - Login and get JWT tokens
