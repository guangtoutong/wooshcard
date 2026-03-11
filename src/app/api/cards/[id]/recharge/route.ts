import { NextResponse } from 'next/server'
import { getSessionUser, unauthorized, badRequest, notFound } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser()
  if (!user) return unauthorized()

  const card = await prisma.card.findUnique({
    where: { id: params.id },
  })

  if (!card) return notFound('Card not found')
  if (card.userId !== user.id) return unauthorized()

  if (card.status !== 'ACTIVE') {
    return badRequest('Card must be active to recharge')
  }

  const body = await request.json()
  const { amount } = body

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return badRequest('Amount must be a positive number')
  }

  // Look up BIN config for fee rate
  const binConfig = await prisma.cardBinConfig.findFirst({
    where: { network: card.network, scenario: card.scenario },
  })

  const feeRate = binConfig ? Number(binConfig.rechargeFeeRate) : 0.03
  const fee = Math.round(amount * feeRate * 100) / 100
  const total = Math.round((amount + fee) * 100) / 100

  // Create pending recharge transaction with total amount
  // Description encodes the base amount for later extraction
  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      cardId: card.id,
      type: 'RECHARGE',
      amount: total,
      description: `Recharge $${amount.toFixed(2)} to card ending in ${card.lastFour} (fee: $${fee.toFixed(2)})`,
      status: 'PENDING',
    },
  })

  return NextResponse.json({
    transactionId: transaction.id,
    amount,
    fee,
    feeRate,
    total,
    cardId: card.id,
  })
}
