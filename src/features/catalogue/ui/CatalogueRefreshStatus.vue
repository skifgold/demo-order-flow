<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner'
</script>

<template>
  <p class="catalogue-refresh-status" role="status" aria-live="polite">
    <ProgressSpinner aria-hidden="true" stroke-width="6" />
    <span>Refreshing availability…</span>
  </p>
</template>

<style scoped>
.catalogue-refresh-status {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  margin: 0;
  color: var(--color-muted);
}

.catalogue-refresh-status :deep(.p-progressspinner) {
  width: 1rem;
  height: 1rem;
}
</style>
