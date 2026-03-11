'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  Database,
  Settings,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useState } from 'react'

const adminLinks = [
  { href: '/admin', labelKey: 'dashboard' as const, icon: LayoutDashboard },
  { href: '/admin/users', labelKey: 'users' as const, icon: Users },
  { href: '/admin/cards', labelKey: 'cards' as const, icon: CreditCard },
  { href: '/admin/transactions', labelKey: 'transactions' as const, icon: Receipt },
  { href: '/admin/bin-config', labelKey: 'binConfig' as const, icon: Database },
  { href: '/admin/settings', labelKey: 'systemSettings' as const, icon: Settings },
]

function SidebarContent({ pathname, t }: { pathname: string; t: (key: string) => string }) {
  return (
    <nav className="flex flex-col space-y-1 py-4">
      {adminLinks.map((link) => {
        const isActive =
          link.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <link.icon className="h-4 w-4" />
            {t(link.labelKey)}
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const t = useTranslations('admin')
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 left-4 z-40 md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle>{t('dashboard')}</SheetTitle>
          </SheetHeader>
          <div onClick={() => setMobileOpen(false)}>
            <SidebarContent pathname={pathname} t={t} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="px-3">
          <SidebarContent pathname={pathname} t={t} />
        </div>
      </aside>
    </>
  )
}
