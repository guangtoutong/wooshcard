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
    return badRequest('Card must be active to spend')
  }

  const body = await request.json()
  const { amount, description } = body

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return badRequest('Amount must be a positive number')
  }

  if (!description || typeof description !== 'string') {
    return badRequest('Description is required')
  }

  if (Number(card.balance) < amount) {
    return badRequest('Insufficient balance')
  }

  // Atomically decrement balance and create transaction
  const [updatedCard, transaction] = await prisma.$transaction([
    prisma.card.update({
      where: { id: params.id },
      data: {
        balance: {
          decrement: amount,
        },
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        cardId: card.id,
        type: 'CONSUMPTION',
        amount,
        description,
        status: 'SUCCESS',
      },
    }),
  ])

  return NextResponse.json({
    transaction,
    newBalance: updatedCard.balance,
  })
}
