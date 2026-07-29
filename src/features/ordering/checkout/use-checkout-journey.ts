import { computed } from 'vue'
import { useRouter } from 'vue-router'

import type { CustomerDetails } from '../domain/order-configuration'
import { useOrderDraftStore } from '../draft/order-draft.store'

import { useCheckoutBasket } from './use-basket'
import { useCheckoutConfiguration } from './use-checkout-configuration'
import { useCheckoutSubmission } from './use-submission'

export function useCheckoutJourney() {
  const router = useRouter()
  const { basket, products, items, isError, isPending, refetch } = useCheckoutBasket()
  const draft = useOrderDraftStore()
  const configuration = useCheckoutConfiguration({ basket, products, draft })

  function reviewBasket(): void {
    configuration.checkpointConfiguration()
    void router.push({ name: 'catalogue' })
  }

  async function recoverOrderConflict(affectedProductIds: readonly string[]): Promise<void> {
    draft.recordOrderConflict({
      affectedProductIds:
        affectedProductIds.length > 0
          ? affectedProductIds
          : basket.items.map((item) => item.productId),
    })
    await refetch()
    basket.reconcile(products.value)
    configuration.reconcileWithBasket()
  }

  function reviewBasketAfterConflict(): void {
    draft.resolveOrderConflict()
    void router.push({ name: 'catalogue' })
  }

  function browseArtworks(): void {
    void router.push({ name: 'catalogue' })
  }

  const submission = useCheckoutSubmission({
    products,
    basketItems: computed(() => basket.items),
    configuration: computed(() => draft.configuration),
    onSuccess: () => {
      basket.clear()
      draft.completeDraft()
    },
    onConflict: recoverOrderConflict,
  })

  function setCustomerDetails(customerDetails: CustomerDetails): void {
    draft.setCustomerDetails(customerDetails)
  }

  function returnToConfiguration(customerDetails: CustomerDetails): void {
    setCustomerDetails(customerDetails)
    draft.returnToConfiguration()
  }

  async function submitOrder(customerDetails: CustomerDetails): Promise<void> {
    setCustomerDetails(customerDetails)
    await submission.submit(customerDetails)
  }

  function continueShopping(): void {
    submission.clearConfirmation()
    void router.push({ name: 'catalogue' })
  }

  const screen = computed(() => {
    if (submission.confirmation.value !== undefined) {
      return {
        kind: 'confirmation' as const,
        order: submission.confirmation.value,
        continueShopping,
      }
    }

    if (isPending.value) {
      return { kind: 'loading' as const }
    }

    if (isError.value) {
      return { kind: 'error' as const, retry: refetch }
    }

    if (basket.isEmpty) {
      return { kind: 'empty-basket' as const, browseArtworks }
    }

    if (draft.step === 'configuration') {
      return {
        kind: 'configuration' as const,
        items: items.value,
        configuration: draft.configuration,
        summary: configuration.summary.value,
        issues: configuration.issues.value,
        updateItem: configuration.updateItem,
        updateShipping: configuration.updateShipping,
        updateGiftOptions: configuration.updateGiftOptions,
        continueToCustomerDetails: configuration.continueToCustomerDetails,
        reviewBasket,
        removeItem: configuration.removeItem,
      }
    }

    return {
      kind: 'customer-details' as const,
      customerDetails: draft.customerDetails,
      items: items.value,
      configuration: draft.configuration,
      summary: configuration.summary.value,
      isSubmitting: submission.isSubmitting.value,
      isSubmissionBlocked: submission.isSubmissionBlocked.value,
      serverIssues: submission.serverIssues.value,
      recovery: submission.recovery.value,
      highlightedProductIds: draft.orderConflict?.affectedProductIds,
      returnToConfiguration,
      setCustomerDetails,
      submitOrder,
      reviewBasketAfterConflict,
    }
  })

  return { screen }
}
