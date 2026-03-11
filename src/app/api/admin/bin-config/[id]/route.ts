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

  const config = await prisma.cardBinConfig.findUnique({ where: { id } })
  if (!config) {
    return NextResponse.json({ error: 'Config not found' }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  if (body.network !== undefined) data.network = body.network
  if (body.scenario !== undefined) data.scenario = body.scenario
  if (body.bin !== undefined) {
    if (!/^\d{6}$/.test(body.bin)) {
      return NextResponse.json({ error: 'BIN must be 6 digits' }, { status: 400 })
    }
    data.bin = body.bin
  }
  if (body.openFee !== undefined) data.openFee = body.openFee
  if (body.customLastFourFee !== undefined) data.customLastFourFee = body.customLastFourFee
  if (body.description !== undefined) data.description = body.description
  if (body.isActive !== undefined) data.isActive = body.isActive

  const updated = await prisma.cardBinConfig.update({ where: { id }, data })

  return NextResponse.json({
    ...updated,
    openFee: Number(updated.openFee),
    customLastFourFee: Number(updated.customLastFourFee),
  })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const config = await prisma.cardBinConfig.findUnique({ where: { id } })
  if (!config) {
    return NextResponse.json({ error: 'Config not found' }, { status: 404 })
  }

  await prisma.cardBinConfig.update({
    where: { id },
    data: { isActive: false },
  })

  return NextResponse.json({ success: true })
}
