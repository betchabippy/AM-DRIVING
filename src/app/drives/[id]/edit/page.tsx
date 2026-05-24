'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Flag, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { DriveVisibility } from '@/types'
import clsx from 'clsx'

const CHARACTERS = ['spirited', 'leisurely', 'scenic', 'breakfast', 'sunset']
const NE_STATES = ['NY', 'CT', 'VT', 'MA', 'NH', 'ME', 'NJ', 'PA']
const MID_STATES = ['VA', 'MD', 'NC', 'SC', 'TN', 'WV']

export default function EditDrivePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [title, setTitle] = useState('')
  const [character, setCharacter] = useState('spirited')
  const [visibility, setVisibility] = useState<DriveVisibility>('open')
  const [driveDate, setDriveDate] = useState('')
  const [driveTime, setDriveTime] = useState('09:00')
  const [meetingPoint, setMeetingPoint] = useState('')
  const [destination, setDestination] = useState('')
  const [routeDescription, setRouteDescription] = useState('')
  const [maxSpots, setMaxSpots] = useState('10')
  const [description, setDescription] = useState('')
  const [selectedStates, setSelectedStates] = useState<string[]>([])

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: drive } = await supabase.from('drives').select('*').eq('id', id).single()
      if (!drive) { router.push('/drives'); return }
      if (drive.organizer_id !== user.id) { router.push('/drives/' + id); return }

      setTitle(drive.title || '')
      setCharacter(drive.character || 'spirited')
      setVisibility(drive.visibility || 'open')
      setDriveDate(drive.drive_date || '')
      setDriveTime(drive.depart_time || '09:00')
      setMeetingPoint(drive.meeting_point || '')
      setDestination(drive.destination || '')
      setRouteDescription(drive.route_description || '')
      setMaxSpots(drive.max_spots?.toString() || '10')
      setDescription(drive.description || '')
      setSelectedStates(drive.states || [])
      setLoading(false)
    }
    load()
  }, [id])

  const toggleState = (s: string) =>
    setSelectedStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleSave = async () => {
    if (!title || !driveDate) return
    setSaving(true)
    await supabase.from('drives').update({
      title, character, visibility,
      drive_date: driveDate, depart_time: driveTime,
      meeting_point: meetingPoint || null,
      destination: destination || null,
      route_description: routeDescription || null,
      states: selectedStates,
      max_spots: parseInt(maxSpots) || null,
      description: description || null,
    }).eq('id', id)
    setSaving(false)
    router.push('/drives/' + id)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await supabase.from('rsvps').delete().eq('drive_id', id)
    await supabase.from('drives').delete().eq('id', id)
    router.push('/drives')
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/drives/' + id)}
          className="w-9 h-9 rounded-xl bg-surface-raised border border-surface-border flex items-center justify-center hover:border-gray-500 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-display text-2xl text-white">Edit drive</h1>
      </div>

      <div className="space-y-6">
        <div>
          <p className="section-label mb-2">Drive name</p>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-dark" />
        </div>

        <div>
          <p className="section-label mb-3">Drive character</p>
          <div className="flex flex-wrap gap-2">
            {CHARACTERS.map(c => (
              <button key={c} onClick={() => setCharacter(c)}
                className={clsx('px-4 py-2 rounded-full text-xs font-medium border transition-all capitalize',
                  character === c ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border text-gray-500 hover:border-gray-500'
                )}>{c}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="section-label mb-3">Who can join?</p>
          <div className="flex bg-surface-raised border border-surface-border rounded-xl overflow-hidden">
            {(['private', 'club', 'open'] as DriveVisibility[]).map(v => (
              <button key={v} onClick={() => setVisibility(v)}
                className={clsx('flex-1 py-2.5 text-xs font-medium capitalize transition-all',
                  visibility === v ? 'bg-gold-400 text-black' : 'text-gray-500 hover:text-gray-300'
                )}>
                {v === 'private' ? 'Invite only' : v === 'club' ? 'Club members' : 'All members'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="section-label mb-3">Date and time</p>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={driveDate} onChange={e => setDriveDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} className="input-dark" />
            <input type="time" value={driveTime} onChange={e => setDriveTime(e.target.value)} className="input-dark" />
          </div>
        </div>

        <div>
          <p className="section-label mb-3">Area</p>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {NE_STATES.map(s => (
              <button key={s} onClick={() => toggleState(s)}
                className={clsx('py-3 rounded-xl text-xs font-medium border transition-all',
                  selectedStates.includes(s) ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border bg-surface-raised text-gray-500 hover:border-gray-500'
                )}>{s}</button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {MID_STATES.map(s => (
              <button key={s} onClick={() => toggleState(s)}
                className={clsx('py-3 rounded-xl text-xs font-medium border transition-all',
                  selectedStates.includes(s) ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border bg-surface-raised text-gray-500 hover:border-gray-500'
                )}>{s}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="section-label mb-2">Meeting point</p>
          <input type="text" value={meetingPoint} onChange={e => setMeetingPoint(e.target.value)}
            placeholder="e.g. White Flower Farm, Litchfield CT" className="input-dark" />
        </div>

        <div>
          <p className="section-label mb-2">Destination</p>
          <input type="text" value={destination} onChange={e => setDestination(e.target.value)}
            placeholder="e.g. The Inn at Pound Ridge" className="input-dark" />
        </div>

        <div>
          <p className="section-label mb-2">Route description</p>
          <textarea value={routeDescription} onChange={e => setRouteDescription(e.target.value)}
            placeholder="Describe the route — roads to take, highlights, any tricky turns..."
            rows={4} className="input-dark resize-none" />
        </div>

        <div>
          <p className="section-label mb-2">Max spots</p>
          <input type="number" min="2" max="50" value={maxSpots}
            onChange={e => setMaxSpots(e.target.value)} className="input-dark" />
        </div>

        <div>
          <p className="section-label mb-2">Description</p>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Tell people what to expect..." rows={3} className="input-dark resize-none" />
        </div>

        <button onClick={handleSave} disabled={saving || !title || !driveDate}
          className="w-full btn-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {saving ? 'Saving...' : 'Save changes'} <Flag size={15} />
        </button>

        <div className="border-t border-surface-border pt-6">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-900/50 text-red-400 text-sm hover:bg-red-950/20 transition-colors">
              <Trash2 size={15} /> Cancel this drive
            </button>
          ) : (
            <div className="card p-4 border-red-900/50">
              <p className="text-sm text-white mb-4 text-center">Are you sure? This will cancel the drive and remove all RSVPs.</p>
              <div className="flex gap-3">
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-900/40 border border-red-800 text-red-400 text-sm font-medium hover:bg-red-900/60 transition-colors">
                  {deleting ? 'Cancelling...' : 'Yes, cancel drive'}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 btn-outline text-sm">
                  Keep it
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
