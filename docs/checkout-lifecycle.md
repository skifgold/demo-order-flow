# Checkout Lifecycle

## Router views

```text
/           ProductSelectionView
/checkout   CheckoutView
/*          Redirect to /
```

`CheckoutView` renders Configuration, Customer Details, or Order Confirmation
internally. These steps are not separate routes. Confirmation comes directly
from a successful order mutation and has no retrieval route.

## State ownership

| State | Owner |
| --- | --- |
| Product data and catalogue request lifecycle | TanStack Query |
| Basket product IDs and quantities | Pinia Basket Store |
| Persisted Basket | Versioned `localStorage` |
| Checkout step, Order Draft, and unresolved Order Conflict | In-memory Pinia Draft Store |
| Mounted field values, touched state, and field errors | PrimeVue Forms |
| Dependent choices, reconciliation, validation, and pricing | Pure ordering-domain functions |
| Submission request lifecycle: pending and error | TanStack mutation |
| Accepted response shown after success | Feature-local checkout submission coordinator until the customer leaves confirmation |

The Draft never duplicates submission status, submission errors, or the
successful response. The checkout submission coordinator retains the accepted
response only so `CheckoutView` can render confirmation after the Draft clears.

## Checkout transitions

The Draft has two navigation steps:

```ts
type CheckoutStep = 'configuration' | 'customer-details'
```

It exposes named transitions instead of an arbitrary step setter:

- advance to Customer Details after valid configuration;
- return to Configuration;
- checkpoint Customer Details;
- reconcile with the current Basket and catalogue;
- record or resolve an Order Conflict;
- cancel the Draft;
- complete and clear the Draft.

XState and other state-machine dependencies are intentionally excluded. The
transition logic is small enough to remain explicit in Pinia actions and pure
ordering-domain functions.

## Form checkpointing

PrimeVue Forms owns field interaction while a step is mounted. Values are
checkpointed into the Draft before **Next**, **Back**, **Review basket**, and
**Submit**. Returning to checkout initializes the form from the latest
checkpoint.

This avoids continuous two-way synchronization between form state and Pinia
while still preserving incomplete customer input during intentional in-app
navigation. A browser reload intentionally loses the Draft and customer data;
the persisted Basket remains and checkout restarts at Configuration.

## Basket reconciliation

When the Basket or refreshed product data changes:

- unchanged Basket Items keep their Print Configuration;
- a quantity change keeps its configuration and recalculates totals;
- removed Basket Items are removed from the Draft;
- new Basket Items receive empty configurations;
- values that are no longer supported are cleared;
- a material content or configuration change returns checkout to Configuration
  and clears terms acceptance;
- customer and address data remain available in the Draft.

If reconciliation leaves the Basket empty, checkout is cancelled and the
customer returns to the catalogue with non-blocking feedback.

## Submission

Submission builds an immutable payload snapshot from the current Basket,
validated Draft, and current product data.

- Pending locks checkout editing and duplicate submission.
- Recognized field validation failure stays on Customer Details and maps errors
  to PrimeVue Forms.
- Network or unexpected server failure stays on Customer Details and preserves
  all input.
- Order Conflict is recorded in the Draft, refreshes product data, blocks
  resubmission, and offers **Review basket**.
- Success renders confirmation from the mutation response, then clears the
  Basket, persisted Basket, and Draft.

The checkout submission coordinator keeps the successful response available to
`CheckoutView` after the Draft is cleared. Leaving confirmation discards that
response; it cannot be revisited by URL or restored after reload.
