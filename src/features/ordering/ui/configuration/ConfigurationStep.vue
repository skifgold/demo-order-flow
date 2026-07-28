<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import Form from '@primevue/forms/form'
import Button from 'primevue/button'

import type {
  ConfigurationIssue,
  GiftOptions,
  OrderConfiguration,
  OrderSummary,
  PrintConfiguration,
  ShippingMethod,
} from '../../domain/order-configuration'
import CheckoutProgress from '../checkout/CheckoutProgress.vue'
import ConfigurationErrorSummary from './ConfigurationErrorSummary.vue'
import {
  type ConfiguredBasketLine,
  configurationFieldId,
  useConfigurationForm,
} from './configuration-form'
import OrderSummaryPanel from '../order-summary/OrderSummary.vue'
import PrintConfigurationCard from './PrintConfigurationCard.vue'
import { useFormIssueFocus } from '../form/use-form-issues'

const props = defineProps<{
  lines: readonly ConfiguredBasketLine[]
  configuration: OrderConfiguration
  summary: OrderSummary
  issues: readonly ConfigurationIssue[]
}>()

defineEmits<{
  updateLine: [input: { productId: string; field: keyof PrintConfiguration; value: string }]
  updateShipping: [shipping: ShippingMethod]
  updateGiftOptions: [giftOptions: GiftOptions]
  continue: []
  reviewBasket: []
}>()

const lines = toRef(props, 'lines')
const configuration = toRef(props, 'configuration')
const issues = toRef(props, 'issues')
const errorSummary = ref<{ focus: () => void }>()
const formKey = computed(() => props.lines.map((line) => line.product.id).join('-'))
const { initialValues, resolver } = useConfigurationForm(lines, configuration)

useFormIssueFocus({ issues, errorSummary, getFieldId: configurationFieldId })
</script>

<template>
  <section class="configuration-step" aria-labelledby="checkout-title">
    <header class="configuration-step__header">
      <h1 id="checkout-title">Configure your prints</h1>
      <CheckoutProgress />
    </header>

    <Form
      :key="formKey"
      class="configuration-step__form"
      :initial-values="initialValues"
      :resolver="resolver"
      :validate-on-value-update="false"
      @submit="$emit('continue')"
    >
      <div class="configuration-step__layout">
        <div class="configuration-step__content">
          <ConfigurationErrorSummary v-if="issues.length > 1" ref="errorSummary" :issues="issues" />

          <PrintConfigurationCard
            v-for="line in lines"
            :key="line.product.id"
            :product="line.product"
            :quantity="line.quantity"
            :configuration="configuration.lines[line.product.id] ?? {}"
            :issues="issues"
            @update="$emit('updateLine', { productId: line.product.id, ...$event })"
          />

          <footer class="configuration-step__actions">
            <Button
              data-testid="review-basket"
              label="Review basket"
              severity="secondary"
              text
              type="button"
              @click="$emit('reviewBasket')"
            />
            <Button
              class="configuration-step__continue"
              data-testid="continue-to-details"
              label="Continue to details"
              type="submit"
            />
          </footer>
        </div>

        <OrderSummaryPanel
          :lines="lines"
          :configuration="configuration"
          :summary="summary"
          :issues="issues"
          @update-shipping="$emit('updateShipping', $event)"
          @update-gift-options="$emit('updateGiftOptions', $event)"
        />
      </div>
    </Form>
  </section>
</template>

<style scoped>
.configuration-step__header {
  max-width: none;
  margin-bottom: var(--space-8);
}

.configuration-step h1 {
  margin: 0 0 var(--space-6);
  font-family: var(--font-display);
  font-size: clamp(48px, 5vw, var(--font-size-checkout-heading-max));
  font-weight: 500;
  letter-spacing: var(--letter-spacing-heading);
  line-height: 1;
}

.configuration-step__form {
  display: block;
}

.configuration-step__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(var(--layout-summary-min-inline-size), 0.95fr);
  gap: 40px;
  align-items: start;
}

.configuration-step__content {
  display: grid;
  gap: var(--space-4);
}

.configuration-step__actions {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  justify-content: space-between;
}

.configuration-step__actions :deep(.p-button-text) {
  padding: 0;
  color: var(--color-ink);
  text-decoration: underline;
}

.configuration-step__continue:deep(.p-button) {
  min-width: 342px;
  min-height: 72px;
  color: var(--color-surface);
  background: var(--color-ink);
  border-color: var(--color-ink);
  border-radius: 6px;
  font-size: 20px;
}

.configuration-step__continue:deep(.p-button:hover) {
  color: var(--color-surface);
  background: var(--color-accent);
  border-color: var(--color-accent);
}

@media (max-width: 800px) {
  .configuration-step__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .configuration-step__actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .configuration-step__continue:deep(.p-button) {
    width: 100%;
    min-width: 0;
  }
}
</style>
