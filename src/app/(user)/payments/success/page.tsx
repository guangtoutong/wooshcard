'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const orderId = searchParams.get('order_id')
    const sessionId = searchParams.get('session_id')

    if (!orderId) {
      // No order_id means we came from a real WooshPay redirect (non-mock)
      // The webhook will handle the transaction update
      setStatus('success')
      return
    }

    // Mock mode: call mock-complete to simulate webhook
    async function completeMockPayment() {
      try {
        const response = await fetch('/api/payments/mock-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: orderId }),
        })

        if (response.ok) {
          setStatus('success')
        } else {
          const data = await response.json()
          setErrorMessage(data.error || 'Payment completion failed')
          setStatus('error')
        }
      } catch {
        setErrorMessage('Failed to complete payment')
        setStatus('error')
      }
    }

    completeMockPayment()
  }, [searchParams])

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Processing Payment...</h1>
            <p className="text-zinc-400">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-zinc-400 mb-8">
              Your payment has been processed successfully. Your card will be ready shortly.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Return to Dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-3xl font-bold">!</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
            <p className="text-zinc-400 mb-8">{errorMessage}</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
