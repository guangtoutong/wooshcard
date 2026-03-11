'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { VirtualCard } from '@/components/ui/virtual-card'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface StepSuccessProps {
  network: 'VISA' | 'MASTERCARD'
  scenario: 'AMAZON' | 'CHATGPT' | 'CLAUDE'
  customLastFour: boolean
  customLastFourValue: string
}

export function StepSuccess({ network, scenario, customLastFour, customLastFourValue }: StepSuccessProps) {
  const t = useTranslations('cards')
  const tp = useTranslations('payment')

  const lastFour = customLastFour && customLastFourValue
    ? customLastFourValue
    : String(Math.floor(1000 + Math.random() * 9000))

  const card = {
    network,
    scenario,
    lastFour,
    expMonth: new Date().getMonth() + 1,
    expYear: new Date().getFullYear() + 3,
    status: 'ACTIVE',
    balance: 0,
  }

  return (
    <div className="space-y-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="flex justify-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <CheckCircle className="h-20 w-20 text-green-500" />
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-bold"
      >
        {t('cardCreated')}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="max-w-sm mx-auto"
      >
        <VirtualCard card={card} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex flex-col gap-3 items-center"
      >
        <Button asChild size="lg" className="min-w-[220px]">
          <Link href="/dashboard">{t('rechargeNow')}</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">{tp('returnToDashboard')}</Link>
        </Button>
      </motion.div>
    </div>
  )
}
