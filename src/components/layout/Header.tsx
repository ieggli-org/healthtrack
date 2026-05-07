'use client'

import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { UserMenu } from './UserMenu'
import { useUIStore } from '@/store/ui'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/log': 'Log',
  '/goals': 'Goals',
  '/settings': 'Settings',
}

interface HeaderProps {
  user: User
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const { toggleSidebar } = useUIStore()
  const title = pageTitles[pathname] ?? 'HealthTrack'

  return (
    <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-border bg-surface flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-2 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-muted" />
        </button>
        <h1 className="text-sm font-medium text-heading">{title}</h1>
      </div>
      <UserMenu user={user} />
    </header>
  )
}
