<script setup lang="ts">
withDefaults(defineProps<{ activeStep?: 1 | 2 }>(), { activeStep: 1 })
</script>

<template>
  <div class="checkout-progress" aria-label="Checkout progress">
    <span
      class="checkout-progress__step typography typography--body-medium"
      :class="{
        'checkout-progress__step--active': activeStep === 1,
      }"
      :aria-current="activeStep === 1 ? 'step' : undefined"
    >
      <span class="checkout-progress__number typography typography--caption">1</span>
      Configuration
    </span>
    <span class="checkout-progress__connector" aria-hidden="true" />
    <span
      class="checkout-progress__step typography typography--body-medium"
      :class="{
        'checkout-progress__step--active': activeStep === 2,
      }"
      :aria-current="activeStep === 2 ? 'step' : undefined"
    >
      <span class="checkout-progress__number typography typography--caption">2</span>
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
  color: var(--color-muted);
}

.checkout-progress__step--active {
  color: var(--color-ink);
  font-weight: 700;
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
