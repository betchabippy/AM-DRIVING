'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, Star, Flag, Navigation } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function RouteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [route, setRoute] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data } = await supabase.from('routes').select('*').eq('id', id).maybeSingle()
      setRoute(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
  if (!route) return <div className="flex items-center justify-center h-64 text-gray-500">Route not found</div>

  const waypoints = route.waypoints ?? []
  const turns = route.turns ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/routes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={15} /> Back to routes
        </Link>
        {route.is_curated && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-950/60 text-gold-400 border border-gold-400/20">Curated</span>
        )}
      </div>

      {/* Hero */}
      <div className="map-placeholder h-48 rounded-card mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-base/80 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h1 className="font-display text-3xl text-white">{route.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
            <span className="flex items-center gap-1"><MapPin size={12} /> {route.miles} mi</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {Math.round(route.duration_mins / 60 * 10) / 10}h</span>
            {route.rating > 0 && <span className="flex items-center gap-1"><Star size={12} className="text-gold-400" /> {route.rating}</span>}
          </div>
        </div>
      </div>

      {/* Description */}
      {route.description && (
        <div className="card p-5 mb-6">
          <p className="text-sm text-gray-300 leading-relaxed">{route.description}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Distance', value: route.miles + ' mi' },
          { label: 'Duration', value: Math.round(route.duration_mins / 60 * 10) / 10 + 'h' },
          { label: 'Drives', value: route.drive_count || 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface-raised border border-surface-border rounded-xl p-4 text-center">
            <div className="font-mono text-lg font-medium text-gold-400">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Character tags */}
      {route.character && route.character.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {route.character.map((c: string) => (
            <span key={c} className="pill-gold capitalize">{c}</span>
          ))}
          {(route.states ?? []).map((s: string) => (
            <span key={s} className="pill" style={{ background: '#1a1a1a', color: '#888' }}>{s}</span>
          ))}
        </div>
      )}

      {/* Waypoints */}
      {waypoints.length > 0 && (
        <div className="mb-6">
          <h2 className="section-label mb-3">Waypoints</h2>
          <div className="card divide-y divide-surface-border">
            {waypoints.map((wp: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                  i === 0 ? 'bg-green-900 text-green-400' :
                  i === waypoints.length - 1 ? 'bg-amber-900 text-gold-400' :
                  'bg-surface border border-surface-border text-gray-500'
                }`}>
                  {i === 0 ? '▶' : i === waypoints.length - 1 ? '⚑' : i}
                </div>
                <div>
                  <div className="text-sm text-white">{wp.name}</div>
                  {i === 0 && <div className="text-xs text-green-400 mt-0.5">Start</div>}
                  {i === waypoints.length - 1 && <div className="text-xs text-gold-400 mt-0.5">End</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Turn by turn if available */}
      {turns.length > 0 && (
        <div className="mb-6">
          <h2 className="section-label mb-3">Turn by turn</h2>
          <div className="card divide-y divide-surface-border">
            {turns.map((turn: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <div className="w-12 text-right flex-shrink-0">
                  <div className="text-xs font-mono text-gold-400">{turn.miles} mi</div>
                </div>
                <div className="text-sm text-gray-300">{turn.instruction}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={'/drives/create?route=' + route.id}
          className="flex-1 btn-gold flex items-center justify-center gap-2">
          <Flag size={15} /> Use for a drive
        </Link>
        <Link href={'/routes/' + route.id + '/navigate'}
          className="flex-1 btn-outline flex items-center justify-center gap-2">
          <Navigation size={15} /> Follow route
        </Link>
      </div>
    </div>
  )
}
