# TeamBoard

A lightweight work management platform — projects with multiple tasks, JWT-based auth, and a
React frontend talking to a NestJS API over a clean REST contract.

Built for the Heunets full-stack assessment. This document covers setup, architecture, and the
reasoning behind the trade-offs made.

## Live demo

- **Frontend:** https://taiwobamgboye-heunets-assessment.netlify.app
- **Backend API:** https://heunets-assessment-production.up.railway.app/api
- **Swagger docs:** https://heunets-assessment-production.up.railway.app/api/docs

Frontend on Netlify, API on Railway, database on MongoDB Atlas. Signup, login, project, and task
flows are wired end-to-end against this deployment — not just a local-only setup.

## Stack

| Layer    | Choice                                                            |
| -------- | ------------------------------------------------------------------ |
| Backend  | NestJS, TypeScript, MongoDB, Mongoose, Passport-JWT, class-validator |
| Frontend | React 18, Vite, TypeScript, React Router, TanStack Query, React Hook Form, Tailwind CSS |
| Testing  | Jest + Supertest (backend unit & e2e, with mongodb-memory-server), Vitest + Testing Library (frontend) |

## Project layout

```
.
├── backend/   NestJS API (auth, projects, tasks)
├── frontend/  React SPA (Vite)
├── docker-compose.yml   optional local orchestration (Mongo + API + SPA)
└── postman_collection.json
```

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB instance — either a local `mongod`, MongoDB Atlas, or via the included
  `docker-compose.yml`

### 1. Backend

```bash
cd backend
cp .env.example .env   # fill in MONGODB_URI / JWT_SECRET
npm install
npm run start:dev
```

The API listens on `http://localhost:3000/api`. Interactive Swagger docs are at
`http://localhost:3000/api/docs`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # defaults to http://localhost:3000/api
npm install
npm run dev
```

The SPA runs on `http://localhost:5173`.

### 3. (Optional) Everything via Docker Compose

```bash
docker compose up --build
```

Spins up MongoDB, the API (port 3000), and the built SPA served by nginx (port 5173).

### Running tests

```bash
# backend
cd backend
npm test           # unit tests
npm run test:e2e   # e2e tests (spins up an in-memory MongoDB, no setup needed)

# frontend
cd frontend
npm test
```

### API testing

Import `postman_collection.json` into Postman. It captures `accessToken`, `projectId`, and
`taskId` into collection variables automatically as you run the Signup → Login → Create Project →
Create Task flow in order.

## Architecture overview

**This is a monolith, deliberately.** A single NestJS application with feature modules
(`auth`, `users`, `projects`, `tasks`) gives the fastest path to a correct, testable system for
this scope — three resources and one cross-cutting concern (auth). Splitting this into real
microservices today would mean distributed transactions for "delete a project and its tasks",
network calls for a check that's currently a function call, and three deployable units to keep in
sync — costs with no corresponding benefit at this scale.

What *is* in place to make a future split realistic:

- **Module boundaries mirror service boundaries.** `AuthModule`, `ProjectsModule`, and
  `TasksModule` only talk to each other through exported providers (`ProjectsService`,
  `UsersService`), never by reaching into another module's schema or repository directly. If
  `ProjectsModule` became its own service tomorrow, the seam is already where the import is.
- **Tasks depend on Projects, not the other way around**, for membership checks
  (`TasksService` calls `ProjectsService.findOneForUser` before touching a task). The one
  exception is cascade-delete: `ProjectsService` deletes a project's tasks directly via the
  `Task` Mongoose model (injected, not via `TasksService`) specifically to avoid a circular
  module dependency. In a microservice world this becomes an event (`project.deleted`) consumed
  by a Tasks service — noted below as the natural next step.
- **DTOs + class-validator at every boundary**, so the validation logic doesn't change shape
  when it moves to a different process.
- **Stateless JWT auth.** Any service that can verify the JWT secret can authenticate a request
  independently — no shared session store to factor out later.

If this needed to scale into real services, the natural split is `AuthService` (issues/verifies
tokens), `ProjectsService` (owns project + membership data), and `TasksService` (owns task data,
subscribes to project-deleted events instead of being called synchronously). An API gateway would
front them; a message broker (RabbitMQ/Redis pub-sub) would replace the in-process cascade-delete
call and any other cross-service side effect.

