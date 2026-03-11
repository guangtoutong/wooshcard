import { getTranslations } from 'next-intl/server'
import { CardDetailView } from '@/components/cards/card-detail-view'
import { TransactionList } from '@/components/cards/transaction-list'

// Mock data for MVP
const mockCards: Record<string, any> = {
  '1': {
    id: '1',
    network: 'VISA',
    scenario: 'CHATGPT',
    cardNumber: '4242424242424242',
    lastFour: '4242',
    cvv: '123',
    expMonth: 12,
    expYear: 2028,
    status: 'ACTIVE',
    balance: 50.0,
  },
  '2': {
    id: '2',
    network: 'MASTERCARD',
    scenario: 'AMAZON',
    cardNumber: '5555555555558888',
    lastFour: '8888',
    cvv: '456',
    expMonth: 6,
    expYear: 2027,
    status: 'ACTIVE',
    balance: 75.0,
  },
  '3': {
    id: '3',
    network: 'VISA',
    scenario: 'CLAUDE',
    cardNumber: '4111111111111234',
    lastFour: '1234',
    cvv: '789',
    expMonth: 3,
    expYear: 2029,
    status: 'FROZEN',
    balance: 25.0,
  },
}

const mockTransactions = [
  {
    id: 'tx1',
    type: 'CARD_OPEN',
    amount: 5,
    status: 'SUCCESS',
    description: 'Card issuance fee',
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'tx2',
    type: 'RECHARGE',
    amount: 50,
    status: 'SUCCESS',
    description: 'Recharge card ending in 4242',
    createdAt: '2025-12-05T14:30:00Z',
  },
  {
    id: 'tx3',
    type: 'CONSUMPTION',
    amount: 20,
    status: 'SUCCESS',
    description: 'ChatGPT Plus subscription',
    createdAt: '2025-12-10T09:15:00Z',
  },
  {
    id: 'tx4',
    type: 'RECHARGE',
    amount: 30,
    status: 'PENDING',
    description: 'Recharge card ending in 4242',
    createdAt: '2026-01-02T11:00:00Z',
  },
]

export default async function CardDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const t = await getTranslations('cards')
  const card = mockCards[params.id]

  if (!card) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
        <p className="text-muted-foreground">Card not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">{t('cardDetail')}</h1>

      <CardDetailView card={card} />

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-white mb-4">
          {t('rechargeCard')}
        </h2>
        <TransactionList transactions={mockTransactions} />
      </div>
    </div>
  )
}
