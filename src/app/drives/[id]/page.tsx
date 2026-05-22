'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, Flag, Users, Check, Minus, X, Shield, Globe, Lock } from 'lucide-react'
import { mockDrives, mockUser } from '@/lib/mock-data'
import { format, parseISO } from 'date-fns'
import clsx from 'clsx'
import type { RsvpStatus } from '@/types'

export default function DriveDetailPage({ params }: { params: { id: string } }) {
  const drive = mockDrives.find(d => d.id === params.id) ?? mockDrives[0]
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('pending')
  const [selectedCar, setSelectedCar] = useState('car-1')
  const [note, setNote] = useState('')
  const [showRsvpPanel, setShowRsvpPanel] = useState(false)

  const goingAttendees = drive.attendees.filter(a => a.status === 'going')
  const maybeAttendees = drive.attendees.filter(a => a.status === 'maybe')

  function RouteSvg() {
    const coords = drive.route?.coordinates ?? []
    if (!coords.length) return <div className="w-full h-full bg-surface" />
    const xs = coords.map(c => c[0])
    const ys = coords.map(c => c[1])
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)
    const pad = 0.08
    const vx = minX - pad, vy = minY - pad
    const vw = (maxX - minX) + pad * 2 || 0.5, vh = (maxY - minY) + pad * 2 || 0.5
    const pts = coords.map(([x, y]) => `${x},${y}`).join(' ')
    return (
      <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <rect x={vx} y={vy} width={vw} height={vh} fill="#0d1a0d"/>
        <polyline points={pts} fill="none" stroke="#1a3a1a" strokeWidth={vw*0.05} strokeLinecap="round"/>
        <polyline points={pts} fill="none" stroke="#C9A84C" strokeWidth={vw*0.012} strokeLinecap="round" strokeDasharray={`${vw*0.025} ${vw*0.018}`}/>
        <circle cx={coords[0][0]} cy={coords[0][1]} r={vw*0.025} fill="#4CAF70"/>
        <circle cx={coords[coords.length-1][0]} cy={coords[coords.length-1][1]} r={vw*0.025} fill="#C9A84C"/>
      </svg>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-32 md:pb-8">

      {/* Back */}
      <Link href="/drives" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={15} /> Back to drives
      </Link>

      {/* Hero map */}
      <div className="map-placeholder h-52 rounded-card mb-6 relative overflow-hidden">
        <RouteSvg />
        <div className="absolute inset-0 bg-gradient-to-t from-base/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            {drive.club && (
              <span className="pill-purple text-[10px] mb-2 inline-block">{drive.club}</span>
            )}
            <h1 className="font-display text-3xl text-white">{drive.title}</h1>
          </div>
          {drive.visibility === 'private' && <Lock size={16} className="text-gray-400" />}
          {drive.visibility === 'open' && <Globe size={16} className="text-gray-400" />}
          {drive.visibility === 'club' && <Shield size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* Info rows */}
      <div className="card divide-y divide-surface-border mb-6">
        {[
          { icon: Calendar, label: 'Date & time',    value: `${format(parseISO(drive.date), 'EEEE, MMMM d')} · ${drive.departTime}` },
          { icon: MapPin,   label: 'Meeting point',  value: drive.meetingPoint },
          { icon: Flag,     label: 'Destination',    value: drive.destination ?? '—' },
          { icon: Clock,    label: 'Route',          value: drive.route ? `${drive.route.miles} mi · ${Math.round(drive.route.durationMinutes / 60 * 10) / 10}h · ${drive.route.name}` : '—' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 p-4">
            <Icon size={16} className="text-gold-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-500 mb-0.5">{label}</div>
              <div className="text-sm text-white">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      {drive.description && (
        <div className="card p-4 mb-6">
          <p className="text-sm text-gray-400 leading-relaxed">{drive.description}</p>
        </div>
      )}

      {/* Attendees */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-label">Going ({goingAttendees.length})</h2>
          {maybeAttendees.length > 0 && <span className="text-xs text-gray-500">{maybeAttendees.length} maybe</span>}
        </div>
        <div className="card divide-y divide-surface-border">
          {drive.attendees.map(a => (
            <div key={a.userId} className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                style={{ background: a.avatarColor, color: '#ddd' }}>
                {a.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{a.name}</div>
                <div className="text-xs text-gray-600">{a.car} · {a.carColor}</div>
                {a.note && <div className="text-xs text-gray-500 mt-0.5 italic">"{a.note}"</div>}
              </div>
              <div className="flex items-center gap-2">
                {a.club && <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#1a1028', color: '#c080e0' }}>{a.club}</span>}
                <span className={clsx('w-5 h-5 rounded-full flex items-center justify-center',
                  a.status === 'going' ? 'bg-green-900' : a.status === 'maybe' ? 'bg-amber-900' : 'bg-surface-border'
                )}>
                  {a.status === 'going' && <Check size={10} className="text-green-400" />}
                  {a.status === 'maybe' && <Minus size={10} className="text-amber-400" />}
                  {a.status === 'declined' && <X size={10} className="text-red-400" />}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RSVP panel */}
      {showRsvpPanel ? (
        <div className="card p-5 mb-4 animate-slide-up">
          <h3 className="font-medium text-white mb-4">RSVP to this drive</h3>

          <p className="section-label mb-2">Which car are you bringing?</p>
          <div className="space-y-2 mb-4">
            {mockUser.cars.map(car => (
              <button
                key={car.id}
                onClick={() => setSelectedCar(car.id)}
                className={clsx('w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                  selectedCar === car.id ? 'border-gold-400 bg-amber-950/30' : 'border-surface-border bg-surface-raised hover:border-gray-600'
                )}
              >
                <div className={clsx('w-2.5 h-2.5 rounded-full border-2 flex-shrink-0', selectedCar === car.id ? 'bg-gold-400 border-gold-400' : 'border-gray-600')} />
                <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ background: car.colorHex }} />
                <div>
                  <div className="text-sm font-medium text-white">{car.year} {car.make} {car.model}</div>
                  <div className="text-xs text-gray-600">{car.color}</div>
                </div>
              </button>
            ))}
          </div>

          <p className="section-label mb-2">Add a note</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {["Can't wait!", "Running a few mins late", "First rally!", "Bringing a guest"].map(n => (
              <button key={n} onClick={() => setNote(n)}
                className={clsx('text-xs px-3 py-1.5 rounded-full border transition-all',
                  note === n ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border text-gray-500 hover:border-gray-500'
                )}>
                {n}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Or write your own..."
            value={note}
            onChange={e => setNote(e.target.value)}
            className="input-dark mb-4"
          />

          <div className="flex gap-2">
            <button onClick={() => { setRsvpStatus('going'); setShowRsvpPanel(false) }}
              className="flex-1 btn-gold flex items-center justify-center gap-2">
              <Check size={14} /> Going
            </button>
            <button onClick={() => { setRsvpStatus('maybe'); setShowRsvpPanel(false) }}
              className="flex-1 btn-outline flex items-center justify-center gap-2">
              <Minus size={14} /> Maybe
            </button>
            <button onClick={() => setShowRsvpPanel(false)} className="btn-outline px-4">
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          {rsvpStatus !== 'going' ? (
            <button onClick={() => setShowRsvpPanel(true)} className="flex-1 btn-gold">
              RSVP — I'm going
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 bg-green-900/30 border border-green-800 rounded-xl py-3 text-sm text-green-400 font-medium">
              <Check size={15} /> You're going
            </div>
          )}
          {rsvpStatus !== 'maybe' && rsvpStatus !== 'going' && (
            <button onClick={() => setRsvpStatus('maybe')} className="btn-outline">Maybe</button>
          )}
        </div>
      )}

      {drive.visibility === 'open' && rsvpStatus === 'pending' && (
        <p className="text-xs text-gray-600 text-center mt-3">
          This is an open drive — any member can request a spot. The organizer will confirm.
        </p>
      )}
    </div>
  )
}