### Data model

- **User** — `name`, `email` (unique), `passwordHash` (bcrypt, never serialized in API
  responses — `select: false` on the schema field plus a dedicated `UserResponseDto`).
- **Project** — `name`, `description`, `owner` (User ref), `members` (User ref array, owner is
  always a member). Only the owner can update, delete, or add members; any member can view the
  project and manage its tasks.
- **Task** — `title`, `description`, `status` (`todo` / `in_progress` / `done`), `priority`
  (`low` / `medium` / `high`), `project` (ref, required), `assignee` (optional User ref),
  `dueDate`. Tasks are always addressed through their parent project
  (`/projects/:projectId/tasks/...`), which is what makes the membership check a single
  guaranteed step rather than something each endpoint has to remember to do. The frontend task
  board supports drag-and-drop between status columns (`@dnd-kit/core`) in addition to the
  status/assignee dropdowns, with optimistic UI updates (rolled back on failure) and toast
  feedback on create/update/delete.

### Request flow

```
React (Vite)  →  axios (Bearer token attached via interceptor)
              →  NestJS: ValidationPipe → JwtAuthGuard → Controller → Service → Mongoose → MongoDB
              ←  TransformInterceptor wraps success as { success, data }
              ←  AllExceptionsFilter normalizes every error as { success: false, statusCode, message, path, timestamp }
```

Both `main.ts` (real bootstrap) and the e2e test harness call the same `configureApp()` function
(`backend/src/bootstrap.ts`) to install pipes/filters/interceptors — so the test suite is
exercising the exact middleware stack production traffic hits, not a hand-rolled approximation
that could drift out of sync.

## Design decisions & trade-offs

- **JWT access tokens only, no refresh tokens.** Simpler to implement and to reason about for an
  assessment of this scope; the trade-off is a fixed session lifetime (`JWT_EXPIRES_IN`, default
  1 day) with no silent renewal. A production system would add a refresh-token rotation flow.
- **Project membership via an embedded array of ObjectIds**, not a separate join collection. For
  the expected scale (a project with tens of members, not thousands), this keeps "is this user
  allowed in" a single indexed query instead of a join. A `ProjectMember` collection would be the
  right call if per-member metadata (role, joined-at) becomes a requirement.
- **Ownership vs. membership permission model**: any member can read a project and manage its
  tasks; only the owner can rename/delete the project or add members. Good enough for a small
  team tool; a real product would likely want a roles table (`admin` / `editor` / `viewer`).
- **Response envelope (`{ success, data }`) and a single global exception filter** for one
  predictable shape on every endpoint, instead of ad hoc returns per controller — sounds like
  ceremony for 3 resources, pays for itself the moment the frontend stops needing per-endpoint
  response-shape special cases.
- **React Query over Redux Toolkit.** Almost everything this app holds in state is server data
  (projects, tasks); Query gives caching, invalidation, and loading/error states for free, with
  far less boilerplate than thunks + reducers for the same data. The one piece of genuine client
  state — the authenticated user — lives in a small Context provider instead, since it doesn't
  belong in a server cache and there's only one consumer pattern for it.
- **Tailwind for styling.** The brief explicitly deprioritizes visual design in favor of
  functionality and code clarity; Tailwind keeps styling co-located with markup so reviewing a
  component doesn't mean jumping to a separate stylesheet.
- **No Docker requirement.** A `docker-compose.yml` is included for convenience (Mongo + API +
  SPA in one command) but everything also runs with a local Node + MongoDB install — no learning
  curve forced on the reviewer.

## What's intentionally out of scope

- Refresh tokens / logout-everywhere (would need a token blocklist or rotation store).
- Real-time updates (websockets) for collaborative editing — tasks refresh via React Query's
  cache invalidation on mutation, not a live socket feed.
- Role-based permissions beyond owner/member.
- Rate limiting / brute-force protection on auth endpoints.

These were left out deliberately to keep the implementation focused and reviewable, not because
they were overlooked — happy to talk through how I'd add any of them.
