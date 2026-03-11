import { NextResponse } from 'next/server'
import { getSessionUser, unauthorized, badRequest } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return unauthorized()

  const cards = await prisma.card.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(cards)
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return unauthorized()

  const body = await request.json()
  const { network, scenario, customLastFour } = body

  // Validate
  if (!['VISA', 'MASTERCARD'].includes(network)) return badRequest('Invalid network')
  if (!['AMAZON', 'CHATGPT', 'CLAUDE'].includes(scenario)) return badRequest('Invalid scenario')
  if (customLastFour && !/^\d{4}$/.test(customLastFour)) return badRequest('Invalid last four digits')

  // Find BIN config
  const binConfig = await prisma.cardBinConfig.findUnique({
    where: { network_scenario: { network, scenario } },
  })
  if (!binConfig || !binConfig.isActive) return badRequest('Card configuration not available')

  const totalFee = Number(binConfig.openFee) + (customLastFour ? Number(binConfig.customLastFourFee) : 0)

  // Create pending transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: 'CARD_OPEN',
      amount: totalFee,
      description: `Open ${network} card for ${scenario}${customLastFour ? ` (custom: ${customLastFour})` : ''}`,
      status: 'PENDING',
    },
  })

  return NextResponse.json({
    transactionId: transaction.id,
    totalFee,
    binConfig: {
      id: binConfig.id,
      network: binConfig.network,
      scenario: binConfig.scenario,
      bin: binConfig.bin,
    },
  })
}
