# TASK LIST: TESTING_E2E_PLAYWRIGHT

## 1. COMPONENT DETAILS

- **Component Name:** `testing/e2e-playwright` (End-to-End Authentication & User Flows Suite)
- **Domain:** Cross-Platform E2E Testing, Browser & Mobile Device Emulation, CI/CD Automated Verification
- **Purpose:** Provide automated end-to-end regression testing across web and mobile viewports for all authentication flows (Email OTP, Google SSO, Onboarding, Route Protection, Directory Search, and Moderation) using Playwright.
- **Key Features & Flows:**
  - Multi-browser & mobile viewport test harness (Chromium, Firefox, Mobile Safari, Android Pixel emulation).
  - Web Admin Portal auth suite (`/login` -> OTP prompt -> session cookie -> `/` dashboard -> `/users` table -> moderation).
  - Mobile responsive web / phone auth verification (Emulated touch targets, OTP auto-fill, rider onboarding, profile update, logout).
  - Test mailer / OTP interceptor hook to extract 6-digit test codes during automated runs without external delivery dependencies.
  - CI/CD integration with video recording, trace viewers, and HTML test reports.
- **Tech Stack:** Playwright Test, TypeScript, Docker, GitHub Actions.
- **Component Status:** `PENDING` (0/4 tasks completed; deadline: `TBD` / No deadline).
- **Central Implementation Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Overall Progress:** [`../PROGRESS.md`](../PROGRESS.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Playwright Harness & Multi-Device Emulation Config | `playwright.config.ts`, browser fixtures, mobile device viewports, web server bootstrap | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-02` | Web Admin Auth & Moderation E2E Test Suite | Automated test: admin login, OTP entry, cookie validation, route guard redirect, user directory, status moderation | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-03` | Mobile Phone & Consumer Auth E2E Test Suite | Automated mobile touch tests: Email OTP registration, onboarding form submission, profile editing, and logout | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-04` | CI/CD Pipeline Integration & Trace Reporter | Automated execution in GitHub Actions, test failure video recording, trace viewer artifacts | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Playwright Harness & Multi-Device Emulation Config
- **Description:** Scaffold Playwright testing framework:
  - Configure root `playwright.config.ts` with parallel worker execution, local development web server auto-start, and base URL setup.
  - Configure device presets: Desktop Chrome (1440x900), Mobile Chrome (Pixel 7), and Mobile Safari (iPhone 14).
  - Implement zero-flakiness test database seed and test OTP retrieval fixture.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md)

### `TASK-02`: Web Admin Auth & Moderation E2E Test Suite
- **Description:** Implement end-to-end automated tests for the admin portal:
  - Test 1: Unauthenticated request to `/users` is redirected to `/login`.
  - Test 2: Standard user (`userType === 'user'`) receives 403 Forbidden on admin login.
  - Test 3: Admin user (`userType === 'admin'`) logs in with Email + OTP, verifies session cookie, and enters dashboard.
  - Test 4: Navigate to `/users`, search user by name, open detail drawer, block user, and verify status badge turns red.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md)

### `TASK-03`: Mobile Phone & Consumer Auth E2E Test Suite
- **Description:** Implement mobile viewport end-to-end tests:
  - Test 1: New rider enters email, receives OTP, enters 6-digit code, fills onboarding form, and lands on Home.
  - Test 2: Returning rider enters email + OTP, bypasses onboarding, and lands directly on Home.
  - Test 3: Rider navigates to profile, edits emergency contact, updates name, and logs out. Verify session is destroyed.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md)

### `TASK-04`: CI/CD Pipeline Integration & Trace Reporter
- **Description:** Wire Playwright test runner into GitHub Actions CI pipeline:
  - Run headless test matrix on pull requests.
  - On failure, automatically upload Playwright traces, console logs, and failure screenshots.
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md)
