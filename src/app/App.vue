<script setup lang="ts">
import { RouterView } from 'vue-router'

import ViewErrorBoundary from './error-handling/ViewErrorBoundary.vue'
import AppLayout from './layouts/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <RouterView v-slot="{ Component }">
      <ViewErrorBoundary>
        <component :is="Component" />
      </ViewErrorBoundary>
    </RouterView>
  </AppLayout>
</template>
