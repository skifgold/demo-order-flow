# Architecture

## Approach

The project follows a lightweight feature-first architecture inspired by
Feature-Sliced Design. Instead of implementing the full FSD layer hierarchy,
the structure is intentionally simplified to match the application's size
while preserving clear module interfaces and separation of concerns.

This is not a claim of canonical Feature-Sliced Design. The project does not
introduce top-level `widgets`, `entities`, or `processes` layers because the
current two-view application does not need them.

## Implemented structure

```text
src/
├── app/
│   ├── router/
│   ├── query-client/
│   ├── error-handling/
│   ├── layouts/
│   ├── reviewer-demo/
│   ├── styles/
│   ├── App.vue
│   └── use-basket-lifecycle.ts
├── features/
│   ├── catalogue/
│   │   ├── api/
│   │   ├── ui/
│   │   └── views/
│   ├── basket/
│   └── ordering/
│       ├── api/
│       ├── checkout/
│       ├── domain/
│       ├── draft/
│       ├── queries/
│       ├── ui/
│       └── views/
├── shared/
│   ├── errors/
│   ├── http/
│   ├── money/
│   └── observability/
├── mocks/
└── test/
```

Segments are created only when they contain real code. The tree is a guide to
ownership, not a requirement to scaffold empty folders.

## Feature ownership

**Catalogue** answers: _What can the customer buy?_

It owns product response validation, the HTTP client, product query keys,
`useProductsQuery()`, catalogue presentation, and catalogue request states.

**Basket** answers: _What has the customer chosen to buy?_

It owns product IDs and quantities, versioned local persistence, hydration,
reconciliation inputs, and basket operations.

**Ordering** answers: _How does the customer configure and submit the order?_

It owns the Order Draft, Print Configuration rules, dependent-value cleanup,
pricing, checkout validation, order submission, conflicts, and confirmation.
The detailed state ownership and transitions are defined in
[Checkout lifecycle](./checkout-lifecycle.md).

Within Ordering, `api/` owns HTTP transport and Zod contracts; `queries/` owns
TanStack Query wrappers over that transport; and `checkout/` coordinates those
modules with the Basket and Draft for the checkout route.

**App** composes the feature interfaces through routing, providers, global
error handling, and application startup. `AppLayout` owns the common route
shell; feature views own their page-specific content layouts.

**Shared** contains only business-agnostic code with demonstrated reuse.

## Views

- Build views declaratively from feature-local UI modules so the template reads
  as the page's states, layout, and customer journey rather than its detailed
  presentation implementation.
- A view owns route composition. A feature-local UI module owns one named
  section's markup, interaction, and styles, such as an Artwork Card, loading
  state, or error state.
- A feature may use an internal, route-specific module such as
  `ordering/checkout/` for coordination between its Draft, Basket, Query, and
  submission. When that coordination owns the customer journey, it may also
  select query states and navigate; its interface exposes journey states and
  actions rather than raw stores or dependencies. It is an implementation
  detail of the route and does not export a second public feature interface.
- Extract a named UI module when it lowers the cognitive load of reading the
  view, even when that section has one current caller. Keep it within its
  feature; do not promote it to `shared` without demonstrated reuse.

## Dependency rules

```text
app ───────────────→ features
                         │
                         ▼
                      shared

mocks ── HTTP seam ──→ feature HTTP clients
```

- `app` may depend on feature public interfaces and `shared`.
- A feature may depend on `shared`.
- Cross-feature collaboration must use a small declared interface; callers do
  not reach into another feature's implementation.
- `shared` must not depend on any feature.
- Ordering-domain code must not depend on Vue, Pinia, PrimeVue, TanStack Query,
  browser storage, or MSW.
- Production features must not import MSW handlers, demo-scenario state, or
  mock data.

## Mock boundary

`src/mocks` contains MSW handlers, deterministic data, and reviewer scenarios.
The browser worker is dynamically imported and started only when
`import.meta.env.DEV` is true; the test suite uses its separate MSW server.
The production build keeps the typed HTTP clients but has no mock API runtime,
so it is an asset-build verification rather than a runnable customer demo.

## Styling

- Use BEM class names (`block`, `block__element`, `block--modifier`) for
  component styles, including `<style scoped>` blocks in Vue files.
- A component owns its BEM block; avoid tag-name and descendant selectors for
  component-specific appearance.
- Keep global design tokens, resets, and reusable presentational BEM blocks
  (such as typography) in `src/app/styles/`; feature styles consume them
  without creating a second global stylesheet.

## Small public interfaces

The initial feature interfaces are intentionally narrow:

- Catalogue: `useProductsQuery()` and `productKeys`.
- Basket: derived basket state plus `add`, `setQuantity`, `remove`, and `clear`.
- Ordering domain: pure operations for configuration normalization,
  availability, validation, and pricing.
- Order submission: `useSubmitOrder()`.
- Observability: `reportUnexpectedError()`.

The interface is also the preferred test surface. Tests should assert
observable behavior through these interfaces and remain stable when their
implementation changes.

Public functions with three or more input values accept one named typed object
instead of positional parameters. This makes the call site self-describing and
prevents interchangeable primitive values from being confused.

## Deliberate simplifications

- No canonical FSD `widgets`, `entities`, or `processes` hierarchy.
- No global technical folders such as `components`, `services`, `stores`, or
  `validators`.
- No repository layer over the two HTTP clients.
- No dependency-injection container.
- No abstract port with only one adapter.
- No XState or another state-machine dependency for the two-step checkout.
- No generic abstraction created solely for possible future endpoints.

These omissions are deliberate scope choices, not missing architecture.
