# TASK LIST: FEATURE_PIKYRIDER_AUTH

## 1. FEATURE DETAILS

- **Feature Name:** `mobile_apps/pikyrider` (Authentication & Session Suite)
- **Domain:** TrackRide / PikyRider Mobile Rider Authentication & Onboarding
- **Purpose:** Secure rider authentication, passwordless email login, Google SSO, rider profile onboarding, hardware-backed session storage, profile management, and logout for the PikyRider mobile app via integration with `services/auth`.
- **Key Features & Flows:**
  - Passwordless Email entry (sign-in / sign-up initiate with `isNewUser` detection).
  - 6-digit OTP code verification screen with timer countdown and resend trigger.
  - Mandatory Rider Profile Onboarding screen (First Name, Last Name, Gender, Country).
  - Session persistence in hardware-backed storage (`Expo SecureStore`), silent background token refresh, and explicit logout.
  - Profile and Emergency Contact management screen.
  - Google Social Sign-In / Sign-Up federation.
  - Phased build, typecheck, and automated test suites.
- **Tech Stack:** React Native, Expo, TypeScript, `expo-secure-store`, Zod, `@react-native-google-signin/google-signin` / Expo AuthSession, Jest/Vitest.
- **Component Status:** `PENDING` (0/9 tasks completed; target deadline: **Next Sunday, 2026-11-22**).
- **Central Implementation Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Overall Progress:** [`../PROGRESS.md`](../PROGRESS.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Email Authentication Flow (Sign-in / Sign-up) | Email input screen, Zod format validation, `POST /api/auth/email/initiate` dispatch | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-02` | OTP Code Verification Screen (Sign-in / Sign-up) | 6-digit numeric input with auto-focus, countdown timer, `POST /api/auth/email/verify` verification | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-03` | Rider Profile Onboarding Screen (Sign-up) | First Name, Last Name, Gender, ISO Country code picker, `POST /api/auth/onboarding` submission | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-04` | Session Storage, Refresh & Logout Engine | `Expo SecureStore` token storage, silent background refresh, cold-start hydration, and `POST /api/auth/logout` | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-05` | Rider Profile & Settings Management Screen | Profile screen at `/profile`, update personal metadata via `PUT /api/users/me`, linked emergency contacts | [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-06` | Phase 1 Mobile Build & Verification Test Suite | Unit tests for auth state machine, navigation guards, token storage mocking, and Expo typecheck | [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-07` | Google Social Authentication (Sign-in / Sign-up) | Native 1-tap Google Sign-In button, ID token retrieval, `POST /api/auth/google` session exchange | [`TASK_07_IMPLEMENTATION_GUIDE.md`](./TASK_07_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-08` | Phase 2 Mobile Build & Parity Test Suite | End-to-end regression tests verifying Google Auth and Email OTP parity, EAS local build validation | [`TASK_08_IMPLEMENTATION_GUIDE.md`](./TASK_08_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-09` | Hardening, Error Handling & Offline State Management | Network disconnect banner, graceful retry handling, token expiration interceptor recovery | [`TASK_09_IMPLEMENTATION_GUIDE.md`](./TASK_09_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Email Authentication Flow (Sign-in / Sign-up)
- **Description:** Implement clean, responsive mobile email entry screen.
  Validate email format via client-side Zod schema.
  Submit request to `POST /api/auth/email/initiate` in `services/auth`, receive `{ isNewUser, requestId, expiresInSeconds }`, and transition to OTP verification screen.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md)

### `TASK-02`: OTP Code Verification Screen (Sign-in / Sign-up)
- **Description:** Build 6-digit numeric OTP code input screen with auto-focus, paste support, and a 60-second resend countdown timer.
  Submit `requestId` and `code` to `POST /api/auth/email/verify`.
  If returning onboarded user, receive `{ accessToken, refreshToken }` and transition to Home canvas.
  If new user, receive `onboardingToken` and route to Onboarding screen.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md)

### `TASK-03`: Rider Profile Onboarding Screen (Sign-up)
- **Description:** Implement mandatory profile setup screen guarded by `onboardingToken`:
  - Collect First Name, Last Name, Gender (`male`, `female`, `other`), and ISO 3166-1 alpha-2 Country code.
  - Submit payload to `POST /api/auth/onboarding`.
  - Receive production access and refresh tokens, mark user onboarded, and navigate into the app.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md)

### `TASK-04`: Session Storage, Refresh & Logout Engine
- **Description:** Implement mobile session management service:
  - Store JWT access and refresh tokens securely in hardware-backed `Expo SecureStore`.
  - Silent background token refresh interceptor using `POST /api/auth/session/refresh`.
  - Cold-start session hydration to restore rider state instantly when opening the app.
  - Single-device logout action invoking `POST /api/auth/logout` and clearing SecureStore tokens.
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md)

### `TASK-05`: Rider Profile & Settings Management Screen
- **Description:** Build user profile screen allowing riders to view their account info, update display name, gender, country, and avatar URL via `PUT /api/users/me`.
  Manage emergency contacts (add, edit, remove emergency phone contacts) via `/api/users/me/emergency-contacts`.
- **Guide:** [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md)

### `TASK-06`: Phase 1 Mobile Build & Verification Test Suite
- **Description:** Execute comprehensive automated test verification for Phase 1:
  - Unit tests for auth state slice, token storage mock, and Zod validator schemas.
  - Verify protected route navigation redirects when unauthenticated.
  - Typecheck mobile codebase (`tsc --noEmit`).
- **Guide:** [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md)

### `TASK-07`: Google Social Authentication (Sign-in / Sign-up)
- **Description:** Integrate native Google Sign-In SDK for 1-tap authentication:
  - Request user Google ID token.
  - Send ID token to `POST /api/auth/google` in `services/auth`.
  - Handle automatic avatar extraction from Google profile picture (`claims.picture`).
  - Seamlessly route to Home canvas if onboarded, or prompt Onboarding if first-time user.
- **Guide:** [`TASK_07_IMPLEMENTATION_GUIDE.md`](./TASK_07_IMPLEMENTATION_GUIDE.md)

### `TASK-08`: Phase 2 Mobile Build & Parity Test Suite
- **Description:** Verify full authentication feature set:
  - Verify parity between Google OAuth and Email OTP sessions.
  - Verify multi-account switching and token invalidation on logout.
  - Run EAS build dry-run / local build command to verify native dependencies compile cleanly.
- **Guide:** [`TASK_08_IMPLEMENTATION_GUIDE.md`](./TASK_08_IMPLEMENTATION_GUIDE.md)

### `TASK-09`: Hardening, Error Handling & Offline State Management
- **Description:** Final polish and edge case hardening:
  - Offline connectivity banner when cell signal drops during authentication attempts.
  - User-friendly error toast notifications for rate limits, expired OTPs, and network drops.
  - Verify graceful recovery when refresh tokens expire or are revoked from another device.
- **Guide:** [`TASK_09_IMPLEMENTATION_GUIDE.md`](./TASK_09_IMPLEMENTATION_GUIDE.md)
