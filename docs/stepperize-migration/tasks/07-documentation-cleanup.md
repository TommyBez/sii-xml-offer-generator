# Task 08 – Documentation & Cleanup

**Checklist items:** `#8 Docs`

With code migrated, we need to update docs, READMEs to reflect the new Stepperize-based architecture.

---

## 0. Deliverables
1. Updated **root README** with installation & quick-start reflecting Stepperize.
2. Remove stale docs (`T23-*`, wizard legacy)
3. ESLint / Prettier config cleanup – drop overrides for deleted files.

---

## 1. Branch
`feat/migration-task-08-docs`  after Task-07.

---

## 2. Steps
### 2.1 README rewrite
* Replace "custom wizard" section with short code snippet:
  ```tsx
  const { useStepper } = useWizard();
  ```
* List migration guide path (`docs/stepperize-migration`).

### 2.2 Delete deprecated docs
```bash
git rm docs/T23-*.md docs/T23.md docs/T23*.md
```
Add redirect note in `T23.md` top-level pointing to new guide (optional).

### 2.3 Update tech-stack.md
* Mention Stepperize v5 + metadata.

### 2.4 ESLint config
* Remove `globals` or `rules` tied to `wizard-container`.
* Run `pnpm eslint . --fix`.

---

## 3. Effort
* Docs edits – **45 min**
* Config cleanup – **30 min**

_Total: ~1.75 h._

---

## 4. Done Criteria
- [ ] README & tech-stack updated.
- [ ] Legacy wizard docs removed.
- [ ] ESLint passes without ignored rules.
- [ ] Migration guide directory linked from README.

---

🎉 **Migration complete!** 