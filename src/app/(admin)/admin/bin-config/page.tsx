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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BinConfigForm } from '@/components/admin/bin-config-form'
import { Plus, MoreHorizontal } from 'lucide-react'

interface BinConfig {
  id: string
  network: string
  scenario: string
  bin: string
  openFee: number
  customLastFourFee: number
  description: string
  isActive: boolean
  createdAt: string
}

export default function AdminBinConfigPage() {
  const t = useTranslations('admin')
  const [configs, setConfigs] = useState<BinConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editConfig, setEditConfig] = useState<BinConfig | null>(null)

  const fetchConfigs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/bin-config')
      const data = await res.json()
      setConfigs(data.configs || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  const toggleActive = async (config: BinConfig) => {
    await fetch(`/api/admin/bin-config/${config.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !config.isActive }),
    })
    fetchConfigs()
  }

  const openEdit = (config: BinConfig) => {
    setEditConfig(config)
    setFormOpen(true)
  }

  const openCreate = () => {
    setEditConfig(null)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('binConfig')}</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addConfig')}
        </Button>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('network')}</TableHead>
              <TableHead>{t('scenario')}</TableHead>
              <TableHead>{t('bin')}</TableHead>
              <TableHead>{t('openFee')}</TableHead>
              <TableHead>{t('customFee')}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No configurations found
                </TableCell>
              </TableRow>
            ) : (
              configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>{config.network}</TableCell>
                  <TableCell>{config.scenario}</TableCell>
                  <TableCell className="font-mono">{config.bin}</TableCell>
                  <TableCell>${config.openFee.toFixed(2)}</TableCell>
                  <TableCell>${config.customLastFourFee.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={config.isActive ? 'default' : 'secondary'}>
                      {config.isActive ? t('active') : t('inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(config)}>
                          {t('editConfig')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleActive(config)}>
                          {config.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BinConfigForm
        open={formOpen}
        onOpenChange={setFormOpen}
        config={editConfig}
        onSaved={fetchConfigs}
      />
    </div>
  )
}
