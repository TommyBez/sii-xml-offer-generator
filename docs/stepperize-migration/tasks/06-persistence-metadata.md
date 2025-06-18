# Task 06 – Persistence & Metadata Enhancement

**Related checklist items:** `#6 Persistence`, `#7 Hydration Gate`

Now that Stepperize's `metadata` drives UI state, we want to persist it alongside the form draft so users don't lose progress on refresh—**without** re-introducing hydration mismatches.

---

## 0. Goal
• Serialize `stepper.metadata` into localStorage under the same key as form data.  
• Hydrate Provider with `initialMetadata` so SSR and client render identically, allowing us to delete the `useHydrated()` gate.

---

## 1. Branch & PR meta
| Item | Value |
|------|-------|
| Branch | `feat/migration-task-06-persistence-metadata` |
| Depends | Task-05 merged |
| PR title | `Task 06 – Persist step metadata & drop hydration gate` |
| Labels | `migration`, `persistence`, `task-06` |

---

## 2. Implementation Plan

### 2.1 Extend store persistence
Add an **atomic** `metadata` field to the `formDraft` slice:
```ts
interface WizardDraft {
  data: FormData;
  metadata: MetadataMap; // from lib/stepper
}
```
Persist via `persist` middleware (`name: 'wizard-draft', version: 3`).  No migration logic needed because we dropped compatibility in Task-05.

### 2.2 Provide metadata to Stepper Provider
```tsx
const { metadata } = useWizardStore();

<Stepper.Provider
  initialStep={steps[0].id}
  initialMetadata={metadata}
  persistence="local"
>
  {({ methods }) => {
    // keep metadata in sync
    useEffect(() => {
      useWizardStore.setState({ metadata: methods.metadata });
    }, [methods.metadata]);
    return children;
  }}
</Stepper.Provider>
```
This one-way sync writes back changes after each navigation/validation.

### 2.3 Remove hydration gate
Delete the `useHydrated()` hook & early return in `(wizard)/layout.tsx`. Because `initialMetadata` now matches the client snapshot, attributes (`data-disabled`, etc.) won't diverge.

### 2.4 Drop skeleton markup
Replace with a minimal `<LoadingSpinner />` **only** for network-bound Server Components (not needed here).

---

## 3. Tests
* **SSR snapshot test** – Render wizard page with Jest + `@testing-library/react` SSR, then hydrate; expect **no** console errors.
* **Draft restore** – Fill a few steps, reload, check that completed badges persist.

---

## 4. Effort
* Coding – **1 h**
* Tests – **0.5 h**
* Review – **0.25 h**

_Total: ~1.75 h._

---

## 5. Definition of Done
- [ ] `metadata` persisted and rehydrated via Provider.
- [ ] `useHydrated` gate & skeleton removed.
- [ ] No hydration warnings in console.
- [ ] Draft restore shows correct completion state.

---

**➡ Continue to:** Task-07 (Test Suite Update) 