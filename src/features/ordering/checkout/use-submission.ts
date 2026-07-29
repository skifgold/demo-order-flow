import { computed, ref, type ComputedRef } from 'vue'

import type { BasketItem } from '@/features/basket'
import type { Product } from '@/features/catalogue'
import { isRequestCancellation } from '@/shared/errors/is-request-cancellation'
import { NetworkError } from '@/shared/errors/network-error'
import { OrderConflictError } from '@/shared/errors/order-conflict-error'
import { OrderValidationError } from '@/shared/errors/order-validation-error'
import { reportUnexpectedError } from '@/shared/observability/report-unexpected-error'
import { unexpectedErrorContext } from '@/shared/observability/should-report-error'

import type { AcceptedOrder } from '../api/post-order.contract'
import { useSubmitOrder } from '../queries/use-submit-order'
import {
  createOrderPayload,
  type CustomerDetails,
  type OrderConfiguration,
} from '../domain/order-configuration'
import { mapServerFieldErrors } from '../ui/customer-details/customer-details-form'
import type { SubmissionRecovery } from '../ui/customer-details/submission-recovery'
import type { FormIssue } from '../ui/form/use-form-issues'

export function useCheckoutSubmission({
  products,
  basketItems,
  configuration,
  onSuccess,
  onConflict,
}: {
  products: ComputedRef<readonly Product[]>
  basketItems: ComputedRef<readonly BasketItem[]>
  configuration: ComputedRef<OrderConfiguration>
  onSuccess: () => void
  onConflict: (affectedProductIds: readonly string[]) => Promise<void>
}) {
  const submitOrder = useSubmitOrder()
  const confirmation = ref<AcceptedOrder>()
  const serverIssues = ref<readonly FormIssue[]>([])
  const recovery = ref<SubmissionRecovery>()
  const isSubmitting = computed(() => submitOrder.isPending.value)
  const isSubmissionBlocked = computed(() => recovery.value?.kind === 'conflict')

  async function submit(customerDetails: CustomerDetails): Promise<void> {
    if (isSubmitting.value || isSubmissionBlocked.value) {
      return
    }

    serverIssues.value = []
    recovery.value = undefined

    const payload = createOrderPayload({
      products: products.value,
      basketItems: basketItems.value,
      configuration: configuration.value,
      customerDetails,
    })

    try {
      confirmation.value = await submitOrder.mutateAsync(payload)
      onSuccess()
    } catch (error) {
      serverIssues.value = []

      if (error instanceof OrderValidationError) {
        const mapped = mapServerFieldErrors(error.issues)
        serverIssues.value = mapped.issues
        if (mapped.hasUnknownField) {
          reportUnexpectedError({ operation: 'order-submission', errorType: error.type })
          recovery.value = { kind: 'validation' }
        }
        return
      }

      if (error instanceof OrderConflictError) {
        await onConflict(error.affectedProductIds)
        recovery.value = { kind: 'conflict' }
        return
      }

      if (isRequestCancellation(error)) {
        return
      }

      const context = unexpectedErrorContext(error, 'order-submission')

      if (context !== undefined) {
        reportUnexpectedError(context)
      }

      recovery.value = error instanceof NetworkError ? { kind: 'network' } : { kind: 'system' }
    }
  }

  function clearConfirmation(): void {
    confirmation.value = undefined
  }

  return {
    clearConfirmation,
    confirmation,
    isSubmitting,
    isSubmissionBlocked,
    serverIssues,
    recovery,
    submit,
  }
}
