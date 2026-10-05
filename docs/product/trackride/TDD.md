# TECHNICAL DESIGN DOCUMENT (TDD) — TRACKRIDE

## DOCUMENT CONTROL

- **System Title:** TrackRide System Architecture & Engineering Specification
- **AI Engine Profile:** CTO Skill Persona v1.0 (Technical Architecture & Systems Engineering)
- **Date Generated:** 2026-10-01
- **Associated Product Sources:** [docs/product/trackride/PRD.md](file:///home/vikas/Documents/forginity/docs/product/trackride/PRD.md), [docs/product/trackride/UIUX_SPEC.md](file:///home/vikas/Documents/forginity/docs/product/trackride/UIUX_SPEC.md), [docs/product/trackride/DB.md](file:///home/vikas/Documents/forginity/docs/product/trackride/DB.md)
- **Target Implementation Path:** `apps/trackride`, `services/trackride-api`

---

## 1. HIGH-LEVEL SYSTEM ARCHITECTURE (HLD)

TrackRide runs as a **Micro-Frontend Remote Application (`apps/trackride`)** plugged into the Forginity Module Federation Shell (`apps/shell`), backed by a dedicated **Fastify Backend Service (`services/trackride-api`)** and Socket.IO real-time location stream engine.

```text
                               ┌──────────────────────────────────────────────┐
                               │           Cloudflare Edge / DNS              │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │          Nginx Reverse Proxy Gateway         │
                               └──────┬───────────────────────┬───────────────┘
                                      │                       │
           ┌──────────────────────────┴────────┐     ┌────────┴──────────────────────────┐
           │ Micro-Frontend Remote (Next.js)   │     │ TrackRide Backend Service         │
           │  - apps/trackride                 │     │  - services/trackride-api         │
           │    (Mounted in apps/shell Host)   │     │    (Fastify + Socket.IO Server)   │
           └───────────────────────────────────┘     └──────────────────┬────────────────┘
                                                                        │
                                                     ┌──────────────────┴────────────────┐
                                                     │ TrackRide Datastores              │
                                                     │  - PostgreSQL (trackride_db)      │
                                                     │  - Redis (Live Location Pub/Sub)  │
                                                     └───────────────────────────────────┘
```

### Tech Stack Specifications

| Layer | Technology | Primary Function |
| :--- | :--- | :--- |
| **Micro-Frontend Remote** | Next.js App Router + Module Federation | Mounted under `trackride.forginity.com` inside `@forginity/ui` Shell. |
| **Backend Service** | Fastify (TypeScript) | Navigation API, POI forward-vector search, telemetry sync. |
| **Real-Time Streaming** | Socket.IO + Redis Pub/Sub | Live group rider location broadcasting (<1.5s latency). |
| **Database & ORM** | PostgreSQL 16 (`trackride_db`) + Drizzle ORM | Storage of rides, routes, waypoints, telemetry logs, ride events. |
| **Offline Storage** | IndexedDB / SQLite (Client-Side) | Local offline ping caching when cell signal drops. |
| **External APIs** | Mapbox / Google Maps Places API | Offline map tiles, routing polyline, fuel/hospital POI data. |

---

## 2. API & PROTOCOL CONTRACTS

### A. Plan Ride API
- **POST** `/api/v1/trackride/rides/plan`
- **Request Body:**
  ```json
  {
    "title": "Leh-Ladakh Tour 2026",
    "startLocation": { "lat": 34.1526, "lng": 77.5771, "name": "Leh" },
    "destination": { "lat": 34.5539, "lng": 77.1645, "name": "Nobra Valley" },
    "waypoints": [{ "lat": 34.2789, "lng": 77.6042, "name": "Khardung La Pass" }],
    "routeOptions": ["fastest", "best_for_riding", "scenic"],
    "hasReturnRoute": true
  }
  ```
- **Response (201 Created):** Returns calculated route polylines, elevation profile, and primary route ID.

### B. Sync Offline Telemetry Batch API
- **POST** `/api/v1/trackride/rides/:rideId/telemetry`
- **Request Body:**
  ```json
  {
    "telemetryBatch": [
      {
        "lat": 34.2001,
        "lng": 77.5800,
        "speedKmh": 58.5,
        "heading": 180.2,
        "altitudeM": 3500.0,
        "batteryLevel": 88,
        "recordedAt": "2026-10-01T10:15:00Z"
      }
    ]
  }
  ```

### C. Trigger Emergency SOS API
- **POST** `/api/v1/trackride/rides/:rideId/sos`
- **Request Body:** `{ "lat": 34.2001, "lng": 77.5800, "triggerType": "manual" }`
- **Response (200 OK):** Dispatches SMS/calls to `auth_db.user_emergency_contacts` and returns WhatsApp live-location link.

---

## 3. DATABASE ARCHITECTURE REFERENCE

All TrackRide-specific table definitions (`vehicles`, `rides`, `routes`, `locations`, `ride_events`, `group_members`) are fully specified in:
📄 [docs/product/trackride/DB.md](file:///home/vikas/Documents/forginity/docs/product/trackride/DB.md)

---

## 4. INFRASTRUCTURE & DEPLOYMENT STRATEGY

- **Deployment Target:** Hetzner Cloud instance via Docker Compose / Kubernetes.
- **CI/CD Pipeline:** GitHub Actions build triggering automated TypeScript compilation, Zod validation checks, and zero-downtime micro-frontend deployments.

---
