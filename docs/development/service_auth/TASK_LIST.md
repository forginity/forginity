# TASK LIST: SERVICE_AUTH

## 1. SERVICE DETAILS

- **Service Name:** `services/auth`
- **Domain:** Centralized Single Sign-On (SSO), Identity, and User Accounts
- **Purpose:** Provides unified authentication and onboarding across Forginity products. Issues scoped session JWTs and manages user profiles.
- **Key Features & Flows:**
  - Passwordless Sign-in/Sign-up with Email + OTP.
  - Passwordless Sign-in/Sign-up with Phone Number + OTP.
  - Social Sign-in/Sign-up with Google OAuth 2.0 / OIDC.
  - Unified Onboarding collecting First Name, Last Name, Gender, and Country.
  - Hybrid Sessions: 15-minute scoped JWT access tokens with 30-day refresh sessions stored in `auth_db.sessions` and Redis.
  - Cross-product switching for TrackRide and other Forginity applications.
- **Tech Stack:** Express, TypeScript, PostgreSQL 18, Drizzle ORM, Zod, Redis 7, `argon2id`.
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](file:///home/vikas/Documents/forginity/docs/development/service_auth/IMPLEMENTATIONS_RECORD.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Scaffold `services/auth` package and configs | Base Express app, tsconfig, drizzle config | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-02` | Database schemas (`users`, `otps`, `sessions`, `user_products`) | `src/db/auth.schema.ts` | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-03` | Zod validators and Onboarding DTOs | `src/db/auth.validator.ts` | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-04` | Repository layer for users, OTPs, and sessions | `src/repositories/*.repository.ts` | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-05` | Service logic (OTP, Google, Onboarding, Sessions) | `src/services/*.service.ts` | [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-06` | Express routes, auth guards, and middleware | `src/routes/*.route.ts` | [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-07` | Comprehensive test suite | Unit and integration tests | [`TASK_07_IMPLEMENTATION_GUIDE.md`](./TASK_07_IMPLEMENTATION_GUIDE.md) | `PENDING` |
