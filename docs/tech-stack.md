# Tech Stack

This document describes the technology stack adopted (and proposed) for the **SII XML Offer Generator** project.  It is based on the current code-base and the functional requirements outlined in `functional-requirements-sii-xml.md`.

## 1. Runtime & Hosting

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Runtime | **Node.js 20 LTS** | Widely supported, stable, and the default target for the Next.js runtime. |
| Web Server / SSR | **Next.js 15** (App Router, Server Components, Turbopack) | Enables hybrid static/SSR rendering, fast dev-time HMR, and file-system routing. Perfect for the wizard-style UI described in the requirements. |
| Deployment | **Vercel** (recommended) or any container-based platform | Zero-config support for Next.js, automatic CI/CD, edge functions if needed. |

## 2. Front-End Framework

| Concern | Technology | Status |
|---------|------------|--------|
| UI Library | **React 19** | Already in `package.json`. Gives concurrent features and hooks-based API. |
| Language | **TypeScript 5** | Already configured via `tsconfig.json`. Guarantees strict typing for the complex domain models. |
| Styling | **Tailwind CSS 4** (with PostCSS) | Already configured (`postcss.config.mjs`). Fast utility-first styling, good for responsive wizard forms. |
| Icons & UI Primitives | **Shadcn/ui** (already scaffolded under `components/ui`) + **lucid-react** *(icon set)* | Accessible, theme-able components built on top of Tailwind CSS, fully customizable in-repo. |
| Font | **next/font** with Geist | Default from create-next-app. |

## 3. Form Handling & Validation

The application must enforce hundreds of field-level and cross-field constraints. We recommend the following stack:

| Concern | Technology | Why |
|---------|------------|-----|
| Form state | **react-hook-form** | Performance for large forms, easy integration with uncontrolled inputs, wizard navigation support. |
| Schema validation | **Zod** | Type-safe schemas that can be shared between front-end and XML generator. Integrates with react-hook-form via `@hookform/resolvers/zod`. |
| Conditional logic | **zod-effects** / custom validators | Handles rules like "mandatory if ...". |
| date/time parsing | **dayjs** | Lightweight alternative to moment for DD/MM/YYYY_HH:mm:ss formats. |

> These packages are **not yet added**—they will be introduced when the form wizard is scaffolded.

## 4. State Management

Wizard-level data (the many fields collected throughout the offer-creation wizard) will be stored in a **single, typed Zustand store**.  
Zustand provides a minimal API, React-server-component compatibility and good dev-tooling, while avoiding the boilerplate of Redux and the rerender pitfalls of Context for large nested trees.

Additional notes:

* The store will expose *get/set* helpers and selectors to keep component re-renders minimal.
* Offer drafts can still be persisted via `zustand/middleware` (e.g. `persist` to `localStorage` or IndexedDB).  
* URL Search Params can be used for shareable wizard checkpoints, while Zustand remains the source of truth.
* No global Redux or MobX layer is needed.

> Package to add: `zustand@^4`

## 5. Domain Models & Data Layer

* **TypeScript types generated from Zod schemas** – reused on both client (validation) and server (XML generation).
* No backend database is required (FR-2.5). Offer drafts can be kept client-side or in browser IndexedDB for offline support.  Future persistence can plug into Supabase/Postgres without changing the models.

## 6. XML Generation

| Step | Technology | Notes |
|------|------------|-------|
| TS → XML | **xmlbuilder2** *(npm)* | Stream-based, namespace aware, produces UTF-8. |
| Schema validation | **xsd-schema-validator** (CLI in CI) | To lint against the official XSD during build/test. |
| File download | **Blob + `navigator.saveAs`** (client) | Creates the `<PIVA_UTENTE>_<AZIONE>_<DESCRIZIONE>.xml` file for the user. |
| ZIP batch | **jszip** | For FR-6.5 bulk download. |

## 7. Testing & Quality

| Type | Technology |
|------|------------|
| Unit / integration | **Vitest** (works with Vite & Turbopack) |
| E2E | **Playwright** (headless browser, supports wizard flows) |
| Linting | **ESLint 9** with `eslint-config-next` (already present) |
| Formatting | **Prettier** (to be added) |
| CI | **GitHub Actions** – lint, test, build, schema-validate XML artefacts. |

## 8. Build & Tooling

* **pnpm** – workspace's default package manager (lockfile present).
* **Turbopack** – enabled via `next dev --turbopack` for blazingly fast HMR.
* **TS-path imports** – configured in `tsconfig.json` for absolute imports.

## 9. Future Enhancements

The following technologies are optional and earmarked for future roadmap items (section 6 of requirements):

* **GraphQL API layer** for template library/offer comparison services.
* **Supabase** as backend-as-a-service when persistence is required.
* **Server Actions / RSC Mutations** for XSD validation calls.
* **Web Workers** for large ZIP operations.

## 10. Directory Structure (current)

```
├─ app/               # Next.js App Router pages & components
├─ docs/              # Functional & technical documentation
├─ public/            # Static assets (favicon, etc.)
├─ node_modules/
├─ package.json
└─ tsconfig.json
```

---

This stack balances developer velocity (Next.js + Tailwind), strict correctness (TypeScript + Zod), and the specialised needs of XML generation and validation required by the **SII** specification. 