# TASK LIST: FEATURE_PIKYRIDER_AUTH

## 1. FEATURE DETAILS

- **Feature Name:** `mobile_apps/pikyrider` (Authentication & Session Suite)
- **Domain:** TrackRide / PikyRider Mobile Authentication & Onboarding
- **Purpose:** Secure rider authentication, sign-up, login, profile onboarding, and session persistence for the PikyRider mobile app via integration with `services/auth`.
- **Key Features & Flows:**
  - Mobile authentication client with `services/auth` interceptors.
  - Mobile phone and email OTP sign-up flow.
  - Sign-in and hardware-backed credential storage (`Expo SecureStore`).
  - Rider profile onboarding screen (rider handle, bike details, emergency contact).
  - Silent token refresh and session guard routing.
- **Tech Stack:** React Native, Expo, TypeScript, `expo-secure-store`, Zod.
- **Reference Specification:** [`./README.md`](./README.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](file:///home/vikas/Documents/forginity/docs/development/feature_pikyrider_auth/IMPLEMENTATIONS_RECORD.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Mobile Auth Client & Secure Storage Foundation | HTTP client configured with `services/auth`, `Expo SecureStore` wrappers | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-02` | Mobile Phone & Email OTP Sign-Up Flow | Registration screens, OTP code entry, client Zod validation | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-03` | Mobile Sign-In & Session Hydration | Sign-in screen, JWT token storage, automatic cold-start session restore | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-04` | Mobile Rider Onboarding Screen | Post-registration profile view: handle, motorcycle model, emergency contact | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-05` | Token Refresh, Session Guard & Logout | Auto-refresh interceptor, protected navigation guards, complete session logout | [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Mobile Auth Client & Secure Storage Foundation
- **Description:** Implement networking client pointing to `services/auth` with Bearer token injection.
  Set up `expo-secure-store` wrapper for reading and writing access and refresh tokens.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-02`: Mobile Phone & Email OTP Sign-Up Flow
- **Description:** Build sign-up UI accepting phone number or email address.
  Connect to OTP request endpoint in `services/auth` and provide 6-digit verification code screen.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-03`: Mobile Sign-In & Session Hydration
- **Description:** Build sign-in screen supporting existing credentials and one-tap restore.
  Hydrate auth state on application startup to bypass login for active sessions.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-04`: Mobile Rider Onboarding Screen
- **Description:** Build profile onboarding screen collecting rider handle, motorcycle model, and emergency phone.
  Submit payload to `services/auth` profile endpoint and transition user to map screen.
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-05`: Token Refresh, Session Guard & Logout
- **Description:** Implement Axios/fetch response interceptor that transparently handles token expiry using refresh tokens.
  Build logout action that flushes SecureStore tokens and clears rider state.
- **Guide:** [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)
