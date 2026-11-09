# TASK LIST: V2 VISION & EXPANSION ROADMAP

## 1. COMPONENT DETAILS

- **Component Name:** `docs/development/v2_vision` (Forginity Ecosystem V2 Vision)
- **Domain:** Global Expansion, International Telephony, and High-Scale Infrastructure
- **Purpose:** Tracks architectural expansions and capabilities planned for Version 2 rollout across the Forginity monorepo ecosystem. Centralizes features deferred from V1 for cost optimization, regulatory lead-time (e.g. telecom DLT compliance), or advanced carrier integrations.
- **Key Features & Flows:**
  - International Phone Number registration and login via SMS and WhatsApp OTP.
  - Multi-provider telecom carrier routing and failover (Twilio, AWS Pinpoint/SNS, MSG91, Meta WhatsApp API).
  - Telephony toll fraud protection, geo-fencing, and Carrier HLR lookup.
  - Advanced biometric authentication / WebAuthn passkeys.
- **Strategic Context:** V1 focuses on zero-cost, high-deliverability **Email OTP (Resend Free Tier)** and **Google SSO** for global reach. Phone/SMS OTP is deferred to V2 to eliminate premature carrier costs and navigate international telecom registrations cleanly.
- **Central Implementation Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Overall Progress:** [`../PROGRESS.md`](../PROGRESS.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Phone Number & SMS/WhatsApp OTP Sign-Up Flow | International E.164 phone registration, carrier dispatch, rate-limiting | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-02` | Phone Number & SMS/WhatsApp OTP Sign-In Flow | Passwordless phone authentication, session issuance, dormant account recovery | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-03` | Telecom Gateway Integration & Carrier Routing | Pluggable adapters for Twilio, AWS SNS, MSG91, and Meta WhatsApp Business API | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-04` | Telephony Toll-Fraud Defense & Geo-Fencing | Phone verification risk scoring, anti-pumping protection, carrier cost caps | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-05` | Admin Console RBAC & Mutating Endpoints Guard | Route guards & UI permissions restricting create, edit, delete actions to Admin role | [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Phone Number & SMS/WhatsApp OTP Sign-Up Flow
- **Description:** Implement international E.164 telephone number verification for user registration.
  Integrate multi-channel SMS and WhatsApp OTP dispatch, duplicate phone number validation, and onboarding state initialization.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md)

### `TASK-02`: Phone Number & SMS/WhatsApp OTP Sign-In Flow
- **Description:** Implement passwordless phone number authentication for registered active accounts.
  Verify phone OTP codes, issue hybrid SSO sessions, and handle un-onboarded profile redirections.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md)

### `TASK-03`: Telecom Gateway Integration & Carrier Routing
- **Description:** Build production telecom adapter layer supporting Twilio (US/Global), AWS Pinpoint/SNS, MSG91/Fast2SMS (India DLT), and Meta WhatsApp Business API with automated fallback routing.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md)

### `TASK-04`: Telephony Toll-Fraud Defense & Geo-Fencing
- **Description:** Implement defensive security barriers against SMS pumping attacks, fraudulent destination range routing, automated bot registration, and per-carrier monthly expenditure limits.
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md)

### `TASK-05`: Admin Console RBAC & Mutating Endpoints Guard (Moved from V1)
- **Description:** Enforce administrative role verification on all mutating product actions (create, edit, delete, maintenance scheduling) in `apps/admin`.
  Conditionally hide or disable mutation controls for read-only / support operators, returning clean authorization error toasts once `services/auth` RBAC tokens are fully integrated.
- **Guide:** [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md)
