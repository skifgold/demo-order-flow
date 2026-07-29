<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'

import {
  submissionRecoveryHeading,
  submissionRecoveryMessage,
  submissionRecoverySeverity,
  type SubmissionRecovery,
} from './submission-recovery'

const props = defineProps<{
  recovery: SubmissionRecovery
  disabled: boolean
  affectedArtworkNames?: readonly string[]
}>()

defineEmits<{
  retry: []
  reviewBasket: []
}>()

const root = ref<HTMLElement>()

watch(
  () => props.recovery,
  async () => {
    await nextTick()
    root.value?.focus()
  },
  { immediate: true },
)
</script>

<template>
  <section ref="root" class="submission-recovery" tabindex="-1" role="alert">
    <Message :severity="submissionRecoverySeverity(recovery)" role="presentation">
      <div class="submission-recovery__content">
        <div>
          <strong>{{ submissionRecoveryHeading(recovery) }}</strong>
          <p>{{ submissionRecoveryMessage(recovery, affectedArtworkNames) }}</p>
        </div>
        <Button
          v-if="recovery.kind === 'conflict'"
          label="Review basket"
          severity="warn"
          @click="$emit('reviewBasket')"
        />
        <Button
          v-else-if="recovery.kind !== 'validation'"
          label="Try again"
          :disabled="disabled"
          @click="$emit('retry')"
        />
      </div>
    </Message>
  </section>
</template>

<style scoped>
.submission-recovery {
  outline: none;
}

.submission-recovery__content {
  display: grid;
  gap: var(--space-3);
}

.submission-recovery :deep(.p-message) {
  margin: 0;
}

.submission-recovery p {
  margin: var(--space-2) 0 0;
}

.submission-recovery:focus {
  outline: 2px solid var(--color-ink);
  outline-offset: 3px;
}
</style>
