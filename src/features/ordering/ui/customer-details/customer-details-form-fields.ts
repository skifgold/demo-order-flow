import type { CustomerDetails } from '../../domain/order-configuration'
import { createFormFieldIds } from '../form/use-form-issues'

export const CustomerDetailsFormField = {
  fullName: 'fullName',
  email: 'email',
  phone: 'phone',
  addressLine1: 'addressLine1',
  city: 'city',
  postcode: 'postcode',
  termsAccepted: 'termsAccepted',
} as const satisfies Record<keyof CustomerDetails, keyof CustomerDetails>

export type CustomerDetailsFormFieldName =
  (typeof CustomerDetailsFormField)[keyof typeof CustomerDetailsFormField]

const customerDetailsFieldIds = createFormFieldIds('customer-details')

export function customerDetailsFieldId(field: CustomerDetailsFormFieldName): string {
  return customerDetailsFieldIds.fieldId(field)
}

export function customerDetailsFieldErrorId(field: CustomerDetailsFormFieldName): string {
  return customerDetailsFieldIds.errorId(field)
}
