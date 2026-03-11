import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCardNumber } from '@/lib/card-generator'

// Only works when WOOSHPAY_API_KEY is not set (mock mode)
// Simulates a successful payment webhook
export async function POST(request: Request) {
  if (process.env.WOOSHPAY_API_KEY) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const { transactionId } = await request.json()
  if (!transactionId) {
    return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  })
  if (!transaction) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }
  if (transaction.status !== 'PENDING') {
    return NextResponse.json({ error: 'Transaction is not pending' }, { status: 400 })
  }

  if (transaction.type === 'CARD_OPEN') {
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
          billingStreet: binConfig.defaultBillingStreet,
          billingCity: binConfig.defaultBillingCity,
          billingState: binConfig.defaultBillingState,
          billingZip: binConfig.defaultBillingZip,
          billingCountry: binConfig.defaultBillingCountry,
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

    // Parse base amount from description (fee is included in transaction.amount)
    const rechargeMatch = transaction.description.match(/Recharge \$([0-9.]+)/)
    const baseAmount = rechargeMatch ? parseFloat(rechargeMatch[1]) : Number(transaction.amount)

    await prisma.$transaction([
      prisma.card.update({
        where: { id: transaction.cardId },
        data: { balance: { increment: baseAmount } },
      }),
      prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'SUCCESS' },
      }),
    ])
  }

  return NextResponse.json({ success: true })
}
