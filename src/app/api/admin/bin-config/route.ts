import { requireAdmin } from '@/lib/admin-guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const configs = await prisma.cardBinConfig.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    configs: configs.map((c) => ({
      ...c,
      openFee: Number(c.openFee),
      customLastFourFee: Number(c.customLastFourFee),
    })),
  })
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await request.json()
  const { network, scenario, bin, openFee, customLastFourFee, description } = body

  if (!network || !scenario || !bin) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!['VISA', 'MASTERCARD'].includes(network)) {
    return NextResponse.json({ error: 'Invalid network' }, { status: 400 })
  }

  if (!['AMAZON', 'CHATGPT', 'CLAUDE'].includes(scenario)) {
    return NextResponse.json({ error: 'Invalid scenario' }, { status: 400 })
  }

  if (!/^\d{6}$/.test(bin)) {
    return NextResponse.json({ error: 'BIN must be 6 digits' }, { status: 400 })
  }

  const existing = await prisma.cardBinConfig.findUnique({
    where: { network_scenario: { network, scenario } },
  })

  if (existing) {
    return NextResponse.json({ error: 'Config for this network/scenario already exists' }, { status: 409 })
  }

  const config = await prisma.cardBinConfig.create({
    data: {
      network,
      scenario,
      bin,
      openFee: openFee ?? 5,
      customLastFourFee: customLastFourFee ?? 10,
      description: description || '',
    },
  })

  return NextResponse.json({
    ...config,
    openFee: Number(config.openFee),
    customLastFourFee: Number(config.customLastFourFee),
  }, { status: 201 })
}
