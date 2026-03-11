'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CreditCard } from 'lucide-react'

interface StepNetworkProps {
  selected: 'VISA' | 'MASTERCARD' | null
  onSelect: (network: 'VISA' | 'MASTERCARD') => void
  onNext: () => void
}

export function StepNetwork({ selected, onSelect, onNext }: StepNetworkProps) {
  const t = useTranslations('cards')
  const tc = useTranslations('common')

  const networks = [
    {
      id: 'VISA' as const,
      label: t('visa'),
      gradient: 'from-blue-600 to-blue-900',
      borderColor: 'border-blue-500',
      hoverBorder: 'hover:border-blue-400',
    },
    {
      id: 'MASTERCARD' as const,
      label: t('mastercard'),
      gradient: 'from-red-500 to-orange-600',
      borderColor: 'border-orange-500',
      hoverBorder: 'hover:border-orange-400',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t('selectNetwork')}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {networks.map((network) => (
          <motion.button
            key={network.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(network.id)}
            className={`relative rounded-xl border-2 p-6 transition-all ${
              selected === network.id
                ? `${network.borderColor} ring-2 ring-offset-2 ring-offset-background ${network.borderColor.replace('border-', 'ring-')}`
                : `border-muted ${network.hoverBorder}`
            }`}
          >
            <div
              className={`bg-gradient-to-br ${network.gradient} rounded-lg p-8 flex flex-col items-center justify-center gap-3`}
            >
              <CreditCard className="h-10 w-10 text-white" />
              <span className="text-2xl font-bold text-white tracking-wider">
                {network.label}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!selected} size="lg">
          {tc('next')}
        </Button>
      </div>
    </div>
  )
}
