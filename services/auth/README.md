# Auth & Identity Microservice (`@services/auth`)

Centralized Single Sign-On (SSO), Identity, and Reusable OTP Engine for the Forginity monorepo platform.

---

## 1. What This Service Is

The Auth & Identity Service (`@services/auth`) is the centralized authentication and identity authority for the Forginity ecosystem. It provides passwordless email authentication, Google Social SSO, multi-tenant session orchestration, and unified user profiles across consumer applications (e.g. **TrackRide / PikyRider**, **Custom Apparel**, **Candidate Assessment**) and internal administrative back-offices (**Admin Console**).

It serves as the **single source of truth** for user records, credential issuance, emergency contacts, session token rotation, and administrative account moderation.

### Primary Responsibilities
- **Passwordless Email OTP Engine:** Dispatches and verifies cryptographically secure 6-digit OTP tokens via transactional email (Resend SMTP).
- **Google OAuth 2.0 / OIDC Federation:** Cryptographically verifies Google ID tokens via Google JWKS and synchronizes user profiles (names, email, avatar).
- **Profile Onboarding Engine:** Captures mandatory first-time profile metadata (`firstName`, `lastName`, `gender`, ISO 3166-1 alpha-2 `country`) guarded by scoped 2-hour onboarding tokens before granting production session tokens.
- **SSO Session Management & Token Rotation:** Issues 15-minute scoped JWT access tokens and 30-day rotating refresh tokens with SHA-256 session secret hashes stored in PostgreSQL.
- **User Self-Service & Lifecycle:** Profile updates, emergency contacts management, account soft deletion, and 30-day grace period restoration.
- **Administrative Back-Office Directory & Moderation:** Paginated directory search, deep inspection, and moderation (`active`, `blocked`, `deleted`) with RBAC enforcement (`userType === 'admin'`).

### Core Network & Port Allocations
- **Port:** `3001` (HTTP)
- **Base URL:** `http://localhost:3001`
- **Reverse Proxy Route:** `http://localhost:8080/api/auth`
- **Swagger / OpenAPI Documentation:** `http://localhost:3001/api/docs`
- **Raw OpenAPI Spec:** `http://localhost:3001/api/docs.json`

---

## 2. Architecture & Security Model

```text
  ┌────────────────────────────────────────────────────────┐
  │                 Client Application                     │
  │     (Next.js Web Admin, Mobile PikyRider / Expo)       │
  └───────────────────────────┬────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
  [Bearer Access Token (15m)]             [Refresh Token (30d)]
  (In-Memory / SecureStore)            (HttpOnly Cookie / SecureStore)
          │                                       │
          ▼                                       ▼
  ┌────────────────────────────────────────────────────────┐
  │      services/auth (Express 5 + TypeScript on 3001)    │
  │  - auth.middleware.ts: JWT validation (HS256)          │
  │  - validate.middleware.ts: Zod schema parsing          │
  │  - token.utils.ts: Token issuance and verification     │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │         PostgreSQL 18 (Database: auth_db)              │
  │  - users: User profiles and auth status                │
  │  - sessions: Active sessions & SHA-256 token hashes    │
  │  - emergency_contacts: Rider safety contacts           │
  │  - otps: Reusable verification requests & attempts     │
  └────────────────────────────────────────────────────────┘
```

### Token Types & Lifecycles
| Token Type | Claims | Lifetime | Intended Purpose | Storage Location |
| :--- | :--- | :--- | :--- | :--- |
| **`onboardingToken`** | `{ sub: userId, email, purpose: "onboarding" }` | **2 Hours** | Restricts API access exclusively to `POST /api/auth/onboarding` for first-time or incomplete registrations. | Client Memory / State |
| **`accessToken`** | `{ sub: userId, email, userType: "user"\|"admin", isEmailVerified, isOnboarded }` | **15 Minutes** | Standard Bearer token included in `Authorization: Bearer <token>` for all protected endpoints. | Client Memory / SecureStore |
| **`refreshToken`** | `{ sub: userId, sessionId, tokenVersion }` | **30 Days** | Long-lived rotating token used to mint fresh access tokens via `POST /api/auth/session/refresh`. | HttpOnly Cookie (Web) / `Expo SecureStore` (Mobile) |

---

## 3. Master Authentication Flows

