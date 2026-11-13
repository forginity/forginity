# TASK IMPLEMENTATION GUIDE: TASK-08 - User Profile & Emergency Contacts API

- **Service:** `services/auth`
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Completed Date:** 2026-11-12

---

## 1. SUMMARY & GOAL

Implement comprehensive User Profile Management and Emergency Contacts CRUD APIs for `services/auth`.
In our flagship product, **TrackRide**, emergency contacts are a mission-critical safety requirement: riders must have at least 1 verified contact to activate a ride session, enabling automated GPS crash and SOS dispatch.
This task delivers:
1. **User Profile API (`GET /api/users/me` & `PUT /api/users/me`):**
   - Retrieves the authenticated user's profile and active settings.
   - Updates personal attributes (`firstName`, `lastName`, `gender`, `country`, `avatarUrl`), automatically recalculating composite display `name`.
2. **Emergency Contacts Sub-Resource CRUD (`/api/users/me/emergency-contacts`):**
   - `GET /`: List all emergency contacts for the authenticated user (ordered by `isPrimary desc, createdAt desc`).
   - `POST /`: Add an emergency contact with name, E.164 phone, relationship, and `isPrimary` flag.
   - `GET /:contactId`: Fetch a specific emergency contact.
   - `PUT /:contactId`: Update contact fields.
   - `DELETE /:contactId`: Remove an emergency contact.
3. **Safety & Security Architecture:**
   - Strict `BearerAuth` access token middleware verification.
   - Strict tenant/user data isolation (`where userId = req.user.id`) to prevent IDOR vulnerabilities.
   - Primary contact management: setting a contact as `isPrimary = true` automatically demotes other primary contacts.
4. **OpenAPI / Swagger Integration:**
   - Full OpenAPI 3.0 registration in `/api/docs` and `/api/docs.json`.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `services/auth/src/repositories/emergency-contact.repository.ts`
  - `services/auth/src/repositories/emergency-contact.repository.test.ts`
  - `services/auth/src/services/user-profile.service.ts`
  - `services/auth/src/services/user-profile.service.test.ts`
  - `services/auth/src/services/emergency-contact.service.ts`
  - `services/auth/src/services/emergency-contact.service.test.ts`
  - `services/auth/src/controllers/user-profile.controller.ts`
  - `services/auth/src/controllers/emergency-contact.controller.ts`
  - `services/auth/src/routes/user.route.ts`
  - `services/auth/src/routes/user.route.test.ts`

- **Files to Modify:**
  - `services/auth/src/db/auth.validator.ts` (Add `ContactIdParamSchema`)
  - `services/auth/src/types/auth.types.ts` (Add profile and emergency contact response contracts)
  - `services/auth/src/routes/api.router.ts` (Mount user router)
  - `services/auth/src/app.ts` (Mount `/api/users` top-level alias)
  - `services/auth/src/docs/openapi.ts` (Register profile and emergency contacts schemas & routes)

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Validator & Type Contracts
- Add `ContactIdParamSchema` to `auth.validator.ts`.
- Add `EmergencyContactResponse`, `EmergencyContactListResponse`, and `UserProfileResponse` to `auth.types.ts`.

### Step 2: Emergency Contact Repository
- Create `EmergencyContactRepository` with methods:
  - `createContact(userId, input)`
  - `findContactsByUserId(userId)`
  - `findContactById(userId, contactId)`
  - `updateContact(userId, contactId, input)`
  - `deleteContact(userId, contactId)`
  - `demotePrimaryContacts(userId)`

### Step 3: Domain Services
- Create `UserProfileService` (`getUserProfile`, `updateUserProfile`).
- Create `EmergencyContactService` (`listContacts`, `getContactById`, `createContact`, `updateContact`, `deleteContact`).

### Step 4: Controllers & Routes
- Create `UserProfileController` and `EmergencyContactController`.
- Create `user.route.ts` with sub-resource routing:
  - `GET /me`
  - `PUT /me`
  - `GET /me/emergency-contacts`
  - `POST /me/emergency-contacts`
  - `GET /me/emergency-contacts/:contactId`
  - `PUT /me/emergency-contacts/:contactId`
  - `DELETE /me/emergency-contacts/:contactId`
- Bind router in `api.router.ts` and `app.ts`.

### Step 5: Swagger / OpenAPI Documentation
- Register schemas and all 7 endpoints under the `"User Profile"` and `"Emergency Contacts"` tags in `openapi.ts`.

### Step 6: Automated Unit & Integration Tests
- Unit test services and repository.
- Integration test HTTP endpoints via Supertest covering authorization, valid mutations, validation errors, and IDOR prevention.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @services/auth typecheck
pnpm --filter @services/auth lint
pnpm --filter @services/auth test
pnpm typecheck
```

---

## 5. SECURITY & GUARDRAILS

- [ ] **No `.env` touched.** Secrets read strictly from `process.env`.
- [ ] **Authentication Guard.** All routes require valid 15-minute `accessToken`.
- [ ] **Zero IDOR Vulnerabilities.** All queries strictly filter by `where userId = req.user.id`.
- [ ] **E.164 Phone Validation.** Emergency contact phone numbers must conform to international format.
- [ ] **No Barrel Exports.** Direct file imports only.

---

## 6. RECORD UPDATE

1. Mark task as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update the **LAST UPDATE** block and append task row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh the component row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
