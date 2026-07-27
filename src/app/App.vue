<script setup lang="ts">
import { RouterView } from 'vue-router'

import ViewErrorBoundary from './error-handling/ViewErrorBoundary.vue'
</script>

<template>
  <main class="application-shell">
    <RouterView v-slot="{ Component }">
      <ViewErrorBoundary>
        <component :is="Component" />
      </ViewErrorBoundary>
    </RouterView>
  </main>
</template>
