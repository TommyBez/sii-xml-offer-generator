# Task 01 – Step Definitions Audit

**Parent checklist item:** `#1 Step Definitions`

## Goal
Ensure that `lib/stepper.ts` (our new Stepperize declaration) is a **loss-less mirror** of the legacy `wizardSteps` array and does not contain stale or experimental steps.

## Why It Matters
* Navigation bugs surface when a step exists in the UI but has no form (or vice-versa).
* Per-step metadata union (`StepId`) must include **every** canonical step or TypeScript will silently widen to `string`.
* Deleting obsolete steps early prevents dead code and lowers memory usage of the persisted draft.

## 0. Prerequisites
- Install/upgrade to **@stepperize/react ^5.x**.
- `tsc` must pass on `main` before starting; fix type errors first.
- Familiarity with `wizardSteps` and the Functional-Requirements doc.

---

## 1. Branch & PR conventions
| Item | Value |
|------|-------|
| Branch name | `feat/migration-task-01-step-definitions` |
| PR title | `Task 01 – Audit & Finalise step definitions` |
| Labels | `migration`, `stepperize`, `task-01` |

> **Tip :** Push small commits (≤ 150 LOC) so code-reviewers can follow the mapping work.

---

## 2. Step-by-Step Guide

### 2.1 Generate side-by-side diff (one-off)
```bash
npx ts-node scripts/list-step-ids.ts > /tmp/new-ids.txt  # dumps from lib/stepper.ts
rg "id: '([a-z0-9-]+)'" lib/wizard-config.ts -or '$1' | sort > /tmp/old-ids.txt
code --diff /tmp/old-ids.txt /tmp/new-ids.txt
```
_Outcome:_ quick visual of missing / extra IDs.

### 2.2 Add missing steps
1. Open `lib/stepper.ts`.
2. Insert new object literal **in correct order**.
3. Import Zod schema from `schemas/index.ts` (if it exists).  If not, leave placeholder comment.
4. Provide **human—reader-friendly** `label` and optional `description` for tooltips.

_Example:_
```ts
import { pricingStructureSchema } from '@/schemas';
// … existing code …
{ id: 'pricing-structure', label: 'Pricing Structure', schema: pricingStructureSchema },
// … existing code …
```

### 2.3 Remove obsolete steps
If a step in `lib/stepper.ts` has **no**:
* form component folder
* schema definition
* mention in FR doc

you may delete it **only after** searching:
```bash
rg "pricing-structure" -g '!node_modules/**'
```
If any hits appear in tests or store slices → coordinate with component owners.

### 2.4 Type-safety smoke-test
Run `pnpm tsc --noEmit` to ensure `StepId` remains a finite union.

---

## 3. Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Duplicate `id` values | TypeScript will error (duplicate object key in tuple) |
| Order change breaks dependency assumptions | Review with domain expert & run e2e smoke-suite |

Rollback plan: revert PR or cherry-pick file edits; navigation will fall back to legacy wizard.

---

## 4. Estimated Effort
* Audit & diff – **1 h**
* Adding/removing objects – **1 h**
* Code review & fixes – **1 h**

_Total: ~3.5 developer hours._

---

## 5. Definition of Done
- [ ] `lib/stepper.ts` fully aligns with FR doc.
- [ ] `StepId` union equals 32 literal types.
- [ ] No unused imports or eslint errors.
- [ ] PR merged with at least one reviewer approval.

---

**➡ Continue to:** [02-Forms Integration](./02-forms-integration.md) 