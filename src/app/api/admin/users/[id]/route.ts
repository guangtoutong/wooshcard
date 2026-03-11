import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const { role } = body

  if (!role || !['USER', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  if (user!.id === id && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json(updated)
}
