# PikyRider Mobile Application (`mobile_apps/pikyrider`)

The official cross-platform mobile client for **TrackRide**, Forginity's flagship motorcycle navigation and rider awareness platform.

---

## 1. What This Application Is

PikyRider provides motorcycle riders with offline navigation, turn-by-turn voice directions, real-time group rider radar over WebSockets, emergency stall detection, and seamless authentication with the centralized Forginity ecosystem.

### Core Capabilities
- **Passwordless Rider Onboarding:** Fast email OTP login and 1-tap Google Social SSO.
- **Hardware-Backed Session Security:** Secure token storage via `expo-secure-store` with silent background token rotation.
- **Mandatory Profile Setup:** First-time onboarding screen capturing rider metadata (names, gender, ISO country).
- **Rider Emergency Safety:** Linked emergency contacts for incident alerts and deviation monitoring.
- **Group Radar & Mesh:** Real-time proximity radar and 6-digit group session codes.

---

## 2. Authoritative Backend API Source of Truth

> [!IMPORTANT]
> **API Contracts & Integration Reference:**
> All backend authentication, session lifecycle, profile, and emergency contact contracts are authoritatively documented in:
> 
> 👉 **[`services/auth/README.md`](../../services/auth/README.md)**
> 
> When developing, testing, or modifying API integrations in PikyRider, **refer directly to `services/auth/README.md`** for exact request/response JSON schemas, headers, status codes, error models, and mobile integration guidelines (`expo-secure-store`, refresh token handling, and navigation redirects).
> 
> **Do NOT guess or reverse-engineer API contracts from backend source files.**

### Primary Backend Service Mappings
| Mobile Feature / Screen | Backend Endpoint | Reference Section in Auth README |
| :--- | :--- | :--- |
| **Email Sign-In / Sign-Up** (`/(onboarding)/signin`, `signup`) | `POST /api/auth/email/initiate` | [`services/auth/README.md` -> Group C](../../services/auth/README.md#group-c-unified-passwordless-email-authentication) |
| **OTP Code Verification** (`/(onboarding)/otp`) | `POST /api/auth/email/verify` | [`services/auth/README.md` -> Group C](../../services/auth/README.md#group-c-unified-passwordless-email-authentication) |
| **Google 1-Tap Sign-In** | `POST /api/auth/google` | [`services/auth/README.md` -> Group D](../../services/auth/README.md#group-d-google-oauth-20--social-sso) |
| **Profile Onboarding** (`/(onboarding)/profile`) | `POST /api/auth/onboarding` | [`services/auth/README.md` -> Group E](../../services/auth/README.md#group-e-rider-profile-onboarding) |
| **Silent Session Refresh** (Background Interceptor) | `POST /api/auth/session/refresh` | [`services/auth/README.md` -> Group F](../../services/auth/README.md#group-f-session-lifecycle--token-management) |
| **Single-Device Logout** | `POST /api/auth/session/revoke` | [`services/auth/README.md` -> Group F](../../services/auth/README.md#group-f-session-lifecycle--token-management) |
| **Rider Profile & Settings** (`/(app)/profile`) | `GET /api/users/me`, `PUT /api/users/me` | [`services/auth/README.md` -> Group G](../../services/auth/README.md#group-g-user-self-service--lifecycle) |
| **Emergency Contacts** | `GET/POST/PUT/DELETE /api/users/me/emergency-contacts` | [`services/auth/README.md` -> Group H](../../services/auth/README.md#group-h-emergency-contacts-rider-safety) |

---

## 3. Tech Stack

- **Framework:** Expo 58 (SDK 58), React Native 0.88, React 19.
- **Routing:** Expo Router (`expo-router/entry`) with typed routes.
- **Styling:** NativeWind 4.2 (`tailwindcss` 3.4) with Coral Sunset dark theme tokens.
- **State Management:** Zustand 5.0 (`useOnboardingStore`).
- **Validation:** Zod 4.
- **Security:** `expo-secure-store` for hardware-backed JWT storage.
- **Icons:** `lucide-react-native`.

---

## 4. Getting Started

### 1. Start the Metro Development Server
```bash
pnpm --filter pikyrider start
```

### 2. Run on Android Emulator / Device
```bash
pnpm --filter pikyrider android
```

### 3. Run on iOS Simulator / Device
```bash
pnpm --filter pikyrider ios
```

### 4. Verification Suite
```bash
# Typecheck
pnpm --filter pikyrider typecheck

# Linting
pnpm --filter pikyrider lint
```
