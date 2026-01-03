export type PaymentMethod = 'mtn' | 'vodafone' | 'airteltigo'

export interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    amount: number
    currency: string
    transaction_date: string
    status: string
    reference: string
    customer: {
      email: string
      phone: string | null
    }
    metadata: Record<string, any>
  }
}

export interface PaystackWebhookEvent {
  event: string
  data: {
    reference: string
    amount: number
    customer: {
      email: string
      phone: string | null
    }
    metadata: Record<string, any>
    status: string
    paid_at: string | null
  }
}

export interface InitializePaymentInput {
  email: string
  amount: number // in pesewas (GHS * 100)
  phone?: string
  metadata?: Record<string, any>
  callback_url?: string
}
