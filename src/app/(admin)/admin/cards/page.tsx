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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminCard {
  id: string
  cardNumber: string
  lastFour: string
  network: string
  scenario: string
  status: 'ACTIVE' | 'FROZEN' | 'CANCELLED'
  balance: number
  createdAt: string
  userName: string | null
  userEmail: string | null
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  FROZEN: 'secondary',
  CANCELLED: 'destructive',
}

export default function AdminCardsPage() {
  const t = useTranslations('admin')
  const [cards, setCards] = useState<AdminCard[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [network, setNetwork] = useState<string>('')
  const [scenario, setScenario] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const limit = 20

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (network) params.set('network', network)
      if (scenario) params.set('scenario', scenario)
      if (status) params.set('status', status)
      const res = await fetch(`/api/admin/cards?${params}`)
      const data = await res.json()
      setCards(data.cards || [])
      setTotal(data.total || 0)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, network, scenario, status])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const updateCardStatus = async (cardId: string, newStatus: string) => {
    await fetch(`/api/admin/cards/${cardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchCards()
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('cards')}</h1>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={network} onValueChange={(v) => { setNetwork(v === 'ALL' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('network')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Networks</SelectItem>
            <SelectItem value="VISA">Visa</SelectItem>
            <SelectItem value="MASTERCARD">Mastercard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={scenario} onValueChange={(v) => { setScenario(v === 'ALL' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('scenario')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Scenarios</SelectItem>
            <SelectItem value="AMAZON">Amazon</SelectItem>
            <SelectItem value="CHATGPT">ChatGPT</SelectItem>
            <SelectItem value="CLAUDE">Claude</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => { setStatus(v === 'ALL' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="FROZEN">Frozen</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Card Number</TableHead>
              <TableHead>{t('network')}</TableHead>
              <TableHead>{t('scenario')}</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : cards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No cards found
                </TableCell>
              </TableRow>
            ) : (
              cards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-mono text-sm">{card.cardNumber}</TableCell>
                  <TableCell>{card.network}</TableCell>
                  <TableCell>{card.scenario}</TableCell>
                  <TableCell className="text-muted-foreground">{card.userEmail}</TableCell>
                  <TableCell>${card.balance.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[card.status] || 'secondary'}>
                      {card.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(card.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {card.status === 'ACTIVE' && (
                          <DropdownMenuItem onClick={() => updateCardStatus(card.id, 'FROZEN')}>
                            Freeze
                          </DropdownMenuItem>
                        )}
                        {card.status === 'FROZEN' && (
                          <DropdownMenuItem onClick={() => updateCardStatus(card.id, 'ACTIVE')}>
                            Unfreeze
                          </DropdownMenuItem>
                        )}
                        {card.status !== 'CANCELLED' && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => updateCardStatus(card.id, 'CANCELLED')}
                          >
                            Cancel
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
