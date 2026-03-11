'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Menu, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/auth/user-menu'
import { LoginButton } from '@/components/auth/login-button'
import { MobileNav } from './mobile-nav'
import { useState, useTransition } from 'react'

export function Header() {
  const { data: session } = useSession()
  const t = useTranslations('common')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const toggleLocale = () => {
    startTransition(() => {
      const current = document.cookie
        .split('; ')
        .find((row) => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1] || 'en'
      const next = current === 'en' ? 'zh' : 'en'
      document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`
      window.location.reload()
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-1">
          <span className="text-xl font-bold text-primary">Woosh</span>
          <span className="text-xl font-bold text-secondary">Card</span>
        </Link>

        {/* Desktop nav */}
        {session && (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('dashboard')}
            </Link>
            <Link
              href="/cards"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('myCards')}
            </Link>
            <Link
              href="/transactions"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('transactions')}
            </Link>
          </nav>
        )}

        {/* Right side */}
        <div className="ml-auto flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLocale}
            disabled={isPending}
            title={t('language')}
          >
            <Globe className="h-4 w-4" />
          </Button>

          {session ? <UserMenu /> : <LoginButton />}
        </div>
      </div>

      {/* Mobile nav sheet */}
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  )
}