### Flow 1: Passwordless Email Authentication (Sign-In / Sign-Up)

```text
Client                              services/auth                     Database / Resend
  │                                       │                                   │
  │ 1. POST /api/auth/email/initiate      │                                   │
  │    { email, intent: "authentication" }│                                   │
  ├──────────────────────────────────────>│ Check user existence              │
  │                                       │ Generate 6-digit OTP              │
  │                                       ├──────────────────────────────────>│ Send email OTP
  │ 2. 200 OK                             │ Store OTP record (10m expiry)     │
  │    { success, isNewUser, requestId }  │                                   │
  │<──────────────────────────────────────┤                                   │
  │                                       │                                   │
  │ 3. POST /api/auth/email/verify        │                                   │
  │    { requestId, code: "123456" }      │                                   │
  ├──────────────────────────────────────>│ Verify code & attempt count       │
  │                                       │                                   │
  │ Case A: New User (isOnboarded: false) │ Register user (status: active)    │
  │ 4a. 200 OK                            │ Issue scoped onboardingToken      │
  │     { success, isNewUser: true,       │                                   │
  │       isOnboarded: false,             │                                   │
  │       onboardingToken, user }         │                                   │
  │<──────────────────────────────────────┤                                   │
  │                                       │                                   │
  │ Case B: Onboarded (isOnboarded: true) │ Create DB session                 │
  │ 4b. 200 OK                            │ Issue accessToken + refreshToken  │
  │     { success, isNewUser: false,      │ Set HttpOnly cookie               │
  │       isOnboarded: true,              │                                   │
  │       session: { accessToken, ... } } │                                   │
  │<──────────────────────────────────────┤                                   │
```

---

### Flow 2: Google OAuth 2.0 / Social SSO

```text
Client (Web / Mobile)               services/auth                     Google JWKS
  │                                       │                                │
  │ 1. Obtain Google idToken natively     │                                │
  │                                       │                                │
  │ 2. POST /api/auth/google              │                                │
  │    { idToken: "eyJhbGciOi..." }       │                                │
  ├──────────────────────────────────────>│ Verify token cryptographically │
  │                                       ├───────────────────────────────>│
  │                                       │<───────────────────────────────┤
  │                                       │ Extract claims (email, name, picture)
  │                                       │ Query or create user record    │
  │                                       │                                │
  │ Case A: If isOnboarded is false:      │ Issue scoped onboardingToken   │
  │ 3a. 200 OK                            │                                │
  │     { success, isOnboarded: false,    │                                │
  │       onboardingToken, user }         │                                │
  │<──────────────────────────────────────┤                                │
  │                                       │                                │
  │ Case B: If isOnboarded is true:       │ Provision DB session           │
  │ 3b. 200 OK                            │ Issue accessToken + refreshToken│
  │     { success, isOnboarded: true,     │                                │
  │       session: { accessToken, ... } } │                                │
  │<──────────────────────────────────────┤                                │
```

---

### Flow 3: Profile Onboarding (Completing Registration)

```text
Client                              services/auth                     Database
  │                                       │                               │
  │ 1. POST /api/auth/onboarding          │                               │
  │    Headers: Authorization: Bearer <onboardingToken>                   │
  │    Body: { firstName, lastName,       │                               │
  │            gender, country }          │                               │
  ├──────────────────────────────────────>│ Validate names & ISO country  │
  │                                       │ Update user (isOnboarded=true)│
  │                                       │ Provision active DB session   │
  │ 2. 200 OK                             │ Issue production tokens       │
  │    { success: true, user,             │                               │
  │      session: { accessToken,          │                               │
  │                 refreshToken,         │                               │
  │                 expiresIn: 900 } }    │                               │
  │<──────────────────────────────────────┤                               │
```

---

## 4. API Reference (Source of Truth)

All requests and responses use `application/json` unless otherwise specified.

---

### Group A: System & Operational Health

#### `GET /api/health` & `GET /api/auth/health`
Operational health check and PostgreSQL connectivity verification.

- **Authentication:** None (Public)
- **Request Headers:** None
- **Request Body:** None

**Success Response (`200 OK`):**
```json
{
  "status": "ok",
  "service": "auth",
  "database": "connected",
  "timestamp": "2026-11-17T21:00:00.000Z"
}
```

