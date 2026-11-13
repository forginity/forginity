# TASK LIST: INFRA_REDIS_LAYER

## 1. COMPONENT DETAILS

- **Component Name:** `infra/redis-layer` (Central Redis Caching, In-Memory Session Invalidation, & Pub/Sub)
- **Domain:** In-Memory Caching, Security Rate Limiting, Session Purging, and Real-Time Event Pub/Sub
- **Purpose:** Provide high-performance, low-latency in-memory data storage, instantaneous session revocation, rate-limiting counters, and WebSocket location stream Pub/Sub for the Forginity monorepo ecosystem.
- **Key Features & Flows:**
  - Dedicated Redis client connection pool (`ioredis`) with automatic reconnect backoff and health checks.
  - In-memory session blacklist for sub-millisecond session validation and instant global revocation.
  - Sliding window rate limiting across authentication, OTP dispatch, and public API routes.
  - Redis Pub/Sub channels for live group ride location radar and multi-device state synchronization.
- **Tech Stack:** Redis 7, `ioredis`, Express rate limiters, Socket.IO Redis Adapter, TypeScript.
- **Component Status:** `PENDING` (0/4 tasks completed; deadline: `TBD` / No deadline).
- **Central Implementation Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Overall Progress:** [`../PROGRESS.md`](../PROGRESS.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Redis Client Scaffolding & Connection Pool | Reusable `ioredis` client wrapper, health check probe, automatic reconnection, graceful shutdown | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-02` | In-Memory Session Blacklist & Revocation Engine | Instant session invalidation cache, key namespacing (`auth:session:*`), sub-millisecond token lookup | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-03` | Distributed Rate Limiting & Abuse Prevention | Redis-backed sliding window rate limiter for OTP dispatch (`/otp/send`), login attempts, and public APIs | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-04` | Real-Time Event Pub/Sub & Socket.IO Mesh | Redis Pub/Sub channels (`radar:rides:*`), multi-node WebSocket message adapter for live rider beacons | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Redis Client Scaffolding & Connection Pool
- **Description:** Implement centralized Redis connection module using `ioredis`.
  Configure connection pooling, exponential retry backoff, connection error interceptors, and integrate Redis ping check into `/api/health`.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md)

### `TASK-02`: In-Memory Session Blacklist & Revocation Engine
- **Description:** Implement ultra-fast session validation:
  - Cache active session tokens with TTL matching token expiration.
  - On user logout or moderation (`blocked` / `deleted`), publish invalidation key to immediately revoke access without waiting for database queries.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md)

### `TASK-03`: Distributed Rate Limiting & Abuse Prevention
- **Description:** Deploy distributed rate limiting:
  - Enforce maximum 3 OTP requests per 10 minutes per email/phone.
  - Enforce brute-force attack throttling on verification attempts.
  - Return clean HTTP 429 Too Many Requests responses with `Retry-After` headers.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md)

### `TASK-04`: Real-Time Event Pub/Sub & Socket.IO Mesh
- **Description:** Connect Socket.IO server to Redis adapter for horizontal scaling:
  - Broadcast rider telemetry coordinates across multi-node server clusters.
  - Channel isolation per Ride ID (`radar:rides:{rideId}`) ensuring zero cross-ride interference.
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md)
