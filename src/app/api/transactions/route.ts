import { NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const user = await getSessionUser()
  if (!user) return unauthorized()

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const skip = (page - 1) * limit

  const where: any = { userId: user.id }
  if (type && ['CARD_OPEN', 'CUSTOM_LAST_FOUR', 'RECHARGE', 'CONSUMPTION'].includes(type)) {
    where.type = type
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ])

  return NextResponse.json({
    transactions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}
