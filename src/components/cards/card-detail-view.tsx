'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { VirtualCard } from '@/components/ui/virtual-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, Copy, Snowflake, Sun } from 'lucide-react'
import { RechargeDialog } from './recharge-dialog'

interface CardData {
  id: string
  network: string
  scenario: string
  cardNumber: string
  lastFour: string
  cvv: string
  expMonth: number
  expYear: number
  status: string
  balance: number
}

interface CardDetailViewProps {
  card: CardData
}

export function CardDetailView({ card: initialCard }: CardDetailViewProps) {
  const t = useTranslations('cards')
  const [card, setCard] = useState(initialCard)
  const [showNumber, setShowNumber] = useState(false)
  const [showCvv, setShowCvv] = useState(false)
  const [rechargeOpen, setRechargeOpen] = useState(false)
  const [freezeLoading, setFreezeLoading] = useState(false)

  const isFrozen = card.status === 'FROZEN'

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(t('copied'))
  }

  const handleToggleFreeze = async () => {
    setFreezeLoading(true)
    try {
      const newStatus = isFrozen ? 'ACTIVE' : 'FROZEN'
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCard((prev) => ({ ...prev, status: updated.status }))
      }
    } finally {
      setFreezeLoading(false)
    }
  }

  const maskedNumber = card.cardNumber.replace(/(.{4})/g, '$1 ').trim()
  const dotNumber = `•••• •••• •••• ${card.lastFour}`

  return (
    <div className="space-y-8">
      {/* Full-size card */}
      <div className="max-w-md mx-auto">
        <VirtualCard card={card} />
      </div>

      {/* Balance */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{t('balance')}</p>
        <p className="text-4xl font-bold text-foreground">${card.balance.toFixed(2)}</p>
      </div>

      {/* Card info */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        {/* Card number */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase">{t('cardNumber')}</p>
            <p className="font-mono text-lg">
              {showNumber ? maskedNumber : dotNumber}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNumber(!showNumber)}
            >
              {showNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(card.cardNumber)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* CVV */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase">{t('cvv')}</p>
            <p className="font-mono text-lg">
              {showCvv ? card.cvv : '•••'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCvv(!showCvv)}
          >
            {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {/* Expiry */}
        <div>
          <p className="text-xs text-muted-foreground uppercase">{t('expiryDate')}</p>
          <p className="font-mono text-lg">
            {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
          </p>
        </div>

        {/* Status */}
        <div>
          <p className="text-xs text-muted-foreground uppercase mb-1">{t('status')}</p>
          <Badge
            variant={isFrozen ? 'secondary' : 'default'}
            className={isFrozen ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}
          >
            {isFrozen ? t('frozen') : t('active')}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          className="flex-1"
          onClick={() => setRechargeOpen(true)}
          disabled={isFrozen}
        >
          {t('rechargeCard')}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleToggleFreeze}
          disabled={freezeLoading}
        >
          {isFrozen ? (
            <>
              <Sun className="h-4 w-4 mr-2" />
              {t('unfreeze')}
            </>
          ) : (
            <>
              <Snowflake className="h-4 w-4 mr-2" />
              {t('freeze')}
            </>
          )}
        </Button>
      </div>

      <RechargeDialog
        cardId={card.id}
        currentBalance={card.balance}
        open={rechargeOpen}
        onOpenChange={setRechargeOpen}
      />
    </div>
  )
}
