'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { BinConfig } from './step-preview'

interface StepPaymentProps {
  network: 'VISA' | 'MASTERCARD'
  scenario: 'AMAZON' | 'CHATGPT' | 'CLAUDE'
  binConfig: BinConfig
  customLastFour: boolean
  customLastFourValue: string
  onNext: () => void
  onBack: () => void
}

export function StepPayment({
  network,
  scenario,
  binConfig,
  customLastFour,
  customLastFourValue,
  onNext,
  onBack,
}: StepPaymentProps) {
  const t = useTranslations('cards')
  const tc = useTranslations('common')

  const total = binConfig.openFee + (customLastFour ? binConfig.customLastFourFee : 0)

  function handlePay() {
    toast.info('Payment integration coming soon')
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t('payNow')}</h2>
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Network</span>
          <span className="font-medium">{t(network.toLowerCase() as 'visa' | 'mastercard')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Scenario</span>
          <span className="font-medium">{t(scenario.toLowerCase() as 'amazon' | 'chatgpt' | 'claude')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Card Segment</span>
          <span className="font-mono font-medium">{binConfig.bin}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('customLastFour')}</span>
          <span className="font-medium">
            {customLastFour ? `Yes (${customLastFourValue})` : 'No'}
          </span>
        </div>

        <div className="border-t my-2" />

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('openFee')}</span>
          <span>${binConfig.openFee.toFixed(2)}</span>
        </div>
        {customLastFour && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('customLastFour')}</span>
            <span>${binConfig.customLastFourFee.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t my-2" />
        <div className="flex justify-between text-lg font-bold">
          <span>{t('totalFee')}</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg">
          {tc('back')}
        </Button>
        <Button onClick={handlePay} size="lg" className="min-w-[180px]">
          Pay with WooshPay
        </Button>
      </div>
    </div>
  )
}
