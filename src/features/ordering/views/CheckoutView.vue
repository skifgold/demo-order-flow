<script setup lang="ts">
import { useRouter } from 'vue-router'

import CheckoutErrorState from '../ui/checkout/CheckoutErrorState.vue'
import CheckoutLoadingState from '../ui/checkout/CheckoutLoadingState.vue'
import EmptyBasketState from '../ui/checkout/EmptyBasketState.vue'
import ConfigurationStep from '../ui/configuration/ConfigurationStep.vue'
import CustomerDetailsPlaceholder from '../ui/customer-details/CustomerDetailsPlaceholder.vue'
import { useCheckoutConfiguration } from './use-checkout-configuration'

const {
  basket,
  browseArtworks,
  continueToCustomerDetails,
  draft,
  isError,
  isPending,
  issues,
  lines,
  removeLine,
  refetch,
  reviewBasket,
  summary,
  updateGiftOptions,
  updateLine,
  updateShipping,
} = useCheckoutConfiguration(useRouter())
</script>

<template>
  <CheckoutLoadingState v-if="isPending" />

  <CheckoutErrorState v-else-if="isError" @retry="refetch" />

  <EmptyBasketState v-else-if="basket.isEmpty" @browse="browseArtworks" />

  <ConfigurationStep
    v-else-if="draft.step === 'configuration'"
    :lines="lines"
    :configuration="draft.configuration"
    :summary="summary"
    :issues="issues"
    @update-line="updateLine"
    @update-shipping="updateShipping"
    @update-gift-options="updateGiftOptions"
    @continue="continueToCustomerDetails"
    @review-basket="reviewBasket"
    @remove-line="removeLine"
  />

  <CustomerDetailsPlaceholder v-else @back="draft.returnToConfiguration" />
</template>
