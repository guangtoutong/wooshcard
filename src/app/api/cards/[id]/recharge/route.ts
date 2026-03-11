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

  // Create pending recharge transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      cardId: card.id,
      type: 'RECHARGE',
      amount,
      description: `Recharge card ending in ${card.lastFour}`,
      status: 'PENDING',
    },
  })

  return NextResponse.json({
    transactionId: transaction.id,
    amount,
    cardId: card.id,
  })
}
