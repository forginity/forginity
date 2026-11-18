# TASK IMPLEMENTATION GUIDE: TASK-02 - OTP Code Verification Screen (Sign-in / Sign-up)

- **Service:** `mobile_apps/pikyrider`
- **Domain:** TrackRide / PikyRider Mobile Rider Authentication & Onboarding
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Authoritative API Source of Truth:** [`services/auth/README.md`](../../services/auth/README.md#group-c-unified-passwordless-email-authentication)

---

## 1. SUMMARY & GOAL

Implement the 6-digit OTP verification screen for the PikyRider mobile app.
When a rider arrives on `/(onboarding)/otp` after entering their email, the screen renders a 6-box numeric input with auto-focus, paste detection, countdown timer, and resend trigger.
When the rider submits their 6-digit code, the client calls `authApiService.verifyEmailAuth` targeting `POST /api/auth/email/verify` on `services/auth` (Port 3001).
- **Case 1: Returning Onboarded Rider (`isOnboarded: true`)**: Stores session tokens (`accessToken`, `refreshToken`), sets authentication state, populates profile data, and navigates immediately into the main application canvas (`/(app)`).
- **Case 2: First-Time / Un-onboarded Rider (`isOnboarded: false`)**: Captures scoped `onboardingToken` and transitions rider to the mandatory Profile Onboarding screen (`/(onboarding)/profile`).

---

## 2. SCOPE OF CHANGES

- **Files to Modify:**
  - `mobile_apps/pikyrider/src/types/auth-api.types.ts`: Ensure complete alignment with `services/auth/README.md` Group C.
  - `mobile_apps/pikyrider/src/store/useOnboardingStore.ts`: Add `currentUser` state, `setCurrentUser` action, and helper to hydrate user attributes into local profile.
  - `mobile_apps/pikyrider/src/components/formElement/OtpInput.tsx`: Add optional `autoFocus` prop to automatically focus the first box on mount.
  - `mobile_apps/pikyrider/src/app/(onboarding)/otp.tsx`: Wire full backend verification to `authApiService.verifyEmailAuth`, real 60s cooldown timer, live "Resend code" calling `authApiService.initiateEmailAuth`, detailed attempt-counter error feedback, and route branch (`/(app)` vs `/(onboarding)/profile`).

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Update Onboarding Store with User Details
- **Target File:** `mobile_apps/pikyrider/src/store/useOnboardingStore.ts`
- **Action:**
  - Import `UserProfileSummary` from `../types/auth-api.types`.
  - Add `currentUser: UserProfileSummary | null` to `OnboardingState`.
  - Add `setCurrentUser: (user: UserProfileSummary | null) => void` action.
  - In `setCurrentUser`, automatically synchronize `profile.firstName`, `profile.lastName`, and `gender` if present on the returned user object.

### Step 2: Enhance OtpInput with Auto-Focus Support
- **Target File:** `mobile_apps/pikyrider/src/components/formElement/OtpInput.tsx`
- **Action:**
  - Add `autoFocus?: boolean` prop (default: `true`).
  - Add `useEffect` to focus `inputRefs.current[0]` after mount if `autoFocus` is true.

### Step 3: Implement Full OTP Verification & Resend in Screen
- **Target File:** `mobile_apps/pikyrider/src/app/(onboarding)/otp.tsx`
- **Action:**
  - Read `requestId`, `identifier`, `cooldownSeconds`, and `flow` from `useOnboardingStore`.
  - Initialize countdown timer to `cooldownSeconds || 60`.
  - Implement `handleVerify`:
    - Validate with `otpSchema`.
    - Guard against missing `requestId` (prompt redirect back to auth).
    - Dispatch `authApiService.verifyEmailAuth({ requestId, code, intent: "authentication" })`.
    - If `response.isOnboarded === true`:
      - Store tokens via `setSessionTokens(response.session.accessToken, response.session.refreshToken)`.
      - Store user via `setCurrentUser(response.user)`.
      - Navigate with `router.replace("/(app)")`.
    - If `response.isOnboarded === false`:
      - Store `onboardingToken` via `setOnboardingToken(response.onboardingToken)`.
      - Store user via `setCurrentUser(response.user)`.
      - Navigate with `router.push("/(onboarding)/profile")`.
    - Catch errors:
      - Display `err.message` or `remainingAttempts` counter.
  - Implement `handleResend`:
    - Dispatch `authApiService.initiateEmailAuth({ email: identifier, productName: "TrackRide", intent: "authentication" })`.
    - Update store `requestId` and restart countdown with returned `cooldownSeconds`.
    - Display brief confirmation notice banner.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter pikyrider typecheck
pnpm --filter pikyrider lint
```

Test scenarios to cover:
- **Happy Path (Returning User):** Submits 6-digit code, receives session tokens, redirects to `/(app)`.
- **Happy Path (New User):** Submits 6-digit code, receives `onboardingToken`, redirects to `/(onboarding)/profile`.
- **Invalid Code Failure:** Submits incorrect code, receives `400 Bad Request` with `remainingAttempts`, renders localized error message below OTP boxes.
- **Expired Request:** When `requestId` expires, displays guidance to resend code.
- **Resend Flow:** Resend button triggers new OTP dispatch, resets 60s countdown, and displays confirmation notice.

---

## 5. SECURITY & GUARDRAILS

- [x] **Authoritative Service README Grounding.** Follows [`services/auth/README.md`](../../services/auth/README.md#group-c-unified-passwordless-email-authentication).
- [x] **No `.env` touched.** Secrets and API URLs read strictly via `process.env`.
- [x] **Input validation.** All OTP codes parsed and validated via Zod `otpSchema`.
- [x] **Lexend Typography Only.** Retains single-font organization rule.

---

## 6. RECORD UPDATE

1. Mark task as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update the **LAST UPDATE** block and append task row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh the component row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