**Unhealthy Response (`503 Service Unavailable`):**
```json
{
  "status": "unhealthy",
  "service": "auth",
  "database": "disconnected",
  "error": "Database connection timeout",
  "timestamp": "2026-11-17T21:00:00.000Z"
}
```

---

### Group B: Low-Level Reusable OTP Engine

#### `POST /api/auth/otp/send`
Dispatches a 6-digit numeric OTP code via Resend Nodemailer SMTP and returns an opaque `requestId`.

- **Authentication:** None (Public)
- **Request Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "identifier": "rider@forginity.com",
  "identifierType": "email",
  "purpose": "authentication",
  "productName": "TrackRide"
}
```
*Constraints:*
- `identifier`: Valid email string (max 255 chars). *Note: Phone is deferred to V2 and returns 400.*
- `identifierType`: `"email"` | `"phone"` (default: `"email"`)
- `purpose`: `"authentication"` | `"verification"` | `"transaction"` | `"sign_in"` | `"sign_up"` (default: `"authentication"`)
- `productName`: Optional string (max 100 chars), displayed in email template header.

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "expiresInSeconds": 600,
  "cooldownSeconds": 60,
  "debugOtp": "123456"
}
```
*(Note: `debugOtp` is only exposed when `NODE_ENV !== "production"`).*

**Error Responses:**
- `400 Bad Request`: Validation failure or phone verification attempted.
  ```json
  {
    "error": "Phone number verification is scheduled for V2 rollout. Please verify using an email address.",
    "code": "PHONE_VERIFICATION_DEFERRED"
  }
  ```
- `429 Too Many Requests`: Resend cooldown active.
  ```json
  {
    "error": "Please wait 48 seconds before requesting another verification code.",
    "code": "COOLDOWN_ACTIVE"
  }
  ```

---

#### `POST /api/auth/otp/verify`
Validates a 6-digit code against an active `requestId`.

- **Authentication:** None (Public)
- **Request Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "code": "123456"
}
```

**Success Response (`200 OK`):**
```json
{
  "verified": true,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "identifier": "rider@forginity.com",
  "identifierType": "email",
  "purpose": "authentication"
}
```

**Error Responses:**
- `400 Bad Request`: Code mismatch (decrements remaining attempts).
  ```json
  {
    "error": "Invalid verification code.",
    "code": "INVALID_CODE",
    "remainingAttempts": 2,
    "maxAttempts": 3
  }
  ```
- `410 Gone / 404 Not Found`: Expired, invalid requestId, or max attempts exceeded.
  ```json
  {
    "error": "Verification request expired or not found. Please request a new code.",
    "code": "REQUEST_EXPIRED"
  }
  ```

---

### Group C: Unified Passwordless Email Authentication

#### `POST /api/auth/email/initiate`
Initiates passwordless authentication. Determines if the account exists (`isNewUser: false`) or is new (`isNewUser: true`), runs moderation checks, and dispatches an OTP.

- **Authentication:** None (Public)
- **Request Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "email": "rider@forginity.com",
  "productName": "TrackRide",
  "intent": "authentication",
  "userType": "user"
}
```
*Fields:*
- `email` (string, required): Lowercased and validated email address.
- `productName` (string, optional): Application brand name (e.g. "TrackRide").
- `intent` (string, optional): `"authentication"` (default: allows both sign-in and sign-up) | `"sign_in"` (sign-in only, rejects unregistered users with 404).
- `userType` (string, optional): `"user"` (default) | `"admin"` (if intent is `"sign_in"` and `userType` is `"admin"`, verifies administrative privileges).

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "isNewUser": true,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "expiresInSeconds": 600,
  "cooldownSeconds": 60,
  "debugOtp": "123456"
}
```

**Error Responses:**
- `403 Forbidden`: Account blocked or deleted.
  ```json
  {
    "error": "Account is blocked. Please contact support.",
    "code": "ACCOUNT_BLOCKED"
  }
  ```
  *(Or `code: "ACCOUNT_DELETED"` / `code: "FORBIDDEN"`).*
- `404 Not Found` (when `intent === "sign_in"`):
  ```json
  {
    "error": "No account found with this email address.",
    "code": "USER_NOT_FOUND"
  }
  ```
- `429 Too Many Requests`: Cooldown active.
  ```json
  {
    "error": "Please wait 52 seconds before requesting another verification code.",
    "code": "COOLDOWN_ACTIVE"
  }
  ```

---

#### `POST /api/auth/email/verify`
Verifies OTP code against `requestId`. If returning & onboarded, establishes session. If new or un-onboarded, creates user record and issues 2-hour scoped `onboardingToken`.

- **Authentication:** None (Public)
- **Request Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "code": "123456",
  "intent": "authentication",
  "userType": "user"
}
```

