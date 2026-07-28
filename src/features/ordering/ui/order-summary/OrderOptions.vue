<script setup lang="ts">
import { computed, ref } from 'vue'
import Accordion from 'primevue/accordion'
import AccordionContent from 'primevue/accordioncontent'
import AccordionHeader from 'primevue/accordionheader'
import AccordionPanel from 'primevue/accordionpanel'
import Checkbox from 'primevue/checkbox'
import Textarea from 'primevue/textarea'

import {
  isExpressEligible,
  type ConfigurationIssue,
  type GiftOptions,
  type OrderConfiguration,
  type ShippingMethod,
} from '../../domain/order-configuration'
import SelectField from '../form/SelectField.vue'
import type { SelectFieldOption } from '../form/select-field.types'
import { issueMessageFor } from '../form/use-form-issues'
import {
  configurationFieldErrorId,
  configurationFieldId,
} from '../configuration/configuration-form'

const props = defineProps<{
  configuration: OrderConfiguration
  issues: readonly ConfigurationIssue[]
}>()

const emit = defineEmits<{
  updateShipping: [shipping: ShippingMethod]
  updateGiftOptions: [giftOptions: GiftOptions]
}>()

const expressEligible = computed(() => isExpressEligible(Object.values(props.configuration.lines)))
const activeOption = ref<string | null>(null)
const shippingOptions = computed<readonly SelectFieldOption[]>(() => [
  { label: 'Standard', value: 'standard' },
  { label: 'Express', value: 'express', disabled: !expressEligible.value },
])
const giftMessageError = computed(() => issueMessageFor(props.issues, 'giftOptions.message'))
const giftOptionsSummary = computed(() =>
  props.configuration.giftOptions.message || props.configuration.giftOptions.hidePricesOnPackingSlip
    ? 'Selected'
    : 'Not selected',
)

function updateGiftMessage(message: string): void {
  emit('updateGiftOptions', {
    message,
    hidePricesOnPackingSlip: props.configuration.giftOptions.hidePricesOnPackingSlip,
  })
}

function updateHidePrices(hidePricesOnPackingSlip: boolean): void {
  emit('updateGiftOptions', {
    message: props.configuration.giftOptions.message,
    hidePricesOnPackingSlip,
  })
}
</script>

<template>
  <section class="order-options" aria-label="Order options">
    <div class="order-options__shipping">
      <div
        class="order-options__row order-options__row--shipping typography typography--body-large"
      >
        <span>Shipping</span>
        <div class="order-options__shipping-control">
          <SelectField
            name="shipping"
            :input-id="configurationFieldId('shipping')"
            label="Shipping"
            :model-value="configuration.shipping"
            :options="shippingOptions"
            :error="issueMessageFor(issues, 'shipping')"
            compact
            large
            @update:model-value="$emit('updateShipping', $event as ShippingMethod)"
          />
        </div>
      </div>
      <p
        v-if="!expressEligible"
        class="order-options__shipping-hint typography typography--meta typography--relaxed"
      >
        Express is available for Print only in A4 or A3.
      </p>
    </div>
    <Accordion v-model:value="activeOption" class="order-options__gift" lazy>
      <AccordionPanel value="gift-options">
        <AccordionHeader
          class="typography typography--body-large"
          data-testid="toggle-gift-options"
        >
          <span>Gift options</span>
          <span class="order-options__gift-summary typography typography--meta">{{
            giftOptionsSummary
          }}</span>
        </AccordionHeader>
        <AccordionContent>
          <div data-testid="gift-options-fields" class="order-options__gift-fields">
            <label
              class="order-options__gift-label typography typography--caption"
              :for="configurationFieldId('giftOptions.message')"
            >
              Gift message <span>(optional)</span>
            </label>
            <Textarea
              :id="configurationFieldId('giftOptions.message')"
              :model-value="configuration.giftOptions.message"
              :invalid="Boolean(giftMessageError)"
              :maxlength="200"
              :rows="3"
              fluid
              @update:model-value="updateGiftMessage"
            />
            <p class="order-options__hint typography typography--meta">
              {{ configuration.giftOptions.message.length }}/200 characters
            </p>
            <p
              :id="configurationFieldErrorId('giftOptions.message')"
              class="order-options__error typography typography--caption"
              :class="{ 'order-options__error--empty': !giftMessageError }"
            >
              {{ giftMessageError }}
            </p>
            <div class="order-options__checkbox">
              <Checkbox
                :input-id="configurationFieldId('giftOptions.hidePricesOnPackingSlip')"
                :model-value="configuration.giftOptions.hidePricesOnPackingSlip"
                binary
                @update:model-value="updateHidePrices"
              />
              <label
                class="typography typography--caption"
                :for="configurationFieldId('giftOptions.hidePricesOnPackingSlip')"
              >
                Hide prices on packing slip
              </label>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </section>
