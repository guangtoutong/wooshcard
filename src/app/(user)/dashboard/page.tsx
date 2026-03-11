import { getTranslations } from 'next-intl/server'
import { BalanceCard } from '@/components/dashboard/balance-card'
import { CardList } from '@/components/dashboard/card-list'
import { QuickActions } from '@/components/dashboard/quick-actions'

// Mock data for now
const mockUser = {
  balance: 150.0,
}

const mockCards = [
  {
    id: '1',
    network: 'VISA',
    scenario: 'CHATGPT',
    lastFour: '4242',
    expMonth: 12,
    expYear: 2028,
    status: 'ACTIVE',
    balance: 50.0,
  },
  {
    id: '2',
    network: 'MASTERCARD',
    scenario: 'AMAZON',
    lastFour: '8888',
    expMonth: 6,
    expYear: 2027,
    status: 'ACTIVE',
    balance: 75.0,
  },
  {
    id: '3',
    network: 'VISA',
    scenario: 'CLAUDE',
    lastFour: '1234',
    expMonth: 3,
    expYear: 2029,
    status: 'FROZEN',
    balance: 25.0,
  },
]

export default async function DashboardPage() {
  const t = await getTranslations('dashboard')

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Top section: Balance + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 mb-10">
        <BalanceCard balance={mockUser.balance} />
        <QuickActions />
      </div>

      {/* Cards section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">{t('myCards')}</h2>
        <CardList cards={mockCards} />
      </div>
    </div>
  )
}
