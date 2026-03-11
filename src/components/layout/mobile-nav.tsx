'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LayoutDashboard, CreditCard, Receipt, Settings } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const t = useTranslations('common')

  const links = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/cards', label: t('myCards'), icon: CreditCard },
    { href: '/transactions', label: t('transactions'), icon: Receipt },
    { href: '/settings', label: t('settings'), icon: Settings },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-1">
            <span className="text-primary">Woosh</span>
            <span className="text-secondary">Card</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