**Success Response — Case 1: New or Un-onboarded User (`200 OK`):**
*(Sets NO session cookie. Returns scoped `onboardingToken` for routing to Onboarding screen).*
```json
{
  "success": true,
  "isNewUser": true,
  "isOnboarded": false,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "rider@forginity.com",
    "phone": null,
    "name": null,
    "firstName": null,
    "lastName": null,
    "gender": null,
    "country": null,
    "avatarUrl": null,
    "authProvider": "email_otp",
    "isVerified": true,
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "isOnboarded": false,
    "userType": "user",
    "status": "active",
    "createdAt": "2026-11-17T21:00:00.000Z",
    "updatedAt": "2026-11-17T21:00:00.000Z"
  },
  "onboardingToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJlbWFpbCI6InJpZGVyQGZvcmdpbml0eS5jb20iLCJwdXJwb3NlIjoib25ib2FyZGluZyIsImlhdCI6MTc2MzQxMzYwMCwiZXhwIjoxNzYzNDIwODAwfQ.xxxx"
}
```

**Success Response — Case 2: Returning Onboarded User (`200 OK`):**
*(Sets HTTP-Only cookie `refreshToken` for web clients. Returns production session).*
```json
{
  "success": true,
  "isNewUser": false,
  "isOnboarded": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "rider@forginity.com",
    "phone": null,
    "name": "Alex Morgan",
    "firstName": "Alex",
    "lastName": "Morgan",
    "gender": "male",
    "country": "IN",
    "avatarUrl": null,
    "authProvider": "email_otp",
    "isVerified": true,
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "isOnboarded": true,
    "userType": "user",
    "status": "active",
    "createdAt": "2026-11-10T12:00:00.000Z",
    "updatedAt": "2026-11-10T12:00:00.000Z"
  },
  "session": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJlbWFpbCI6InJpZGVyQGZvcmdpbml0eS5jb20iLCJ1c2VyVHlwZSI6InVzZXIiLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlzT25ib2FyZGVkIjp0cnVlLCJpYXQiOjE3NjM0MTM2MDAsImV4cCI6MTc2MzQxNDUwMH0.xxxx",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJzZXNzaW9uSWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwOTkiLCJpYXQiOjE3NjM0MTM2MDAsImV4cCI6MTc2NjAwNTYwMH0.xxxx",
    "expiresIn": 900
  }
}
```

**Error Responses:**
- `400 Bad Request`: Code mismatch.
  ```json
  {
    "error": "Invalid verification code.",
    "code": "INVALID_CODE",
    "remainingAttempts": 1
  }
  ```
- `403 Forbidden`: Account is blocked or deleted.
- `404 Not Found`: No account exists for `sign_in` intent.

---

### Group D: Google OAuth 2.0 / Social SSO

#### `POST /api/auth/google`
Verifies a Google OAuth 2.0 ID token. Pre-populates name and profile picture from Google claims.

