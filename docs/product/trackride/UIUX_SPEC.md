# UI/UX DESIGN SYSTEM & SCREEN ARCHITECTURE (UIUX_SPEC) — TRACKRIDE

## DOCUMENT CONTROL

- **Product Name:** TrackRide (Forginity Anchor Product #1)
- **AI Engine Profile:** UI/UX Skill Persona v2.0 (Visual Identity & Interface Focus)
- **Date Generated:** 2026-10-01
- **Associated Product Source:** [docs/product/trackride/PRD.md](file:///home/vikas/Documents/forginity/docs/product/trackride/PRD.md)
- **Target Implementation Path:** `apps/project-1` (TrackRide), `packages/ui`

---

## 1. GLOBAL VISUAL IDENTITY & POWDER COLOR PALETTE

### Design Theme Strategy
- **Aesthetic Direction:** Powder Dark Ride Theme — ultra-deep dark background (`#050606`) with high-contrast powder mint accents (`#67F29A`) and forest container surfaces (`#173326`) optimized for outdoor sunlight legibility and low battery consumption during touring.
- **Typography Standard:** **Lexend** (Google Font), with **Light (300)** and **Regular (400)** font weights applied as default UI typography.

### Color Tokens (Powder Dark Theme)

| Token Name | Hex Code | Purpose / Usage Context |
| :--- | :--- | :--- |
| **`bg`** | `#050606` | Main background surface, map canvas background |
| **`surface`** | `#121513` | Elevated card surfaces, floating corner controls, sheet panels |
| **`primary`** | `#173326` | Deep powder forest green primary buttons & container fills |
| **`primary-foreground`** | `#67F29A` | High-luminance powder mint green for active routes, CTAs & map pings |
| **`text`** | `#F5F7F5` | Primary headings, turn-by-turn guidance text, crisp typography |
| **`body`** | `#D7DCD9` | Default body paragraphs, POI names, sub-text |
| **`mute`** | `#7C8580` | Secondary labels, muted distance indicators, disabled buttons |
| **`error`** | `#C98793` | Soft powder rose/red for route deviation warnings, SOS, danger alerts |

---

## 2. DESIGN SYSTEM GUIDELINES & STANDARDS (GLOBAL SYSTEM GUIDE)

### A. Device Breakpoint Matrix

| Device Profile | Breakpoint Range | Navigation Pattern | Touch Target Minimum |
| :--- | :--- | :--- | :--- |
| **Mobile (Rider Mount)** | `320px – 639px` (`sm`) | Bottom Navigation Bar + Floating Corner Controls | `48px x 48px` (Gloved Hand Compliant) |
| **Tablet (Tour Organizer)** | `640px – 1023px` (`md`) | Split Map Canvas + Floating Drawer Sidebar | `48px x 48px` |
| **Desktop (Planning)** | `1024px – 1919px` (`lg`) | Dual-Panel Route Planner + Full Map | `40px x 40px` |

---

### B. Typography Scaling Matrix (Lexend Light Default)

| Element | Mobile (`sm`) | Desktop (`lg`) | Font Weight | Color Token |
| :--- | :--- | :--- | :--- | :--- |
| **Turn Distance Banner** | `32px` / `38px` LH | `44px` / `52px` LH | Lexend Medium (500) | `#67F29A` (Mint) |
| **Heading 1 (H1)** | `24px` / `30px` LH | `36px` / `44px` LH | Lexend Regular (400) | `#F5F7F5` (Text) |
| **Heading 2 (H2)** | `20px` / `26px` LH | `24px` / `32px` LH | Lexend Regular (400) | `#F5F7F5` (Text) |
| **Heading 3 (H3)** | `16px` / `22px` LH | `18px` / `26px` LH | Lexend Light (300) | `#67F29A` (Mint) |
| **Body Copy** | `14px` / `20px` LH | `15px` / `24px` LH | Lexend Light (300) | `#D7DCD9` (Body) |
| **Muted Captions** | `12px` / `16px` LH | `13px` / `18px` LH | Lexend Light (300) | `#7C8580` (Mute) |

---

### C. Spatial System & Border Radius Scale
- **Grid Rhythm:** `2xs` (4px), `xs` (8px), `sm` (12px), `md` (16px), `lg` (24px), `xl` (32px).
- **Border Radii:** `radius-sm` (4px), `radius-md` (8px), `radius-lg` (12px), `radius-full` (9999px for floating action buttons).

---

## 3. RIDE MODE UI & PERSISTENT FLOATING CORNER CONTROL

Ride Mode optimizes the interface specifically for motorcycle handlebar use:
- **Zero Distraction:** Disables satellite maps, complex vector overlays, and non-essential UI.
- **High Contrast:** Black background (`#050606`), bright powder mint active route line (`#67F29A`), and red off-route deviation line (`#C98793`).
- **Persistent Floating Corner Control (`FloatingRideControl`):** Compact 48dp glassmorphic pill located in the top-right corner containing:
  1. *Voice Mute Toggle* (Speaker Icon)
  2. *POI Filter & Radius Slider* (Fuel/Hospital/Mechanic quick toggle)
  3. *Map Orientation Toggle* (Heading-Up vs North-Up)
  4. *Ride Mode Toggle* (Minimal High-Contrast Mode)
  5. *Emergency SOS Trigger* (Red Powder Button `#C98793`)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [ ◄ 250m ] TURN RIGHT ON HIGHWAY 44                              [ 🔊 🔍 🧭 🌙 🆘 ]  │
│  Next: Fuel Station in 1.2km                                       (Floating Control)  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│                                       ▲ (Rider Marker #67F29A)                         │
│                                    ╱  │                                                │
│                       Planned     ╱   │                                                │
│                       Route ─────┼────┼────────────► Destination                       │
│                                       │                                                │
│                                       │ (Off-Route Deviation Red #C98793)              │
│                                       ▼                                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  Speed: 65 km/h  │  Dist: 42 km  │  ETA: 45 min  │  Battery: 84%   │ [ ⏸ PAUSE RIDE ] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. SCREEN ARCHITECTURE & USER EXPERIENCE MATRIX

### SCREEN 01: Onboarding & Emergency Contact Setup
- **Objective:** First-time user setup enforcing mandatory emergency contact entry for SOS.
- **Layout Anatomy:** Hero setup card, input field for contact name/phone, import from contacts button.
- **Visual States:**
  - *Ideal State:* Listed emergency contacts with green verified checkmarks.
  - *Empty State:* Friendly illustration: *"Add at least 1 emergency contact to enable SOS protection."*
  - *Loading State:* Skeleton input blocks.
  - *Error State:* Powder rose border on invalid phone numbers.

### SCREEN 02: Plan Ride & Route Comparison Canvas
- **Objective:** Select start, destination, multi-stops, and compare routes (*Fastest*, *Best for Riding*, *Scenic*).
- **Layout Anatomy:** Top search bar, route option tabs, multi-stop re-order list, return route toggle.
- **Visual States:**
  - *Ideal State:* 3 route polylines on map with duration/elevation chips.
  - *Empty State:* Map centered on current location with prompt: *"Where are you riding today?"*
  - *Loading State:* Pulse animation on route calculation vector.
  - *Error State:* Toast banner: *"Unable to calculate route off-grid without cached tiles."*

### SCREEN 03: Active Navigation & Live Ride Mode Map
- **Objective:** Real-time turn-by-turn guidance and continuous tracking.
- **Layout Anatomy:** Top guidance banner, map viewport with rider position arrow, bottom metric bar (speed, distance, ETA, battery level, Pause button), Floating Corner Control.
- **Visual States:**
  - *Ideal State:* Active green route line, live turn instructions, voice prompts.
  - *Empty State:* N/A (Active state only).
  - *Loading State:* Smooth GPS position interpolation.
  - *Error State:* Banner: *"GPS signal weak — using dead reckoning telemetry."*

### SCREEN 04: POI Detour & Deviation Warning Overlay
- **Objective:** Show nearby POIs and alert when off-route beyond 500m.
- **Layout Anatomy:** Top deviation alert banner in Powder Rose (`#C98793`), map showing original route vs detour path to fuel/hospital.
- **Visual States:**
  - *Ideal State:* Dual route paths (Primary planned route preserved in gray, temporary POI detour in mint).
  - *Empty State:* No POIs within selected radius.

### SCREEN 05: SOS Emergency & Accident Confirmation Modal
- **Objective:** Trigger emergency contact alerts or confirm accident status.
- **Layout Anatomy:** Full-screen modal overlay, 10-second countdown timer, *"I'M OK"* button, *"SEND SOS NOW"* button.
- **Visual States:**
  - *Ideal State:* Active 10s countdown with audio beeps.

### SCREEN 06: Group Ride Host & Member Tracking Map (MVP 2)
- **Objective:** Live tracking of multi-rider group sessions.
- **Layout Anatomy:** Shared map canvas with color-coded rider markers (Green = On-route, Amber = Lagging, Red = Off-route/Stalled), member drawer list.
- **Visual States:**
  - *Ideal State:* All group member markers updating in real-time.
  - *Empty State:* Share QR code modal to invite members.

### SCREEN 07: Interactive Map-Based Ride History ("What I Planned vs What Happened")
- **Objective:** Post-ride review comparing planned vs actual route taken.
- **Layout Anatomy:** Full-screen interactive map, timeline scrubber, overlay toggles (Planned route, Actual route, Stops, Detours, POIs, Speed profile).
- **Visual States:**
  - *Ideal State:* Layered map comparison with timeline slider.

---

## 5. REVENUE & INTERACTION TRANSITION MAPS

```text
Open App ➔ Onboarding (Emergency Contact Setup) ➔ Plan Ride ➔ Compare Routes
                                                                    │
                                                                    ▼
                                                            Start Ride (Free Solo)
                                                                    │
                                                  ┌─────────────────┴─────────────────┐
                                                  ▼                                   ▼
                                           Normal Riding                       Group Ride Host
                                         (Ride Mode Navigation)           (Prompt ₹300 Host Fee)
                                                  │                                   │
                                      ┌───────────┼───────────┐                       ▼
                                      ▼           ▼           ▼               Group Live Map Sync
                                  POI Detour  Deviation   Accident/SOS            (Free for Members)
                                      │           │           │
                                      └───────────┼───────────┘
                                                  ▼
                                            End Ride / Pause
                                                  │
                                                  ▼
                                      Interactive Ride History
```

---
