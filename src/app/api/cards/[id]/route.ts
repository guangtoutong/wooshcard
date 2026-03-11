import { NextResponse } from 'next/server'
import { getSessionUser, unauthorized, badRequest, notFound } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser()
  if (!user) return unauthorized()

  const card = await prisma.card.findUnique({
    where: { id: params.id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!card) return notFound('Card not found')
  if (card.userId !== user.id) return unauthorized()

  return NextResponse.json(card)
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser()
  if (!user) return unauthorized()

  const card = await prisma.card.findUnique({
    where: { id: params.id },
  })

  if (!card) return notFound('Card not found')
  if (card.userId !== user.id) return unauthorized()

  const body = await request.json()
  const { status, billingStreet, billingCity, billingState, billingZip, billingCountry } = body

  // If updating billing address
  const billingFields: Record<string, string> = {}
  if (billingStreet !== undefined) billingFields.billingStreet = billingStreet
  if (billingCity !== undefined) billingFields.billingCity = billingCity
  if (billingState !== undefined) billingFields.billingState = billingState
  if (billingZip !== undefined) billingFields.billingZip = billingZip
  if (billingCountry !== undefined) billingFields.billingCountry = billingCountry

  if (Object.keys(billingFields).length > 0) {
    const updatedCard = await prisma.card.update({
      where: { id: params.id },
      data: billingFields,
    })
    return NextResponse.json(updatedCard)
  }

  // If updating status
  if (!status || !['ACTIVE', 'FROZEN'].includes(status)) {
    return badRequest('Status must be ACTIVE or FROZEN')
  }

  if (card.status === 'CANCELLED') {
    return badRequest('Cannot update a cancelled card')
  }

  if (card.status === status) {
    return badRequest(`Card is already ${status}`)
  }

  const updatedCard = await prisma.card.update({
    where: { id: params.id },
    data: { status },
  })

  return NextResponse.json(updatedCard)
}
