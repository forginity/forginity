# TASK IMPLEMENTATION GUIDE: TASK-01 - Mobile Email Authentication Flow (Sign-in / Sign-up)

- **Service:** `mobile_apps/pikyrider`
- **Domain:** TrackRide / PikyRider Mobile Rider Authentication & Onboarding
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Authoritative API Source of Truth:** [`services/auth/README.md`](../../services/auth/README.md#group-c-unified-passwordless-email-authentication)

---

## 1. SUMMARY & GOAL

Implement the passwordless email authentication initiation flow for the PikyRider mobile app.
When a rider enters their email address on `/(onboarding)/auth` (navigated from `/(onboarding)/welcome` via "Sign up" or "Sign in"), the client validates the email using Zod, submits an initiate request to `POST /api/auth/email/initiate` on `services/auth` (Port 3001), captures `{ success, isNewUser, requestId, expiresInSeconds, cooldownSeconds }`, persists the request context in the Zustand onboarding store, and transitions the rider to the 6-digit OTP verification screen (`/(onboarding)/otp`).

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `mobile_apps/pikyrider/src/services/auth-api.service.ts`: Type-safe mobile HTTP client for `services/auth`, implementing `initiateEmailAuth` and standardizing error normalization.
  - `mobile_apps/pikyrider/src/types/auth-api.types.ts`: TypeScript contracts derived from [`services/auth/README.md`](../../services/auth/README.md).
- **Files to Modify:**
  - `mobile_apps/pikyrider/src/store/useOnboardingStore.ts`: Add `requestId`, `isNewUser`, and session initiation state actions.
  - `mobile_apps/pikyrider/src/app/(onboarding)/auth.tsx`: Wire email input to `authApiService.initiateEmailAuth`, handling loading states, validation, error toasts, and navigation to `/(onboarding)/otp`.
  - `mobile_apps/pikyrider/src/app/(onboarding)/otp.tsx`: Fix typed route navigation fallback referencing `/(onboarding)/auth`.
  - `mobile_apps/pikyrider/src/components/formElement/CustomInput.tsx`: Fix React Native 0.88 / React 19 `TextInput` ref typing.
  - `mobile_apps/pikyrider/src/components/formElement/OtpInput.tsx`: Fix React Native 0.88 `TextInput` and `TextInputKeyPressEvent` typing.
  - `mobile_apps/pikyrider/src/app/(onboarding)/profile.tsx`: Fix React Native 0.88 `ScrollView` and `TextInput` ref typing.

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Define Mobile Auth API Contracts & Service
- **Target Files:**
  - `mobile_apps/pikyrider/src/types/auth-api.types.ts`
  - `mobile_apps/pikyrider/src/services/auth-api.service.ts`
- **Action:**
  - Derive types matching `services/auth/README.md` Group C (`POST /api/auth/email/initiate`):
    - `InitiateEmailAuthPayload`: `{ email: string; productName?: string; intent?: "authentication" | "sign_in" }`
    - `InitiateEmailAuthResponse`: `{ success: boolean; isNewUser: boolean; requestId: string; expiresInSeconds: number; cooldownSeconds: number; debugOtp?: string }`
    - `AuthApiError`: `{ error: string; code?: string; remainingAttempts?: number }`
  - Implement `initiateEmailAuth`:
    - Base URL: `process.env.EXPO_PUBLIC_AUTH_API_URL || Platform.select({ ios: "http://localhost:3001", android: "http://10.0.2.2:3001", default: "http://localhost:3001" })`
    - Submit JSON payload to `/api/auth/email/initiate`.
    - Catch and parse 400, 403, 404, 429 errors into user-friendly messages.

### Step 2: Extend Onboarding Store (`useOnboardingStore`)
- **Target File:** `mobile_apps/pikyrider/src/store/useOnboardingStore.ts`
- **Action:**
  - Add `requestId: string | null`, `isNewUser: boolean | null`, `cooldownSeconds: number | null`.
  - Add actions: `setRequestId(requestId: string | null)`, `setIsNewUser(isNewUser: boolean | null)`, and `setAuthInitiateData(data: { requestId: string; isNewUser: boolean; cooldownSeconds: number })`.

### Step 3: Wire Email Entry Screen (`/(onboarding)/auth.tsx`)
- **Target File:** `mobile_apps/pikyrider/src/app/(onboarding)/auth.tsx`
- **Action:**
  - Validate email using `emailSchema`.
  - Call `authApiService.initiateEmailAuth({ email, productName: "TrackRide", intent: "authentication" })`.
  - Show activity spinner on button during network submission (`loading={isSubmitting}`).
  - On success: store `requestId` and `isNewUser` in Zustand, then call `router.push("/(onboarding)/otp")`.
  - On error: display error message below input or banner.

### Step 4: Resolve React Native 0.88 / React 19 Component Ref Typings
- **Target Files:**
  - `mobile_apps/pikyrider/src/components/formElement/CustomInput.tsx`
  - `mobile_apps/pikyrider/src/components/formElement/OtpInput.tsx`
  - `mobile_apps/pikyrider/src/app/(onboarding)/profile.tsx`
  - `mobile_apps/pikyrider/src/app/(onboarding)/otp.tsx`
- **Action:**
  - Update `TextInput` ref types to `ElementRef<typeof TextInput>` / `React.ComponentRef<typeof TextInput>` or `any`.
  - Update `ScrollView` ref types to `ElementRef<typeof ScrollView>`.
  - Update `otp.tsx` back navigation to `/(onboarding)/auth`.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
# Verify strict TypeScript typecheck
pnpm --filter pikyrider exec tsc --noEmit

# Run ESLint validation
pnpm --filter pikyrider lint
```

Test scenarios covered:
- **Happy Path:** Valid email initiates OTP dispatch, receives `requestId`, stores context, and navigates to `/(onboarding)/otp`.
- **Validation Failure:** Malformed email triggers client-side Zod error message without making network calls.
- **Rate Limit / Cooldown:** API returning 429 `COOLDOWN_ACTIVE` renders "Please wait X seconds before requesting another verification code."
- **Account Blocked / Moderation:** API returning 403 `ACCOUNT_BLOCKED` renders "Account is blocked. Please contact support."

---

## 5. SECURITY & GUARDRAILS

- [ ] **No `.env` touched.** Secrets read strictly from `process.env`.
- [ ] **Input validation.** Emails parsed through client-side Zod `emailSchema` before dispatch.
- [ ] **Zero credential exposure.** Only opaque `requestId` stored in client state; OTP codes never logged or leaked.

---

## 6. RECORD UPDATE

1. Mark `TASK-01` as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update the **LAST UPDATE** block and append task row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh the component row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
