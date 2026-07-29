<script setup lang="ts">
import { ref } from 'vue'

import type { ConfigurationIssue } from '../../domain/order-configuration'
import { configurationFieldId } from './configuration-form'

defineProps<{ issues: readonly ConfigurationIssue[] }>()

const root = ref<HTMLElement>()

defineExpose({
  focus: () => root.value?.focus(),
})
</script>

<template>
  <div
    ref="root"
    class="configuration-error-summary"
    tabindex="-1"
    role="alert"
    aria-label="Configuration errors"
  >
    <strong>Complete the highlighted fields</strong>
    <ul>
      <li v-for="issue in issues" :key="issue.field">
        <a :href="`#${configurationFieldId(issue.field)}`">{{ issue.message }}</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.configuration-error-summary {
  padding: var(--space-4);
  color: var(--color-error-ink);
  background: var(--color-error-surface);
  border: 1px solid var(--color-error-border);
}

.configuration-error-summary ul {
  padding-left: 1.25rem;
  margin: var(--space-2) 0 0;
}

.configuration-error-summary a {
  color: inherit;
}

.configuration-error-summary:focus {
  outline: 2px solid var(--color-error-border);
  outline-offset: 3px;
}
</style>
