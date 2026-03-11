import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const { status } = body

  if (!status || !['ACTIVE', 'FROZEN', 'CANCELLED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const card = await prisma.card.findUnique({ where: { id } })
  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  const updated = await prisma.card.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  })

  return NextResponse.json(updated)
}
