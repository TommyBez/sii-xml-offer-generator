# 04 ‑ Metadata Strategy

`metadata` is the unsung hero of Stepperize v5.  It lets us attach arbitrary key/value pairs **per step**, turning the stepper into a tiny, purpose-built state machine for UI concerns (completion badges, error counts, etc.) without polluting our form store.

---

## 4.1  Why Use Metadata?
| Requirement | Legacy Solution | Metadata Replacement |
|-------------|-----------------|----------------------|
| Show green check-mark on completed steps | `completedSteps: Set<StepId>` in Zustand | `metadata[stepId].completed = true` |
| Block *Next* button when step invalid | `validMap: Record<StepId, boolean>` | `metadata[stepId].isValid = boolean` |
| Display error badge with count | Derived from `validationErrors` array | `metadata[stepId].errorCount = number` |
| Remember last async validation status | ad-hoc fields in store | `metadata[stepId].asyncStatus = 'idle' \| 'pending' \| 'error'` |

Benefits:
* **Locality** – UI widgets read/write metadata directly; no cross-slice selectors.
* **Persistence** – Stepperize stores metadata in `sessionStorage` by default (configurable).
* **Type Safety** – You control the TypeScript interface.

---

## 4.2  Typing the Metadata Object
```ts
// lib/stepper.ts
interface StepMeta {
  completed?: boolean;
  isValid?: boolean;
  errorCount?: number;
  asyncStatus?: 'idle' | 'pending' | 'error';
}

type MetadataMap = Record<StepId, StepMeta>;

export const { useStepper, steps } = defineStepper(/* … */);
```
Stepperize initialises metadata with **deep copies** of `initialMetadata` you pass to `<Stepper.Provider>`.  We usually start with an empty object:
```tsx
<Stepper.Provider initialMetadata={{}}>
  {children}
</Stepper.Provider>
```

---

## 4.3  Writing Metadata
### 4.3.1  On successful form submit
```tsx
const onSubmit = form.handleSubmit(async (values) => {
  // persist data to Zustand …
  stepper.metadata[stepper.current.id] = {
    completed: true,
    isValid: true,
  };
  stepper.next();
});
```

### 4.3.2  While typing
```tsx
useEffect(() => {
  const sub = form.watch(() => {
    stepper.metadata[stepId].isValid = form.formState.isValid;
  });
  return () => sub.unsubscribe();
}, []);
```

### 4.3.3  Storing error counts
```ts
const errors = await runValidation(stepId, data);
stepper.metadata[stepId].errorCount = errors.length;
```

> **Important:** Metadata mutations are **reactive** – they trigger re-renders of `Stepper.Navigation`, badges, tooltips, etc.

---

## 4.4  Reading Metadata in the UI
```tsx
const meta = stepper.metadata[step.id] ?? {};

<Badge variant={meta.completed ? 'success' : 'secondary'}>
  {meta.errorCount ?? 0}
</Badge>
```

---

## 4.5  Persisting Metadata Between Sessions
By default Stepperize persists metadata to **sessionStorage**.  For long-lived drafts you can override:
```tsx
<Stepper.Provider
  persistence="local"  // localStorage
  initialMetadata={draft?.metadata ?? {}}
>
  …
</Stepper.Provider>
```

---

## 4.6  Resetting Metadata
Call `stepper.reset()` or manually clear:
```ts
Object.keys(stepper.metadata).forEach((k) => delete stepper.metadata[k as StepId]);
```

---

**Read next:** [05-Conditional Logic](./05-conditional-logic.md) 