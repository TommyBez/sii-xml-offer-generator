# Task 05 – Zustand Store Simplification

**Parent checklist item:** `#5 Zustand Store`

Now that navigation and validation metadata live inside Stepperize, the large Zustand slice that previously handled wizard flow can be reduced to **pure form data persistence**.

---

## 0. Affected Code
| File | Purpose |
|------|---------|
| `store/wizard-store.ts` | Hosts navigation + form slices + misc helpers |
| `hooks/use-keyboard-navigation.ts` | Reads `currentStep` from store |
| Any component importing `useWizardStore((s)=>s.currentStep)` |

---

## 1. Objectives
1. **Remove navigation fields**: `currentStep`, `completedSteps`, `validMap`, `goTo`, `next`, `prev`.
2. **Retain & document form slices only** (one slice per form section).
3. Ensure persistence continues to work (`persist` middleware) **without** circular JSON errors due to Stepper metadata.
4. Update hooks/components that referenced removed fields to use Stepperize APIs instead.

---

## 2. Branch & PR Info
| Item | Value |
|------|-------|
| Branch | `feat/migration-task-05-zustand-store` |
| PR title | `Task 05 – Simplify Zustand store (navigation → Stepperize)` |
| Depends | Task-04 merged |
| Labels | `migration`, `zustand`, `task-05` |

---

## 3. Implementation Steps

### 3.1 Strip navigation slice
1. Open `store/wizard-store.ts`.
2. Remove properties & actions related to navigation.
3. Verify `create((set, get)=>({ ... }))` still returns a serialisable object.

### 3.2 Adjust persistence key
- Remove draft version bump logic; simply keep using the same `name`.
- Delete any legacy keys (`currentStep`, etc.) from **initial state** definition – fresh installs only.

### 3.3 Update consumers
Run:
```bash
rg "\.currentStep" src | cut -d: -f1 | sort -u > /tmp/currentStepUsers.txt
```
Refactor each file:
* Replace `useWizardStore(s=>s.currentStep)` with `useStepper().current.id`.
* Replace `goTo(...)` calls with `stepper.goTo(...)`.

### 3.4 Delete keyboard navigation hook (optional)
`use-keyboard-navigation.ts` can be simplified to call Stepper methods directly; or keep if still valuable.

### 3.5 Regression Pass
* Start dev server, refresh wizard with existing draft – ensure app migrates without crash.
* Complete a few steps, reload → data persists.

---

## 4. Effort & Timeline
* Code removal & compile fix – **45 min**
* Consumer refactors – **1 h**

_Total: ~1.75 h._

---

## 5. Definition of Done
- [ ] `wizard-store.ts` contains **only** form-data slices.
- [ ] No component imports navigation fields from the store.
- [ ] App starts, fills flow, refresh → draft persists correctly.

---

**➡ Continue to:** Task-06 (Persistence Metadata Enhancement) 