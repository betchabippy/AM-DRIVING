'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusCircle, Calendar, MapPin, Flag, Check, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'

export default function MyDrivesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [myDrives, setMyDrives] = useState<any[]>([])
  const [rsvpdDrives, setRsvpdDrives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      // Drives I created
      const { data: created } = await supabase
        .from('drives')
        .select('*')
        .eq('organizer_id', user.id)
        .order('drive_date', { ascending: true })
      setMyDrives(created ?? [])

      // Drives I RSVPd to
      const { data: rsvps } = await supabase
        .from('rsvps')
        .select('*, drives(*)')
        .eq('user_id', user.id)
        .neq('status', 'declined')
        .order('created_at', { ascending: false })
      setRsvpdDrives(rsvps ?? [])

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white mb-1">My drives</h1>
          <p className="text-gray-500 text-sm">Drives you have created and joined</p>
        </div>
        <Link href="/drives/create" className="btn-gold flex items-center gap-2 text-xs">
          <PlusCircle size={13} /> Create
        </Link>
      </div>

      {/* Drives I created */}
      <div className="mb-10">
        <h2 className="section-label mb-4">Created by me ({myDrives.length})</h2>
        {myDrives.length === 0 ? (
          <div className="card p-8 flex flex-col items-center justify-center gap-3 border-dashed">
            <Flag size={24} className="text-gray-600" />
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 mb-1">No drives yet</div>
              <div className="text-xs text-gray-600">Create your first drive and invite others</div>
            </div>
            <Link href="/drives/create" className="btn-gold text-xs mt-2">Create a drive</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myDrives.map(drive => (
              <Link key={drive.id} href={'/drives/' + drive.id}
                className="card p-4 flex items-center gap-4 hover:border-gray-600 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white group-hover:text-gold-400 transition-colors mb-1">{drive.title}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    {drive.drive_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {format(parseISO(drive.drive_date), 'MMM d, yyyy')}
                      </span>
                    )}
                    {drive.meeting_point && (
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />
                        {drive.meeting_point.split(',')[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                    drive.visibility === 'open' ? 'bg-green-950 text-green-400' :
                    drive.visibility === 'private' ? 'bg-purple-950 text-purple-400' :
                    'bg-blue-950 text-blue-400'
                  }`}>{drive.visibility}</span>
                  <span className="text-xs text-gold-400 font-medium">Edit →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Drives I RSVPd to */}
      <div>
        <h2 className="section-label mb-4">I am attending ({rsvpdDrives.length})</h2>
        {rsvpdDrives.length === 0 ? (
          <div className="card p-8 flex flex-col items-center justify-center gap-3 border-dashed">
            <Check size={24} className="text-gray-600" />
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 mb-1">No upcoming drives</div>
              <div className="text-xs text-gray-600">Browse drives and RSVP to join</div>
            </div>
            <Link href="/drives" className="btn-outline text-xs mt-2">Browse drives</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rsvpdDrives.map(rsvp => (
              rsvp.drives && (
                <Link key={rsvp.id} href={'/drives/' + rsvp.drives.id}
                  className="card p-4 flex items-center gap-4 hover:border-gray-600 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white group-hover:text-gold-400 transition-colors mb-1">{rsvp.drives.title}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      {rsvp.drives.drive_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {format(parseISO(rsvp.drives.drive_date), 'MMM d, yyyy')}
                        </span>
                      )}
                      {rsvp.drives.meeting_point && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {rsvp.drives.meeting_point.split(',')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                    rsvp.status === 'going' ? 'bg-green-950 text-green-400' : 'bg-amber-950 text-amber-400'
                  }`}>
                    {rsvp.status === 'going' ? <Check size={10} /> : <Minus size={10} />}
                    {rsvp.status === 'going' ? 'Going' : 'Maybe'}
                  </div>
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
