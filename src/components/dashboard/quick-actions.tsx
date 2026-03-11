'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Plus, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function QuickActions() {
  const t = useTranslations('dashboard')

  return (
    <div className="flex flex-col gap-3">
      <Button
        asChild
        size="lg"
        className="h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold"
      >
        <Link href="/cards/new">
          <Plus className="w-5 h-5 mr-2" />
          {t('applyCard')}
        </Link>
      </Button>
      <Button
        asChild
        size="lg"
        className="h-12 bg-amber-600 hover:bg-amber-500 text-white font-semibold"
      >
        <Link href="/recharge">
          <Wallet className="w-5 h-5 mr-2" />
          {t('recharge')}
        </Link>
      </Button>
    </div>
  )
}
