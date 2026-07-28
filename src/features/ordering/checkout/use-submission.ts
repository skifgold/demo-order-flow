import { computed, ref, type ComputedRef } from 'vue'

import type { BasketLine } from '@/features/basket'
import type { Product } from '@/features/catalogue/api/product.contract'

import type { AcceptedOrder } from '../api/post-order.contract'
import { useSubmitOrder } from '../queries/use-submit-order'
import {
  createOrderPayload,
  type CustomerDetails,
  type OrderConfiguration,
} from '../domain/order-configuration'
import { mapServerFieldErrors } from '../ui/customer-details/customer-details-form'
import type { FormIssue } from '../ui/form/use-form-issues'

export function useCheckoutSubmission({
  products,
  basketLines,
  configuration,
  onSuccess,
}: {
  products: ComputedRef<readonly Product[]>
  basketLines: ComputedRef<readonly BasketLine[]>
  configuration: ComputedRef<OrderConfiguration>
  onSuccess: () => void
}) {
  const submitOrder = useSubmitOrder()
  const confirmation = ref<AcceptedOrder>()
  const serverIssues = ref<readonly FormIssue[]>([])
  const submissionMessage = ref<string>()
  const isSubmitting = computed(() => submitOrder.isPending.value)

  async function submit(customerDetails: CustomerDetails): Promise<void> {
    if (isSubmitting.value) {
      return
    }

    serverIssues.value = []
    submissionMessage.value = undefined

    const payload = createOrderPayload({
      products: products.value,
      basketLines: basketLines.value,
      configuration: configuration.value,
      customerDetails,
    })

    try {
      const result = await submitOrder.mutateAsync(payload)

      switch (result.kind) {
        case 'accepted':
          confirmation.value = result.order
          onSuccess()
          return
        case 'validation': {
          const mapped = mapServerFieldErrors(result.errors)
          serverIssues.value = mapped.issues
          submissionMessage.value = mapped.hasUnknownField
            ? 'We could not apply one or more order checks. Review your details and try again.'
            : undefined
          return
        }
        case 'conflict':
          submissionMessage.value =
            'This order needs review because availability or pricing may have changed.'
          return
      }
    } catch {
      serverIssues.value = []
      submissionMessage.value =
        'We could not place your order. Your details are still here, so please try again.'
    }
  }

  function clearConfirmation(): void {
    confirmation.value = undefined
  }

  return {
    clearConfirmation,
    confirmation,
    isSubmitting,
    serverIssues,
    submissionMessage,
    submit,
  }
}