- **Authentication:** None (Public)
- **Request Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "productId": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Success Response — First-time or Un-onboarded User (`200 OK`):**
```json
{
  "success": true,
  "isNewUser": true,
  "isOnboarded": false,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "email": "rider@gmail.com",
    "name": "Sarah Connor",
    "firstName": "Sarah",
    "lastName": "Connor",
    "gender": null,
    "country": null,
    "avatarUrl": "https://lh3.googleusercontent.com/a/ACg8oc...",
    "authProvider": "google",
    "isVerified": true,
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "isOnboarded": false,
    "userType": "user",
    "status": "active"
  },
  "onboardingToken": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

**Success Response — Returning Onboarded User (`200 OK`):**
```json
{
  "success": true,
  "isNewUser": false,
  "isOnboarded": true,
  "user": { ... },
  "session": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "expiresIn": 900
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Token verification failed against Google JWKS.
  ```json
  {
    "error": "Invalid Google ID token.",
    "code": "INVALID_TOKEN"
  }
  ```
- `403 Forbidden`: User account blocked or deleted.

---

### Group E: Rider Profile Onboarding

#### `POST /api/auth/onboarding`
Completes profile setup for a newly registered user. Upgrades user to `isOnboarded: true` and provisions an active production session.

- **Authentication:** Required (`Bearer <onboardingToken>` or `Bearer <accessToken>`)
- **Request Headers:**
  - `Authorization: Bearer <onboardingToken>`
  - `Content-Type: application/json`

**Request Body:**
```json
{
  "username": "alexmorgan",
  "firstName": "Alex",
  "lastName": "Morgan",
  "gender": "male",
  "country": "IN"
}
```
*Validation Rules:*
- `username`: String, 3–30 chars (`/^[a-zA-Z0-9_]{3,30}$/`), letters, numbers, and underscores only, case-insensitive, globally unique across users (optional, recommended).
- `firstName`: String, 1–100 chars, required.
- `lastName`: String, 1–100 chars, required.
- `gender`: `"male"` | `"female"` | `"other"` | `"prefer_not_to_say"` (required enum).
- `country`: Exact 2-letter uppercase ISO 3166-1 alpha-2 code (e.g. `"IN"`, `"US"`, `"CA"`, `"DE"`).

**Success Response (`200 OK`):**
*(Sets HTTP-Only cookie `refreshToken` for web clients).*
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "rider@forginity.com",
    "name": "Alex Morgan",
    "username": "alexmorgan",
    "firstName": "Alex",
    "lastName": "Morgan",
    "gender": "male",
    "country": "IN",
    "avatarUrl": null,
    "authProvider": "email_otp",
    "isVerified": true,
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "isOnboarded": true,
    "userType": "user",
    "status": "active"
  },
  "session": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "expiresIn": 900
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation failure.
  ```json
  {
    "error": "Country must be a 2-letter uppercase ISO 3166-1 alpha-2 code (e.g. IN, US)",
    "code": "VALIDATION_ERROR",
    "issues": [
      {
        "field": "country",
        "message": "Country must be a 2-letter uppercase ISO 3166-1 alpha-2 code (e.g. IN, US)"
      }
    ]
  }
  ```
- `401 Unauthorized`: Token invalid, expired, or missing.
- `403 Forbidden`: Account is blocked or deleted.

---

### Group F: Session Lifecycle & Token Management

#### `POST /api/auth/session/refresh` (Alias: `/api/auth/session`)
Rotates the session refresh token and issues a fresh 15-minute access token.

- **Authentication:** None required (Token passed via Cookie or Request Body)
- **Request Headers:** `Content-Type: application/json`
- **Cookies:** `refreshToken=<token>` (optional if provided in body)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
}
```
*(Optional in web browsers when `refreshToken` cookie is present).*

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "session": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "expiresIn": 900
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Token invalid, expired, or revoked.
  ```json
  {
    "error": "Session expired or revoked.",
    "code": "SESSION_REVOKED"
  }
  ```

---

#### `GET /api/auth/session/me`
Retrieves current session claims and full user profile.

- **Authentication:** Required (`Authorization: Bearer <accessToken>`)
- **Request Body:** None

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "session": {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "currentProductId": null,
    "currentSection": null,
    "deviceType": "mobile",
    "expiresAt": "2026-12-17T21:00:00.000Z"
  },
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "rider@forginity.com",
    "name": "Alex Morgan",
    "firstName": "Alex",
    "lastName": "Morgan",
    "gender": "male",
    "country": "IN",
    "avatarUrl": null,
    "authProvider": "email_otp",
    "isVerified": true,
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "isOnboarded": true,
    "userType": "user",
    "status": "active"
  }
}
```

---

#### `POST /api/auth/session/switch-product`
Updates active product domain context for the current session without re-authenticating.

