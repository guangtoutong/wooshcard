import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/wooshpay'
import { generateCardNumber } from '@/lib/card-generator'

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get('x-wooshpay-signature') || ''

  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(payload)
  const { type, data } = event
  // data.metadata.order_id = our transaction ID
  // or for mock mode, handle differently

  const orderId = data?.metadata?.order_id || data?.order_id
  if (!orderId) return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })

  const transaction = await prisma.transaction.findFirst({
    where: {
      OR: [
        { id: orderId },
        { wooshpayOrderId: orderId },
      ],
    },
  })
  if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

  if (type === 'payment.success' || type === 'payment_intent.succeeded') {
    if (transaction.type === 'CARD_OPEN') {
      // Parse card details from description
      // Description format: "Open VISA card for CHATGPT" or "Open VISA card for CHATGPT (custom: 1234)"
      const descMatch = transaction.description.match(/Open (\w+) card for (\w+)(?:\s*\(custom:\s*(\d{4})\))?/)
      if (!descMatch) {
        return NextResponse.json({ error: 'Cannot parse card details' }, { status: 500 })
      }

      const network = descMatch[1] as 'VISA' | 'MASTERCARD'
      const scenario = descMatch[2] as 'AMAZON' | 'CHATGPT' | 'CLAUDE'
      const customLastFour = descMatch[3] || undefined

      const binConfig = await prisma.cardBinConfig.findUnique({
        where: { network_scenario: { network, scenario } },
      })
      if (!binConfig) {
        return NextResponse.json({ error: 'BIN config not found' }, { status: 500 })
      }

      const cardData = generateCardNumber(binConfig.bin, customLastFour)

      await prisma.$transaction([
        prisma.card.create({
          data: {
            userId: transaction.userId,
            network,
            scenario,
            bin: binConfig.bin,
            ...cardData,
            customLastFour: !!customLastFour,
          },
        }),
        prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'SUCCESS' },
        }),
      ])
    } else if (transaction.type === 'RECHARGE') {
      if (!transaction.cardId) {
        return NextResponse.json({ error: 'No card ID for recharge' }, { status: 500 })
      }

      await prisma.$transaction([
        prisma.card.update({
          where: { id: transaction.cardId },
          data: { balance: { increment: Number(transaction.amount) } },
        }),
        prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'SUCCESS' },
        }),
      ])
    }
  } else if (type === 'payment.failed' || type === 'payment_intent.payment_failed') {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'FAILED' },
    })
  }

  return NextResponse.json({ received: true })
}
