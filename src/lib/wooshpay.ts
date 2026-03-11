import crypto from 'crypto'

const WOOSHPAY_API_URL = process.env.WOOSHPAY_API_URL || 'https://api.wooshpay.com'
const WOOSHPAY_API_KEY = process.env.WOOSHPAY_API_KEY || ''
const WOOSHPAY_WEBHOOK_SECRET = process.env.WOOSHPAY_WEBHOOK_SECRET || ''

interface CreatePaymentParams {
  amount: number // in dollars
  currency: string
  description: string
  orderId: string // our transaction ID
  returnUrl: string
  cancelUrl: string
}

interface PaymentSession {
  checkoutUrl: string
  sessionId: string
}

export async function createPaymentSession(params: CreatePaymentParams): Promise<PaymentSession> {
  // For MVP/development: return a mock checkout URL
  // In production, this would call WooshPay API:
  // POST /v1/payment-sessions
  // Headers: Authorization: Bearer {WOOSHPAY_API_KEY}

  if (!WOOSHPAY_API_KEY) {
    // Mock mode: return a URL that simulates success
    const mockSessionId = `mock_${Date.now()}_${params.orderId}`
    return {
      checkoutUrl: `${params.returnUrl}?session_id=${mockSessionId}&order_id=${params.orderId}`,
      sessionId: mockSessionId,
    }
  }

  // Real WooshPay API call
  const response = await fetch(`${WOOSHPAY_API_URL}/v1/payment-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${WOOSHPAY_API_KEY}`,
    },
    body: JSON.stringify({
      amount: Math.round(params.amount * 100), // WooshPay expects cents
      currency: params.currency,
      description: params.description,
      metadata: {
        order_id: params.orderId,
      },
      success_url: params.returnUrl,
      cancel_url: params.cancelUrl,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`WooshPay API error: ${response.status} ${error}`)
  }

  const data = await response.json()
  return {
    checkoutUrl: data.checkout_url || data.url,
    sessionId: data.id,
  }
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!WOOSHPAY_WEBHOOK_SECRET) return true // Mock mode: accept all

  // In production: verify HMAC-SHA256 signature
  const expectedSignature = crypto
    .createHmac('sha256', WOOSHPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  return signature === expectedSignature
}
