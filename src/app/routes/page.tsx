'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, TrendingUp, Clock, Star, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const STATE_FILTERS = ['All', 'NY', 'CT', 'VT', 'MA', 'NH', 'PA', 'NJ']

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    async function load() {
      const query = supabase.from('routes').select('*').order('rating', { ascending: false })
      if (filter !== 'All') query.contains('states', [filter])
      const { data } = await query
      setRoutes(data ?? [])
      setLoading(false)
    }
    load()
  }, [filter])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white mb-1">Routes</h1>
          <p className="text-gray-500 text-sm">Curated scenic drives and community favourites</p>
        </div>
        <Link href="/routes/create" className="btn-gold flex items-center gap-2 text-xs">
          <Plus size={13} /> Plan a route
        </Link>
      </div>

      {/* State filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATE_FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
              filter === s ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border text-gray-500 hover:border-gray-500'
            }`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-500">Loading routes...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map(route => (
            <Link key={route.id} href={'/routes/' + route.id}
              className="card overflow-hidden hover:border-gray-600 transition-colors group">
              {/* Mini map placeholder */}
              <div className="h-32 map-placeholder relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                  {(route.states ?? []).map((s: string) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-gray-300">{s}</span>
                  ))}
                  {route.is_curated && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-gold-400 font-medium">Curated</span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-medium text-white mb-1 group-hover:text-gold-400 transition-colors">{route.name}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{route.description}</p>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin size={10} /> {route.miles} mi
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {Math.round(route.duration_mins / 60 * 10) / 10}h
                  </span>
                  {route.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star size={10} className="text-gold-400" /> {route.rating}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {(route.character ?? []).map((c: string) => (
                    <span key={c} className="pill-gold capitalize">{c}</span>
                  ))}
                  {route.drive_count > 0 && (
                    <span className="pill" style={{ background: '#1a1a1a', color: '#888' }}>{route.drive_count} drives</span>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {/* Add route card */}
          <Link href="/routes/create"
            className="border border-dashed border-surface-border rounded-card p-6 flex flex-col items-center justify-center gap-3 hover:border-gold-400 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center group-hover:bg-surface-border transition-colors">
              <Plus size={20} className="text-gray-600 group-hover:text-gold-400 transition-colors" />
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 group-hover:text-white transition-colors">Plan a route</div>
              <div className="text-xs text-gray-600 mt-0.5">Create and share your favourite roads</div>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
