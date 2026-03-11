'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { CreditCard, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VirtualCard } from '@/components/ui/virtual-card'

interface CardData {
  id: string
  network: string
  scenario: string
  lastFour: string
  expMonth: number
  expYear: number
  status: string
  balance: number
}

interface CardListProps {
  cards: CardData[]
}

export function CardList({ cards }: CardListProps) {
  const t = useTranslations('dashboard')

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 mb-4">
          <CreditCard className="w-8 h-8 text-zinc-500" />
        </div>
        <p className="text-lg text-zinc-400 mb-6">{t('noCards')}</p>
        <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white">
          <Link href="/cards/new">
            <Plus className="w-4 h-4 mr-2" />
            {t('getFirstCard')}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <Link key={card.id} href={`/cards/${card.id}`}>
          <VirtualCard card={card} />
        </Link>
      ))}
    </div>
  )
}
