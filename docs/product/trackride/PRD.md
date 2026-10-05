# PRODUCT REQUIREMENTS DOCUMENT (PRD) — TRACKRIDE

## DOCUMENT CONTROL

- **Product Name:** TrackRide (Forginity Flagship Product #1)
- **AI Engine Profile:** PM Skill Persona v1.0 (Comprehensive Product Specification)
- **Date Updated:** 2026-10-01
- **Target Release Milestone:** MVP 1 (Solo Touring Validation) & MVP 2 (Group Riding & Monetization)
- **Associated Strategy Source:** [docs/product/trackride/SMA-PVR.md](file:///home/vikas/Documents/forginity/docs/product/trackride/SMA-PVR.md)
- **Target Path:** `docs/product/trackride/PRD.md`

---

## 1. EXECUTIVE SUMMARY & PRODUCT VISION

- **Product Vision:** TrackRide is a motorcycle-focused navigation, tracking, and ride-awareness application designed specifically for real-world motorcycle touring. Core Promise: _"Never lose your route, never lose your group."_
- **User Personas:**
  1. _Solo Touring Rider (P1):_ Long-distance rider needing voice-guided navigation, offline map caching, battery-friendly tracking, route deviation alerts, emergency POIs, and accident/SOS protection.
  2. _Group Ride Host / Club Lead (P2):_ Touring group captain who plans group routes, creates group ride sessions, pays the host fee (₹300/ride), and monitors member locations and safety in real-time.
  3. _Group Member Rider (P3):_ Rider joining a group session for free via QR/invite link to view group positions on the map and receive route deviation alerts.
- **Core Value Metrics:**
  - Zero lost riders during group touring expeditions.
  - Hourly background GPS battery consumption under 5% additional drain.
  - 100% offline navigation and telemetry caching during cell signal loss.

---

## 2. SYSTEM USER STORIES & PRIORITIZATION (MoSCoW MATRIX)

| ID        | User Persona | User Story (As a... I want to... So that...)                                                                                                                        | Priority               |
| :-------- | :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------- |
| **US-01** | Solo Rider   | As a rider, I want to register/login via Forginity SSO and set up emergency contacts (min 1 required) so that SOS alerts can reach my trusted contacts.             | **Must Have (MVP 1)**  |
| **US-02** | Solo Rider   | As a rider, I want to plan multi-stop routes with return route options and compare route types (Fastest, Best for Riding, Scenic) so I can choose the optimal path. | **Must Have (MVP 1)**  |
| **US-03** | Solo Rider   | As a rider, I want turn-by-turn voice navigation with a quick-mute toggle so I can navigate safely while keeping my eyes on the road.                               | **Must Have (MVP 1)**  |
| **US-04** | Solo Rider   | As a rider, I want a Ride Mode UI with high contrast, large touch targets (≥44/48dp), and no satellite map bloat to optimize battery life and sunlight visibility.  | **Must Have (MVP 1)**  |
| **US-05** | Solo Rider   | As a rider, I want a persistent Floating Corner Control panel on the map for instant access to voice mute, POI filters, orientation, Ride Mode, and SOS.            | **Must Have (MVP 1)**  |
| **US-06** | Solo Rider   | As a rider, I want essential POIs (fuel, hospital, mechanic, ATM, food) displayed along my forward route vector within a 3km/custom radius.                         | **Must Have (MVP 1)**  |
| **US-07** | Solo Rider   | As a rider, I want POI detours to calculate temporary routes without modifying or destroying my primary planned route.                                              | **Must Have (MVP 1)**  |
| **US-08** | Solo Rider   | As a rider, I want automated route deviation alerts evaluating distance (e.g. 500m), duration, and heading so I am warned when taking a wrong split.                | **Must Have (MVP 1)**  |
| **US-09** | Solo Rider   | As a rider, I want offline ride tracking so my journey is cached locally during cell coverage drops and auto-synced upon reconnecting.                              | **Must Have (MVP 1)**  |
| **US-10** | Solo Rider   | As a rider, I want one-tap SOS emergency dispatch that sends my location to emergency contacts and shares WhatsApp live location.                                   | **Must Have (MVP 1)**  |
| **US-11** | Solo Rider   | As a rider, I want automated accident and no-movement prompts (_"Are you okay?"_) to quickly trigger SOS if I crash or stall.                                       | **Must Have (MVP 1)**  |
| **US-12** | Solo Rider   | As a rider, I want to submit and view community Road Danger Reports (road blocked, accident, flood, damage) active for 24 hours.                                    | **Must Have (MVP 1)**  |
| **US-13** | Solo Rider   | As a rider, I want to pause my ride session during overnight hotel stays and resume it the next day under the same unified Ride ID.                                 | **Must Have (MVP 1)**  |
| **US-14** | Solo Rider   | As a rider, I want an interactive map-based Ride History comparing my planned route vs actual path taken, detours, stops, and alerts.                               | **Must Have (MVP 1)**  |
| **US-15** | Group Host   | As a group host, I want to create a group ride (₹300 host fee) and invite members via link/QR code so everyone follows a shared route.                              | **Must Have (MVP 2)**  |
| **US-16** | Group Host   | As a group host, I want live map tracking of all group members to see their positions and receive alerts if anyone lags or strays.                                  | **Must Have (MVP 2)**  |
| **US-17** | Group Member | As a group member, I want to join group rides for free without needing an individual paid subscription.                                                             | **Must Have (MVP 2)**  |
| **US-18** | Solo Rider   | As a rider, I want an AI assistant to suggest curated dream-touring routes based on my ride history.                                                                | **Could Have (MVP 3)** |

---

## 3. COMPREHENSIVE FUNCTIONAL REQUIREMENTS & ACCEPTANCE CRITERIA

### FR-01: Account & Emergency Contact Setup

- **Description:** User authentication via Forginity SSO and emergency contact registration.
- **Acceptance Criteria 1:** Minimum 1 emergency contact is mandatory before a user can start a Ride. Unlimited emergency contacts may be added.
- **Acceptance Criteria 2:** SSO authentication persists across offline states via secure local storage.

### FR-02: Multi-Stop Route Planning & Route Options Engine

- **Description:** Route planning with multi-stop insertion, favorite locations, return route setup, and route comparison.
- **Acceptance Criteria 1:** System provides route options: _Fastest_, _Best for Riding_ (evaluating road quality, highway vs rural preference, scenic value), _Scenic_, and _Alternative_.
- **Acceptance Criteria 2:** Riders can add multi-stops via address search, POI search, or direct map location selection.

### FR-03: Voice-Guided Offline-First Navigation

- **Description:** Turn-by-turn voice navigation with local tile/node caching.
- **Acceptance Criteria 1:** Voice navigation is enabled by default with a persistent one-tap mute control.
- **Acceptance Criteria 2:** When network connectivity drops to 0 bars, navigation continues seamlessly using pre-fetched offline route packages.

### FR-04: High-Contrast Ride Mode UI

- **Description:** Dedicated motorcycle UI optimized for sunlight legibility and gloved touch.
- **Acceptance Criteria 1:** Ride Mode enforces high-contrast Powder Dark Theme (`#050606` background, `#F5F7F5` text, `#67F29A` accents).
- **Acceptance Criteria 2:** Disables satellite map rendering, complex animations, and non-essential UI elements to conserve battery and reduce network payload. All buttons enforce min `44x44dp` / `48x48dp` touch targets.

### FR-05: Persistent Floating Corner Ride Control

- **Description:** Floating compact control overlay providing instant access to critical ride functions without navigating away from the map.
- **Acceptance Criteria 1:** Contains quick toggles for: Voice Mute, POI Filter & Radius Slider, Map Orientation (Heading-up vs North-up), Ride Mode Toggle, and Emergency SOS.

### FR-06: Essential Points of Interest (POI) & Detour Preservation Engine

- **Description:** Forward-vector POI discovery and non-destructive detour routing.
- **Categories:** Petrol pump, EV charging, Restaurant/Food, ATM, Police station, Motorcycle service/mechanics, Hospital.
- **Acceptance Criteria 1:** Default behavior displays the nearest 2 relevant POIs within 3km along the forward route path. Radius and categories are rider-configurable.
- **Acceptance Criteria 2:** Selecting a POI calculates a temporary detour to the POI and a return route leg back to the main route without modifying or destroying the primary planned route.

### FR-07: Route Deviation Analysis & Alerting

- **Description:** Geodesic boundary algorithm evaluating distance, duration, and heading alignment.
- **Acceptance Criteria 1:** System evaluates distance offset (e.g. 500m threshold), duration off-route (>30s), and heading vector.
- **Acceptance Criteria 2:** When deviation is confirmed, trigger audio alert _"Route deviation detected"_ and display the off-route path in red on the map.

### FR-08: Offline Telemetry Tracking & Auto-Sync

- **Description:** Local storage engine for continuous ride location logging off-grid.
- **Acceptance Criteria 1:** During network loss, raw GPS telemetry pings are written to local SQLite/IndexedDB.
- **Acceptance Criteria 2:** When cell coverage is restored, local telemetry syncs automatically to the `services/auth` and product backend in background batches.

### FR-09: One-Tap Emergency SOS & Contact Notification

- **Description:** Instant emergency trigger for solo and group riders.
- **Acceptance Criteria 1:** Triggering SOS grabs exact GPS coordinates, dispatches SMS/calls to configured emergency contacts, and generates a pre-formatted WhatsApp live-location sharing payload.

### FR-10: Accident & Prolonged No-Movement Detection

- **Description:** Impact and stationary hazard detection.
- **Acceptance Criteria 1:** Sudden deceleration/impact triggers dialog: _"Possible accident detected — Are you okay? [I'M OK] [SEND SOS]"_. Requires manual confirmation before SOS dispatch in MVP 1.
- **Acceptance Criteria 2:** Prolonged stationary status (>5 mins while active) triggers a no-movement rider alert.

### FR-11: Road Danger Community Reporting

- **Description:** Crowd-sourced hazard markers on the live navigation map.
- **Acceptance Criteria 1:** Riders can report hazards: _Road Blocked_, _Dangerous Road_, _Accident_, _Flood / Water_, _Road Damage_.
- **Acceptance Criteria 2:** Reports display on maps for all active riders in the area and auto-expire after 24 hours.

### FR-12: Multi-Day Ride Session Lifecycle (Pause & Resume)

- **Description:** Session suspension for overnight hotel stays and long breaks.
- **Acceptance Criteria 1:** Selecting "Pause Ride" completely stops background GPS sampling without ending the Ride record.
- **Acceptance Criteria 2:** Selecting "Resume Ride" restores tracking and navigation under the original unified Ride ID.

### FR-13: Interactive Map-Based Ride History ("What I Planned vs What Happened")

- **Description:** Post-ride interactive map visualizer comparing planned vs actual route.
- **Acceptance Criteria 1:** Interactive map displays dual route overlays: Planned Route line vs Actual GPS Track line, stops, detours, visited POIs, deviation points, danger alerts, speed timeline, and breaks.

### FR-14: Real-Time Group Ride Tracking & Radius Sync (MVP 2)

- **Description:** Multi-rider real-time position overlay on shared map.
- **Acceptance Criteria 1:** Group Host creates ride (Host fee ₹300/ride up to 5 members). Members join free via QR code or invite link.
- **Acceptance Criteria 2:** Real-time WebSockets overlay all member map markers. If a member strays or stalls, their marker turns red and dispatches an alert to the host and group.

---

## 4. NON-FUNCTIONAL REQUIREMENTS

- **Offline Resiliency:** Complete ride history telemetry must be stored in local IndexedDB / SQLite when offline and synced automatically upon network restoration.
- **Performance:** Map rendering at 60 FPS; real-time socket location update latencies < 1.5 seconds when connected to 4G/5G.
- **Mobile Usability:** Powder Dark Theme UI design optimized for sunlight readability, high touch target sizes (minimum 44x44dp / 48x48dp), and voice-first prompts.
- **Battery Optimization:** Dynamic GPS sampling algorithm (15s pings when moving >40 km/h; 60s pings when stationary >5 mins) keeping hourly background GPS battery drain < 5%.

---

## 5. PRODUCT ROADMAP & SCOPE BOUNDARIES

### MVP 1 Scope (Solo Rider - Core Validation)

- Account & Emergency Contacts setup (min 1 contact mandatory).
- Multi-stop route planning, return route setup, route options (Fastest, Best for Riding, Scenic).
- Turn-by-turn voice navigation with mute toggle.
- High-contrast Powder Dark Ride Mode & Floating Corner Ride Control.
- Essential POI discovery (fuel, hospital, mechanic, ATM, food) with non-destructive Detour Preservation.
- Route deviation alerts (distance, duration, heading).
- Offline tracking & local telemetry auto-sync.
- One-tap SOS, Accident Detection prompt, No-Movement warning, Road Danger reports.
- Multi-day Pause & Resume ride session management.
- Interactive Map-Based Ride History (Planned vs Actual Route).

### MVP 2 Scope (Group Riding & Monetization)

- Group creation by Host (Host fee: ₹300/ride up to 5 members + ₹50/extra member).
- Free member joining via QR code / link.
- Multi-rider live location map overlay.
- Group member deviation & danger alerts.

### Explicitly Out of Scope for MVP 1 & 2

- AI route generation & automated dream-ride planner (Deferred to MVP 3).
- Social community feeds, public ride discovery, rider followers (Deferred to MVP 4).
- Competitive mileage prize pools (Deferred to MVP 5 — evaluated after ₹1Cr/year revenue).
- In-app group voice intercom calling (Deferred to Future Release).

---
