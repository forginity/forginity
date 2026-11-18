# TASK IMPLEMENTATION GUIDE: TASK-04 - Session Storage, Refresh & Logout Engine

- **Service:** `mobile_apps/pikyrider`
- **Domain:** TrackRide / PikyRider Mobile Rider Authentication & Onboarding
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Authoritative API Source of Truth:** [`services/auth/README.md`](../../services/auth/README.md#group-f-session-lifecycle--token-management) and [`Section 6 (Mobile Integration Guidelines)`](../../services/auth/README.md#6-client-integration--mobile-best-practices-pikyrider--expo)

---

## 1. SUMMARY & GOAL

Implement enterprise-grade mobile session persistence, silent background token refresh, cold-start session hydration, and explicit single-device logout for the PikyRider mobile app.
Session tokens (`accessToken` and `refreshToken`) are stored in hardware-backed secure storage via `expo-secure-store` with web environment fallbacks.
On cold-start, the app inspects secure storage, performs silent token rotation against `POST /api/auth/session/refresh`, restores user profile details via `GET /api/auth/session/me`, and smoothly boots riders into the authenticated app canvas without prompting for re-login.
On sign-out, the app invalidates the session on `services/auth` via `POST /api/auth/session/revoke`, wipes secure storage, resets application state, and routes riders to the welcome screen.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `mobile_apps/pikyrider/src/services/session-storage.service.ts`: Hardware-backed token storage manager with `expo-secure-store` (`forginity_access_token` and `forginity_refresh_token`).
  - `mobile_apps/pikyrider/src/services/session-manager.service.ts`: High-level session orchestration orchestrating hydration, silent refresh, and remote revocation.
- **Files to Modify:**
  - `mobile_apps/pikyrider/src/types/auth-api.types.ts`: Add `RefreshSessionPayload`, `RevokeSessionPayload`, and `SessionMeResponse` types.
  - `mobile_apps/pikyrider/src/services/auth-api.service.ts`: Add `refreshSession`, `revokeSession`, and `getCurrentSession` methods.
  - `mobile_apps/pikyrider/src/app/(onboarding)/otp.tsx`: Persist tokens to SecureStore when returning user authenticates.
  - `mobile_apps/pikyrider/src/app/(onboarding)/country.tsx`: Persist tokens to SecureStore when new user finishes onboarding.
  - `mobile_apps/pikyrider/src/app/(app)/index.tsx`: Connect "Sign out" button to call `sessionManager.logout()`.
  - `mobile_apps/pikyrider/src/app/_layout.tsx`: Hydrate session on app launch before hiding splash screen.

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Add Session Lifecycle API Types
- **Target File:** `mobile_apps/pikyrider/src/types/auth-api.types.ts`
- **Action:**
  - Define `RefreshSessionResponse`: `{ success: boolean; session: SessionData }`
  - Define `RevokeSessionResponse`: `{ success: boolean; message: string }`
  - Define `SessionMeResponse`: `{ success: boolean; session: any; user: UserProfileSummary }`

### Step 2: Implement Session Endpoints in Auth API Service
- **Target File:** `mobile_apps/pikyrider/src/services/auth-api.service.ts`
- **Action:**
  - Implement `refreshSession(refreshToken: string): Promise<RefreshSessionResponse>` targeting `POST /api/auth/session/refresh`.
  - Implement `revokeSession(refreshToken?: string, accessToken?: string): Promise<RevokeSessionResponse>` targeting `POST /api/auth/session/revoke`.
  - Implement `getCurrentSession(accessToken: string): Promise<SessionMeResponse>` targeting `GET /api/auth/session/me`.

### Step 3: Implement Hardware-Backed Session Storage Service
- **Target File:** `mobile_apps/pikyrider/src/services/session-storage.service.ts`
- **Action:**
  - Integrate `expo-secure-store` to save, retrieve, and delete `forginity_access_token` and `forginity_refresh_token`.
  - Provide fallback for non-native / web test environments.

### Step 4: Implement Session Manager & Cold-Start Hydration
- **Target File:** `mobile_apps/pikyrider/src/services/session-manager.service.ts`
- **Action:**
  - Implement `hydrateSession()`:
    - Read stored refresh token.
    - If present, call `refreshSession(refreshToken)`.
    - Fetch fresh user profile via `getCurrentSession(newAccessToken)`.
    - Populate Zustand store and mark `isAuthenticated = true`.
    - If token is revoked (`401`), clear storage and reset store.
  - Implement `logout()`:
    - Revoke session on backend.
    - Wipe secure store tokens.
    - Reset store state.

### Step 5: Wire Storage in Auth Flows & Sign Out
- **Target Files:**
  - `mobile_apps/pikyrider/src/app/(onboarding)/otp.tsx`
  - `mobile_apps/pikyrider/src/app/(onboarding)/country.tsx`
  - `mobile_apps/pikyrider/src/app/(app)/index.tsx`
  - `mobile_apps/pikyrider/src/app/_layout.tsx`
- **Action:**
  - Save tokens to SecureStore on successful authentication in `otp.tsx` and `country.tsx`.
  - Trigger `sessionManager.hydrateSession()` in root layout `_layout.tsx`.
  - Wire `handleSignOut` in `(app)/index.tsx` to `sessionManager.logout()`.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter pikyrider typecheck
pnpm --filter pikyrider lint
```

Test scenarios to cover:
- **Hardware-Backed Storage:** Tokens successfully saved and retrieved from SecureStore.
- **Silent Refresh:** Stored refresh token rotated and new access token issued without user disruption.
- **Session Revocation & Logout:** Logout deletes hardware tokens, notifies `services/auth`, resets Zustand store, and navigates to welcome screen.
- **Cold-Start Hydration:** Valid stored credentials restore rider session immediately on app launch.

---

## 5. SECURITY & GUARDRAILS

- [x] **Authoritative Service README Grounding.** Follows [`services/auth/README.md`](../../services/auth/README.md#group-f-session-lifecycle--token-management) and Section 6.
- [x] **Hardware-Backed Secure Storage.** Avoids unencrypted local storage; uses `expo-secure-store`.
- [x] **No `.env` touched.** Secrets and API URLs read strictly via `process.env`.
- [x] **Lexend Typography Only.** Retains single-font organization rule.

---

## 6. RECORD UPDATE

1. Mark task as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update the **LAST UPDATE** block and append task row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh the component row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