- **Authentication:** Required (`Authorization: Bearer <accessToken>`)
- **Request Body:**
  ```json
  {
    "productId": "550e8400-e29b-41d4-a716-446655440002",
    "section": "navigation"
  }
  ```

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "session": {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "currentProductId": "550e8400-e29b-41d4-a716-446655440002",
    "currentSection": "navigation"
  }
}
```

---

#### `POST /api/auth/session/revoke` (Alias: `/api/auth/session/logout`)
Revokes a single device session and invalidates its refresh token.

- **Authentication:** Optional if `refreshToken` is provided in body or cookie; required via Bearer otherwise.
- **Request Body:**
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

**Success Response (`200 OK`):**
*(Clears the `refreshToken` HttpOnly cookie).*
```json
{
  "success": true,
  "message": "Session successfully revoked."
}
```

---

#### `POST /api/auth/session/revoke-all` (Alias: `/api/auth/session/logout-all`)
Revokes all active sessions across all devices for the authenticated user.

- **Authentication:** Required (`Authorization: Bearer <accessToken>`)
- **Request Body:** None

**Success Response (`200 OK`):**
*(Clears the `refreshToken` HttpOnly cookie).*
```json
{
  "success": true,
  "message": "All active sessions revoked successfully."
}
```

---

### Group G: User Self-Service & Lifecycle

#### `GET /api/auth/users/check-username` (Alias: `/api/users/check-username`)
Public endpoint to check whether a proposed username is available or already claimed globally.

- **Authentication:** None (Public)
- **Query Parameters:**
  - `username` (string, required): 3–30 characters, letters, numbers, underscores (`/^[a-zA-Z0-9_]{3,30}$/`).

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "available": true,
  "username": "alexmorgan"
}
```
*(If taken, `available` is `false`).*

**Error Responses:**
- `400 Bad Request`: Invalid username format (length < 3, > 30, or contains special characters).
  ```json
  {
    "error": "Username can only contain alphanumeric characters and underscores",
    "code": "VALIDATION_ERROR"
  }
  ```

---

#### `GET /api/users/me`
Retrieves authenticated user profile.

- **Authentication:** Required (`Authorization: Bearer <accessToken>`)

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "rider@forginity.com",
    "name": "Alex Morgan",
    "username": "alexmorgan",
    "firstName": "Alex",
    "lastName": "Morgan",
    "gender": "male",
    "country": "IN",
    "avatarUrl": "https://storage.forginity.com/avatars/rider.png",
    "authProvider": "email_otp",
    "isVerified": true,
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "isOnboarded": true,
    "userType": "user",
    "status": "active",
    "createdAt": "2026-11-10T12:00:00.000Z",
    "updatedAt": "2026-11-17T21:00:00.000Z"
  }
}
```

---

#### `PUT /api/users/me`
Updates user profile metadata. All fields are optional.

- **Authentication:** Required (`Authorization: Bearer <accessToken>`)

**Request Body:**
```json
{
  "username": "alex_rider",
  "firstName": "Alexander",
  "lastName": "Morgan",
  "gender": "male",
  "country": "CA",
  "avatarUrl": "https://storage.forginity.com/avatars/rider-new.png"
}
```

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

#### `DELETE /api/users/me`
Schedules own user account for soft-deletion and immediately terminates all active sessions.

- **Authentication:** Required (`Authorization: Bearer <accessToken>`)

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Account has been scheduled for deletion. You have a 30-day grace period to restore it."
}
```

---

#### `POST /api/users/:userId/restore`
Restores a soft-deleted account within the 30-day grace period.

- **Authentication:** Required (`Authorization: Bearer <accessToken>`)
- **Path Parameters:** `userId` (UUID)

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Account successfully restored.",
  "user": { ... }
}
```

---

### Group H: Emergency Contacts (Rider Safety)

#### `GET /api/users/me/emergency-contacts`
Retrieves all linked emergency contacts for the rider.

- **Authentication:** Required (`Authorization: Bearer <accessToken>`)

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "contacts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "contactName": "Sarah Connor",
      "contactPhone": "+14155552671",
      "relationship": "Spouse",
      "isPrimary": true,
      "createdAt": "2026-11-12T10:00:00.000Z",
      "updatedAt": "2026-11-12T10:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/users/me/emergency-contacts`
Adds a new emergency contact.

- **Authentication:** Required (`Authorization: Bearer <accessToken>`)

**Request Body:**
```json
{
  "contactName": "Sarah Connor",
  "contactPhone": "+14155552671",
  "relationship": "Spouse",
  "isPrimary": true
}
```
*Validation Rules:*
- `contactName`: String, 1–255 chars, required.
- `contactPhone`: Strict E.164 international phone regex (`/^\+[1-9]\d{1,14}$/`), required.
- `relationship`: String, max 50 chars, optional.
- `isPrimary`: Boolean, default `true`.

