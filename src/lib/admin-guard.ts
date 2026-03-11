import { getSessionUser, unauthorized } from '@/lib/api-utils'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const user = await getSessionUser()
  if (!user) return { error: unauthorized(), user: null }
  if (user.role !== 'ADMIN') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), user: null }
  return { error: null, user }
}
