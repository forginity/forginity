# FEATURE SPECIFICATION: FEATURE_PIKYRIDER_GROUP

## 1. EXECUTIVE SUMMARY

- **Feature Name:** `mobile_apps/pikyrider` (Group Tour Suite)
- **Folder Reference:** `docs/development/feature_pikyrider_group`
- **Domain:** TrackRide / PikyRider Motorcycle Group Tour Awareness & Safety
- **Owner:** Mobile Navigation & Real-time Systems Team
- **Purpose:** Provide live group ride coordination, multi-rider radar tracking, member separation alerts, and emergency stall/fall detection for motorcycle touring groups. Supports host-paid group sessions where the tour host pays a fixed ride fee and guests join seamlessly via ride codes.
- **Consumers:** PikyRider Mobile Client (iOS and Android via React Native / Expo) and `services/notification-api`.
- **Development Roadmap:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 2. BUSINESS & FUNCTIONAL REQUIREMENTS

### Core Capabilities
- **Group Ride Session Creation & Joining:** Tour hosts create sessions, choose routes, and share 6-character ride codes for up to 5 members.
- **Real-Time Group Radar:** Visual multi-rider map radar displaying real-time coordinates, bearing, and speeds of all active group members.
- **Rider Separation & Lag Detection:** Automated notifications when a rider falls outside the configurable group distance threshold (e.g. >1.5 km behind the leader).
- **Stall & Emergency Crash Detection:** Stationary motion triggers alert other riders if a group member halts unexpectedly for more than 3 minutes.
- **Group Tour Summary & Recap:** Aggregated group stats showing total ride time, formation coherence score, distance covered, and rider roster.

### User Flows & Workflows
1. **Group Session Setup:**
   - Host initiates a new group ride in PikyRider and selects the planned route.
   - Host completes host-paid checkout (₹300 per group session via `services/payment-api`).
   - System returns a unique 6-character ride PIN.
   - Guest riders enter the PIN or tap deep link to join the live session for free.
2. **Live Group Tracking & Separation Alert:**
   - Riders broadcast lightweight telemetry pings every 3 seconds over WebSockets.
   - Sweep rider or trailing member lags behind due to traffic or breakdown.
   - Leader and tail riders receive instant audible alerts on intercoms: "Rider [Name] is 2 km behind".

---

## 3. ARCHITECTURE & TECH STACK

- **Client Runtime:** React Native with Expo, TypeScript.
- **Real-time Messaging:** WebSocket client connecting to Socket.IO and Redis Pub/Sub gateway.
- **Spatial Clustering:** Turf.js for inter-rider distance matrices and convex hull calculations.
- **Backend Services Consumed:**
  - `services/payment-api` (Host-paid ride passes)
  - `services/notification-api` (Real-time WebSocket dispatch and push notifications)
  - `services/auth` (User identity and session tokens)
- **Architectural Reference:** [`docs/org/TDD.md`](file:///home/vikas/Documents/forginity/docs/org/TDD.md)

---

## 4. DOMAIN DATA MODELS

Managed across client cache and backend `trackride_db`:

- **Group Ride Session (`group_sessions`):** Session UUID, host user ID, 6-character join PIN, status (`created`, `active`, `completed`), max riders (default 5).
- **Group Member (`group_members`):** Session UUID, user ID, role (`host`, `leader`, `sweep`, `member`), joined at, last ping at.
- **Group Location Ping (`group_pings`):** Session UUID, user ID, latitude, longitude, speed, heading, timestamp.
- **Group Alert Event (`group_alerts`):** Alert UUID, session UUID, rider ID, alert type (`lag`, `stall`, `sos`, `deviation`), timestamp.

---

## 5. SECURITY & COMPLIANCE

- **Zero `.env` Access:** Secrets are read strictly from runtime environment variables.
- **Ephemeral Session PINs:** Group ride join codes expire 2 hours after ride completion.
- **Low-Bandwidth Telemetry:** Delta compression minimizes mobile data usage and packet size during rides.
