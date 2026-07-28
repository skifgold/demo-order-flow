<script setup lang="ts">
import { computed } from 'vue'
import TrashIcon from '@primevue/icons/trash'
import Button from 'primevue/button'

import type { Product } from '@/features/catalogue/api/product.contract'
import {
  getSupportedGlazings,
  getSupportedSizes,
  type ConfigurationIssue,
  type PrintConfiguration,
} from '../../domain/order-configuration'
import blackWoodSwatch from './assets/frame-black-wood.png'
import naturalOakSwatch from './assets/frame-natural-oak.png'
import whiteWoodSwatch from './assets/frame-white-wood.png'
import SelectField from '../form/SelectField.vue'
import type { SelectFieldOption } from '../form/select-field.types'
import { issueMessageFor } from '../form/use-form-issues'
import PresentationChoice from './PresentationChoice.vue'
import {
  configurationFieldName,
  configurationLineField,
  configurationLineFieldId,
} from './configuration-form'

const props = defineProps<{
  product: Product
  quantity: number
  configuration: PrintConfiguration
  issues: readonly ConfigurationIssue[]
}>()

defineEmits<{
  update: [input: { field: keyof PrintConfiguration; value: string }]
  remove: []
}>()

const presentationOptions: readonly SelectFieldOption[] = [
  { label: 'Print only', value: 'print-only' },
  { label: 'Framed', value: 'framed' },
]
const finishOptions: readonly SelectFieldOption[] = [
  { label: 'Matte Fine Art', value: 'matte' },
  { label: 'Lustre Fine Art · +£5', value: 'lustre' },
]
const frameOptions: readonly SelectFieldOption[] = [
  { label: 'Black', value: 'black', imagePath: blackWoodSwatch },
  { label: 'White', value: 'white', imagePath: whiteWoodSwatch },
  { label: 'Natural Oak · +£10', value: 'natural-oak', imagePath: naturalOakSwatch },
]
const sizeOptions = computed<readonly SelectFieldOption[]>(() =>
  getSupportedSizes(props.product).map((size) => ({ label: sizeLabel(size), value: size })),
)
const glazingOptions = computed<readonly SelectFieldOption[]>(() =>
  getSupportedGlazings(props.configuration).map((glazing) => ({
    label: glazing === 'acrylic' ? 'Acrylic · +£8' : 'Glass',
    value: glazing,
  })),
)

function issueFor(field: keyof PrintConfiguration): string | undefined {
  return issueMessageFor(props.issues, configurationLineField(props.product.id, field))
}

function sizeLabel(size: string): string {
  const dimensionsBySize: Record<string, string> = {
    A4: '21.0 × 29.7 cm',
    A3: '29.7 × 42.0 cm',
    A2: '42.0 × 59.4 cm',
  }

  return `${size} (${dimensionsBySize[size]})`
}
</script>

<template>
  <article class="print-configuration">
    <Button
      class="print-configuration__remove"
      :aria-label="`Remove ${product.name} from Basket`"
      :data-testid="`remove-artwork-${product.id}`"
      severity="danger"
      text
      rounded
      type="button"
      @click="$emit('remove')"
    >
      <TrashIcon />
    </Button>
    <div class="print-configuration__image-frame">
      <img :src="product.imagePath" :alt="`Artwork: ${product.name}`" width="1122" height="1402" />
    </div>
    <div class="print-configuration__body">
      <div class="print-configuration__fields">
        <PresentationChoice
          :name="configurationFieldName(product.id, 'presentation')"
          :input-id="configurationLineFieldId(product.id, 'presentation')"
          label="Presentation"
          :model-value="configuration.presentation ?? ''"
          :options="presentationOptions"
          :error="issueFor('presentation')"
          @update:model-value="$emit('update', { field: 'presentation', value: $event })"
        />
        <SelectField
          :name="configurationFieldName(product.id, 'size')"
          :input-id="configurationLineFieldId(product.id, 'size')"
          label="Size"
          :model-value="configuration.size ?? ''"
          :options="sizeOptions"
          placeholder="Choose size"
          :error="issueFor('size')"
          @update:model-value="$emit('update', { field: 'size', value: $event })"
        />
        <SelectField
          :name="configurationFieldName(product.id, 'finish')"
          :input-id="configurationLineFieldId(product.id, 'finish')"
          label="Paper finish"
          :model-value="configuration.finish ?? ''"
          :options="finishOptions"
          placeholder="Choose paper finish"
          :error="issueFor('finish')"
          @update:model-value="$emit('update', { field: 'finish', value: $event })"
        />
        <SelectField
          :name="configurationFieldName(product.id, 'frame')"
          :input-id="configurationLineFieldId(product.id, 'frame')"
          label="Frame style"
          :model-value="configuration.frame ?? ''"
          :options="frameOptions"
          :placeholder="configuration.presentation === 'framed' ? 'Choose frame style' : '—'"
          :disabled="configuration.presentation !== 'framed'"
          :error="issueFor('frame')"
          @update:model-value="$emit('update', { field: 'frame', value: $event })"
        />
        <SelectField
          class="print-configuration__glazing"
          :name="configurationFieldName(product.id, 'glazing')"
          :input-id="configurationLineFieldId(product.id, 'glazing')"
          label="Glazing"
          :model-value="configuration.glazing ?? ''"
          :options="glazingOptions"
          :placeholder="configuration.presentation === 'framed' ? 'Choose glazing' : '—'"
          :disabled="configuration.presentation !== 'framed'"
          :error="issueFor('glazing')"
          @update:model-value="$emit('update', { field: 'glazing', value: $event })"
        />
      </div>
    </div>
  </article>
</template>

<style scoped>
.print-configuration {
  position: relative;
  display: grid;
  grid-template-columns: 228px minmax(0, 1fr);
  gap: 36px;
  padding: 54px 24px 30px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.print-configuration__image-frame {
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--color-border);
}

.print-configuration__image-frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.print-configuration__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

:deep(.p-button.print-configuration__remove) {
  position: absolute;
  inset-block-start: var(--space-4);
  inset-inline-end: var(--space-4);
  z-index: 1;
  width: 40px;
  height: 40px;
  padding: 0;
  color: var(--color-error-border);
}

:deep(.p-button.print-configuration__remove svg) {
  width: 20px;
  height: 20px;
}

:deep(.p-button.print-configuration__remove:not(:disabled):hover) {
  color: var(--color-error-ink);
  background: var(--color-error-surface);
}

:deep(.p-button.print-configuration__remove:focus-visible) {
  outline: 2px solid var(--color-error-border);
  outline-offset: 2px;
}

.print-configuration__glazing {
  grid-column: span 2;
}

@media (max-width: 560px) {
  .print-configuration,
  .print-configuration__fields {
    grid-template-columns: 1fr;
  }

  .print-configuration__image-frame {
    max-width: 228px;
  }

  .print-configuration__glazing {
    grid-column: auto;
  }
}
</style>