</template>

<style scoped>
.order-options {
  display: grid;
  gap: 0;
  padding: 0;
  margin: 0;
  border-bottom: 1px solid var(--color-border);
}

.order-options__row,
.order-options :deep(.p-accordionheader) {
  gap: var(--space-4);
  align-items: center;
  width: 100%;
  min-height: 72px;
  padding: 0;
  text-align: left;
}

.order-options__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
}

.order-options__row--shipping {
  min-height: 40px;
}

.order-options__shipping {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
}

.order-options__shipping-control {
  display: grid;
  justify-items: end;
}

.order-options__shipping-hint {
  margin: 0;
}

.order-options__gift {
  padding: 0;
}

.order-options :deep(.p-accordion),
.order-options :deep(.p-accordionpanel) {
  background: transparent;
  border: 0;
}

.order-options :deep(.p-accordionheader) {
  display: flex;
  justify-content: space-between;
  background: transparent;
  border: 0;
  border-radius: 0;
}

.order-options :deep(.p-accordionheader:hover),
.order-options :deep(.p-accordionheader[data-p-active='true']) {
  color: var(--color-ink);
  background: transparent;
}

.order-options :deep(.p-accordionheader:focus-visible) {
  outline: 2px solid var(--color-ink);
  outline-offset: 3px;
}

.order-options__gift-summary {
  margin-left: auto;
}

.order-options :deep(.p-accordionheader-toggle-icon) {
  width: 1rem;
  height: 1rem;
  margin-left: var(--space-1);
  color: var(--color-muted);
}

.order-options :deep(.p-accordionheader[data-p-active='true']) {
  border-bottom: 1px solid var(--color-border);
}

.order-options :deep(.p-accordioncontent),
.order-options :deep(.p-accordioncontent-content) {
  padding: 0;
  color: inherit;
  background: transparent;
  border: 0;
}

.order-options__gift-fields {
  display: grid;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-6) 0;
}

.order-options__gift span {
  color: var(--color-muted);
}

.order-options__hint,
.order-options__error {
  margin: 0;
}

.order-options__error {
  min-block-size: 1.25em;
  color: var(--color-error-border);
}

.order-options__error--empty {
  visibility: hidden;
}

.order-options__checkbox {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  padding-top: var(--space-2);
}

:deep(.p-textarea) {
  min-height: 112px;
  padding: var(--space-3);
  color: var(--color-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-shadow: none;
}

:deep(.p-textarea:focus),
:deep(.p-textarea:hover) {
  border-color: var(--color-ink);
  box-shadow: inset 0 0 0 1px var(--color-ink);
}

:deep(.p-textarea.p-invalid) {
  border-color: var(--color-error-border);
  box-shadow: inset 0 0 0 1px var(--color-error-border);
}

:deep(.p-checkbox .p-checkbox-box) {
  border-color: var(--color-border);
  border-radius: 2px;
}

:deep(.p-checkbox.p-highlight .p-checkbox-box) {
  background: var(--color-accent);
  border-color: var(--color-accent);
}
</style>
