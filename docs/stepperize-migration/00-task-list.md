# 00 ‑ Migration Task List

Use this checklist as a **single source-of-truth** for remaining migration work.  Each task maps to a PR (or sub-PR) and references the migration guide chapters for context.

| # | Area | Description | Owner | Status |
|---|------|-------------|-------|--------|
| 1 | Step Definitions | Audit `defineStepper` against `wizardSteps` – add missing steps, remove obsolete ones | @frontend-devs | ⬜ |
| 2 | Forms | For each form under `components/forms/*` ensure it: <br>• retrieves `schema` from `stepper.current` <br>• calls `stepper.next()` on successful submit <br>• writes `metadata.isValid` during typing | — | ⬜ |
| 3 | Conditional Logic | Move every `isVisible` / `dependsOn` rule from `lib/wizard-config.ts` into `step-conditions.ts` + `stepper.switch()` calls | — | ⬜ |
| 4 | Navigation UI | Delete legacy components: `wizard-container.tsx`, `wizard-navigation.tsx`, `wizard-mobile-nav.tsx` once Stepperize Navigation parity is confirmed | — | ⬜ |
| 5 | Zustand Store | Remove `currentStep`, `completedSteps`, `validMap` from `wizard-store.ts`.<br>Retain only **form data slices**. | — | ⬜ |
| 6 | Persistence | Replace `persist` middleware key `wizard-draft` to also store `stepper.metadata` (optional) | — | ⬜ |
| 7 | Hydration Gate | Evaluate if `useHydrated()` is still needed (see *SSR Strategy* note). Remove gate & skeleton when initial props are deterministic. | — | ⬜ |
| 8 | Docs | Delete deprecated docs (`T23-*` hydration fix, old wizard architecture) and update README wizard section | Tech-Writer | ⬜ |

> Mark a task **✅ Done** when the related PR is merged into `main`.  Use the task number in branch names (e.g., `feat/migration-task-4`). 