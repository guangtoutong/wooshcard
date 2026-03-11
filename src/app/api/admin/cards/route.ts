import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = request.nextUrl
  const network = searchParams.get('network') || undefined
  const scenario = searchParams.get('scenario') || undefined
  const status = searchParams.get('status') || undefined
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (network) where.network = network
  if (scenario) where.scenario = scenario
  if (status) where.status = status

  const [cards, total] = await Promise.all([
    prisma.card.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.card.count({ where }),
  ])

  return NextResponse.json({
    cards: cards.map((c) => ({
      id: c.id,
      cardNumber: c.cardNumber.slice(0, 4) + ' **** **** ' + c.lastFour,
      lastFour: c.lastFour,
      network: c.network,
      scenario: c.scenario,
      status: c.status,
      balance: Number(c.balance),
      createdAt: c.createdAt,
      userName: c.user.name,
      userEmail: c.user.email,
    })),
    total,
    page,
    limit,
  })
}
