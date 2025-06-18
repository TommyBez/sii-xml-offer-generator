# Task 04 – Navigation UI Cleanup

**Parent checklist item:** `#4 Navigation UI`

With Stepperize fully powering navigation we can remove the legacy visual components and finish styling the new ones.

---

## 0. Affected Files
| Path | Action |
|------|--------|
| `components/wizard/wizard-container.tsx` | **Delete** (logic replaced by Stepper Provider) |
| `components/wizard/wizard-navigation.tsx` | **Delete** – superseded by `components/stepper.tsx` |
| `components/wizard/wizard-mobile-nav.tsx` | **Delete** unless specific mobile UX retained |
| `components/stepper.tsx` | **Keep / Polish** – ensure parity with old design |

---

## 1. Objectives
1. Remove unused imports & dead code.
2. Provide a **single** navigation component based on Stepperize primitives with variants:
   * Desktop horizontal bar (default)
   * Mobile collapsible drawer (optional)
3. Ensure keyboard & screen-reader accessibility matches Radix/Shadcn guidelines.
4. Migrate tooltips & status indicators implemented in `T23-TOOLTIP-IMPLEMENTATION` onto the new component.

---

## 2. Branch & PR Details
| Item | Value |
|------|-------|
| Branch | `feat/migration-task-04-navigation-ui` |
| PR title | `Task 04 – Remove legacy wizard navigation` |
| Depends | Task-03 merged |
| Labels | `migration`, `ui`, `task-04` |

---

## 3. Implementation Steps

### 3.1 Delete legacy files
```bash
git rm components/wizard/wizard-container.tsx \
       components/wizard/wizard-navigation.tsx \
       components/wizard/wizard-mobile-nav.tsx
```
Fix TypeScript breakages by replacing imports with `components/stepper` equivalents.

### 3.2 Enhance `components/stepper.tsx`
```tsx
export const WizardStepper = ({ variant = 'horizontal' }: { variant?: 'horizontal' | 'mobile'; }) => {
  const stepper = useStepper();
  return (
    <Stepper.Navigation className={cn("flex overflow-x-auto", variant === 'mobile' && 'mobile-styles') }>
      {stepper.all.map((step, idx) => (
        <Stepper.Step
          key={step.id}
          of={step.id}
          disabled={/* compute disabled (depends on Task-03) */}
          icon={<CircleIndex index={idx+1} status={getStatus(step)} />}
        >
          <Stepper.Title>{step.label}</Stepper.Title>
        </Stepper.Step>
      ))}
    </Stepper.Navigation>
  );
};
```
Inject tooltips:
```tsx
<Tooltip>
  <TooltipTrigger asChild>{/* Step Button */}</TooltipTrigger>
  <TooltipContent side="bottom">
    <WizardStepTooltip step={step} />
  </TooltipContent>
</Tooltip>
```

### 3.3 Status helper
Create `getStatus(step)` that returns `'completed' | 'active' | 'locked' | 'incomplete'` based on metadata from Task-03.

### 3.4 Mobile drawer (optional)
If UX requires a dedicated mobile nav, wrap `WizardStepper` inside a Radix `Sheet`; trigger via hamburger icon.

### 3.5 CSS / Tailwind cleanup
Remove `.wizard-navigation` styles from `globals.css`. Add new `.stepper-*` utility classes if needed.

---

## 4. Risks
| Risk | Mitigation |
|------|------------|
| Users stored old `wizard-draft` referencing removed components | Draft restore tests; migration script clears incompatible drafts |
| Mobile layout regression | QA on Safari iOS & Chrome Android |

---

## 5. Effort Estimate
* File deletions & quick fixes – **0.5 h**
* Stepper component polish – **1.5 h**
* Review & merge – **0.5 h**

_Total: ~3.5 developer hours._

---

## 7. Definition of Done
- [ ] Legacy wizard nav files removed.
- [ ] `WizardStepper` covers both desktop & mobile.
- [ ] Tooltips/status badges work.
- [ ] No hydration warnings.

---

**➡ Continue to:** Task-05 (Zustand Store Simplification) 