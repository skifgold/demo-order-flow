import { zodResolver } from '@primevue/forms/resolvers/zod'

import { CustomerDetailsSchema, type CustomerDetails } from '../../domain/order-configuration'
import type { FormIssue } from '../form/use-form-issues'
import type { OrderFieldError } from '../../api/post-order.contract'

import {
  CustomerDetailsFormField,
  type CustomerDetailsFormFieldName,
} from './customer-details-form-fields'

const serverFieldToFormField: Readonly<Record<string, CustomerDetailsFormFieldName>> = {
  'customer.fullName': CustomerDetailsFormField.fullName,
  'customer.email': CustomerDetailsFormField.email,
  'customer.phone': CustomerDetailsFormField.phone,
  'deliveryAddress.addressLine1': CustomerDetailsFormField.addressLine1,
  'deliveryAddress.city': CustomerDetailsFormField.city,
  'deliveryAddress.postcode': CustomerDetailsFormField.postcode,
  termsAccepted: CustomerDetailsFormField.termsAccepted,
}

export const customerDetailsResolver = zodResolver(CustomerDetailsSchema)

export function toCustomerDetails(values: Record<string, unknown>): CustomerDetails {
  return {
    fullName: typeof values.fullName === 'string' ? values.fullName : '',
    email: typeof values.email === 'string' ? values.email : '',
    phone: typeof values.phone === 'string' ? values.phone : '',
    addressLine1: typeof values.addressLine1 === 'string' ? values.addressLine1 : '',
    city: typeof values.city === 'string' ? values.city : '',
    postcode: typeof values.postcode === 'string' ? values.postcode : '',
    termsAccepted: values.termsAccepted === true,
  }
}

export function mapServerFieldErrors(errors: readonly OrderFieldError[]): {
  issues: FormIssue[]
  hasUnknownField: boolean
} {
  const issues: FormIssue[] = []
  let hasUnknownField = false

  for (const error of errors) {
    const field = serverFieldToFormField[error.field]

    if (field === undefined) {
      hasUnknownField = true
      continue
    }

    issues.push({ field, message: error.message })
  }

  return { issues, hasUnknownField }
}
