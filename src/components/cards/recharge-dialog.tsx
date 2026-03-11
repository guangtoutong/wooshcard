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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
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

      const { transactionId } = await rechargeRes.json()

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

          <Button type="submit" className="w-full" disabled={loading || !amount || parseFloat(amount) < 1}>
            {loading ? '...' : `Pay with WooshPay - $${parseFloat(amount || '0').toFixed(2)}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
