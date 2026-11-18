# TASK IMPLEMENTATION GUIDE: TASK-03 - Rider Profile Onboarding Screen (Sign-up)

- **Service:** `mobile_apps/pikyrider`
- **Domain:** TrackRide / PikyRider Mobile Rider Authentication & Onboarding
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Authoritative API Source of Truth:** [`services/auth/README.md`](../../services/auth/README.md#group-e-rider-profile-onboarding)

---

## 1. SUMMARY & GOAL

Implement the mandatory Rider Profile Onboarding submission for newly registered riders in `mobile_apps/pikyrider`.
When a rider signs up and verifies their OTP, `services/auth` returns an `onboardingToken` and directs them through the multi-step onboarding wizard (Profile details, Gender identity, and Country of residence).
On the final step (`country.tsx`), upon tapping "Finish setup", the app compiles the collected profile details, normalizes gender to the backend enum (`male`, `female`, `other`, `prefer_not_to_say`), converts country to uppercase 2-letter ISO 3166-1 alpha-2, and submits a request to `POST /api/auth/onboarding` with `Authorization: Bearer <onboardingToken>`.
Upon receipt of the production `accessToken` and `refreshToken`, the app establishes the authenticated rider session and routes into `/(app)`.

---

## 2. SCOPE OF CHANGES

- **Files to Modify:**
  - `mobile_apps/pikyrider/src/types/auth-api.types.ts`: Add `OnboardingPayload` and `OnboardingResponse` contracts matching `services/auth/README.md` Group E.
  - `mobile_apps/pikyrider/src/services/auth-api.service.ts`: Add `submitOnboarding(payload, onboardingToken)` method.
  - `mobile_apps/pikyrider/src/app/(onboarding)/country.tsx`: Wire "Finish setup" CTA to call `authApiService.submitOnboarding`, handle loading and error states, persist session tokens to store, and transition to `/(app)`.
  - `mobile_apps/pikyrider/src/app/(onboarding)/profile.tsx`: Guard against missing `onboardingToken` / unauthenticated entry, and pre-fill fields if `currentUser` has metadata.

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Define Onboarding API Contracts
- **Target File:** `mobile_apps/pikyrider/src/types/auth-api.types.ts`
- **Action:**
  - Export `OnboardingPayload`:
    - `firstName: string;`
    - `lastName: string;`
    - `gender: "male" | "female" | "other" | "prefer_not_to_say";`
    - `country: string;` (ISO 3166-1 alpha-2)
  - Export `OnboardingResponse`:
    - `success: boolean;`
    - `user: UserProfileSummary;`
    - `session: SessionData;`

### Step 2: Implement Onboarding Submission Service
- **Target File:** `mobile_apps/pikyrider/src/services/auth-api.service.ts`
- **Action:**
  - Implement `submitOnboarding(payload: OnboardingPayload, onboardingToken: string): Promise<OnboardingResponse>`.
  - Send POST request to `/api/auth/onboarding` with `Authorization: Bearer <onboardingToken>`.
  - Parse error responses (400, 401, 403) and raise `AuthApiError`.

### Step 3: Wire Submission in Country Screen
- **Target File:** `mobile_apps/pikyrider/src/app/(onboarding)/country.tsx`
- **Action:**
  - Read `profile`, `gender`, `onboardingToken`, and store actions from `useOnboardingStore`.
  - Map UI gender values (`man` -> `male`, `woman` -> `female`, `nonbinary` -> `other`, `prefer_not_to_say` -> `prefer_not_to_say`).
  - Extract 2-letter uppercase ISO country code (`selectedCountry.id.toUpperCase()`).
  - In `handleFinish`, validate and invoke `authApiService.submitOnboarding`.
  - On success:
    - Update store tokens via `setSessionTokens(response.session.accessToken, response.session.refreshToken)`.
    - Update user via `setCurrentUser(response.user)`.
    - Set country via `setStoreCountry(selectedCountry)`.
    - Set `setIsAuthenticated(true)`.
    - Navigate to `/(app)` via `router.replace("/(app)")`.
  - On error:
    - Render localized error banner / alert.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter pikyrider typecheck
pnpm --filter pikyrider lint
```

Test scenarios to cover:
- **Happy Path:** First-time rider fills name, gender, and country; submits with `onboardingToken`; receives production session tokens and transitions to `/(app)`.
- **Gender Enum Normalization:** UI selections (`man`, `woman`, `nonbinary`) map reliably to backend-accepted enums (`male`, `female`, `other`).
- **Country ISO Formatting:** Country IDs are guaranteed 2-letter uppercase codes matching ISO 3166-1 alpha-2.
- **Error Handling:** Expired or missing `onboardingToken` throws 401 and presents user-friendly error message.

---

## 5. SECURITY & GUARDRAILS

- [x] **Authoritative Service README Grounding.** Follows [`services/auth/README.md`](../../services/auth/README.md#group-e-rider-profile-onboarding).
- [x] **Bearer Authentication Header.** Strictly sends `Authorization: Bearer <onboardingToken>`.
- [x] **No `.env` touched.** Secrets and API URLs read strictly via `process.env`.
- [x] **Lexend Typography Only.** Retains single-font organization rule.

---

## 6. RECORD UPDATE

1. Mark task as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update the **LAST UPDATE** block and append task row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh the component row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
