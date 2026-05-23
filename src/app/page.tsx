'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, TrendingUp, Leaf, Mountain, ArrowRight } from 'lucide-react'
import { DriveCard } from '@/components/drives/DriveCard'
import { mockDrives, mockRoutes } from '@/lib/mock-data'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [firstName, setFirstName] = useState('there')
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const name = user.user_metadata?.name || ''
        setFirstName(name.split(' ')[0] || 'there')
        const { data: userCars } = await supabase
          .from('cars').select('*').eq('user_id', user.id)
          .order('is_primary', { ascending: false })
        setCars(userCars ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">

      <div className="mb-10">
        <p className="text-gray-500 text-sm mb-1">{greeting}</p>
        <h1 className="font-display text-4xl md:text-5xl text-white mb-1">{firstName}</h1>
        <p className="text-gray-500 text-sm">Welcome to Rally — your road enthusiast community</p>
      </div>

      {!loading && cars.length === 0 && (
        <div className="card p-6 mb-10" style={{ background: 'linear-gradient(135deg, #1e1a0e 0%, #111 100%)', borderColor: '#C9A84C40' }}>
          <h2 className="font-display text-2xl text-white mb-2">Get started</h2>
          <p className="text-gray-500 text-sm mb-5">Add your car to your garage to join drives and connect with other enthusiasts.</p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/garage" className="btn-gold flex items-center gap-2 text-xs">
              <PlusCircle size={13} /> Add your car
            </Link>
            <Link href="/clubs" className="btn-outline flex items-center gap-2 text-xs">
              Browse clubs
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium tracking-widest text-gray-500 uppercase">Sample drives</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-950/60 text-gold-400 border border-gold-400/20">Demo</span>
            </div>
            <Link href="/drives/create" className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-200 transition-colors">
              Create a drive <ArrowRight size={12} />
            </Link>
          </div>
          <p className="text-xs text-gray-600 mb-4">These are sample drives to show how Rally works. Create your own to get started.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {mockDrives.map(drive => (
              <DriveCard key={drive.id} drive={drive} />
            ))}
            <Link href="/drives/create"
              className="border border-dashed border-surface-border rounded-card p-6 flex flex-col items-center justify-center gap-3 text-center hover:border-gold-400 hover:bg-surface-raised transition-all group">
              <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center group-hover:bg-surface-border transition-colors">
                <PlusCircle size={20} className="text-gray-600 group-hover:text-gold-400 transition-colors" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 group-hover:text-white transition-colors">Create your first drive</div>
                <div className="text-xs text-gray-600 mt-0.5">Invite friends and hit the road</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium tracking-widest text-gray-500 uppercase">Popular routes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { route: mockRoutes[0], icon: TrendingUp, iconColor: '#C9A84C', tag: 'Spirited' },
              { route: mockRoutes[2], icon: Leaf, iconColor: '#4CAF70', tag: 'Scenic' },
              { route: mockRoutes[1], icon: Mountain, iconColor: '#5B9CF6', tag: 'Twisty' },
            ].map(({ route, icon: Icon, iconColor, tag }) => (
              <Link key={route.id} href="/drives/create" className="card p-4 hover:border-gray-600 transition-colors group">
                <Icon size={20} className="mb-3" style={{ color: iconColor }} />
                <div className="text-sm font-medium text-white mb-0.5 group-hover:text-gold-400 transition-colors">{route.name}</div>
                <div className="text-xs text-gray-600">{route.states.join(', ')} · {route.miles} mi · {tag}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium tracking-widest text-gray-500 uppercase">My garage</h2>
              <Link href="/garage" className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-200 transition-colors">
                {cars.length > 0 ? 'View all' : 'Add car'} <ArrowRight size={12} />
              </Link>
            </div>
            {cars.length > 0 ? (
              <div className="space-y-2">
                {cars.map((car: any) => (
                  <div key={car.id} className="card p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex-shrink-0" style={{ background: car.color_hex || '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white">{car.year} {car.make} {car.model}</div>
                      <div className="text-xs text-gray-600">{car.color}</div>
                    </div>
                    {car.is_primary && <span className="ml-auto text-xs text-gold-400 font-medium">Primary</span>}
                  </div>
                ))}
              </div>
            ) : (
              <Link href="/garage" className="card p-5 flex flex-col items-center justify-center gap-3 border-dashed hover:border-gold-400 transition-all group">
                <PlusCircle size={20} className="text-gray-600 group-hover:text-gold-400 transition-colors" />
                <div className="text-sm text-gray-500 group-hover:text-white transition-colors text-center">Add your first car</div>
              </Link>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium tracking-widest text-gray-500 uppercase">Clubs</h2>
              <Link href="/clubs" className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-200 transition-colors">
                Browse <ArrowRight size={12} />
              </Link>
            </div>
            <Link href="/clubs" className="card p-4 flex items-center gap-3 hover:border-gray-600 transition-colors group">
              <div className="text-sm text-gray-500 group-hover:text-white transition-colors">Browse AMOC, PCA, Grenadier and more</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
