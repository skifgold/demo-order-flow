<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'

import { scheduleDemoScenario, type DemoScenario } from './demo-scenarios'

const props = defineProps<{ refreshCatalogue: () => void }>()

const isOpen = ref(false)

function enableScenario(scenario: DemoScenario): void {
  scheduleDemoScenario(scenario)
  isOpen.value = false

  if (scenario === 'catalogue-delay' || scenario === 'catalogue-failure') {
    props.refreshCatalogue()
  }
}
</script>

<template>
  <aside class="demo-controls" aria-label="Demo controls">
    <Button
      :label="isOpen ? 'Hide demo controls' : 'Reviewer scenarios'"
      severity="secondary"
      size="small"
      @click="isOpen = !isOpen"
    />
    <template v-if="isOpen">
      <p>Each choice changes one upcoming customer action, then resets.</p>
      <div class="demo-controls__actions">
        <Button
          label="Delay catalogue"
          severity="secondary"
          size="small"
          @click="enableScenario('catalogue-delay')"
        />
        <Button
          label="Fail catalogue"
          severity="secondary"
          size="small"
          @click="enableScenario('catalogue-failure')"
        />
        <Button
          label="Order conflict"
          severity="secondary"
          size="small"
          @click="enableScenario('order-conflict')"
        />
        <Button
          label="Fail order"
          severity="secondary"
          size="small"
          @click="enableScenario('order-server-failure')"
        />
      </div>
    </template>
  </aside>
</template>

<style scoped>
.demo-controls {
  position: fixed;
  z-index: 20;
  right: var(--space-4);
  bottom: var(--space-4);
  display: grid;
  gap: var(--space-2);
  max-width: 300px;
  padding: var(--space-2);
  color: var(--color-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-ink);
  border-radius: 6px;
  box-shadow: 0 12px 32px rgb(0 0 0 / 18%);
}

.demo-controls p {
  margin: 0;
  color: var(--color-muted);
}

.demo-controls__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}
</style>
