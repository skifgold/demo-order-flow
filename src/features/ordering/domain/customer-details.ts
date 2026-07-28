import { z } from 'zod'

import type { CustomerDetails } from './order-configuration.types'

export type { CustomerDetails }

export const CustomerDetailsSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter your full name.'),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z.string(),
  addressLine1: z.string().trim().min(1, 'Enter your delivery address.'),
  city: z.string().trim().min(1, 'Enter your city.'),
  postcode: z.string().trim().min(1, 'Enter your postcode.'),
  termsAccepted: z.literal(true, 'Accept the terms to place your order.'),
})

export function createEmptyCustomerDetails(): CustomerDetails {
  return {
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    postcode: '',
    termsAccepted: false,
  }
}
