'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminTransaction {
  id: string
  type: string
  amount: number
  description: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  createdAt: string
  userName: string | null
  userEmail: string | null
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  SUCCESS: 'default',
  PENDING: 'secondary',
  FAILED: 'destructive',
}

const typeLabels: Record<string, string> = {
  CARD_OPEN: 'Card Open',
  CUSTOM_LAST_FOUR: 'Custom Last 4',
  RECHARGE: 'Recharge',
  CONSUMPTION: 'Consumption',
}

export default function AdminTransactionsPage() {
  const t = useTranslations('admin')
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [type, setType] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const limit = 20

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (type) params.set('type', type)
      if (status) params.set('status', status)
      const res = await fetch(`/api/admin/transactions?${params}`)
      const data = await res.json()
      setTransactions(data.transactions || [])
      setTotal(data.total || 0)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, type, status])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('transactions')}</h1>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={type} onValueChange={(v) => { setType(v === 'ALL' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="CARD_OPEN">Card Open</SelectItem>
            <SelectItem value="CUSTOM_LAST_FOUR">Custom Last 4</SelectItem>
            <SelectItem value="RECHARGE">Recharge</SelectItem>
            <SelectItem value="CONSUMPTION">Consumption</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => { setStatus(v === 'ALL' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="SUCCESS">Success</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tx.userEmail}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[tx.type] || tx.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">${tx.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[tx.status] || 'secondary'}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {tx.description}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">{page} / {totalPages}</span>
            <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
