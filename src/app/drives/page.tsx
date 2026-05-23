'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, Filter, Calendar, MapPin, Globe, Lock, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { mockDrives } from '@/lib/mock-data'
import { DriveCard } from '@/components/drives/DriveCard'
import { format, parseISO } from 'date-fns'

export default function DrivesPage() {
  const [realDrives, setRealDrives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('drives')
        .select('*, profiles(name)')
        .order('drive_date', { ascending: true })
      setRealDrives(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white mb-1">Drives</h1>
          <p className="text-gray-500 text-sm">Discover and join upcoming drives near you</p>
        </div>
        <Link href="/drives/create" className="btn-gold flex items-center gap-2 text-xs">
          <PlusCircle size={13} /> Create
        </Link>
      </div>

      {/* Real drives */}
      {!loading && realDrives.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-medium tracking-widest text-gray-500 uppercase mb-4">Upcoming drives</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {realDrives.map(drive => (
              <Link key={drive.id} href={'/drives/' + drive.id}
                className="card block overflow-hidden hover:border-gray-600 transition-colors group">
                <div className="map-placeholder h-28 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-2 right-2">
                    {drive.visibility === 'open' && <span className="pill-green flex items-center gap-1"><Globe size={9} /> Open</span>}
                    {drive.visibility === 'private' && <span className="pill-purple flex items-center gap-1"><Lock size={9} /> Private</span>}
                    {drive.visibility === 'club' && <span className="pill-blue flex items-center gap-1"><Shield size={9} /> Club</span>}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-white text-sm mb-2 group-hover:text-gold-400 transition-colors">{drive.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {drive.character && <span className="pill-gold capitalize">{drive.character}</span>}
                    {drive.states && drive.states.length > 0 && (
                      <span className="pill" style={{ background: '#1a1a1a', color: '#888' }}>{drive.states.join(' · ')}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={10} /> {drive.meeting_point ? drive.meeting_point.split(',')[0] : 'TBD'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {drive.drive_date ? format(parseISO(drive.drive_date), 'MMM d') : '—'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-32 text-gray-500">Loading drives...</div>
      )}

      {/* Sample drives */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-medium tracking-widest text-gray-500 uppercase">Sample drives</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-950/60 text-gold-400 border border-gold-400/20">Demo</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockDrives.map(drive => (
            <DriveCard key={drive.id} drive={drive} />
          ))}
        </div>
      </div>
    </div>
  )
}
