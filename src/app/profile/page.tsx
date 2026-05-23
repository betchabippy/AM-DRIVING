'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car, Users, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data: userCars } = await supabase.from('cars').select('*').eq('user_id', user.id)
      setCars(userCars ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>

  const name = user?.user_metadata?.name || user?.email || 'My Profile'
  const initials = name.split(' ').length >= 2
    ? `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <h1 className="font-display text-4xl text-white mb-8">Profile</h1>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium"
            style={{ background: '#1e1a0e', border: '2px solid #C9A84C', color: '#C9A84C' }}>
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-medium text-white">{name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Cars', value: cars.length },
            { label: 'Drives', value: 0 },
            { label: 'Miles', value: 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface rounded-lg p-3 text-center">
              <div className="font-mono text-xl font-medium text-gold-400">{value}</div>
              <div className="text-xs text-gray-600 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Link href="/garage" className="card p-4 flex items-center gap-3 hover:border-gray-600 transition-colors group">
          <Car size={18} className="text-gray-500 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-white group-hover:text-gold-400 transition-colors">My garage</div>
            <div className="text-xs text-gray-600">{cars.length} {cars.length === 1 ? 'car' : 'cars'}</div>
          </div>
        </Link>
        <Link href="/clubs" className="card p-4 flex items-center gap-3 hover:border-gray-600 transition-colors group">
          <Users size={18} className="text-gray-500 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-white group-hover:text-gold-400 transition-colors">Browse clubs</div>
            <div className="text-xs text-gray-600">AMOC, PCA, Grenadier and more</div>
          </div>
        </Link>
        <button onClick={handleSignOut} className="w-full card p-4 flex items-center gap-3 hover:border-red-900 transition-colors text-left">
          <LogOut size={18} className="text-red-500 flex-shrink-0" />
          <div className="text-sm font-medium text-red-400">Sign out</div>
        </button>
      </div>
    </div>
  )
}
