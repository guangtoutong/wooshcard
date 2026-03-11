'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BinConfig } from './step-preview'

interface StepCustomLastFourProps {
  binConfig: BinConfig
  customLastFour: boolean
  customLastFourValue: string
  onToggle: (enabled: boolean) => void
  onValueChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export function StepCustomLastFour({
  binConfig,
  customLastFour,
  customLastFourValue,
  onToggle,
  onValueChange,
  onNext,
  onBack,
}: StepCustomLastFourProps) {
  const t = useTranslations('cards')
  const tc = useTranslations('common')

  const total = binConfig.openFee + (customLastFour ? binConfig.customLastFourFee : 0)
  const isValid = !customLastFour || /^\d{4}$/.test(customLastFourValue)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t('customLastFour')}</h2>
        <p className="text-muted-foreground mt-1">{t('customLastFourDesc')}</p>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="custom-toggle" className="text-base cursor-pointer">
            {t('customLastFour')} (+${binConfig.customLastFourFee.toFixed(2)})
          </Label>
          <button
            id="custom-toggle"
            role="switch"
            aria-checked={customLastFour}
            onClick={() => onToggle(!customLastFour)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              customLastFour ? 'bg-primary' : 'bg-input'
            }`}
          >
            <span
              className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                customLastFour ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {customLastFour && (
          <div className="space-y-2">
            <Label htmlFor="last-four-input">{t('enterLastFour')}</Label>
            <Input
              id="last-four-input"
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="0000"
              value={customLastFourValue}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                onValueChange(val)
              }}
              className="font-mono text-center text-2xl tracking-[0.5em] max-w-[200px]"
            />
            {customLastFourValue.length > 0 && customLastFourValue.length < 4 && (
              <p className="text-sm text-destructive">Must be exactly 4 digits</p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('openFee')}</span>
          <span>${binConfig.openFee.toFixed(2)}</span>
        </div>
        {customLastFour && (
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">{t('customLastFour')}</span>
            <span>${binConfig.customLastFourFee.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t my-2" />
        <div className="flex justify-between font-semibold">
          <span>{t('totalFee')}</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg">
          {tc('back')}
        </Button>
        <Button onClick={onNext} disabled={!isValid} size="lg">
          {tc('next')}
        </Button>
      </div>
    </div>
  )
}
