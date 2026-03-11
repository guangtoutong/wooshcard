'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BinConfig {
  id: string
  network: string
  scenario: string
  bin: string
  openFee: number
  customLastFourFee: number
  description: string
  isActive: boolean
}

interface BinConfigFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config?: BinConfig | null
  onSaved: () => void
}

export function BinConfigForm({ open, onOpenChange, config, onSaved }: BinConfigFormProps) {
  const t = useTranslations('admin')
  const [network, setNetwork] = useState(config?.network || '')
  const [scenario, setScenario] = useState(config?.scenario || '')
  const [bin, setBin] = useState(config?.bin || '')
  const [openFee, setOpenFee] = useState(String(config?.openFee ?? '5'))
  const [customLastFourFee, setCustomLastFourFee] = useState(String(config?.customLastFourFee ?? '10'))
  const [description, setDescription] = useState(config?.description || '')
  const [isActive, setIsActive] = useState(config?.isActive ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!config

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const body = {
        network,
        scenario,
        bin,
        openFee: parseFloat(openFee),
        customLastFourFee: parseFloat(customLastFourFee),
        description,
        isActive,
      }

      const url = isEdit ? `/api/admin/bin-config/${config.id}` : '/api/admin/bin-config'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        return
      }

      onSaved()
      onOpenChange(false)
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('editConfig') : t('addConfig')}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update BIN configuration fields.' : 'Create a new BIN configuration.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="space-y-2">
            <Label>{t('network')}</Label>
            <Select value={network} onValueChange={setNetwork}>
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VISA">Visa</SelectItem>
                <SelectItem value="MASTERCARD">Mastercard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('scenario')}</Label>
            <Select value={scenario} onValueChange={setScenario}>
              <SelectTrigger>
                <SelectValue placeholder="Select scenario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AMAZON">Amazon</SelectItem>
                <SelectItem value="CHATGPT">ChatGPT</SelectItem>
                <SelectItem value="CLAUDE">Claude</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('bin')}</Label>
            <Input
              value={bin}
              onChange={(e) => setBin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6 digits"
              maxLength={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('openFee')}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={openFee}
                onChange={(e) => setOpenFee(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('customFee')}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={customLastFourFee}
                onChange={(e) => setCustomLastFourFee(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          {isEdit && (
            <div className="flex items-center gap-3">
              <Label>Active</Label>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  isActive ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
