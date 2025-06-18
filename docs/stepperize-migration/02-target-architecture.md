# 02 ‑ Target Architecture

This section describes the **desired end-state** of the wizard after the Stepperize migration.  Think of it as the "picture on the puzzle box" – every subsequent step brings us closer to this architecture.

---

## 2.1  High-Level Component Diagram
```mermaid
graph TD
  subgraph React Tree
    A[<WizardLayout>] -->|Stepper.Provider| B(\<Stepper.Navigation>)
    A --> C(\<Stepper.Panel id="identification"/>)
    A --> D(\<Stepper.Controls>)
  end
  B -->|uses| E(defineStepper steps[])
  C -->|uses| F[React-Hook-Form Context]
  C -->|writes| G[Zustand form slices]
  D -->|reads/writes| E
  E -->|exposes| H[metadata]
```
* **Stepper Provider** – single instance mounted in `app/(wizard)/layout.tsx` to orchestrate all navigation.
* **Navigation / Controls / Panel** – the only Stepperize primitives we render.
* **Form Pages** – remain autonomous; they just consume `useForm()` + RHF logic and call `stepper.next()` on success.
* **Zustand Store** – _persists form data only_.  Navigation metadata lives in Stepperize.

---

## 2.2  Source of Truth
| Concern | Owner | Persistence |
|---------|-------|-------------|
| **Step order** | `defineStepper()` | static code |
| **Current step** | Stepperize internal state | URL param (optional) |
| **Per-step metadata** | `stepper.metadata` | sessionStorage (built-in) |
| **Form values** | Zustand slices | `localStorage` via `persist` middleware |
| **Validation errors** | `validation-runner.ts` | transient |

---

## 2.3  Directory Layout (final)
```
lib/
  stepper.ts           # exported { useStepper, steps }
  step-conditions.ts   # pure functions reused by UI & validation
components/
  stepper.tsx          # visual wrapper around Stepperize primitives
  wizard/
    stepper-layout.tsx # <Stepper.Provider> wrapper (optional)
    pages/
      identification.tsx
      offer-details.tsx
      ...
```

> **Note**  
> Only `lib/stepper.ts` should import `@stepperize/react`.  All other files import `useStepper` from that module to keep the dependency graph small.

---

## 2.4  Navigation Flow (happy path)
1. **Mount** Wizard route → `Stepper.Provider` initialises with `initialStep` (read from store or `identification`).
2. **User fills Identification** → clicks *Next*.
3. **Controls** call `form.trigger()` → if valid, `stepper.next()`.
4. **Provider** updates internal pointer → rerenders children.
5. **Panel** for "Offer Details" mounts → its `useForm()` reads default values from store.
6. Steps 2-5 repeat until `stepper.isLast`.
7. Final *Finish* button runs global validation runner, then generates XML.

---

## 2.5  SSR / Hydration Strategy
Stepperize is entirely client-side, but our *data collection forms* are also Client Components.  

* `app/(wizard)/layout.tsx` is marked `'use client'` so `Stepper.Provider` can run.  
* No navigation logic runs on the server; SSR output is consistent.  
* To avoid mismatches we **gate** rendering until `useHydrated()` returns `true` (see `T23-HYDRATION-FIX`).

---

## 2.6  Error Boundaries
* `StepperErrorBoundary` wraps Provider to catch navigation logic exceptions and show a fallback with *Reset Wizard* CTA.
* XML Generation errors still handled separately (see `Step 11`).

---

**Read next:** [03-Step Definitions](./03-step-definitions.md) 