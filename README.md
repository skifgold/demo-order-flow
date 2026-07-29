# Frontend Ordering Application

A Vue 3 and TypeScript application for browsing art prints, configuring each
basket item, and submitting an order through a deterministic mock API.

## What it delivers

- A responsive product catalogue and persistent basket.
- A two-step checkout for print configuration and customer details.
- Per-item pricing, validation, order submission, and confirmation.
- Accessible recovery from validation, network, server, and order-conflict
  errors.
- Reviewer-controlled mock scenarios at `?demo=true`.

The scope is intentionally frontend-only. The mock API provides the catalogue
and order submission; authentication, durable orders, deployment, and
multi-user behaviour are out of scope.

## Technical approach

- Vue 3, TypeScript, Vite, Vue Router, and the Composition API.
- PrimeVue and PrimeVue Forms for accessible UI and form interaction.
- Zod for validation, TanStack Query for server state, and Pinia for basket
  and checkout-draft state.
- Native `fetch` for HTTP and MSW for deterministic mock responses.
- A lightweight feature-first structure with framework-independent ordering
  rules.

The visual direction is an editorial art gallery: image-led, warm, and calm
rather than an administration dashboard.

## Getting started

Requires Node.js 22.18+ or 24.12+.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). MSW starts
only in development and supplies the local catalogue and order endpoints; no
environment variables, account, or external service is required.

This is a development-only demo. `npm run dev` is the supported way to run the
complete customer flow. Building the project and starting Vite Preview serves
the production assets, but does not start MSW; consequently, its mock
`/products` and `/orders` endpoints are unavailable and the catalogue and
checkout cannot function there.

Use the production build and preview only to verify that the application
bundles and its static assets are served:

```sh
npm run build
npm run preview
```

## Testing and quality checks

Run the narrowest check while working, or the complete gate before handoff:

```sh
npm run format:check
npm run lint:check
npm run type-check
npm run test:unit:run
npm run test:e2e
npm run check
npm run check:full
```

`check` runs formatting, linting, type checking, unit/component tests, and the
production build. `check:full` adds the Chromium desktop and mobile E2E suite.

## Mock data and reviewer scenarios

The six deterministic Artwork records live in
[`src/mocks/catalogue.data.ts`](./src/mocks/catalogue.data.ts); their locally
bundled images are under [`public/artwork`](./public/artwork). MSW serves
`GET /products` and `POST /orders` in development and tests.

Open `/?demo=true` to reveal reviewer-only controls. Each scenario is
one-shot and returns automatically to normal behaviour:

```text
http://localhost:5173/?demo=true
```

Start `npm run dev`, then open this URL (or append `?demo=true` to the Vite
development URL) to access the demo inputs. The controls are unavailable in
Vite Preview because they, like MSW, are development-only.

- Delay or fail the next catalogue request.
- Delay the next order to inspect the pending lock.
- Return an email validation error, an Order Conflict, or a server failure for
  the next order.

The controls are omitted from the ordinary customer experience and are never
mounted in a production build.

## Recovery behaviour

- Catalogue loading retries once; an initial failure offers Retry, while a
  refresh failure preserves the visible catalogue and shows a warning.
- Recognised order validation errors focus the matching field. Unknown paths
  receive safe form-level copy instead of raw backend text.
- Network and server failures retain the Basket and Order Draft and offer an
  explicit retry.
- An Order Conflict refreshes the catalogue, highlights affected items, blocks
  re-submission, and lets the customer review the Basket without losing input.
- A successful response alone clears the Basket, persisted Basket, and Draft,
  then renders the order confirmation.

## Documentation

- [Architecture](./docs/architecture.md) — feature boundaries, ownership, and
  dependency rules.
- [Product catalogue](./docs/product-catalogue.md) — Artwork data, pricing,
  configurations, and shipping capability rules.
- [Checkout lifecycle](./docs/checkout-lifecycle.md) — routes, Order Draft
  transitions, reconciliation, and submission behaviour.

## Key product constraints

- Each basket item owns its own Print Configuration; no shared configuration
  mode is introduced.
- Only basket product IDs and quantities persist between browser sessions.
- Checkout transitions stay explicit through named Order Draft actions; the
  project does not use a state-machine library.
- Production features remain independent of MSW handlers and demo controls.

## Acknowledgements

This project was developed with assistance from Codex, powered by GPT-5.6.
The six Artwork images in `public/artwork` were generated with OpenAI image
generation tooling and are bundled locally for this demo.
