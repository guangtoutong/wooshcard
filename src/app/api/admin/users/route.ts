import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const skip = (page - 1) * limit

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        balance: true,
        createdAt: true,
        _count: { select: { cards: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      balance: Number(u.balance),
      cardsCount: u._count.cards,
      _count: undefined,
    })),
    total,
    page,
    limit,
  })
}
