# FEATURE SPECIFICATION: FEATURE_PIKYRIDER_AUTH

## 1. EXECUTIVE SUMMARY

- **Feature Name:** `mobile_apps/pikyrider` (Authentication & Session Suite)
- **Folder Reference:** `docs/development/feature_pikyrider_auth`
- **Domain:** TrackRide / PikyRider Mobile Authentication & Onboarding
- **Owner:** Mobile Platform & Identity Engineering Team
- **Purpose:** Provide secure rider authentication, sign-up, login, profile onboarding, and session persistence for the PikyRider mobile app via integration with `services/auth`.
- **Consumers:** PikyRider Mobile Application (iOS & Android via React Native / Expo).
- **Development Roadmap:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 2. BUSINESS & FUNCTIONAL REQUIREMENTS

### Core Capabilities
- **Mobile Auth Network Client:** Configured HTTP client with base URL targeting `services/auth`, request timeout guards, and response interceptors.
- **Rider Sign-Up & OTP Verification:** User registration using mobile phone number or email with one-time password verification screen.
- **Rider Sign-In & Secure Storage:** Credential validation returning JWT access and refresh tokens stored securely in `Expo SecureStore` (iOS Keychain / Android Keystore).
- **Rider Onboarding Flow:** Post-registration screen collecting rider nickname, emergency contact phone number, and motorcycle model.
- **Session Auto-Hydration & Logout:** Biometric or keychain-based automatic login on app cold start, silent token refreshing, and full session revocation on logout.

### User Flows & Workflows
1. **Rider Registration:**
   - User downloads and launches PikyRider app.
   - User enters phone number and receives SMS OTP.
   - User verifies OTP code and lands on the profile onboarding screen.
   - App calls `POST /api/auth/register` and saves returned tokens securely.
2. **Cold App Launch:**
   - App initializes and checks `Expo SecureStore` for active access token.
   - If token is valid, user is redirected directly to the navigation home screen.
   - If token is expired, app attempts silent refresh via `services/auth`.

---

## 3. ARCHITECTURE & TECH STACK

- **Client Runtime:** React Native with Expo, TypeScript.
- **Secure Storage:** `expo-secure-store` for hardware-backed token encryption.
- **State Management:** React Context or Zustand for auth session state.
- **Validation Engine:** Zod for mobile form input validation.
- **Backend Service Consumed:** [`services/auth`](file:///home/vikas/Documents/forginity/services/auth).

---

## 4. SECURITY & COMPLIANCE

- **Zero `.env` Access:** Backend API hosts are read from build configuration environment variables.
- **Secure Token Storage:** Auth tokens are never stored in unencrypted `AsyncStorage`; all keys live in Keychain/Keystore.
- **Auto-Logout on Revocation:** HTTP 401 response interceptor immediately clears cached credentials and returns rider to the login screen.
