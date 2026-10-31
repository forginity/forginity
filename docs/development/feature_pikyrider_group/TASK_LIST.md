# TASK LIST: FEATURE_PIKYRIDER_GROUP

## 1. SERVICE DETAILS

- **Feature Name:** `mobile_apps/pikyrider` (Group Tour Suite)
- **Domain:** TrackRide / PikyRider Motorcycle Group Tour Awareness & Safety
- **Purpose:** Live group ride coordination, multi-rider radar tracking, member separation alerts, and emergency stall/fall detection for motorcycle touring groups with host-paid session monetization.
- **Key Features & Flows:**
  - Group ride session creation, invite PIN generation, and member join flow.
  - Real-time location beacon dispatch and group rider radar over WebSockets.
  - Rider separation and lag alerts when members fall behind.
  - Stall and incident detection when a rider is stationary off-schedule.
  - Group tour completion and shared ride log summary.
- **Tech Stack:** React Native, Expo, TypeScript, Socket.IO client, Redis Pub/Sub, Turf.js.
- **Reference Specification:** [`./README.md`](./README.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](file:///home/vikas/Documents/forginity/docs/development/feature_pikyrider_group/IMPLEMENTATIONS_RECORD.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Group Ride Session Management & Invite Flow | Session lifecycle, 6-character ride PIN, join and leave handshake | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-02` | Real-time Group Location Beacon & Live Radar | Low-bandwidth GPS ping ingestion via Socket.IO, multi-rider map radar | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-03` | Separation & Lag Alert System | Distance threshold checking between leader, sweep, and individual riders | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-04` | Stall & Emergency SOS Broadcast | Stationary motion detection, manual SOS trigger, priority intercom broadcast | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-05` | Group Tour Completion & Shared Ride Log | Synchronized group telemetry rollup, group formation score, recap card | [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Group Ride Session Management & Invite Flow
- **Description:** Implement ride session creation with route selection and guest capacity limit (up to 5 riders).
  Generate short 6-character alphanumeric PINs and QR codes for quick joining.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-02`: Real-time Group Location Beacon & Live Radar
- **Description:** Implement high-efficiency GPS coordinate stream over WebSockets.
  Render member markers with heading indicators and rider avatars on the active navigation map.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-03`: Separation & Lag Alert System
- **Description:** Calculate distance metrics between all active riders using Turf.js.
  Dispatch audio and visual notifications when a member falls behind the designated convoy spacing.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-04`: Stall & Emergency SOS Broadcast
- **Description:** Detect unexpected prolonged stops through accelerometer and GPS stillness triggers.
  Broadcast high-priority alerts with pinned coordinates to all group members and emergency contacts.
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-05`: Group Tour Completion & Shared Ride Log
- **Description:** Aggregate telemetry data from all group riders into a unified ride summary.
  Calculate formation cohesion scores, total trip duration, and exportable group GPX routes.
- **Guide:** [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)
