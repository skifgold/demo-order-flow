<template>
  <div class="checkout-progress" aria-label="Checkout progress">
    <span
      class="checkout-progress__step checkout-progress__step--active typography typography--progress-step typography--progress-step-active"
      aria-current="step"
    >
      <span class="checkout-progress__number typography typography--progress-number">1</span>
      Configuration
    </span>
    <span class="checkout-progress__connector" aria-hidden="true" />
    <span class="checkout-progress__step typography typography--progress-step">
      <span class="checkout-progress__number typography typography--progress-number">2</span>
      Details
    </span>
  </div>
</template>

<style scoped>
.checkout-progress {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.checkout-progress__step {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
}

.checkout-progress__number {
  display: grid;
  width: 30px;
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 50%;
}

.checkout-progress__step--active .checkout-progress__number {
  color: var(--color-surface);
  background: var(--color-ink);
  border-color: var(--color-ink);
}

.checkout-progress__connector {
  width: 66px;
  height: 1px;
  background: var(--color-border);
}
</style>
