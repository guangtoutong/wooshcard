'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function PaymentCancelPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
        <p className="text-zinc-400 mb-8">
          Your payment was cancelled. No charges have been made. You can try again or return to the dashboard.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/cards/new"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
