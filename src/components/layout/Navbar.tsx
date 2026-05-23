'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Compass, Car, Users, PlusCircle, Gauge, LogOut Flag } from 'lucide-react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const links = [
  { href: '/',           label: 'Discover',  icon: Compass },
  { href: '/drives',     label: 'Drives',    icon: Gauge },
  { href: '/my-drives',  label: 'My drives', icon: Flag },
  { href: '/clubs',      label: 'Clubs',     icon: Users },
  { href: '/garage',     label: 'Garage',    icon: Car },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [initials, setInitials] = useState('?')
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        const name = user.user_metadata?.name || user.email || ''
        const parts = name.split(' ')
        setInitials(parts.length >= 2
          ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
          : name.slice(0, 2).toUpperCase()
        )
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        const name = session.user.user_metadata?.name || session.user.email || ''
        const parts = name.split(' ')
        setInitials(parts.length >= 2
          ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
          : name.slice(0, 2).toUpperCase()
        )
      } else {
        setUser(null)
        setInitials('?')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-base border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#C9A84C' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="5" stroke="#0a0a0a" strokeWidth="1.5"/>
              <path d="M4 8 L8 5 L12 8" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="font-display text-lg tracking-[0.2em] text-white leading-none">RALLY</div>
            <div className="text-[9px] tracking-[0.15em] leading-none mt-0.5" style={{ color: '#C9A84C' }}>ROAD ENTHUSIAST</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={clsx('flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors',
                  active ? 'text-white bg-surface-raised' : 'text-gray-500 hover:text-white hover:bg-surface-raised'
                )}>
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/drives/create" className="hidden sm:flex items-center gap-2 btn-gold text-xs">
                <PlusCircle size={14} /> Create drive
              </Link>
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all hover:ring-2 hover:ring-gold-400"
                  style={{ background: '#1e1a0e', color: '#C9A84C', border: '1.5px solid #C9A84C' }}>
                  {initials}
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-10 w-48 bg-surface-raised border border-surface-border rounded-xl overflow-hidden shadow-xl z-50">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-surface-hover transition-colors" onClick={() => setShowMenu(false)}>
                      Profile & settings
                    </Link>
                    <Link href="/garage" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-surface-hover transition-colors" onClick={() => setShowMenu(false)}>
                      My garage
                    </Link>
                    <div className="border-t border-surface-border" />
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-surface-hover transition-colors">
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-outline text-xs">Sign in</Link>
              <Link href="/signup" className="btn-gold text-xs">Join Rally</Link>
            </div>
          )}
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-base border-t border-surface-border z-50 flex">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={clsx('flex-1 flex flex-col items-center gap-1 py-3 text-[10px] transition-colors', active ? 'text-gold-400' : 'text-gray-600')}>
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
        <Link href="/drives/create" className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] text-gray-600">
          <PlusCircle size={18} />
          Create
        </Link>
      </nav>
    </header>
  )
}
