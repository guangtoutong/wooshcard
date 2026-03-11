'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { TransactionList } from '@/components/cards/transaction-list'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Mock data for MVP
const mockTransactions = [
  {
    id: 'tx1',
    type: 'CARD_OPEN',
    amount: 5,
    status: 'SUCCESS',
    description: 'Open VISA card for CHATGPT',
    createdAt: '2025-11-20T10:00:00Z',
  },
  {
    id: 'tx2',
    type: 'CUSTOM_LAST_FOUR',
    amount: 10,
    status: 'SUCCESS',
    description: 'Custom last four: 4242',
    createdAt: '2025-11-20T10:00:00Z',
  },
  {
    id: 'tx3',
    type: 'RECHARGE',
    amount: 50,
    status: 'SUCCESS',
    description: 'Recharge card ending in 4242',
    createdAt: '2025-12-05T14:30:00Z',
  },
  {
    id: 'tx4',
    type: 'CONSUMPTION',
    amount: 20,
    status: 'SUCCESS',
    description: 'ChatGPT Plus subscription',
    createdAt: '2025-12-10T09:15:00Z',
  },
  {
    id: 'tx5',
    type: 'RECHARGE',
    amount: 100,
    status: 'SUCCESS',
    description: 'Recharge card ending in 8888',
    createdAt: '2025-12-15T16:00:00Z',
  },
  {
    id: 'tx6',
    type: 'CONSUMPTION',
    amount: 49.99,
    status: 'SUCCESS',
    description: 'Amazon Prime subscription',
    createdAt: '2025-12-20T08:00:00Z',
  },
  {
    id: 'tx7',
    type: 'RECHARGE',
    amount: 30,
    status: 'PENDING',
    description: 'Recharge card ending in 1234',
    createdAt: '2026-01-02T11:00:00Z',
  },
  {
    id: 'tx8',
    type: 'CONSUMPTION',
    amount: 20,
    status: 'FAILED',
    description: 'Claude Pro subscription',
    createdAt: '2026-01-05T12:00:00Z',
  },
]

const filterTypes: Record<string, string | null> = {
  all: null,
  CARD_OPEN: 'CARD_OPEN',
  RECHARGE: 'RECHARGE',
  CONSUMPTION: 'CONSUMPTION',
}

export default function TransactionsPage() {
  const t = useTranslations('transactions')
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 5

  const filtered = activeTab === 'all'
    ? mockTransactions
    : mockTransactions.filter((tx) => tx.type === activeTab)

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setPage(1)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">{t('title')}</h1>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">{t('all')}</TabsTrigger>
          <TabsTrigger value="CARD_OPEN">{t('cardOpen')}</TabsTrigger>
          <TabsTrigger value="RECHARGE">{t('recharge')}</TabsTrigger>
          <TabsTrigger value="CONSUMPTION">{t('consumption')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <TransactionList transactions={paginated} />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
