'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, RotateCcw, MapPin, GitMerge, Flag, Clock, Check } from 'lucide-react'
import { mockRoutes, mockUser } from '@/lib/mock-data'
import type { DriveType, DriveCharacter, DriveVisibility } from '@/types'
import clsx from 'clsx'

const STEPS = ['Drive type', 'Area', 'Route', 'Invite']

const DRIVE_TYPES: { type: DriveType; icon: any; title: string; sub: string }[] = [
  { type: 'loop',        icon: RotateCcw,  title: 'Loop drive',         sub: 'Start & end in the same place' },
  { type: 'destination', icon: MapPin,     title: 'Destination',        sub: 'Drive to a restaurant or venue' },
  { type: 'equidistant', icon: GitMerge,   title: 'Equidistant meet',   sub: 'Find a midpoint for friends across states' },
  { type: 'multiday',    icon: Flag,       title: 'Multi-day rally',    sub: 'Overnight tour with waypoints' },
]

const CHARACTERS: DriveCharacter[] = ['spirited', 'leisurely', 'scenic', 'breakfast', 'sunset']
const DURATIONS = ['1 hr', '2 hrs', '3 hrs', 'Half day', 'Full day']

const NE_STATES = ['NY', 'CT', 'VT', 'MA', 'NH', 'ME', 'NJ', 'PA']
const MID_STATES = ['VA', 'MD', 'NC', 'SC', 'TN', 'WV']

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={clsx('h-0.5 rounded-full transition-all', i < current ? 'w-6 bg-gold-400' : i === current ? 'w-6 bg-gold-400' : 'w-3 bg-surface-border')} />
      ))}
    </div>
  )
}