**Success Response (`201 Created`):**
```json
{
  "success": true,
  "contact": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "contactName": "Sarah Connor",
    "contactPhone": "+14155552671",
    "relationship": "Spouse",
    "isPrimary": true,
    "createdAt": "2026-11-17T21:00:00.000Z",
    "updatedAt": "2026-11-17T21:00:00.000Z"
  }
}
```

---

#### `GET /api/users/me/emergency-contacts/:contactId`
Retrieves a single emergency contact by UUID.

- **Authentication:** Required (`Authorization: Bearer <accessToken>`)
- **Path Parameters:** `contactId` (UUID)

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "contact": { ... }
}
```

---

#### `PUT /api/users/me/emergency-contacts/:contactId`
Updates an existing emergency contact.

- **Authentication:** Required (`Authorization: Bearer <accessToken>`)
- **Path Parameters:** `contactId` (UUID)

**Request Body:**
```json
{
  "contactName": "Sarah Connor",
  "contactPhone": "+14155552672",
  "relationship": "Partner",
  "isPrimary": true
}
```

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "contact": { ... }
}
```

---

#### `DELETE /api/users/me/emergency-contacts/:contactId`
Deletes an emergency contact.

- **Authentication:** Required (`Authorization: Bearer <accessToken>`)
- **Path Parameters:** `contactId` (UUID)

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Emergency contact deleted successfully."
}
```

---

### Group I: Administrative User Management & Moderation

> [!IMPORTANT]
> All endpoints in this group strictly require an administrative user token (`req.user.userType === "admin"`). Requests from regular users return `403 Forbidden`.

#### `GET /api/users`
Paginated search and filter across the organization's user directory.

- **Authentication:** Required (`Authorization: Bearer <admin_access_token>`)
- **Query Parameters:**
  - `search` (string, optional): Case-insensitive match against email, firstName, lastName, and phone.
  - `status` (string, optional): `"active"` | `"blocked"` | `"deleted"`
  - `userType` (string, optional): `"user"` | `"admin"`
  - `authProvider` (string, optional): `"email_otp"` | `"phone_otp"` | `"google"`
  - `limit` (number, optional, default: 20, max: 100): Results per page.
  - `offset` (number, optional, default: 0): Records to skip.

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "total": 42,
  "limit": 20,
  "offset": 0,
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "rider@forginity.com",
      "phone": null,
      "name": "Alex Morgan",
      "firstName": "Alex",
      "lastName": "Morgan",
      "gender": "male",
      "country": "IN",
      "avatarUrl": null,
      "authProvider": "email_otp",
      "isVerified": true,
      "isEmailVerified": true,
      "isPhoneVerified": false,
      "isOnboarded": true,
      "userType": "user",
      "status": "active",
      "createdAt": "2026-11-10T12:00:00.000Z",
      "updatedAt": "2026-11-17T21:00:00.000Z"
    }
  ]
}
```

---

#### `GET /api/users/:userId`
Detailed user record inspection including active session counts and emergency contacts.

- **Authentication:** Required (`Authorization: Bearer <admin_access_token>`)
- **Path Parameters:** `userId` (UUID)

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "rider@forginity.com",
    "name": "Alex Morgan",
    "firstName": "Alex",
    "lastName": "Morgan",
    "gender": "male",
    "country": "IN",
    "authProvider": "email_otp",
    "isVerified": true,
    "isOnboarded": true,
    "userType": "user",
    "status": "active",
    "createdAt": "2026-11-10T12:00:00.000Z",
    "updatedAt": "2026-11-17T21:00:00.000Z"
  },
  "emergencyContacts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "contactName": "Sarah Connor",
      "contactPhone": "+14155552671",
      "relationship": "Spouse",
      "isPrimary": true
    }
  ],
  "activeSessionsCount": 2
}
```

---

#### `PATCH /api/users/:userId/status`
Updates account moderation status. Setting status to `"blocked"` or `"deleted"` immediately invalidates all active sessions and refresh tokens across all devices.

- **Authentication:** Required (`Authorization: Bearer <admin_access_token>`)
- **Path Parameters:** `userId` (UUID)

**Request Body:**
```json
{
  "status": "blocked",
  "reason": "Suspicious login activity reported"
}
```
*Fields:*
- `status` (string, required): `"active"` | `"blocked"` | `"deleted"`
- `reason` (string, optional, max 255 chars): Audit log justification.

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "User status updated successfully.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "rider@forginity.com",
    "status": "blocked",
    "updatedAt": "2026-11-17T21:00:00.000Z"
  }
}
```

