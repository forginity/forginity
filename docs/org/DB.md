# FORGINITY ORG — DATABASE ARCHITECTURE & SCHEMAS (DB)

## DOCUMENT CONTROL

- **Organization Name:** Forginity
- **Document Type:** Central Database Architecture & Schema Specification
- **AI Profile:** CTO Skill Persona v1.0 (Database & Systems Architecture)
- **Date Generated:** 2026-10-01
- **Associated Specs:** [docs/org/TDD.md](file:///home/vikas/Documents/forginity/docs/org/TDD.md)

---

## 1. DATABASE ARCHITECTURE OVERVIEW

Forginity enforces the **Database-per-Service** pattern. Platform-level metadata (products, feature flags, maintenance windows) and Identity management (users, SSO sessions, app permissions) are maintained in central databases, while individual product business logic runs in isolated product datastores.

```text
                        FORGINITY ARCHITECTURE
                                   │
             ┌─────────────────────┴─────────────────────┐
             │                                           │
       Forginity Core DB                            Identity DB
             │                                           │
       ┌─────┴─────┐                               ┌─────┼─────┐
       │           │                               │     │     │
    Products   Features                         Users Sessions UserProducts
       │                                           │
       │                                           │
       └─────────────── product_id ────────────────┘
                                                   
                                                   
                          Product Services
                                 │
                          ┌──────┴──────┐
                          │             │
                     TrackRide      Product B
                         DB             DB
```

---

## 2. FORGINITY PLATFORM DB (`forginity_db`)

The Forginity Platform Database controls organization-wide product registries, feature flags, versioning, and global maintenance states.

### Database Tables & Field Definitions

#### A. `products`
*Central registry of all B2C and B2B products under the Forginity umbrella.*

```bash
id (UUID, Primary Key, Default: gen_random_uuid())
slug (VARCHAR(100), Unique, Not Null) — e.g. 'trackride', 'custom-cloth'
name (VARCHAR(255), Not Null) — e.g. 'TrackRide'
status (VARCHAR(50), Not Null, Default: 'active') — 'alpha', 'beta', 'active', 'deprecated'
created_at (TIMESTAMP WITH TIME ZONE, Default: NOW())
```

#### B. `product_features`
*Feature flags and capabilities per product.*

```bash
id (UUID, Primary Key, Default: gen_random_uuid())
product_id (UUID, Foreign Key -> products.id ON DELETE CASCADE)
key (VARCHAR(100), Not Null) — e.g. 'offline_voice_nav', 'group_tracking'
name (VARCHAR(255), Not Null)
status (VARCHAR(50), Default: 'enabled') — 'enabled', 'disabled', 'beta'
```

#### C. `product_maintenance`
*Global and product-specific maintenance windows and announcements.*

```bash
id (UUID, Primary Key, Default: gen_random_uuid())
product_id (UUID, Foreign Key -> products.id ON DELETE CASCADE)
starts_at (TIMESTAMP WITH TIME ZONE, Not Null)
ends_at (TIMESTAMP WITH TIME ZONE, Not Null)
status (VARCHAR(50), Default: 'scheduled') — 'scheduled', 'active', 'completed', 'cancelled'
message (TEXT, Not Null)
```

#### D. `product_versions`
*Version releases and active deployment tags.*

```bash
id (UUID, Primary Key, Default: gen_random_uuid())
product_id (UUID, Foreign Key -> products.id ON DELETE CASCADE)
version (VARCHAR(50), Not Null) — e.g. 'v1.0.0'
status (VARCHAR(50), Default: 'latest') — 'latest', 'supported', 'deprecated'
```

### Entity Relationships
```text
products (1)
   │
   ├──────< product_features (M)
   │
   ├──────< product_maintenance (M)
   │
   └──────< product_versions (M)
```

---

## 3. IDENTITY DB (`auth_db`)

The Identity Database powers Single Sign-On (SSO), user accounts, active user product access, and shared cross-product location/emergency profiles.

### Database Tables & Field Definitions

#### A. `users`
*Central user account registry for all Forginity products.*

```bash
id (UUID, Primary Key, Default: gen_random_uuid())
email (VARCHAR(255), Unique, Not Null)
name (VARCHAR(255), Not Null)
password_hash (TEXT, Nullable for OAuth users)
avatar_url (TEXT)
is_verified (BOOLEAN, Default: false)
created_at (TIMESTAMP WITH TIME ZONE, Default: NOW())
updated_at (TIMESTAMP WITH TIME ZONE, Default: NOW())
```

#### B. `sessions`
*Active user SSO session tracking across micro-frontends.*

```bash
id (UUID, Primary Key, Default: gen_random_uuid())
user_id (UUID, Foreign Key -> users.id ON DELETE CASCADE)
current_product_id (UUID, Foreign Key -> Forginity.products.id)
current_section (VARCHAR(100)) — e.g. 'active_navigation', 'checkout'
created_at (TIMESTAMP WITH TIME ZONE, Default: NOW())
expires_at (TIMESTAMP WITH TIME ZONE, Not Null)
last_active_at (TIMESTAMP WITH TIME ZONE, Default: NOW())
```

#### C. `user_products`
*Tracks products accessed by a user and their access status.*

```bash
id (UUID, Primary Key, Default: gen_random_uuid())
user_id (UUID, Foreign Key -> users.id ON DELETE CASCADE)
product_id (UUID, Foreign Key -> Forginity.products.id ON DELETE CASCADE)
status (VARCHAR(50), Default: 'active') — 'active', 'suspended', 'expired'
first_used_at (TIMESTAMP WITH TIME ZONE, Default: NOW())
last_used_at (TIMESTAMP WITH TIME ZONE, Default: NOW())
```

#### D. `user_emergency_contacts` (Shared Cross-Product Data)
*Shared emergency contacts accessible by TrackRide, Raksha, etc.*

```bash
id (UUID, Primary Key, Default: gen_random_uuid())
user_id (UUID, Foreign Key -> users.id ON DELETE CASCADE)
contact_name (VARCHAR(255), Not Null)
contact_phone (VARCHAR(50), Not Null)
relationship (VARCHAR(50)) — e.g. 'spouse', 'parent', 'friend'
is_primary (BOOLEAN, Default: true)
```

### Entity Relationships
```text
users (1)
  │
  ├──────< sessions (M)
  │
  ├──────< user_products (M) ────[product_id]────► Forginity.products.id
  │
  └──────< user_emergency_contacts (M)
```

---
