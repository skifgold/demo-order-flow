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
  <aside class="demo-controls" :class="{ 'demo-controls--open': isOpen }" aria-label="Demo controls">
    <Button
      class="demo-controls__toggle"
      :label="isOpen ? 'Hide demo controls' : 'Reviewer scenarios'"
      :icon="isOpen ? 'pi pi-times' : 'pi pi-flask'"
      severity="contrast"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    />
    <template v-if="isOpen">
      <div class="demo-controls__header">
        <span>Demo mode</span>
        <strong>Reviewer scenarios</strong>
      </div>
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
  width: min(300px, calc(100vw - (var(--space-4) * 2)));
  padding: var(--space-2);
  color: var(--color-ink);
  background: var(--color-warning-surface);
  border: 2px solid var(--color-warning-border);
  border-radius: 8px;
  box-shadow: 0 12px 32px rgb(0 0 0 / 24%);
}

.demo-controls__toggle {
  width: 100%;
  min-height: 52px;
  font-weight: 700;
}

.demo-controls:not(.demo-controls--open)::before {
  position: absolute;
  top: -10px;
  left: var(--space-3);
  padding: 2px var(--space-2);
  color: var(--color-surface);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  content: 'DEMO MODE';
  background: var(--color-warning-border);
  border-radius: 999px;
}

.demo-controls__header {
  display: grid;
  gap: 2px;
}

.demo-controls__header span {
  color: var(--color-warning-ink);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.demo-controls p {
  margin: 0;
  color: var(--color-ink);
}

.demo-controls__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}
</style>
