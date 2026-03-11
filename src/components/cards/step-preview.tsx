'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { VirtualCard } from '@/components/ui/virtual-card'

export type BinConfig = {
  id: string
  network: string
  scenario: string
  bin: string
  openFee: number
  customLastFourFee: number
  description: string
}

const MOCK_BIN_CONFIGS: Record<string, BinConfig> = {
  'VISA_AMAZON': { id: '1', network: 'VISA', scenario: 'AMAZON', bin: '431940', openFee: 5, customLastFourFee: 10, description: 'Visa for Amazon' },
  'VISA_CHATGPT': { id: '2', network: 'VISA', scenario: 'CHATGPT', bin: '433210', openFee: 5, customLastFourFee: 10, description: 'Visa for ChatGPT' },
  'VISA_CLAUDE': { id: '3', network: 'VISA', scenario: 'CLAUDE', bin: '435760', openFee: 5, customLastFourFee: 10, description: 'Visa for Claude' },
  'MASTERCARD_AMAZON': { id: '4', network: 'MASTERCARD', scenario: 'AMAZON', bin: '559666', openFee: 5, customLastFourFee: 10, description: 'Mastercard for Amazon' },
  'MASTERCARD_CHATGPT': { id: '5', network: 'MASTERCARD', scenario: 'CHATGPT', bin: '552830', openFee: 5, customLastFourFee: 10, description: 'Mastercard for ChatGPT' },
  'MASTERCARD_CLAUDE': { id: '6', network: 'MASTERCARD', scenario: 'CLAUDE', bin: '556120', openFee: 5, customLastFourFee: 10, description: 'Mastercard for Claude' },
}

export function getBinConfig(network: string, scenario: string): BinConfig | null {
  const key = `${network}_${scenario}`
  return MOCK_BIN_CONFIGS[key] || null
}

interface StepPreviewProps {
  network: 'VISA' | 'MASTERCARD'
  scenario: 'AMAZON' | 'CHATGPT' | 'CLAUDE'
  binConfig: BinConfig | null
  onBinConfigResolved: (config: BinConfig) => void
  onNext: () => void
  onBack: () => void
}

export function StepPreview({ network, scenario, binConfig, onBinConfigResolved, onNext, onBack }: StepPreviewProps) {
  const t = useTranslations('cards')
  const tc = useTranslations('common')

  const config = binConfig || getBinConfig(network, scenario)

  // Resolve the bin config on first render if not already set
  if (!binConfig && config) {
    onBinConfigResolved(config)
  }

  const previewCard = {
    network,
    scenario,
    lastFour: '0000',
    expMonth: 12,
    expYear: 2027,
    status: 'ACTIVE',
    balance: 0,
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t('preview')}</h2>
      </div>

      <div className="max-w-sm mx-auto">
        <VirtualCard card={previewCard} />
      </div>

      {config && (
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network</span>
            <span className="font-medium">{t(network.toLowerCase() as 'visa' | 'mastercard')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Scenario</span>
            <span className="font-medium">{t(scenario.toLowerCase() as 'amazon' | 'chatgpt' | 'claude')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Card Segment (BIN)</span>
            <span className="font-mono font-medium">{config.bin}</span>
          </div>
          <div className="border-t my-2" />
          <div className="flex justify-between text-sm font-semibold">
            <span>{t('openFee')}</span>
            <span>${config.openFee.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg">
          {tc('back')}
        </Button>
        <Button onClick={onNext} disabled={!config} size="lg">
          {tc('next')}
        </Button>
      </div>
    </div>
  )
}
