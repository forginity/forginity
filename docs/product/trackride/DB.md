# DATABASE SPECIFICATION (DB) — TRACKRIDE

## DOCUMENT CONTROL

- **Product Name:** TrackRide (Forginity Anchor Product #1)
- **Database Identifier:** `trackride_db` (Isolated Product Datastore)
- **AI Engine Profile:** CTO Skill Persona v1.0 (Database & Schema Design)
- **Date Generated:** 2026-10-01
- **Associated Specs:** [docs/product/trackride/TDD.md](file:///home/vikas/Documents/forginity/docs/product/trackride/TDD.md), [docs/org/DB.md](file:///home/vikas/Documents/forginity/docs/org/DB.md)

---

## 1. DATABASE ISOLATION & ARCHITECTURE

`trackride_db` is a dedicated PostgreSQL datastore for TrackRide application domain models. User authentication and emergency contacts are referenced via `user_id` from the central `auth_db`.

```text
                           IDENTITY DB (auth_db)
                                   │
                                user_id
                                   │
                                   ▼
                         TRACKRIDE DB (trackride_db)
                                   │
      ┌───────────┬────────────────┼────────────────┬───────────┐
      │           │                │                │           │
  vehicles      rides           routes          locations  ride_events
                    │
              group_members
```

---

## 2. DATABASE TABLES & FIELD DEFINITIONS

### A. `vehicles`
*Rider motorcycle profiles and specs.*

```bash
id (UUID, Primary Key, Default: gen_random_uuid())
user_id (UUID, Not Null) — References auth_db.users.id
brand (VARCHAR(100), Not Null) — e.g. 'Royal Enfield', 'KTM', 'BMW'
model (VARCHAR(100), Not Null) — e.g. 'Himalayan 450', 'Duke 390'
registration_number (VARCHAR(50))
created_at (TIMESTAMP WITH TIME ZONE, Default: NOW())
```

### B. `rides`
*Complete journey records (solo and group rides).*

```bash
id (UUID, Primary Key, Default: gen_random_uuid())
user_id (UUID, Not Null) — Primary rider / Host user ID (auth_db.users.id)
title (VARCHAR(255), Not Null) — e.g. 'Leh-Ladakh Expedition 2026'
ride_type (VARCHAR(50), Default: 'solo') — 'solo', 'group'
status (VARCHAR(50), Default: 'planned') — 'planned', 'active', 'paused', 'completed', 'cancelled'
host_user_id (UUID, Nullable) — Host user ID if group ride
start_time (TIMESTAMP WITH TIME ZONE)
end_time (TIMESTAMP WITH TIME ZONE)
created_at (TIMESTAMP WITH TIME ZONE, Default: NOW())
```

### C. `routes`
*Planned and calculated routes associated with a ride.*

```bash
id (UUID, Primary Key, Default: gen_random_uuid())
ride_id (UUID, Foreign Key -> rides.id ON DELETE CASCADE)
type (VARCHAR(50), Default: 'primary') — 'primary', 'return', 'detour'
option_category (VARCHAR(50)) — 'fastest', 'best_for_riding', 'scenic'
distance_km (NUMERIC(8,2), Not Null)
estimated_minutes (INTEGER, Not Null)
waypoints_json (JSONB, Not Null) — Array of waypoint coordinates {lat, lng, name}
polyline_encoded (TEXT, Not Null) — Encoded route polyline geometry
created_at (TIMESTAMP WITH TIME ZONE, Default: NOW())
```

### D. `locations` (Location History & Pings)
*Raw telemetry location pings logged during active rides.*

```bash
id (UUID, Primary Key, Default: gen_random_uuid())
ride_id (UUID, Foreign Key -> rides.id ON DELETE CASCADE)
user_id (UUID, Not Null) — Rider who emitted the ping
lat (NUMERIC(10,7), Not Null)
lng (NUMERIC(10,7), Not Null)
speed_kmh (NUMERIC(5,2))
heading (NUMERIC(5,2))
altitude_m (NUMERIC(7,2))
battery_level (SMALLINT) — Percentage 0–100
is_offline_synced (BOOLEAN, Default: false) — true if logged offline and synced later
recorded_at (TIMESTAMP WITH TIME ZONE, Not Null)
```

### E. `ride_events`
*Telemetry events during a ride (deviations, detours, stalls, accidents, SOS).*

```bash
id (UUID, Primary Key, Default: gen_random_uuid())
ride_id (UUID, Foreign Key -> rides.id ON DELETE CASCADE)
user_id (UUID, Not Null)
event_type (VARCHAR(100), Not Null) — 'route_deviation', 'poi_detour', 'stall_detected', 'accident_prompt', 'sos_triggered', 'poi_visited'
payload_json (JSONB) — Event metadata (e.g. deviation distance, POI name)
created_at (TIMESTAMP WITH TIME ZONE, Default: NOW())
```

### F. `group_members`
*Rider participation in group rides (MVP 2).*

```bash
id (UUID, Primary Key, Default: gen_random_uuid())
ride_id (UUID, Foreign Key -> rides.id ON DELETE CASCADE)
user_id (UUID, Not Null) — Member rider ID
role (VARCHAR(50), Default: 'member') — 'host', 'co_host', 'member'
join_status (VARCHAR(50), Default: 'joined') — 'invited', 'joined', 'left'
last_ping_at (TIMESTAMP WITH TIME ZONE)
created_at (TIMESTAMP WITH TIME ZONE, Default: NOW())
```

---

## 3. ENTITY RELATIONSHIP MAP

```text
rides (1)
  │
  ├──────< routes (M)
  │
  ├──────< locations (M)
  │
  ├──────< ride_events (M)
  │
  └──────< group_members (M)
```

---
