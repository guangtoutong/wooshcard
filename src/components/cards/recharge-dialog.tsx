'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RechargeDialogProps {
  cardId: string
  currentBalance: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RechargeDialog({
  cardId,
  currentBalance,
  open,
  onOpenChange,
}: RechargeDialogProps) {
  const t = useTranslations('cards')
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [feeInfo, setFeeInfo] = useState<{ fee: number; feeRate: number; total: number } | null>(null)

  const numAmount = parseFloat(amount || '0')

  // Calculate fee preview when amount changes (use default 3% for display)
  const previewFee = Math.round(numAmount * 0.03 * 100) / 100
  const previewTotal = Math.round((numAmount + previewFee) * 100) / 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!numAmount || numAmount < 1) return

    setLoading(true)
    try {
      // Step 1: Create recharge transaction
      const rechargeRes = await fetch(`/api/cards/${cardId}/recharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount }),
      })
      if (!rechargeRes.ok) return

      const rechargeData = await rechargeRes.json()
      const { transactionId } = rechargeData
      setFeeInfo({ fee: rechargeData.fee, feeRate: rechargeData.feeRate, total: rechargeData.total })

      // Step 2: Create payment session
      const paymentRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      })
      if (!paymentRes.ok) return

      const { checkoutUrl } = await paymentRes.json()

      // Step 3: Redirect to checkout
      router.push(checkoutUrl)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('rechargeCard')}</DialogTitle>
          <DialogDescription>
            {t('balance')}: ${currentBalance.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t('rechargeAmount')}</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">{t('minAmount')}</p>
          </div>

          {numAmount >= 1 && (
            <div className="rounded-md bg-muted/50 p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{t('rechargeAmount')}</span>
                <span>${numAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t('serviceFee')} (3%)</span>
                <span>${previewFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-1 flex justify-between font-semibold">
                <span>{t('totalPayment')}</span>
                <span>${previewTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || !amount || numAmount < 1}>
            {loading ? '...' : `Pay with WooshPay - $${previewTotal.toFixed(2)}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
