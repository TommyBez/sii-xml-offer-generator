# 01 ‑ Background & Rationale

Our original wizard solution relied on a **home-grown navigation layer** (`wizard-container.tsx`) plus a sizeable Zustand slice that tracked `currentStep`, `completedSteps`, conditional visibility, and validation gating.  

As the form set grew to **30+** highly conditional steps, maintaining this bespoke logic became risky:

* Duplicate navigation logic across components (buttons, sidebar, header)
* Type-safety issues – step IDs passed around as plain strings
* Re-implementations of guards (`isFirst`, `isLast`, `canGoTo`) already available in mature libraries
* Hydration mismatches between SSR and client (see `T23-HYDRATION-FIX`)

`@stepperize/react` v5 solves these pain-points by providing a **headless**, **strongly-typed** stepper engine with:

* Declarative `defineStepper()` API
* Imperative helpers (`next`, `prev`, `goTo`, `reset`)
* `metadata` store for per-step runtime data (`completed`, `hasErrors`, etc.)
* Conditional helpers (`when`, `switch`, `match`) for branching flows

Migrating eliminates ~350 LOC of custom code, simplifies conditional logic, and strengthens compile-time guarantees for navigation.  

> **Outcome:** Focus engineering effort on **domain logic** (validation & XML generation) instead of reinventing navigation.  

---

**Read next:** [02-Target Architecture](./02-target-architecture.md) 