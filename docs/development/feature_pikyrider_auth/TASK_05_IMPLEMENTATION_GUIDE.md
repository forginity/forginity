# TASK IMPLEMENTATION GUIDE: TASK-05 - Google Social Authentication (Sign-in / Sign-up)

- **Service:** `mobile_apps/pikyrider`
- **Domain:** TrackRide / PikyRider Mobile Rider Authentication & Onboarding
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Authoritative API Source of Truth:** [`services/auth/README.md`](../../services/auth/README.md#group-d-google-oauth-20--social-sso) (`POST /api/auth/google`)

---

## 1. SUMMARY & GOAL

Implement Google Social Authentication for PikyRider (`mobile_apps/pikyrider`) using `expo-auth-session`.
Riders can authenticate with a single tap on the "Continue with Google" button on `(onboarding)/welcome`.
The mobile app retrieves a cryptographically signed Google ID token via Google OIDC and dispatches it to `services/auth` at `POST /api/auth/google`.
- For **returning onboarded users**, the service establishes a session, returns `accessToken` and `refreshToken`, which are saved to `Expo SecureStore`, and routes directly into the authenticated Home canvas (`(app)`).
- For **new or un-onboarded users**, the service returns a scoped 2-hour `onboardingToken` and pre-populates name and avatar metadata. The app navigates to `/(onboarding)/profile` so the user can verify their unique username, choose gender and country, and complete profile setup.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `mobile_apps/pikyrider/src/services/google-auth.service.ts`: Client-side Google OIDC sign-in driver using `expo-auth-session`.
- **Files to Modify:**
  - `mobile_apps/pikyrider/src/types/auth-api.types.ts`: Add `GoogleAuthPayload` and `GoogleAuthResponse` contracts.
  - `mobile_apps/pikyrider/src/services/auth-api.service.ts`: Add `authenticateGoogle` endpoint caller.
  - `mobile_apps/pikyrider/src/store/useOnboardingStore.ts`: Hydrate Google avatar and metadata in user profile.
  - `mobile_apps/pikyrider/src/app/(onboarding)/welcome.tsx`: Wire the "Continue with Google" button, error banner, and routing.

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Add Google Auth API Contract Types
- **Target File:** `mobile_apps/pikyrider/src/types/auth-api.types.ts`
- **Action:**
  - Define `GoogleAuthPayload`: `{ idToken: string; productId?: string }`
  - Define `GoogleAuthResponse`: Discriminated union between returning session (`isOnboarded: true`) and onboarding token (`isOnboarded: false`).

### Step 2: Implement Google Authentication in Auth API Service
- **Target File:** `mobile_apps/pikyrider/src/services/auth-api.service.ts`
- **Action:**
  - Add `authenticateGoogle(payload: GoogleAuthPayload): Promise<GoogleAuthResponse>` dispatching `POST /api/auth/google`.
  - Handle `401 INVALID_TOKEN` and `403 ACCOUNT_BLOCKED` errors cleanly via `AuthApiError`.

### Step 3: Implement Google Auth Service Driver
- **Target File:** `mobile_apps/pikyrider/src/services/google-auth.service.ts`
- **Action:**
  - Implement `promptGoogleSignIn(): Promise<{ idToken: string } | null>` using `expo-auth-session` with Google OIDC discovery (`https://accounts.google.com/.well-known/openid-configuration`).
  - Read client IDs from environment (`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`).
  - Include dev mock fallback when `EXPO_PUBLIC_ENABLE_GOOGLE_MOCK=true` or when Google credentials are omitted in development mode.

### Step 4: Update Onboarding Store Hydration
- **Target File:** `mobile_apps/pikyrider/src/store/useOnboardingStore.ts`
- **Action:**
  - Ensure `setCurrentUser` retains Google `avatarUrl` and populates `profile.firstName` and `profile.lastName`.

### Step 5: Wire Welcome Screen
- **Target File:** `mobile_apps/pikyrider/src/app/(onboarding)/welcome.tsx`
- **Action:**
  - Connect "Continue with Google" button to `handleGoogleSignIn`.
  - On returning user: save tokens to SecureStore, set user, and enter Home.
  - On new user: save `onboardingToken`, set user, and route to `/(onboarding)/profile`.
  - Show loading spinner and inline error message if sign-in fails.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter pikyrider typecheck
pnpm --filter pikyrider lint
```

Test scenarios to cover:
- **Returning User:** Receives session tokens, persists to SecureStore, `isAuthenticated` flips to `true`, and Home renders.
- **New User:** Receives `onboardingToken`, navigates to `/(onboarding)/profile` with names pre-filled.
- **Dismissed/Cancelled:** User cancels dialog, app stays on `welcome` screen without error.
- **Server Error:** Backend returns 401 or 403, error banner displays in UI.

---

## 5. SECURITY & GUARDRAILS

- [x] **No `.env` touched.** Secrets read strictly from `process.env`.
- [x] **Input validation.** All external inputs validated through Zod and API types.
- [x] **Secure token storage.** Tokens stored exclusively in hardware-backed `Expo SecureStore`.

---

## 6. RECORD UPDATE

1. Mark task as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update the **LAST UPDATE** block and append task row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh the component row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
