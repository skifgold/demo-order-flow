<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

import { reportUnexpectedError } from '@/shared/observability/report-unexpected-error'
import { unexpectedErrorContext } from '@/shared/observability/should-report-error'

const hasViewError = ref(false)
let hasReportedViewError = false

onErrorCaptured((error) => {
  hasViewError.value = true
  const context = unexpectedErrorContext(error, 'view-render')

  if (context !== undefined && !hasReportedViewError) {
    hasReportedViewError = true
    reportUnexpectedError(context)
  }

  return false
})

function reloadApplication() {
  window.location.reload()
}
</script>

<template>
  <section v-if="hasViewError" aria-labelledby="view-error-title" class="view-error">
    <h1 id="view-error-title">This view is temporarily unavailable</h1>
    <p>Please reload the application and try again.</p>
    <button type="button" @click="reloadApplication">Reload application</button>
  </section>
  <slot v-else />
</template>
