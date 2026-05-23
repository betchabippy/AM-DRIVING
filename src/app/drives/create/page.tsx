'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, RotateCcw, MapPin, GitMerge, Flag, Check, Search, X } from 'lucide-react'
import { mockRoutes } from '@/lib/mock-data'
import { supabase } from '@/lib/supabase'
import type { DriveType, DriveCharacter, DriveVisibility } from '@/types'
import clsx from 'clsx'

const STEPS = ['Drive type', 'Area', 'Route', 'Details & publish']

const DRIVE_TYPES: { type: DriveType; icon: any; title: string; sub: string }[] = [
  { type: 'loop',        icon: RotateCcw, title: 'Loop drive',       sub: 'Start & end in the same place' },
  { type: 'destination', icon: MapPin,    title: 'Destination',      sub: 'Drive to a restaurant or venue' },
  { type: 'equidistant', icon: GitMerge,  title: 'Equidistant meet', sub: 'Find a midpoint for friends across states' },
  { type: 'multiday',    icon: Flag,      title: 'Multi-day rally',  sub: 'Overnight tour with waypoints' },
]

const CHARACTERS: DriveCharacter[] = ['spirited', 'leisurely', 'scenic', 'breakfast', 'sunset']
const DURATIONS = ['1 hr', '2 hrs', '3 hrs', 'Half day', 'Full day']
const NE_STATES = ['NY', 'CT', 'VT', 'MA', 'NH', 'ME', 'NJ', 'PA']
const MID_STATES = ['VA', 'MD', 'NC', 'SC', 'TN', 'WV']

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={clsx('h-0.5 rounded-full transition-all',
          i <= current ? 'w-6 bg-gold-400' : 'w-3 bg-surface-border'
        )} />
      ))}
    </div>
  )
}

