import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const [
    totalUsers,
    todayUsers,
    totalCards,
    todayCards,
    totalRevenue,
    todayRevenue,
    totalTransactions,
    todayTransactions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.card.count(),
    prisma.card.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS', createdAt: { gte: todayStart } },
    }),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { createdAt: { gte: todayStart } } }),
  ])

  return NextResponse.json({
    totalUsers,
    todayUsers,
    totalCards,
    todayCards,
    totalRevenue: Number(totalRevenue._sum.amount || 0),
    todayRevenue: Number(todayRevenue._sum.amount || 0),
    totalTransactions,
    todayTransactions,
  })
}
