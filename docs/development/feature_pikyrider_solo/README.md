# FEATURE SPECIFICATION: FEATURE_PIKYRIDER_SOLO

## 1. EXECUTIVE SUMMARY

- **Feature Name:** `mobile_apps/pikyrider` (Solo Riding Suite)
- **Folder Reference:** `docs/development/feature_pikyrider_solo`
- **Domain:** TrackRide / PikyRider Motorcycle Navigation & Rider Safety
- **Owner:** Mobile Navigation Engineering Team
- **Purpose:** Provide an offline-first, voice-guided navigation and safety assistance engine tailored specifically for solo motorcycle riders. Delivers turn-by-turn guidance, route deviation alerts, speed warning thresholds, and emergency point-of-interest discovery under intermittent network connectivity.
- **Consumers:** PikyRider Mobile Client (iOS and Android via React Native / Expo).
- **Development Roadmap:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 2. BUSINESS & FUNCTIONAL REQUIREMENTS

### Core Capabilities
- **Offline-First Route Planning:** Download and store compressed vector map tiles and routing graphs for designated geographic corridors.
- **Voice-Guided Turn-by-Turn Navigation:** Real-time text-to-speech audio cues optimized for helmet intercom systems (Cardo, Sena).
- **Off-Route Deviation Detection:** Continuous GPS position comparison against planned geometry with audible re-route alerts upon exceeding a 50-meter threshold.
- **Emergency POI Discovery:** Rapid proximity lookup for fuel stations, motorcycle repair workshops, and medical facilities, functioning fully offline.
- **Ride Telemetry Recording:** Local capture of speed, heading, altitude, duration, and distance, with opportunistic cloud sync to `trackride_db`.

### User Flows & Workflows
1. **Solo Ride Initiation:**
   - Rider sets destination or imports GPX route file.
   - App validates offline map cache for the route bounding box.
   - Rider taps start ride, triggering GPS tracking and voice instruction engine.
2. **Deviation Alert:**
   - Rider misses an exit or diverges onto an unmapped trail.
   - Sensor pipeline detects distance to active polyline exceeds 50 meters.
   - System sounds an audible chime and computes an immediate recovery trajectory.

---

## 3. ARCHITECTURE & TECH STACK

- **Client Runtime:** React Native with Expo, TypeScript.
- **Local Database:** SQLite with Expo SQLite and Drizzle ORM.
- **Mapping & Spatial Queries:** MapLibre Native, Turf.js for geo-spatial distance calculations.
- **Audio & TTS Engine:** Expo Speech with background audio session persistence.
- **Backend Sync Service:** `services/products` (version checks) and `services/auth` (rider profile).
- **Architectural Reference:** [`docs/org/TDD.md`](file:///home/vikas/Documents/forginity/docs/org/TDD.md)

---

## 4. LOCAL DATA MODELS

Managed locally within the mobile client SQLite store:

- **Planned Route (`solo_routes`):** Route UUID, polyline coordinates, distance, estimated duration, offline cache status.
- **Telemetry Log (`solo_telemetry`):** Timestamp, latitude, longitude, speed, altitude, accuracy.
- **Offline POI Cache (`offline_pois`):** POI UUID, category (`fuel`, `hospital`, `mechanic`), latitude, longitude, name, contact info.

---

## 5. SECURITY & COMPLIANCE

- **Zero `.env` Access:** Secrets are read strictly from configured runtime environment variables.
- **Location Privacy:** Telemetry points are encrypted at rest locally using AES-256 before synchronization.
- **Battery Optimization:** Adaptive GPS polling intervals reduce sensor frequency when rider is stationary.
