# Stepperize Migration Guide

## Purpose
This document describes **how** and **why** the SII-XML Offer Generator migrated from a bespoke wizard/navigation solution to the official `@stepperize/react` library (wrapped by *shadcn-stepper*). It is intended for new contributors who need to understand the architectural decisions, high-level steps, and code-level changes that were performed – or still need to be completed – during the migration.

---

## 1  Background
Our initial multi-step wizard was fully custom: navigation logic, conditional step visibility, progress tracking, and validity gating were all re-implemented inside `wizard-container.tsx` and a large Zustand slice. As the project grew to 30 + steps and hundreds of conditional rules, maintenance became expensive and fragile.

`@stepperize/react` v5 offers:
* declarative *step definitions* via `defineStepper()`
* an ergonomic `useStepper()` API (`next`, `prev`, `goTo`, `reset`, …)
* a **metadata** API to attach dynamic data (e.g. `completed: true`, `errorCount: 0`)
* first-class TypeScript support
* built-in helpers like `switch()` and `when()` for conditional flows

By migrating we achieve:
* ≥ 350 LOC reduction in custom nav code
* robust, community-maintained navigation logic
* stronger type-safety for `StepId`s
* cleaner separation between *navigation* (Stepperize) and *form data* (Zustand + RHF)

---

## 2  Target Architecture
1. **Single source-of-truth** (`lib/stepper.ts`)
   ```ts
   export const { useStepper, steps } = defineStepper(
     { id: 'identification', label: 'Identification', schema: identificationSchema },
     // …repeat for every step…
   );
   ```
2. **State Management**
   * Drop the old `wizard-store` navigation slice
   * Keep form data slices in Zustand
   * Use Stepperize **metadata** for `completed`, `hasErrors`, etc.
3. **Validation Flow**
   * Each `components/forms/*` now calls:
     ```ts
     const form = useForm({ resolver: zodResolver(stepper.current.schema) });
     ```
   * Cross-step checks still run via `validation-runner.ts` on *Finish*
4. **UI Components**
   * `components/stepper.tsx` refactored to consume only the Stepperize API
   * Tooltips, progress counters and status badges read from `stepper.metadata`
5. **Routing (optional)**
   * URL sync via `?step=<id>` for deep-linking

---

## 3  Step-by-Step Migration Checklist
| Phase | Tasks | Status |
|-------|-------|--------|
| 0 | Install deps (`pnpm add @stepperize/react`) | ✅ |
| 1 | Scaffold `lib/stepper.ts` with all 32 step definitions | ✅ |
| 2 | Wrap `(wizard)` layout with `<Stepper.Provider>` | ✅ |
| 3 | Replace `wizard-container.tsx` UI with `Stepper.Navigation`, `Stepper.Controls`, `Stepper.Panel` | ✅ |
| 4 | Update every form component to use `stepper.current.schema` for RHF resolver | **50 %** |
| 5 | Move conditional visibility logic into `stepper.switch()` or `when()` helpers | ✅ |
| 6 | Delete legacy navigation code & unseen helpers (`wizard-config.ts`, nav slice) | ⬜ |
| 7 | Update tests & docs | ⬜ |

> **Tip:** keep the old wizard code behind the feature flag `NEXT_PUBLIC_LEGACY_WIZARD=1` until step 4 is complete.

---

## 4  Code Snippet Examples
### 4.1  Navigation Buttons
```tsx
// components/wizard/wizard-navigation.tsx
const { next, prev, isFirst, isLast } = useStepper();

return (
  <div className="flex gap-4 justify-end">
    <Button onClick={prev} disabled={isFirst}>Back</Button>
    <Button onClick={async () => {
      const valid = await form.trigger();
      if (valid) next();
    }}>
      {isLast ? 'Finish' : 'Next'}
    </Button>
  </div>
);
```

### 4.2  Conditional Step Rendering
```tsx
// lib/step-conditions.ts
export const shouldShowEnergyPriceReferences = (data: FormData) => {
  return (
    data.offerDetails.TIPO_OFFERTA === '02' &&
    !data.discounts?.some(d => d.TIPOLOGIA === '04')
  );
};

// usage
stepper.switch({
  'energy-price-references': () =>
    shouldShowEnergyPriceReferences(formData) ? <EnergyPriceForm /> : null,
});
```

---

## 5  Known Issues / To-Dos
1. **Legacy Store Cleanup** – `completedSteps` & `validMap` still duplicated; migrate fully to `metadata`.
2. **Cross-Step Validation Hook** – integrate `runValidation()` with Stepperize `onStepChange`.
3. **E2E Test Update** – Playwright tests still reference old DOM selectors.
4. **Docs** – update `README` wizard section and diagrams.

---

## 6  Resources
* Stepperize Docs: <https://stepperize.vercel.app/docs/react>
* Example with React Hook Form: `docs/stepperize_basic_example.md`
* Internal design discussion: see `[PR #123](https://github.com/your-org/repo/pull/123)`

---

## 7  Appendix A  – API Cheat-Sheet
| API | Description |
|-----|-------------|
| `useStepper()` | Access navigation + metadata for the current instance |
| `stepper.current` | Current **step object** (`{ id, label, schema }`) |
| `stepper.all` | Ordered array of **all** steps |
| `stepper.next()` / `prev()` | Move linearly |
| `stepper.goTo(id)` | Jump to arbitrary step |
| `stepper.isFirst / isLast` | Boolean flags |
| `stepper.reset()` | Reset back to first step |
| `stepper.metadata[stepId]` | Custom per-step metadata (read/write) |

---

**Last updated:** <!-- TODO: YYYY-MM-DD --> 