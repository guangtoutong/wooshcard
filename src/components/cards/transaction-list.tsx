'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  description: string
  createdAt: string
}

interface TransactionListProps {
  transactions: Transaction[]
}

const typeLabels: Record<string, string> = {
  CARD_OPEN: 'cardOpen',
  CUSTOM_LAST_FOUR: 'customLastFour',
  RECHARGE: 'recharge',
  CONSUMPTION: 'consumption',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  SUCCESS: 'bg-green-500/20 text-green-400',
  FAILED: 'bg-red-500/20 text-red-400',
}

const statusLabels: Record<string, string> = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
}

export function TransactionList({ transactions }: TransactionListProps) {
  const t = useTranslations('transactions')

  if (transactions.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">{t('title')}: --</p>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('date')}</TableHead>
              <TableHead>{t('type')}</TableHead>
              <TableHead>{t('amount')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('description')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {t(typeLabels[tx.type] || tx.type)}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono">
                  ${Number(tx.amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[tx.status] || ''}>
                    {t(statusLabels[tx.status] || tx.status)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {tx.description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-card border border-border rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {t(typeLabels[tx.type] || tx.type)}
              </Badge>
              <Badge className={statusColors[tx.status] || ''}>
                {t(statusLabels[tx.status] || tx.status)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {new Date(tx.createdAt).toLocaleDateString()}
              </span>
              <span className="font-mono font-semibold">
                ${Number(tx.amount).toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {tx.description}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
