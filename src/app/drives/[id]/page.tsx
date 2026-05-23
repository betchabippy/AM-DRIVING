'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Flag, Users, Check, Minus, X, Globe, Lock, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'

export default function DriveDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [drive, setDrive] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [userCars, setUserCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCar, setSelectedCar] = useState('')
  const [note, setNote] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState<string>('pending')
  const [showRsvp, setShowRsvp] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: cars } = await supabase.from('cars').select('*').eq('user_id', user.id)
        setUserCars(cars ?? [])
        if (cars && cars.length > 0) setSelectedCar(cars[0].id)
        const { data: rsvp } = await supabase.from('rsvps')
          .select('*').eq('drive_id', id).eq('user_id', user.id).maybeSingle()
        if (rsvp) setRsvpStatus(rsvp.status)
      }
      const { data: driveData } = await supabase
        .from('drives')
        .select('*, profiles(name)')
        .eq('id', id)
        .maybeSingle()
      setDrive(driveData)
      setLoading(false)
    }
    load()
  }, [id])

  const handleRsvp = async (status: string) => {
    if (!user) return
    setSaving(true)
    await supabase.from('rsvps').upsert({
      drive_id: id,
      user_id: user.id,
      car_id: selectedCar || null,
      status,
      note: note || null,
    })
    setRsvpStatus(status)
    setShowRsvp(false)
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
  if (!drive) return <div className="flex items-center justify-center h-64 text-gray-500">Drive not found</div>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-32 md:pb-8">
      <Link href="/drives" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={15} /> Back to drives
      </Link>

      <div className="map-placeholder h-40 rounded-card mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-base/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            {drive.visibility === 'private' && <Lock size={12} className="text-gray-400" />}
            {drive.visibility === 'open' && <Globe size={12} className="text-gray-400" />}
            {drive.visibility === 'club' && <Shield size={12} className="text-gray-400" />}
          </div>
          <h1 className="font-display text-3xl text-white">{drive.title}</h1>
          {drive.profiles?.name && <p className="text-sm text-gray-400 mt-1">Organized by {drive.profiles.name}</p>}
        </div>
      </div>

      <div className="card divide-y divide-surface-border mb-6">
        <div className="flex items-start gap-3 p-4">
          <Calendar size={16} className="text-gold-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Date and time</div>
            <div className="text-sm text-white">
              {drive.drive_date ? format(parseISO(drive.drive_date), 'EEEE, MMMM d, yyyy') : '—'} · {drive.depart_time || '—'}
            </div>
          </div>
        </div>
        {drive.meeting_point && (
          <div className="flex items-start gap-3 p-4">
            <MapPin size={16} className="text-gold-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Meeting point</div>
              <div className="text-sm text-white">{drive.meeting_point}</div>
            </div>
          </div>
        )}
        {drive.destination && (
          <div className="flex items-start gap-3 p-4">
            <Flag size={16} className="text-gold-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Destination</div>
              <div className="text-sm text-white">{drive.destination}</div>
            </div>
          </div>
        )}
        {drive.states && drive.states.length > 0 && (
          <div className="flex items-start gap-3 p-4">
            <MapPin size={16} className="text-gold-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Area</div>
              <div className="text-sm text-white">{drive.states.join(', ')}</div>
            </div>
          </div>
        )}
        {drive.max_spots && (
          <div className="flex items-start gap-3 p-4">
            <Users size={16} className="text-gold-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Max spots</div>
              <div className="text-sm text-white">{drive.max_spots}</div>
            </div>
          </div>
        )}
      </div>

      {drive.description && (
        <div className="card p-4 mb-6">
          <p className="text-sm text-gray-400 leading-relaxed">{drive.description}</p>
        </div>
      )}

      {showRsvp && (
        <div className="card p-5 mb-4 animate-slide-up">
          <h3 className="font-medium text-white mb-4">RSVP to this drive</h3>
          {userCars.length > 0 && (
            <>
              <p className="section-label mb-2">Which car are you bringing?</p>
              <div className="space-y-2 mb-4">
                {userCars.map(car => (
                  <button key={car.id} onClick={() => setSelectedCar(car.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedCar === car.id ? 'border-gold-400 bg-amber-950/30' : 'border-surface-border bg-surface-raised'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 ${selectedCar === car.id ? 'bg-gold-400 border-gold-400' : 'border-gray-600'}`} />
                    <div>
                      <div className="text-sm font-medium text-white">{car.year} {car.make} {car.model}</div>
                      <div className="text-xs text-gray-600">{car.color}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
          <p className="section-label mb-2">Add a note (optional)</p>
          <input type="text" placeholder="Can't wait! Running a few mins late..."
            value={note} onChange={e => setNote(e.target.value)} className="input-dark mb-4" />
          <div className="flex gap-2">
            <button onClick={() => handleRsvp('going')} disabled={saving}
              className="flex-1 btn-gold flex items-center justify-center gap-2">
              <Check size={14} /> Going
            </button>
            <button onClick={() => handleRsvp('maybe')} disabled={saving}
              className="flex-1 btn-outline flex items-center justify-center gap-2">
              <Minus size={14} /> Maybe
            </button>
            <button onClick={() => setShowRsvp(false)} className="btn-outline px-4">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {!showRsvp && (
        <div className="flex gap-2">
          {rsvpStatus === 'going' ? (
            <div className="flex-1 flex items-center justify-center gap-2 bg-green-900/30 border border-green-800 rounded-xl py-3 text-sm text-green-400 font-medium">
              <Check size={15} /> You are going
            </div>
          ) : rsvpStatus === 'maybe' ? (
            <div className="flex-1 flex items-center justify-center gap-2 bg-amber-900/30 border border-amber-800 rounded-xl py-3 text-sm text-amber-400 font-medium">
              <Minus size={15} /> Maybe going
            </div>
          ) : (
            <button onClick={() => setShowRsvp(true)} className="flex-1 btn-gold">
              RSVP — I am going
            </button>
          )}
          {rsvpStatus === 'pending' && (
            <button onClick={() => handleRsvp('maybe')} className="btn-outline">Maybe</button>
          )}
        </div>
      )}

      {drive.visibility === 'open' && rsvpStatus === 'pending' && (
        <p className="text-xs text-gray-600 text-center mt-3">
          This is an open drive — any member can join.
        </p>
      )}
    </div>
  )
}
