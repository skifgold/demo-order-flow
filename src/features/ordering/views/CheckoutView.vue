<script setup lang="ts">
import { useCheckoutJourney } from '../checkout/use-checkout-journey'
import CheckoutErrorState from '../ui/checkout/CheckoutErrorState.vue'
import CheckoutLoadingState from '../ui/checkout/CheckoutLoadingState.vue'
import EmptyBasketState from '../ui/checkout/EmptyBasketState.vue'
import OrderConfirmation from '../ui/checkout/OrderConfirmation.vue'
import ConfigurationStep from '../ui/configuration/ConfigurationStep.vue'
import CustomerDetailsStep from '../ui/customer-details/CustomerDetailsStep.vue'

const { screen } = useCheckoutJourney()
</script>

<template>
  <OrderConfirmation
    v-if="screen.kind === 'confirmation'"
    :order="screen.order"
    @continue-shopping="screen.continueShopping"
  />

  <CheckoutLoadingState v-else-if="screen.kind === 'loading'" />

  <CheckoutErrorState v-else-if="screen.kind === 'error'" @retry="screen.retry" />

  <EmptyBasketState v-else-if="screen.kind === 'empty-basket'" @browse="screen.browseArtworks" />

  <ConfigurationStep
    v-else-if="screen.kind === 'configuration'"
    :items="screen.items"
    :configuration="screen.configuration"
    :summary="screen.summary"
    @update-item="screen.updateItem"
    @update-shipping="screen.updateShipping"
    @update-gift-options="screen.updateGiftOptions"
    @continue="screen.continueToCustomerDetails"
    @review-basket="screen.reviewBasket"
    @remove-item="screen.removeItem"
  />

  <CustomerDetailsStep
    v-else-if="screen.kind === 'customer-details'"
    :customer-details="screen.customerDetails"
    :items="screen.items"
    :configuration="screen.configuration"
    :summary="screen.summary"
    :is-submitting="screen.isSubmitting"
    :is-submission-blocked="screen.isSubmissionBlocked"
    :server-issues="screen.serverIssues"
    :recovery="screen.recovery"
    :highlighted-product-ids="screen.highlightedProductIds"
    @back="screen.returnToConfiguration"
    @checkpoint="screen.setCustomerDetails"
    @review-basket="screen.reviewBasketAfterConflict"
    @submit="screen.submitOrder"
  />
</template>
