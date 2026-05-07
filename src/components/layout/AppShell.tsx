'use client'

import type { User } from '@supabase/supabase-js'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useUIStore } from '@/store/ui'
import { Sheet, SheetContent } from '@/components/ui/sheet'

interface AppShellProps {
  children: React.ReactNode
  user: User
}

export function AppShell({ children, user }: AppShellProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col border-r border-border bg-surface">
        <Sidebar />
      </aside>

      {/* Mobile sidebar (Sheet drawer) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-56 p-0 bg-surface border-border">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
