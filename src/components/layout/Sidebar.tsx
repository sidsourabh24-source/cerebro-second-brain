'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/chat',
    label: 'AI Chat',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/memory',
    label: 'Memory',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    ),
  },
  {
    href: '/tasks',
    label: 'Tasks',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    href: '/documents',
    label: 'Documents',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: '/voice',
    label: 'Voice',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen shrink-0"
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 overflow-hidden"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--gradient-brand)' }}>
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <path d="M16 4C10.477 4 6 8.477 6 14c0 3.09 1.39 5.86 3.6 7.74L8 26l4.5-1.5A9.96 9.96 0 0016 25c5.523 0 10-4.477 10-10S21.523 4 16 4z" fill="white" fillOpacity="0.9"/>
            <circle cx="12" cy="14" r="1.5" fill="rgba(255,255,255,0.5)"/>
            <circle cx="16" cy="14" r="1.5" fill="white"/>
            <circle cx="20" cy="14" r="1.5" fill="rgba(255,255,255,0.5)"/>
          </svg>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="text-lg font-bold tracking-widest"
              style={{ color: 'var(--text-primary)' }}
            >
              CEREBRO
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative"
              style={{
                background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              }}
              title={collapsed ? item.label : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                  style={{ background: 'var(--gradient-brand)' }}
                />
              )}
              <span className={`flex-shrink-0 transition-colors duration-200 ${isActive ? '' : 'group-hover:text-indigo-400'}`}>
                {item.icon}
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Profile + Logout */}
      <div className="px-2 pb-4 space-y-1" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
        <Link
          href="/profile"
          id="nav-profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span className="flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                Profile
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        <button
          id="btn-logout"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
          style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'transparent', border: 'none' }}
          title={collapsed ? 'Logout' : undefined}
        >
          <span className="flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        id="btn-sidebar-collapse"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          zIndex: 10,
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <motion.svg
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <polyline points="15 18 9 12 15 6" />
        </motion.svg>
      </button>
    </motion.aside>
  )
}
