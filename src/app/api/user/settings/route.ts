import { NextResponse } from 'next/server'
import { getSessionUser, unauthorized, badRequest } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request) {
  const user = await getSessionUser()
  if (!user) return unauthorized()

  const body = await request.json()
  const { locale } = body

  if (!locale || !['en', 'zh'].includes(locale)) {
    return badRequest('Locale must be "en" or "zh"')
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { locale },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      locale: true,
    },
  })

  return NextResponse.json(updatedUser)
}
