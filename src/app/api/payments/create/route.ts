import { NextResponse } from 'next/server'
import { getSessionUser, unauthorized, badRequest, notFound } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { createPaymentSession } from '@/lib/wooshpay'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return unauthorized()

  const { transactionId } = await request.json()
  if (!transactionId) return badRequest('Transaction ID required')

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  })
  if (!transaction) return notFound('Transaction not found')
  if (transaction.userId !== user.id) return unauthorized()
  if (transaction.status !== 'PENDING') return badRequest('Transaction is not pending')

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const session = await createPaymentSession({
    amount: Number(transaction.amount),
    currency: 'USD',
    description: transaction.description,
    orderId: transaction.id,
    returnUrl: `${baseUrl}/payments/success`,
    cancelUrl: `${baseUrl}/payments/cancel`,
  })

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { wooshpayOrderId: session.sessionId },
  })

  return NextResponse.json({ checkoutUrl: session.checkoutUrl })
}
