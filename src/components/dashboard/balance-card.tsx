'use client'

import { useTranslations } from 'next-intl'
import { Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface BalanceCardProps {
  balance: number
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const t = useTranslations('dashboard')

  return (
    <Card className="bg-zinc-900/80 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-sm text-zinc-400">{t('walletBalance')}</span>
        </div>
        <div className="text-4xl font-bold text-white tracking-tight">
          ${balance.toFixed(2)}
        </div>
      </CardContent>
    </Card>
  )
}
