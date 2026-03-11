'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

function getCurrentLocale(): string {
  if (typeof document === 'undefined') return 'en'
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] || 'en'
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const t = useTranslations('settings')
  const [currentLocale, setCurrentLocale] = useState(getCurrentLocale)
  const [loading, setLoading] = useState(false)

  const user = session?.user

  const handleLanguageChange = async (locale: string) => {
    if (locale === currentLocale) return
    setLoading(true)
    try {
      // Update in DB
      await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      })

      // Set cookie
      document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`
      setCurrentLocale(locale)
      toast.success(t('saved'))

      // Reload to apply
      window.location.reload()
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">{t('title')}</h1>

      {/* Profile section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('profile')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
              <AvatarFallback>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user?.name || 'User'}</p>
              <p className="text-sm text-muted-foreground">
                {user?.email || ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('language')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={currentLocale === 'en' ? 'default' : 'outline'}
              onClick={() => handleLanguageChange('en')}
              disabled={loading}
              className="flex-1"
            >
              {t('english')}
            </Button>
            <Button
              variant={currentLocale === 'zh' ? 'default' : 'outline'}
              onClick={() => handleLanguageChange('zh')}
              disabled={loading}
              className="flex-1"
            >
              {t('chinese')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