export default function CreateDrivePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userCars, setUserCars] = useState<any[]>([])
  const [step, setStep] = useState(0)
  const [driveType, setDriveType] = useState<DriveType>('destination')
  const [character, setCharacter] = useState<DriveCharacter>('spirited')
  const [duration, setDuration] = useState('2 hrs')
  const [selectedStates, setSelectedStates] = useState<string[]>(['NY'])
  const [selectedRoute, setSelectedRoute] = useState<string>('route-1')
  const [visibility, setVisibility] = useState<DriveVisibility>('open')
  const [selectedCar, setSelectedCar] = useState<string>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [driveDate, setDriveDate] = useState('')
  const [driveTime, setDriveTime] = useState('09:00')
  const [meetingPoint, setMeetingPoint] = useState('')
  const [destination, setDestination] = useState('')
  const [maxSpots, setMaxSpots] = useState('10')
  const [saving, setSaving] = useState(false)
  const [meetingSuggestions, setMeetingSuggestions] = useState<any[]>([])
  const [destSuggestions, setDestSuggestions] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: cars } = await supabase.from('cars').select('*').eq('user_id', user.id).order('is_primary', { ascending: false })
        setUserCars(cars ?? [])
        if (cars && cars.length > 0) setSelectedCar(cars[0].id)
      }
    }
    load()
  }, [])

  const toggleState = (s: string) =>
    setSelectedStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const searchPlaces = async (query: string, type: 'meeting' | 'dest') => {
    if (!query || query.length < 3) {
      type === 'meeting' ? setMeetingSuggestions([]) : setDestSuggestions([])
      return
    }
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&proximity=-74.006,40.7128&country=US&types=poi&limit=5`
    const res = await fetch(url)
    const data = await res.json()
    const places = data.features?.map((f: any) => ({ name: f.text, address: f.place_name, coords: f.center })) ?? []
    type === 'meeting' ? setMeetingSuggestions(places) : setDestSuggestions(places)
  }

  const suggestMeetingPlaces = async () => {
    if (!selectedStates.length) return
    setLoadingSuggestions(true)
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    
    const stateCenters: Record<string, [number, number]> = {
      NY: [-74.006, 40.7128], CT: [-72.6851, 41.6032], VT: [-72.5778, 44.5588],
      MA: [-71.0589, 42.3601], NH: [-71.5724, 43.1939], ME: [-69.4455, 45.2538],
      NJ: [-74.4057, 40.0583], PA: [-77.1945, 41.2033], VA: [-78.6569, 37.4316],
      MD: [-76.6413, 39.0458], NC: [-79.0193, 35.7596], SC: [-81.1637, 33.8361],
    }

    const center = stateCenters[selectedStates[0]] || [-74.006, 40.7128]
    const searchTerm = character === 'breakfast' ? 'cafe' : character === 'scenic' ? 'park' : 'restaurant'
    
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchTerm}.json?access_token=${token}&proximity=${center[0]},${center[1]}&country=US&types=poi&limit=5`
    const res = await fetch(url)
    const data = await res.json()
    console.log('Mapbox response:', data)
    const places = (data.features ?? []).map((f: any) => ({ name: f.text, address: f.place_name, coords: f.center }))
    console.log('Places found:', places)
    if (places.length > 0) setMeetingSuggestions(places)
    setLoadingSuggestions(false)
  }

    const center = stateCenters[selectedStates[0]] || [-74.006, 40.7128]
    const searchTerm = character === 'breakfast' ? 'cafe' : character === 'scenic' ? 'park' : 'restaurant'
    
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchTerm}.json?access_token=${token}&proximity=${center[0]},${center[1]}&country=US&types=poi&limit=5`
    const res = await fetch(url)
    const data = await res.json()
    console.log('Mapbox response:', data)
    const places = (data.features ?? []).map((f: any) => ({ name: f.text, address: f.place_name, coords: f.center }))
    console.log('Places found:', places)
    if (places.length > 0) setMeetingSuggestions(places)
    setLoadingSuggestions(false)
  }
    const query = character === 'breakfast' ? 'restaurant breakfast' : character === 'scenic' ? 'scenic viewpoint park' : 'restaurant inn'
    const state = stateNames[selectedStates[0]] || selectedStates[0]
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query + ' ' + state)}.json?access_token=${token}&country=US&types=poi&limit=5`
    const res = await fetch(url)
    const data = await res.json()
    setLoadingSuggestions(false)
    const places = (data.features ?? []).map((f: any) => ({ name: f.text, address: f.place_name, coords: f.center }))
    console.log('Places found:', places)
    if (places.length > 0) setMeetingSuggestions(places)
    setLoadingSuggestions(false)
  }

  const handlePublish = async () => {
    if (!user || !driveDate) return
    setSaving(true)
    const driveTitle = title || `${character.charAt(0).toUpperCase() + character.slice(1)} drive — ${selectedStates.join('/')}`
    const { data, error } = await supabase.from('drives').insert({
      title: driveTitle, type: driveType, character, visibility,
      drive_date: driveDate, depart_time: driveTime,
      meeting_point: meetingPoint || null,
      destination: destination || null,
      states: selectedStates, organizer_id: user.id,
      max_spots: parseInt(maxSpots) || null,
      description: description || null,
    }).select().single()
    setSaving(false)
    if (error) { alert(JSON.stringify(error)); return }
    if (data) router.push(`/drives/${data.id}`)
  }

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => step === 0 ? router.back() : setStep(s => s - 1)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={back} className="w-9 h-9 rounded-xl bg-surface-raised border border-surface-border flex items-center justify-center hover:border-gray-500 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="font-display text-2xl text-white">Create a drive</h1>
          <p className="text-xs text-gray-500 mt-0.5">{STEPS[step]}</p>
        </div>
        <div className="ml-auto"><StepIndicator current={step} total={STEPS.length} /></div>
      </div>

      {step === 0 && (
        <div className="animate-slide-up space-y-6">
          <div>
            <h2 className="font-display text-3xl text-white mb-1">What kind of drive?</h2>
            <p className="text-gray-500 text-sm">Choose how you want to build your route</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {DRIVE_TYPES.map(({ type, icon: Icon, title, sub }) => (
              <button key={type} onClick={() => setDriveType(type)}
                className={clsx('text-left p-5 rounded-card border transition-all',
                  driveType === type ? 'border-gold-400 bg-amber-950/30' : 'border-surface-border bg-surface-raised hover:border-gray-600'
                )}>
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
                <button key={c} onClick={() => setCharacter(c)}
                  className={clsx('px-4 py-2 rounded-full text-xs font-medium border transition-all capitalize',
                    character === c ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border text-gray-500 hover:border-gray-500'
                  )}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="section-label mb-3">Duration</p>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={clsx('flex-1 min-w-fit py-2.5 px-3 rounded-xl text-xs font-medium border transition-all',
                    duration === d ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border text-gray-500 hover:border-gray-500'
                  )}>{d}</button>
              ))}
            </div>
          </div>
          <button onClick={next} className="w-full btn-gold flex items-center justify-center gap-2">
            Next — Choose area <ArrowRight size={15} />
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="animate-slide-up space-y-6">
          <div>
            <h2 className="font-display text-3xl text-white mb-1">Where do you want to drive?</h2>
            <p className="text-gray-500 text-sm">Select one or more states</p>
          </div>
          <div>
            <p className="section-label mb-3">Northeast</p>
            <div className="grid grid-cols-4 gap-2">
              {NE_STATES.map(s => (
                <button key={s} onClick={() => toggleState(s)}
                  className={clsx('py-3 rounded-xl text-xs font-medium border transition-all',
                    selectedStates.includes(s) ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border bg-surface-raised text-gray-500 hover:border-gray-500'
                  )}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="section-label mb-3">Mid-Atlantic</p>
            <div className="grid grid-cols-4 gap-2">
              {MID_STATES.map(s => (
                <button key={s} onClick={() => toggleState(s)}
                  className={clsx('py-3 rounded-xl text-xs font-medium border transition-all',
                    selectedStates.includes(s) ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border bg-surface-raised text-gray-500 hover:border-gray-500'
                  )}>{s}</button>
              ))}
            </div>
          </div>
          {selectedStates.length >= 2 && (
            <div className="p-4 rounded-xl border border-gold-400/20 bg-amber-950/10 flex gap-3">
              <MapPin size={16} className="text-gold-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-400 leading-relaxed">
                With <span className="text-gold-400">{selectedStates.join(' + ')}</span> selected, we'll find scenic roads across the area.
              </p>
            </div>
          )}
          <button onClick={next} className="w-full btn-gold flex items-center justify-center gap-2">
            Next — Pick a route <ArrowRight size={15} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-slide-up space-y-4">
          <div>
            <h2 className="font-display text-3xl text-white mb-1">Choose a route</h2>
            <p className="text-gray-500 text-sm">Community rated routes in your area</p>
          </div>
          {mockRoutes.map(route => (
            <button key={route.id} onClick={() => setSelectedRoute(route.id)}
              className={clsx('w-full text-left rounded-card border overflow-hidden transition-all',
                selectedRoute === route.id ? 'border-gold-400' : 'border-surface-border hover:border-gray-600'
              )}>
              <div className="h-16 map-placeholder" />
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div className="font-medium text-sm text-white">{route.name}</div>
                  {selectedRoute === route.id && <Check size={16} className="text-gold-400 flex-shrink-0" />}
                </div>
                <div className="text-xs text-gray-600 mb-2">{route.miles} mi · {Math.round(route.durationMinutes / 60 * 10) / 10}h · {route.states.join(', ')}</div>
                <div className="flex gap-2 flex-wrap">
                  {route.rating > 0 && <span className="pill-green">★ {route.rating}</span>}
                  {route.character.map(c => <span key={c} className="pill-gold capitalize">{c}</span>)}
                </div>
              </div>
            </button>
          ))}
          <button onClick={next} className="w-full btn-gold flex items-center justify-center gap-2">
            Next — Details & publish <ArrowRight size={15} />
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="animate-slide-up space-y-6">
          <div>
            <h2 className="font-display text-3xl text-white mb-1">Almost ready</h2>
            <p className="text-gray-500 text-sm">Name your drive, set the date and meeting point</p>
          </div>

          <div>
            <p className="section-label mb-2">Drive name</p>
            <input type="text" placeholder={`${character.charAt(0).toUpperCase() + character.slice(1)} drive — ${selectedStates.join('/')}`}
              value={title} onChange={e => setTitle(e.target.value)} className="input-dark" />
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
            {visibility === 'open' && (
              <p className="text-xs text-gray-500 mt-2">Any Rally member can request to join — any car, any club or none.</p>
            )}
          </div>

          <div>
            <p className="section-label mb-3">Date & time</p>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={driveDate} onChange={e => setDriveDate(e.target.value)} className="input-dark" />
              <input type="time" value={driveTime} onChange={e => setDriveTime(e.target.value)} className="input-dark" />
            </div>
          </div>

          <div>
            <p className="section-label mb-2">Meeting point</p>
            <div className="relative">
              <input type="text" placeholder="Search for a place..."
                value={meetingPoint}
                onChange={e => { setMeetingPoint(e.target.value); searchPlaces(e.target.value, 'meeting') }}
                className="input-dark pr-10" />
              {meetingPoint && (
                <button onClick={() => { setMeetingPoint(''); setMeetingSuggestions([]) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
            <button onClick={suggestMeetingPlaces}
              className="mt-2 flex items-center gap-2 text-xs text-gold-400 hover:text-gold-200 transition-colors">
              <Search size={12} />
              {loadingSuggestions ? 'Finding places...' : 'Suggest a meeting place based on my area'}
            </button>
            {meetingSuggestions.length > 0 && (
              <div className="mt-2 card divide-y divide-surface-border">
                {meetingSuggestions.map((place, i) => (
                  <button key={i} onClick={() => { setMeetingPoint(place.address); setMeetingSuggestions([]) }}
                    className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors">
                    <div className="text-sm text-white">{place.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{place.address}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {driveType === 'destination' && (
            <div>
              <p className="section-label mb-2">Destination</p>
              <div className="relative">
                <input type="text" placeholder="Search for a destination..."
                  value={destination}
                  onChange={e => { setDestination(e.target.value); searchPlaces(e.target.value, 'dest') }}
                  className="input-dark pr-10" />
                {destination && (
                  <button onClick={() => { setDestination(''); setDestSuggestions([]) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>
              {destSuggestions.length > 0 && (
                <div className="mt-2 card divide-y divide-surface-border">
                  {destSuggestions.map((place, i) => (
                    <button key={i} onClick={() => { setDestination(place.address); setDestSuggestions([]) }}
                      className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors">
                      <div className="text-sm text-white">{place.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{place.address}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <p className="section-label mb-2">Max spots</p>
            <input type="number" min="2" max="50" value={maxSpots}
              onChange={e => setMaxSpots(e.target.value)} className="input-dark" />
          </div>

          <div>
            <p className="section-label mb-2">Description (optional)</p>
            <textarea placeholder="Tell people what to expect..."
              value={description} onChange={e => setDescription(e.target.value)}
              rows={3} className="input-dark resize-none" />
          </div>

          {userCars.length > 0 && (
            <div>
              <p className="section-label mb-3">Which car are you bringing?</p>
              <div className="space-y-2">
                {userCars.map(car => (
                  <button key={car.id} onClick={() => setSelectedCar(car.id)}
                    className={clsx('w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                      selectedCar === car.id ? 'border-gold-400 bg-amber-950/30' : 'border-surface-border bg-surface-raised hover:border-gray-600'
                    )}>
                    <div className={clsx('w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all',
                      selectedCar === car.id ? 'bg-gold-400 border-gold-400' : 'border-gray-600'
                    )} />
                    {car.photo_url ? (
                      <img src={car.photo_url} alt={car.model} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: car.color_hex || '#1a1a1a' }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{car.year} {car.make} {car.model}</div>
                      <div className="text-xs text-gray-600">{car.color}</div>
                    </div>
                    {car.club_name && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#1a1028', color: '#c080e0' }}>
                        {car.club_name}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={handlePublish} disabled={saving || !driveDate}
            className="w-full btn-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {saving ? 'Publishing...' : 'Publish drive'} <Flag size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
