# TRACKRIDE — SCREEN-BY-SCREEN SPECIFICATION & USER FLOWS (SCREEN)

## DOCUMENT CONTROL

- **Product Name:** TrackRide (Forginity Anchor Product #1)
- **Document Type:** Full Screen Architecture, Layout Breakdown & User Flows
- **AI Engine Profile:** UI/UX Skill Persona v2.0 (Screen Specification & Flow Focus)
- **Date Generated:** 2026-10-01
- **Associated Specs:** [docs/product/trackride/PRD.md](file:///home/vikas/Documents/forginity/docs/product/trackride/PRD.md), [docs/product/trackride/UIUX_SPEC.md](file:///home/vikas/Documents/forginity/docs/product/trackride/UIUX_SPEC.md), [docs_old/TrackRide/Figma.md](file:///home/vikas/Documents/forginity/docs_old/TrackRide/Figma.md)
- **Target Path:** `docs/product/trackride/SCREEN.md`

---

## 1. COMPREHENSIVE USER FLOW BLUEPRINTS

### Flow A: Onboarding & First-Time Launch
```text
Open TrackRide (Splash Screen)
 └─► Login / Sign-up Screen (Forginity SSO)
       └─► Location & Background Location Permissions
             └─► Mandatory Emergency Contact Setup (Min 1 Contact)
                   └─► Home / Dashboard Canvas
```

### Flow B: Plan Ride & Route Selection
```text
Home / Dashboard Canvas
 └─► Tap "Plan New Ride"
       └─► Select Start Location (Search / Address / Map Picker)
             └─► Select Destination (Search / Address / Map Picker)
                   └─► Add Multi-Stops (Optional)
                         └─► Calculate Routes & Compare (Fastest, Best for Riding, Scenic)
                               └─► Optional Return Route Configuration
                                     └─► Ride Ready Summary Overlay
                                           └─► Start Ride ──► Active Navigation (Ride Mode)
```

### Flow C: Active Navigation & Essential POI Detour
```text
Active Navigation (Ride Mode)
 ├─► Receive Voice Guidance & Turn Instructions
 ├─► Floating Corner Control (Mute, POI Filter, Orientation, Ride Mode, SOS)
 ├─► Tap "Find POI" (Fuel / Hospital / Mechanic / ATM / Food)
 │     └─► POI Bottom Sheet (Sorted by distance along forward vector)
 │           └─► Select POI ──► Calculate Temporary Detour
 │                 └─► Navigate to POI ──► Complete Stop ──► Calculate Return to Main Route
 └─► Destination Reached ──► End Ride ──► Interactive Map Ride History
```

### Flow D: Route Deviation & Safety Escalation
```text
Rider strays off planned route (>500m radius threshold)
 └─► Evaluate Distance + Duration + Heading Vector
       └─► Route Deviation Alert Triggered ("Route deviation detected")
             ├─► Return to Route Guidance (Highlight off-route path in red)
             └─► Sudden Deceleration / Stationary > 5 mins
                   └─► Accident / No-Movement Prompt ("Are you okay?")
                         ├─► Tap "I'M OK" ──► Resume Navigation
                         └─► Tap "SEND SOS" / Timeout ──► Dispatch Emergency Contacts & WhatsApp Location
```

### Flow E: Multi-Day Session Management (Pause & Resume)
```text
Active Riding ──► Reach Hotel / Long Break ──► Tap "Pause Ride"
                                                       │
                                  Background GPS Suspended / Ride Record Preserved
                                                       │
Overnight Break ──► Open App ──► Tap "Resume Ride" ──► Continue Navigation & Tracking
```

---

## 2. DETAILED SCREEN-BY-SCREEN SPECIFICATIONS

---

### SCREEN 01: Splash / Launch Screen
- **Purpose:** Brand introduction and initial SSO session hydration.
- **Layout:** Full-screen deep dark background (`#050606`) with centered vector Forginity Spark logo and tagline.
- **Components & Content:**
  - Forginity Emblem & TrackRide Logo in Powder Mint (`#67F29A`).
  - Animated Tagline: *"Never lose your route, never lose your group."* (Lexend Light 300, `#D7DCD9`).
  - Progress indicator bar at bottom.
- **Behavior:** Cold start displays logo with subtle scale-up animation (<800ms). Auto-transitions to Login or Home based on SSO session validity.

---

### SCREEN 02: Login / Sign-up Screen (Forginity SSO)
- **Purpose:** Authenticate user via Forginity SSO or create new account.
- **Layout:** Centered card form on dark surface (`#121513`) with `#050606` background.
- **Components & Content:**
  - Title: *"Log in to Forginity"* (Lexend Regular, `#F5F7F5`).
  - Fields: Email / Username, Password with show/hide toggle.
  - Primary CTA: *"Log In"* button (`#173326` background, `#67F29A` text, min 48px height).
  - OAuth Buttons: Google, Passkeys, Magic Link.
  - Secondary Links: *"Create an Account"* and *"Forgot Password?"* (`#7C8580`).
- **Behavior:** Real-time form validation highlighting errors in Powder Rose (`#C98793`). Successful auth directs first-time users to Emergency Contact Setup.

---

### SCREEN 03: Onboarding — Emergency Contact Setup
- **Purpose:** Mandatory configuration of emergency contacts before starting a ride.
- **Layout:** Full-height form container with progress steps header.
- **Components & Content:**
  - Banner: *"Emergency Contact Required (Min 1)"* (Lexend Regular, `#F5F7F5`).
  - Input Fields: Contact Name, Phone Number, Relationship (`#D7DCD9`).
  - Quick Action: *"Import from Phone Contacts"* (`#173326`).
  - Primary CTA: *"Save & Continue to Map"* (`#67F29A` text button).
- **Behavior:** Prevents ride activation until at least 1 verified contact is saved. Contacts sync to central `auth_db.user_emergency_contacts`.

---

### SCREEN 04: Home / Dashboard Canvas
- **Purpose:** Main entry point displaying current location map, active profile, and primary ride triggers.
- **Layout:** Full-screen dark map background with top status bar and floating bottom action card (`#121513`).
- **Components & Content:**
  - Top Bar: Greeting *"Good morning, [Rider Name]"*, Profile avatar icon, Network status pill (`Online` / `Offline`).
  - Main Cards:
    1. *"Plan a New Ride"* (Large primary card with route polyline icon).
    2. *"Create / Join Group Ride"* (MVP 2 group card).
  - Quick Drawer: *"Recent Rides"* list, *"Saved Favorite Routes"*, *"App Settings"*.
- **Behavior:** Tapping "Plan a New Ride" transitions to Route Selection Canvas. If offline, displays *"Offline Mode: Past rides available"*.

---

### SCREEN 05: Plan Ride — Start & Destination Selection
- **Purpose:** Set starting point, destination, and initial map pins.
- **Layout:** Full-screen dark map with floating top search overlay and bottom waypoint sheet.
- **Components & Content:**
  - Top Field 1: *"Start Location"* (Defaults to current GPS position with map pin picker button).
  - Top Field 2: *"Destination Location"* (Autocomplete text search + recent destinations).
  - Map Markers: Green start pin, Red destination pin, preview connecting polyline.
  - Bottom Controls: *"Add Waypoint / Stop"* button (+ icon) and *"Next: Compare Routes"* CTA.
- **Behavior:** Tapping map directly drops start/destination pins. Autocomplete works offline using pre-cached local place indexes.

---

### SCREEN 06: Plan Ride — Multi-Stops & Route Comparison Canvas
- **Purpose:** Insert intermediate stops and compare calculated route options.
- **Layout:** Split-screen: Top 60% dark map showing route alternatives, Bottom 40% scrollable route cards.
- **Components & Content:**
  - Stop List: Drag-to-reorder list of waypoints with remove buttons.
  - Route Cards (Horizontal Slider):
    1. **Fastest:** Distance, estimated duration, highway breakdown.
    2. **Best for Riding:** Road quality index, twisty rating, scenic score, width rating.
    3. **Scenic:** Scenic overview, POI count.
  - Toggle: *"Add Return Route"* switch.
  - Primary CTA: *"Select Route & Confirm"* (`#173326` fill, `#67F29A` text).
- **Behavior:** Tapping a route card highlights its polyline on the map canvas in bright powder mint (`#67F29A`).

---

### SCREEN 07: Ride Ready Confirmation Summary
- **Purpose:** Final pre-ride check showing summary metrics and essentials setup.
- **Layout:** Floating sheet card (`#121513`) overlaid on full-screen map preview.
- **Components & Content:**
  - Headline: *"Your Ride is Ready!"* (Lexend Regular 400).
  - Summary Metrics: Total Distance (km), Estimated Riding Time (hrs), Required Fuel Stops count, Weather forecast along path.
  - Configurable Toggles: POI Alert Radius (Slider 1km–10km), Voice Guidance Mute switch.
  - Primary CTAs: Large Green *"START RIDE"* (`#67F29A` background, 56px height) and Gray *"Edit Route"*.
- **Behavior:** Tapping "START RIDE" initializes background GPS tracking, activates Ride Mode UI, and opens Screen 08.

---

### SCREEN 08: Active Navigation & Live Ride Mode Map
- **Purpose:** Turn-by-turn guidance and real-time tracking optimized for motorcycle handlebars.
- **Layout:** Full-screen dark map canvas (`#050606`), Top Turn Guidance Banner, Bottom Telemetry Bar, Persistent Top-Right Floating Corner Control.
- **Components & Content:**
  - Top Turn Banner: Large turn arrow icon (e.g. ◄ 250m TURN RIGHT), next maneuver instruction, distance to turn (Lexend Medium 500, `#67F29A`).
  - Map Viewport: High-contrast dark map, neon powder mint route line (`#67F29A`), rider position arrow.
  - Floating Corner Control (`FloatingRideControl` pill `#121513`):
    - Speaker Icon (Voice Mute Toggle)
    - Search Lens (POI Quick Filter)
    - Compass (Heading-Up vs North-Up Toggle)
    - Moon/Ride Mode Toggle
    - Red SOS Button (`#C98793`)
  - Bottom Telemetry Bar: Speedometer (km/h), Distance Remaining (km), ETA, Phone Battery Level %, and *"PAUSE RIDE"* button.
- **Behavior:** Voice navigation plays over Bluetooth intercom. Disables satellite maps and unnecessary graphics to keep battery consumption <5%/hour.

---

### SCREEN 09: Nearby POI Discovery Sheet (Essentials)
- **Purpose:** Discover nearby fuel, hospitals, mechanics, ATMs, and food along the forward route vector.
- **Layout:** Slide-up bottom sheet over navigation map when POI icon is tapped.
- **Components & Content:**
  - Category Tabs (Horizontal Pill Slider): `Petrol Pump`, `Hospital`, `Motorcycle Repair`, `ATM`, `Food`.
  - POI Item List: Name, distance along forward vector (e.g. *"Fuel Station - 1.8 km ahead"*), brand icon, open/close status.
  - Action Button per POI: *"Navigate Detour"*.
- **Behavior:** Pre-fetches POIs within selected radius. Offline mode displays cached local POIs.

---

### SCREEN 10: POI Detour & Route Preservation Overlay
- **Purpose:** Guide rider to a selected POI without destroying the main planned route.
- **Layout:** Navigation map displaying dual polylines: Primary planned route in muted gray (`#7C8580`), temporary detour leg to POI in powder mint (`#67F29A`).
- **Components & Content:**
  - Top Banner: *"Detour to [POI Name] — Return to main route after stop."*
  - Control Button: *"Cancel Detour & Resume Main Route"*.
- **Behavior:** Upon arriving at POI and finishing stop, auto-calculates return leg back to closest node on primary route.

---

### SCREEN 11: Route Deviation & Return-to-Route Alert
- **Purpose:** Alert rider when off-route beyond set threshold (500m) and provide return guidance.
- **Layout:** Top alert bar flashing in Powder Rose (`#C98793`), map showing off-route path in red.
- **Components & Content:**
  - Alert Text: *"Route Deviation Detected — You are 650m off planned route."*
  - Voice Audio Prompt: *"Route deviation detected."*
  - CTAs: *"Recalculate Return Route"* (`#67F29A`) and *"Ignore Deviation"*.
- **Behavior:** Evaluates distance + duration + heading before triggering to prevent false alarms from minor GPS jitter.

---

### SCREEN 12: Pause / Break Overlay (Multi-Day Session)
- **Purpose:** Halt tracking during hotel stays or long meals without ending the ride record.
- **Layout:** Dimmed navigation map with centered modal dialog (`#121513`).
- **Components & Content:**
  - Message: *"Pause Ride Tracking?"* — *"Background GPS will sleep to save battery. Resume anytime."*
  - Break Duration Counter: `00:45:12` elapsed pause time.
  - Buttons: Primary *"RESUME RIDE"* (`#67F29A`) and *"End Ride & Save"*.
- **Behavior:** Tapping Pause suspends background location sampling completely. Tapping Resume restores active navigation under original Ride ID.

---

### SCREEN 13: Emergency SOS & Accident Confirmation Modal
- **Purpose:** Confirm rider safety after impact/stall or dispatch emergency contacts.
- **Layout:** Full-screen high-priority alert overlay in Powder Rose border (`#C98793`).
- **Components & Content:**
  - Countdown Timer: 10-second visual radial countdown with audio beeps.
  - Message: *"Possible accident or sudden stop detected. Are you okay?"*
  - Action Buttons:
    1. Large Green *"I'M OK"* (`#173326` background, `#67F29A` text).
    2. Large Red *"SEND SOS NOW"* (`#C98793` background, `#F5F7F5` text).
- **Behavior:** Tapping "I'M OK" cancels alarm. Tapping "SEND SOS NOW" or timer expiration dispatches SMS/calls to emergency contacts and generates WhatsApp live location link.

---

### SCREEN 14: Community Road Danger Report Modal
- **Purpose:** Submit hazard reports to inform other riders in the area.
- **Layout:** Quick-action grid sheet accessible from Floating Corner Control.
- **Components & Content:**
  - Hazard Options: `Road Blocked`, `Dangerous Road`, `Accident`, `Flood / Water`, `Road Damage`.
  - Primary CTA: *"Submit Hazard Report"* (`#173326`).
- **Behavior:** Pin drops at current GPS position, broadcasts to active riders in area, and auto-expires after 24 hours.

---

### SCREEN 15: End Ride & Completion Summary
- **Purpose:** Conclude the active ride and review statistics before saving.
- **Layout:** Full-screen dark card layout with top success emblem.
- **Components & Content:**
  - Title: *"Ride Completed!"* (Lexend Regular 400, `#F5F7F5`).
  - Key Metrics Grid: Total Distance (km), Moving Time, Max Speed, Avg Speed, Elevation Gain, Total Stops count.
  - Action Buttons: Primary *"Save to Ride History"* (`#67F29A`) and *"Share Ride Path"*.
- **Behavior:** Finalizes local location logs and triggers background sync to Fastify backend.

---

### SCREEN 16: Interactive Map-Based Ride History ("What I Planned vs What Happened")
- **Purpose:** Post-ride interactive map visualizer comparing planned route vs actual path.
- **Layout:** Full-screen interactive map with bottom timeline scrubber and layer toggles.
- **Components & Content:**
  - Dual Map Layers: Planned Route (Dashed Line) vs Actual GPS Path (Solid Powder Line).
  - Interactive Layer Toggles: `Planned Route`, `Actual Route`, `Stops`, `Detours`, `Visited POIs`, `Deviation Points`, `Danger Reports`, `Speed Profile`.
  - Timeline Scrubber: Drag slider to replay ride progression point-by-point.
- **Behavior:** Allows riders to visually analyze exact deviations, detours, and speed variations along the trip.

---

### SCREEN 17: Profile, Emergency Contacts & Settings
- **Purpose:** Manage account, motorcycle garage, emergency contacts, and app preferences.
- **Layout:** Scrollable dark list-style view (`#121513`).
- **Components & Content:**
  - Account Info: Name, email, Forginity SSO ID, avatar.
  - Emergency Contacts Section: List of contacts, Add/Edit buttons.
  - Motorcycle Garage: Selected bike brand/model (e.g. *Royal Enfield Himalayan 450*).
  - Preference Toggles: Distance Units (km/mi), POI Alert Radius slider, Dark Theme override, Off-Route Threshold slider.
  - Plan Badge: `Free Solo Plan` / `Group Host Subscription`.
- **Behavior:** Real-time settings saving to local storage and sync to `auth_db`.

---

### SCREEN 18: Group Ride Creation & Host Subscription Modal (MVP 2)
- **Purpose:** Host setup for multi-rider group touring sessions.
- **Layout:** Step-by-step creation wizard modal.
- **Components & Content:**
  - Input Fields: Group Ride Name, Expiration Date/Time.
  - Host Fee Information: *"Host License: ₹300 per group ride (up to 5 members + ₹50/extra member). Group members join free."*
  - Share Options: Generate QR Code & Shareable WhatsApp/SMS Invite Link.
  - Primary CTA: *"Pay & Launch Group Ride"* (Stripe Checkout integration).

---

### SCREEN 19: Live Group Ride Multi-Target Tracking Map (MVP 2)
- **Purpose:** Multi-rider real-time position tracking overlay.
- **Layout:** Full-screen navigation map displaying color-coded member markers and right-side rider drawer.
- **Components & Content:**
  - Member Map Pins: Color-coded rider avatars with initials (Green = On-route, Amber = Lagging, Red = Off-route / Stalled).
  - Member Drawer List: List of riders, current speed, distance from lead, battery level.
  - Host Emergency Action: *"Broadcast Group SOS"* / *"Message Group"*.
- **Behavior:** WebSockets receive live location pings every 5–15 seconds from all group members.

---
