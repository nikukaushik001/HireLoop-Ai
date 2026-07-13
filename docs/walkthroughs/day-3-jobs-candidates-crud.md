# Day 3: Job Management & Candidates CRUD

## What was built:
1. **`services/job.service.ts`**: Contains the logic to create a new job opening, fetch all open jobs, fetch a specific job by ID (along with its applications), and close a job.
2. **`services/candidate.service.ts`**: Contains the logic to query the Talent Pool. Currently includes fetching all candidates and fetching specific candidate details (including their parsed resume data).
3. **`controllers/*`**: Both Job and Candidate controllers were created to handle HTTP requests securely.
4. **`routes/*`**: The endpoints are registered on `/api/v1/jobs` and `/api/v1/candidates` and are protected by the `requireAuth` JWT middleware.

## Available Endpoints:
### Jobs (`/api/v1/jobs`)
- `POST /` - Create a new Job Opening
- `GET /` - Fetch all jobs
- `GET /:id` - Fetch details for a specific job
- `PATCH /:id/close` - Mark a job as closed

### Candidates (`/api/v1/candidates`)
- `GET /` - Fetch all candidates in the Talent Pool
- `GET /:id` - Fetch candidate profile and past applications

## Note on Candidate Creation:
There is no `POST /api/v1/candidates` endpoint. This is intentional. As per our architecture, Candidates are created automatically by the **FastAPI AI Pipeline** when resumes are uploaded in bulk.

## Bug Fix:
- Replaced `ts-node` with `tsx` as the dev runtime due to a compatibility issue with Node.js v24 and TypeScript v7. The `dev` script in `package.json` now uses `tsx watch src/index.ts`.

## Verification:
- TypeScript compiles cleanly with zero errors (`npm run typecheck`).
