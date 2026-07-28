<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <aside class="order-summary-panel" :aria-label="label">
    <slot />
  </aside>
</template>

<style scoped>
.order-summary-panel {
  position: sticky;
  top: var(--space-4);
  padding: 48px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

@media (max-width: 800px) {
  .order-summary-panel {
    position: static;
    order: 2;
  }
}

@media (max-width: 560px) {
  .order-summary-panel {
    padding: var(--space-6);
  }
}
</style>
