# TASK IMPLEMENTATION GUIDE: TASK-01 - Login Screen UI & Login API Integration (Email + OTP)

- **Service / App:** `apps/admin` (`@web/admin`)
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Figma Reference:** [`Forginity · Admin login (Node 319:364)`](https://www.figma.com/design/sERqI1nBTDZqA6JDZVnRt4/Forginity-Ui?node-id=319-364&t=jS11XmriwUOOWfvL-4)

---

## 1. SUMMARY & GOAL

Build the responsive administrator login page UI at `/login` in `apps/admin` strictly matching the Figma specification (`Node 319:364`). The page implements a two-column desktop split layout (620px left branding panel on `#0e0e0e`, 820px right sign-in panel on `#090909`), gracefully adapting to a single-column layout on mobile (`< 640px`) and tablet (`640px - 1024px`) viewports.

In this UI phase, we render the pixel-perfect responsive interface strictly configured for passwordless authentication:
- **Active Flow (Email + OTP):**
  - Step 1: Work email input matching Figma geometry (`h-[50px]`, `rounded-lg`, `#141414` bg, `#292929` border) and primary coral action button (`#ff6347`).
  - Step 2: 6-digit numeric OTP prompt via `@workspace/ui/components/otp-input.tsx` with email display, edit action, and 60-second resend countdown timer.
- **Preserved (Commented):** Password authentication form, show/hide toggle, and remember me/forgot password controls are cleanly preserved in comments for future policy enablement if needed.
- Universal mobile-first responsiveness with zero layout shift (CLS = 0.00).

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `apps/admin/app/login/page.tsx` - Next.js App Router responsive login page component.
  - `apps/admin/components/login-form.tsx` - Interactive client login form supporting Email + OTP flow with live API dispatch.
  - `apps/admin/app/api/auth/initiate/route.ts` - Next.js Route Handler for admin sign-in OTP dispatch.
  - `apps/admin/app/api/auth/verify/route.ts` - Next.js Route Handler for OTP verification and HTTP-only session cookie issuance.
  - `apps/admin/app/api/auth/logout/route.ts` - Next.js Route Handler for cookie clearing and session termination.
  - `apps/admin/proxy.ts` - Next.js 16 Proxy route protection for administrator workspaces.
- **Files to Modify:**
  - `docs/development/web_admin_auth/TASK_LIST.md` - Update status to `COMPLETED`.
  - `services/auth/src/db/auth.validator.ts` - Added `AuthIntentEnum` and updated initiate/verify schemas.
  - `services/auth/src/services/auth.service.ts` - Enforced `intent: "sign_in"` and `userType: "admin"` guardrails.

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Create Interactive Client Login Form
- **Target File:** `apps/admin/components/login-form.tsx`
- **Action:**
  - Passwordless Email + OTP two-step flow.
  - Step 1: Enter email -> calls `/api/auth/initiate` (validates admin account existence).
  - Step 2: 6-digit `OtpInput` code entry -> calls `/api/auth/verify` (validates code and issues session cookie).
  - Countdown resend timer and error handling for invalid codes, remaining attempts, and non-admin rejections.

### Step 2: Build Responsive Login View Shell
- **Target File:** `apps/admin/app/login/page.tsx`
- **Action:**
  - Desktop (`lg:flex`): 2-column split layout.
    - Left Panel: `w-[42%] max-w-[620px] bg-[#0e0e0e] border-r border-[#292929] p-10 xl:p-16 flex flex-col justify-between`.
      - Top: `ForginityLogo`.
      - Middle: "One workspace. Every possibility." Lexend display heading and subtext.
      - Bottom: `© 2026 Forginity`.
    - Right Panel: `flex-1 bg-[#090909] flex flex-col justify-between p-6 sm:p-10 lg:p-16`.
      - Top overline: `FORGINITY / ADMIN PORTAL`.
      - Centered form container: Max-width 400px hosting `LoginForm`.
      - Bottom notices: Security disclaimer and access support link.
  - Mobile & Tablet (`< lg`):
    - Single-column stacked layout with top branding header, responsive container padding, touch targets (`h-[50px]`), and scroll container to avoid clipping.

### Step 3: Implement Next.js BFF Route Handlers & Route Protection
- **Target Files:**
  - `apps/admin/app/api/auth/initiate/route.ts`
  - `apps/admin/app/api/auth/verify/route.ts`
  - `apps/admin/app/api/auth/logout/route.ts`
  - `apps/admin/proxy.ts`
- **Action:**
  - Proxies authentication requests to `services/auth` at `process.env.AUTH_SERVICE_URL || "http://localhost:3001"`.
  - Sets secure HTTP-only cookies (`admin_session` with 15m expiration, `admin_refresh_token` with 30d expiration).
  - `proxy.ts` intercepts requests, redirecting unauthenticated users to `/login` and authenticated users away from `/login`.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @web/admin typecheck
pnpm --filter @web/admin lint
```

UI scenarios to verify:
- **Responsive Layout:**
  - Mobile (`< 640px`): Full width, centered form, clear touch targets, no horizontal overflow.
  - Tablet (`640px - 1024px`): Clean structured layout with prominent branding and inputs.
  - Desktop (`> 1024px`): Exact 2-column split with `#0e0e0e` left panel and `#090909` right panel.
- **Interactive Form States:**
  - Toggle between Password and OTP modes.
  - Password show/hide toggle toggles input `type="password"` / `type="text"`.
  - OTP inputs allow numeric entry and backspace navigation.
  - Remember me checkbox toggles properly.
- **Zero CLS:**
  - Static form view renders instantly without loading skeletons or geometry jumping.

---

## 5. SECURITY & GUARDRAILS

- [x] **No `.env` touched.** Secrets read strictly from `process.env`.
- [x] **Client-side sanitization.** Prevent XSS in inputs.
- [x] **Accessible semantic HTML.** All inputs labeled with proper `id`, `name`, `autoComplete`, and `aria-label`.
- [x] **Mobile viewport adaptation.** Viewport safe areas and touch target sizes >= 44px.

---

## 6. POST-IMPLEMENTATION WORKFLOW

1. Run TypeScript type checking: `pnpm --filter @web/admin typecheck`.
2. Run ESLint: `pnpm --filter @web/admin lint`.
3. Verify visual rendering and responsive behavior.
4. Update task status in `TASK_LIST.md` and central tracking docs.
