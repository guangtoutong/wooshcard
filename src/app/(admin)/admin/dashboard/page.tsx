'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { StatCard } from '@/components/admin/stat-card'
import { Users, UserPlus, CreditCard, CreditCardIcon, DollarSign, TrendingUp } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  todayUsers: number
  totalCards: number
  todayCards: number
  totalRevenue: number
  todayRevenue: number
  totalTransactions: number
  todayTransactions: number
}

export default function AdminDashboardPage() {
  const t = useTranslations('admin')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title={t('totalUsers')}
          value={stats?.totalUsers ?? 0}
          icon={Users}
        />
        <StatCard
          title={t('todayUsers')}
          value={stats?.todayUsers ?? 0}
          icon={UserPlus}
        />
        <StatCard
          title={t('totalCards')}
          value={stats?.totalCards ?? 0}
          icon={CreditCard}
        />
        <StatCard
          title={t('todayCards')}
          value={stats?.todayCards ?? 0}
          icon={CreditCardIcon}
        />
        <StatCard
          title={t('totalRevenue')}
          value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`}
          icon={DollarSign}
        />
        <StatCard
          title={t('todayRevenue')}
          value={`$${(stats?.todayRevenue ?? 0).toFixed(2)}`}
          icon={TrendingUp}
        />
      </div>
    </div>
  )
}
