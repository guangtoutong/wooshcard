'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ShoppingBag, MessageCircle, Brain } from 'lucide-react'

interface StepScenarioProps {
  selected: 'AMAZON' | 'CHATGPT' | 'CLAUDE' | null
  onSelect: (scenario: 'AMAZON' | 'CHATGPT' | 'CLAUDE') => void
  onNext: () => void
  onBack: () => void
}

export function StepScenario({ selected, onSelect, onNext, onBack }: StepScenarioProps) {
  const t = useTranslations('cards')
  const tc = useTranslations('common')

  const scenarios = [
    {
      id: 'AMAZON' as const,
      label: t('amazon'),
      description: 'For Amazon purchases',
      icon: ShoppingBag,
      gradient: 'from-orange-500 to-orange-700',
      borderColor: 'border-orange-500',
      hoverBorder: 'hover:border-orange-400',
    },
    {
      id: 'CHATGPT' as const,
      label: t('chatgpt'),
      description: 'For ChatGPT subscription',
      icon: MessageCircle,
      gradient: 'from-emerald-500 to-emerald-700',
      borderColor: 'border-emerald-500',
      hoverBorder: 'hover:border-emerald-400',
    },
    {
      id: 'CLAUDE' as const,
      label: t('claude'),
      description: 'For Claude subscription',
      icon: Brain,
      gradient: 'from-amber-500 to-amber-700',
      borderColor: 'border-amber-500',
      hoverBorder: 'hover:border-amber-400',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t('selectScenario')}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon
          return (
            <motion.button
              key={scenario.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(scenario.id)}
              className={`relative rounded-xl border-2 p-1 transition-all text-left ${
                selected === scenario.id
                  ? `${scenario.borderColor} ring-2 ring-offset-2 ring-offset-background ${scenario.borderColor.replace('border-', 'ring-')}`
                  : `border-muted ${scenario.hoverBorder}`
              }`}
            >
              <div
                className={`bg-gradient-to-r ${scenario.gradient} rounded-lg p-5 flex items-center gap-4`}
              >
                <Icon className="h-8 w-8 text-white shrink-0" />
                <div>
                  <span className="text-lg font-bold text-white block">
                    {scenario.label}
                  </span>
                  <span className="text-sm text-white/70">
                    {scenario.description}
                  </span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg">
          {tc('back')}
        </Button>
        <Button onClick={onNext} disabled={!selected} size="lg">
          {tc('next')}
        </Button>
      </div>
    </div>
  )
}