---

## 5. Standard Error Handling & Error Codes

The service normalizes all client-facing errors into a standard payload:

```json
{
  "error": "Human-readable error explanation",
  "code": "STANDARD_ERROR_CODE",
  "remainingAttempts": 2,
  "maxAttempts": 3,
  "issues": [
    {
      "field": "country",
      "message": "Country must be a 2-letter uppercase ISO 3166-1 alpha-2 code"
    }
  ]
}
```

### Authoritative Error Code Enumeration
| HTTP Status | Error Code (`code`) | Trigger Condition |
| :---: | :--- | :--- |
| `400` | `VALIDATION_ERROR` | Zod schema parsing failure on request body, query, or path params. |
| `400` | `INVALID_CODE` | 6-digit OTP verification code mismatch. Includes `remainingAttempts`. |
| `400` | `PHONE_VERIFICATION_DEFERRED` | Phone number verification attempted on V1 email-only endpoint. |
| `401` | `UNAUTHORIZED` | Bearer token missing, malformed, or expired. |
| `401` | `INVALID_TOKEN` | Google ID token verification failed against Google JWKS. |
| `401` | `SESSION_REVOKED` | Refresh token was revoked, invalidated, or does not exist in DB. |
| `403` | `FORBIDDEN` | Caller lacks administrative privileges (`userType !== "admin"`). |
| `403` | `ACCOUNT_BLOCKED` | Account was administratively blocked by an operator. |
| `403` | `ACCOUNT_DELETED` | Account was scheduled for deletion. |
| `404` | `USER_NOT_FOUND` | User account does not exist for email or UUID lookup. |
| `404` | `NOT_FOUND` | Emergency contact or specific entity not found. |
| `410` | `REQUEST_EXPIRED` | OTP `requestId` expired (10m window) or max attempts (3) exceeded. |
| `429` | `COOLDOWN_ACTIVE` | Resend cooldown active. Caller must wait for `cooldownSeconds` (60s). |

---

## 6. Client Integration & Mobile Best Practices (PikyRider / Expo)

When integrating `@services/auth` with React Native / Expo (`apps/pikyrider`):

1. **Hardware-Backed Token Storage:**
   Store `accessToken` and `refreshToken` securely using `expo-secure-store`. Do NOT store session tokens in unencrypted `AsyncStorage`.
   ```ts
   import * as SecureStore from "expo-secure-store"
   await SecureStore.setItemAsync("forginity_access_token", accessToken)
   await SecureStore.setItemAsync("forginity_refresh_token", refreshToken)
   ```

2. **Authorization Header:**
   Attach the active access token as a standard Bearer token:
   ```ts
   headers: {
     "Authorization": `Bearer ${accessToken}`,
     "Content-Type": "application/json"
   }
   ```

3. **Silent Token Refresh in Mobile (Non-Cookie Environment):**
   Mobile apps do not maintain automatic browser cookie jars. Pass the stored `refreshToken` explicitly in the request body to `POST /api/auth/session/refresh`:
   ```ts
   const response = await fetch("http://localhost:3001/api/auth/session/refresh", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ refreshToken: storedRefreshToken })
   })
   const { session } = await response.json()
   // Update stored tokens with rotated session.refreshToken and session.accessToken
   ```

4. **Handling `isOnboarded: false` Redirections:**
   Upon verifying OTP or authenticating via Google:
   - If `res.isOnboarded === false`: Cache `res.onboardingToken` and route user directly to `/(onboarding)/profile`.
   - If `res.isOnboarded === true`: Save `res.session` tokens and route user to the main application canvas (`/(app)`).

---

## 7. Verification & Testing Commands

Execute verification commands from the repository root:

```bash
# Run the complete test suite (26 test suites, 214 tests passing)
pnpm --filter @services/auth test

# Run strict TypeScript typecheck
pnpm --filter @services/auth typecheck

# Run ESLint validation
pnpm --filter @services/auth lint
```
