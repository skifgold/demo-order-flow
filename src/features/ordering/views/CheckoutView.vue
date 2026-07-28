<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useCheckoutConfiguration } from '../checkout/use-configuration'
import { useCheckoutCustomerDetails } from '../checkout/use-customer-details'
import CheckoutErrorState from '../ui/checkout/CheckoutErrorState.vue'
import CheckoutLoadingState from '../ui/checkout/CheckoutLoadingState.vue'
import EmptyBasketState from '../ui/checkout/EmptyBasketState.vue'
import OrderConfirmation from '../ui/checkout/OrderConfirmation.vue'
import ConfigurationStep from '../ui/configuration/ConfigurationStep.vue'
import CustomerDetailsStep from '../ui/customer-details/CustomerDetailsStep.vue'

const router = useRouter()
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
  products,
} = useCheckoutConfiguration(router)

const {
  confirmation,
  continueShopping,
  isSubmitting,
  returnToConfiguration,
  serverIssues,
  setCustomerDetails,
  submissionMessage,
  submitOrder,
} = useCheckoutCustomerDetails({
  router,
  basket,
  products,
  configuration: computed(() => draft.configuration),
  draft,
})
</script>

<template>
  <OrderConfirmation
    v-if="confirmation !== undefined"
    :order="confirmation"
    @continue-shopping="continueShopping"
  />

  <CheckoutLoadingState v-else-if="isPending" />

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

  <CustomerDetailsStep
    v-else
    :customer-details="draft.customerDetails"
    :lines="lines"
    :configuration="draft.configuration"
    :summary="summary"
    :is-submitting="isSubmitting"
    :server-issues="serverIssues"
    :submission-message="submissionMessage"
    @back="returnToConfiguration"
    @checkpoint="setCustomerDetails"
    @submit="submitOrder"
  />
</template>
