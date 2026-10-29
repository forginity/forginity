# TASK IMPLEMENTATION GUIDE: [TASK_ID] - [TASK_TITLE]

- **Service:** `[services/service-name]`
- **Status:** `[IN_PROGRESS | COMPLETED]`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 1. SUMMARY & GOAL

[Concise 2-3 sentence description of the goal, why it is needed, and expected outcome.]

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `[path/to/new-file.ts]`
- **Files to Modify:**
  - `[path/to/existing-file.ts]`

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: [Step Title - e.g. Define Schemas and Types]
- **Target File:** `[path/to/file.ts]`
- **Action:** [What to define, write, or export]

### Step 2: [Step Title - e.g. Implement Business Logic or Handler]
- **Target File:** `[path/to/file.ts]`
- **Action:** [What to implement]

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter [service-name] typecheck
pnpm --filter [service-name] lint
pnpm --filter [service-name] test
```

Test scenarios to cover:
- **Happy Path:** [Expected success outcome]
- **Input Validation Failure:** [Expected 400 error on invalid payload]
- **Edge Case:** [Boundary, duplicate, or empty condition]

---

## 5. SECURITY & GUARDRAILS

- [ ] **No `.env` touched.** Secrets read strictly from `process.env`.
- [ ] **Input validation.** All external inputs parsed through Zod.
- [ ] **SQL parameterization.** All queries use Drizzle ORM builders.

---

## 6. RECORD UPDATE

1. Update the **LAST UPDATE** block in [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md) with a two-line summary.
2. Add a row to **COMPLETED TASKS** in [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md).
3. Mark task as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
