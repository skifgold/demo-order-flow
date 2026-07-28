<script setup lang="ts">
import Button from 'primevue/button'
import Message from 'primevue/message'

defineProps<{ isRetrying: boolean }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <Message class="catalogue-refresh-warning" severity="warn" role="status" aria-live="polite">
    <div class="catalogue-refresh-warning__content">
      <div class="catalogue-refresh-warning__copy">
        <p class="catalogue-refresh-warning__title">Couldn’t update the catalogue</p>
        <p>You can keep browsing, but availability and prices may have changed.</p>
      </div>
      <div class="catalogue-refresh-warning__action">
        <Button
          label="Try again"
          icon="pi pi-refresh"
          severity="warn"
          outlined
          :loading="isRetrying"
          @click="$emit('retry')"
        />
      </div>
    </div>
  </Message>
</template>

<style scoped>
.catalogue-refresh-warning {
  position: sticky;
  top: var(--space-2);
  z-index: 10;
  margin-bottom: var(--space-4);
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.catalogue-refresh-warning__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-3);
  align-items: center;
}

.catalogue-refresh-warning :deep(.p-message-content-wrapper),
.catalogue-refresh-warning :deep(.p-message-content),
.catalogue-refresh-warning :deep(.p-message-text) {
  width: 100%;
}

.catalogue-refresh-warning :deep(.p-message-content-wrapper),
.catalogue-refresh-warning :deep(.p-message-text) {
  flex: 1;
}

.catalogue-refresh-warning p {
  margin: 0;
}

.catalogue-refresh-warning__title {
  margin-bottom: var(--space-1) !important;
  font-weight: 700;
}

@media (max-width: 40rem) {
  .catalogue-refresh-warning__content {
    grid-template-columns: 1fr;
  }

  .catalogue-refresh-warning__action {
    justify-self: start;
  }
}
</style>
