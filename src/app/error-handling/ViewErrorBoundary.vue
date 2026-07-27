<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

const hasViewError = ref(false)

onErrorCaptured(() => {
  hasViewError.value = true
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
