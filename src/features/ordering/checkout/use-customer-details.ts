import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { Router } from 'vue-router'

import type { useBasketStore } from '@/features/basket'
import type { Product } from '@/features/catalogue'

import type { OrderConfiguration, CustomerDetails } from '../domain/order-configuration'
import { useOrderDraftStore } from '../draft/order-draft.store'

import { useCheckoutSubmission } from './use-submission'

export function useCheckoutCustomerDetails({
  router,
  basket,
  products,
  configuration,
  draft,
  onConflict,
}: {
  router: Router
  basket: ReturnType<typeof useBasketStore>
  products: ComputedRef<readonly Product[]>
  configuration: ComputedRef<OrderConfiguration>
  draft: ReturnType<typeof useOrderDraftStore>
  onConflict: (affectedProductIds: readonly string[]) => Promise<void>
}) {
  const submission = useCheckoutSubmission({
    products,
    basketLines: computed(() => basket.lines),
    configuration,
    onSuccess: () => {
      basket.clear()
      draft.completeDraft()
    },
    onConflict,
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

  return {
    confirmation: submission.confirmation,
    continueShopping,
    isSubmitting: submission.isSubmitting,
    isSubmissionBlocked: submission.isSubmissionBlocked,
    recovery: submission.recovery,
    returnToConfiguration,
    serverIssues: submission.serverIssues,
    setCustomerDetails,
    submitOrder,
  }
}