export default function CreateDrivePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [driveType, setDriveType] = useState<DriveType>('loop')
  const [character, setCharacter] = useState<DriveCharacter>('spirited')
  const [duration, setDuration] = useState('2 hrs')
  const [selectedStates, setSelectedStates] = useState<string[]>(['NY'])
  const [selectedRoute, setSelectedRoute] = useState<string>('route-1')
  const [visibility, setVisibility] = useState<DriveVisibility>('club')
  const [selectedCar, setSelectedCar] = useState<string>('car-1')
  const [rsvpNote, setRsvpNote] = useState('')
  const [meetingPoint, setMeetingPoint] = useState('')
  const [driveDate, setDriveDate] = useState('')
  const [driveTime, setDriveTime] = useState('09:00')

  const toggleState = (s: string) =>
    setSelectedStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => step === 0 ? router.back() : setStep(s => s - 1)

  const handlePublish = () => router.push('/drives/drive-1')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={back} className="w-9 h-9 rounded-xl bg-surface-raised border border-surface-border flex items-center justify-center hover:border-gray-500 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="font-display text-2xl text-white">Create a drive</h1>
          <p className="text-xs text-gray-500 mt-0.5">{STEPS[step]}</p>
        </div>
        <div className="ml-auto">
          <StepIndicator current={step} total={STEPS.length} />
        </div>
      </div>

      {/* Step 1: Drive type */}
      {step === 0 && (
        <div className="animate-slide-up space-y-6">
          <div>
            <h2 className="font-display text-3xl text-white mb-1">What kind of drive?</h2>
            <p className="text-gray-500 text-sm">Choose how you want to build your route</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {DRIVE_TYPES.map(({ type, icon: Icon, title, sub }) => (
              <button
                key={type}
                onClick={() => setDriveType(type)}
                className={clsx(
                  'text-left p-5 rounded-card border transition-all',
                  driveType === type
                    ? 'border-gold-400 bg-amber-950/30'
                    : 'border-surface-border bg-surface-raised hover:border-gray-600'
                )}
              >
                <Icon size={22} className={clsx('mb-3', driveType === type ? 'text-gold-400' : 'text-gray-500')} />
                <div className="text-sm font-medium text-white mb-1">{title}</div>
                <div className="text-xs text-gray-600 leading-relaxed">{sub}</div>
              </button>
            ))}
          </div>

          <div>
            <p className="section-label mb-3">Drive character</p>
            <div className="flex flex-wrap gap-2">
              {CHARACTERS.map(c => (
                <button
                  key={c}
                  onClick={() => setCharacter(c)}
                  className={clsx(
                    'px-4 py-2 rounded-full text-xs font-medium border transition-all capitalize',
                    character === c
                      ? 'border-gold-400 bg-amber-950/40 text-gold-400'
                      : 'border-surface-border text-gray-500 hover:border-gray-500 hover:text-gray-300'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="section-label mb-3">Duration</p>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={clsx(
                    'flex-1 min-w-fit py-2.5 px-3 rounded-xl text-xs font-medium border transition-all',
                    duration === d
                      ? 'border-gold-400 bg-amber-950/40 text-gold-400'
                      : 'border-surface-border text-gray-500 hover:border-gray-500'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button onClick={next} className="w-full btn-gold flex items-center justify-center gap-2">
            Next — Choose area <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Step 2: State/area */}
      {step === 1 && (
        <div className="animate-slide-up space-y-6">
          <div>
            <h2 className="font-display text-3xl text-white mb-1">Where do you want to drive?</h2>
            <p className="text-gray-500 text-sm">Select one or more states — we'll find the best scenic roads</p>
          </div>

          <div>
            <p className="section-label mb-3">Northeast</p>
            <div className="grid grid-cols-4 gap-2">
              {NE_STATES.map(s => (
                <button
                  key={s}
                  onClick={() => toggleState(s)}
                  className={clsx(
                    'py-3 rounded-xl text-xs font-medium border transition-all',
                    selectedStates.includes(s)
                      ? 'border-gold-400 bg-amber-950/40 text-gold-400'
                      : 'border-surface-border bg-surface-raised text-gray-500 hover:border-gray-500'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="section-label mb-3">Mid-Atlantic</p>
            <div className="grid grid-cols-4 gap-2">
              {MID_STATES.map(s => (
                <button
                  key={s}
                  onClick={() => toggleState(s)}
                  className={clsx(
                    'py-3 rounded-xl text-xs font-medium border transition-all',
                    selectedStates.includes(s)
                      ? 'border-gold-400 bg-amber-950/40 text-gold-400'
                      : 'border-surface-border bg-surface-raised text-gray-500 hover:border-gray-500'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {selectedStates.length >= 2 && (
            <div className="p-4 rounded-xl border border-gold-400/20 bg-amber-950/10 flex gap-3">
              <MapPin size={16} className="text-gold-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-400 leading-relaxed">
                With <span className="text-gold-400">{selectedStates.join(' + ')}</span> selected, we'll find a scenic midpoint meeting area equidistant for all parties.
              </p>
            </div>
          )}

          <button onClick={next} className="w-full btn-gold flex items-center justify-center gap-2">
            Next — See route options <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Step 3: Route pick */}
      {step === 2 && (
        <div className="animate-slide-up space-y-4">
          <div>
            <h2 className="font-display text-3xl text-white mb-1">{mockRoutes.length} routes found</h2>
            <p className="text-gray-500 text-sm">Based on your area and drive type. Rated by the community.</p>
          </div>

          {mockRoutes.map(route => (
            <button
              key={route.id}
              onClick={() => setSelectedRoute(route.id)}
              className={clsx(
                'w-full text-left rounded-card border overflow-hidden transition-all',
                selectedRoute === route.id
                  ? 'border-gold-400'
                  : 'border-surface-border hover:border-gray-600'
              )}
            >
              {/* Mini map */}
              <div className="h-20 map-placeholder relative">
                {route.coordinates.length > 0 && (() => {
                  const xs = route.coordinates.map(c => c[0])
                  const ys = route.coordinates.map(c => c[1])
                  const minX = Math.min(...xs), maxX = Math.max(...xs)
                  const minY = Math.min(...ys), maxY = Math.max(...ys)
                  const pad = 0.05
                  const vx = minX - pad, vy = minY - pad
                  const vw = (maxX - minX) + pad * 2, vh = (maxY - minY) + pad * 2
                  const pts = route.coordinates.map(([x, y]) => `${x},${y}`).join(' ')
                  return (
                    <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                      <rect x={vx} y={vy} width={vw} height={vh} fill="#0d150d"/>
                      <polyline points={pts} fill="none" stroke="#1a3a1a" strokeWidth={vw * 0.06} strokeLinecap="round"/>
                      <polyline points={pts} fill="none" stroke="#C9A84C" strokeWidth={vw * 0.015} strokeLinecap="round" strokeDasharray={`${vw*0.03} ${vw*0.02}`}/>
                    </svg>
                  )
                })()}
                {route.driveCount === 0 && (
                  <span className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full font-medium bg-red-950/80 text-red-400">Community new</span>
                )}
                {route.rating >= 4.8 && (
                  <span className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full font-medium bg-amber-950/80 text-gold-400">Top rated</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div className="font-medium text-sm text-white">{route.name}</div>
                  {selectedRoute === route.id && <Check size={16} className="text-gold-400 flex-shrink-0" />}
                </div>
                <div className="text-xs text-gray-600 mb-2">{route.miles} mi · {Math.round(route.durationMinutes / 60 * 10) / 10}h · via {route.states.join(', ')}</div>
                <div className="flex gap-2 flex-wrap">
                  {route.rating > 0 && <span className="pill-green">★ {route.rating}</span>}
                  {route.character.map(c => <span key={c} className="pill-gold capitalize">{c}</span>)}
                  {route.driveCount > 0 && <span className="pill" style={{ background: '#1a1a1a', color: '#888' }}>{route.driveCount} drives</span>}
                </div>
              </div>
            </button>
          ))}

          <button onClick={next} className="w-full btn-gold flex items-center justify-center gap-2">
            Next — Invite & publish <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Step 4: Invite & publish */}
      {step === 3 && (
        <div className="animate-slide-up space-y-6">
          <div>
            <h2 className="font-display text-3xl text-white mb-1">Almost ready</h2>
            <p className="text-gray-500 text-sm">Set visibility, date, and invite your friends</p>
          </div>

          {/* Visibility */}
          <div>
            <p className="section-label mb-3">Who can join?</p>
            <div className="flex bg-surface-raised border border-surface-border rounded-xl overflow-hidden">
              {(['private', 'club', 'open'] as DriveVisibility[]).map(v => (
                <button
                  key={v}
                  onClick={() => setVisibility(v)}
                  className={clsx(
                    'flex-1 py-2.5 text-xs font-medium capitalize transition-all',
                    visibility === v ? 'bg-gold-400 text-black' : 'text-gray-500 hover:text-gray-300'
                  )}
                >
                  {v === 'private' ? 'Invite only' : v === 'club' ? 'Club members' : 'All members'}
                </button>
              ))}
            </div>
            {visibility === 'open' && (
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Any Rally member can request to join — any car, any club or none. You'll approve each request.
              </p>
            )}
          </div>

          {/* Date & time */}
          <div>
            <p className="section-label mb-3">Date & time</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={driveDate}
                onChange={e => setDriveDate(e.target.value)}
                className="input-dark"
              />
              <input
                type="time"
                value={driveTime}
                onChange={e => setDriveTime(e.target.value)}
                className="input-dark"
              />
            </div>
          </div>

          {/* Meeting point */}
          <div>
            <p className="section-label mb-3">Meeting point</p>
            <input
              type="text"
              placeholder="Restaurant, park, or address..."
              value={meetingPoint}
              onChange={e => setMeetingPoint(e.target.value)}
              className="input-dark"
            />
          </div>

          {/* Car selection */}
          <div>
            <p className="section-label mb-3">Which car are you bringing?</p>
            <div className="space-y-2">
              {mockUser.cars.map(car => (
                <button
                  key={car.id}
                  onClick={() => setSelectedCar(car.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                    selectedCar === car.id
                      ? 'border-gold-400 bg-amber-950/30'
                      : 'border-surface-border bg-surface-raised hover:border-gray-600'
                  )}
                >
                  <div className={clsx('w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all',
                    selectedCar === car.id ? 'bg-gold-400 border-gold-400' : 'border-gray-600'
                  )} />
                  <div className="w-7 h-7 rounded-lg flex-shrink-0" style={{ background: car.colorHex }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{car.year} {car.make} {car.model}</div>
                    <div className="text-xs text-gray-600">{car.color}</div>
                  </div>
                  {car.club && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#1a1028', color: '#c080e0' }}>
                      {car.club}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <p className="section-label mb-3">Add a note (optional)</p>
            <textarea
              placeholder="Can't wait, see you all there! ..."
              value={rsvpNote}
              onChange={e => setRsvpNote(e.target.value)}
              rows={2}
              className="input-dark resize-none"
            />
          </div>

          <button onClick={handlePublish} className="w-full btn-gold flex items-center justify-center gap-2">
            Publish drive <Flag size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
