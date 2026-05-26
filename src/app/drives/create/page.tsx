'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, RotateCcw, MapPin, GitMerge, Flag, Check, Search, X, Navigation, Plus } from 'lucide-react'
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

const STATE_CENTERS: Record<string, [number, number]> = {
  NY: [-74.006, 40.7128], CT: [-72.6851, 41.6032], VT: [-72.5778, 44.5588],
  MA: [-71.0589, 42.3601], NH: [-71.5724, 43.1939], ME: [-69.4455, 45.2538],
  NJ: [-74.4057, 40.0583], PA: [-77.1945, 41.2033], VA: [-78.6569, 37.4316],
  MD: [-76.6413, 39.0458], NC: [-79.0193, 35.7596], SC: [-81.1637, 33.8361],
}

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
  const [step, setStep] = useState(-1)
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
  const [previewRoute, setPreviewRoute] = useState<any>(null)
  const [dbRoutes, setDbRoutes] = useState<any[]>([])
  const [customWaypoints, setCustomWaypoints] = useState(['', ''])
  const [customSuggestions, setCustomSuggestions] = useState<any[]>([])
  const [activeCustomInput, setActiveCustomInput] = useState<number | null>(null)
  const [generatingCustom, setGeneratingCustom] = useState(false)
  const [customGenerated, setCustomGenerated] = useState(false)
  const [customMiles, setCustomMiles] = useState(0)
  const [customMins, setCustomMins] = useState(0)
  const [customTurns, setCustomTurns] = useState<any[]>([])
  const [customRouteId, setCustomRouteId] = useState<string | null>(null)
  
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: cars } = await supabase.from('cars').select('*').eq('user_id', user.id).order('is_primary', { ascending: false })
        setUserCars(cars ?? [])
        if (cars && cars.length > 0) setSelectedCar(cars[0].id)
      }
      const { data: routes } = await supabase.from('routes').select('*').order('rating', { ascending: false })
      setDbRoutes(routes ?? [])
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
    const center = STATE_CENTERS[selectedStates[0]] || [-74.006, 40.7128]
    const res = await fetch('/api/places?query=' + encodeURIComponent(query) + '&lat=' + center[1] + '&lng=' + center[0])
    const data = await res.json()
    const places = (data.predictions ?? []).map((p: any) => ({
      name: p.structured_formatting?.main_text || p.description,
      address: p.structured_formatting?.secondary_text || '',
    }))
    type === 'meeting' ? setMeetingSuggestions(places) : setDestSuggestions(places)
  }

  const suggestMeetingPlaces = async () => {
    if (!selectedStates.length) return
    setLoadingSuggestions(true)
    const center = STATE_CENTERS[selectedStates[0]] || [-74.006, 40.7128]
    const searchTerm = character === 'breakfast' ? 'restaurant' : character === 'scenic' ? 'park' : 'restaurant'
    const res = await fetch('/api/places?query=' + encodeURIComponent(searchTerm) + '&lat=' + center[1] + '&lng=' + center[0])
    const data = await res.json()
    const places = (data.predictions ?? []).map((p: any) => ({
      name: p.structured_formatting?.main_text || p.description,
      address: p.structured_formatting?.secondary_text || '',
    }))
    setMeetingSuggestions(places)
    setLoadingSuggestions(false)
  }

  const searchCustomPlace = async (query: string, index: number) => {
    if (!query || query.length < 3) { setCustomSuggestions([]); return }
    setActiveCustomInput(index)
    const res = await fetch('/api/places?query=' + encodeURIComponent(query) + '&lat=41.6&lng=-73.0')
    const data = await res.json()
    const places = (data.predictions ?? []).map((p: any) => ({
      name: p.structured_formatting?.main_text || p.description,
      address: p.description,
    }))
    setCustomSuggestions(places)
  }

  const generateCustomRoute = async () => {
    const valid = customWaypoints.filter(wp => wp.trim())
    if (valid.length < 2) { alert('Please add at least a start and end point'); return }
    setGeneratingCustom(true)
      setMeetingPoint(valid[0])
setDestination(valid[valid.length - 1])
    const origin = encodeURIComponent(valid[0])
    const dest = encodeURIComponent(valid[valid.length - 1])
    const waypts = valid.slice(1, -1).map(w => encodeURIComponent(w)).join('|')
    const url = '/api/directions?origin=' + origin + '&destination=' + dest + (waypts ? '&waypoints=' + waypts : '')
    const res = await fetch(url)
    const data = await res.json()
    if (data.status === 'OK' && data.routes?.[0]) {
      const legs = data.routes[0].legs
      const totalMeters = legs.reduce((sum: number, leg: any) => sum + leg.distance.value, 0)
      const totalSeconds = legs.reduce((sum: number, leg: any) => sum + leg.duration.value, 0)
      const miles = Math.round(totalMeters * 0.000621371 * 10) / 10
      const mins = Math.round(totalSeconds / 60)
      setCustomMiles(miles)
      setCustomMins(mins)
      let cum = 0
      const turns: any[] = []
      legs.forEach((leg: any) => {
        leg.steps.forEach((step: any) => {
          cum += Math.round(step.distance.value * 0.000621371 * 100) / 100
          turns.push({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
            miles: Math.round(cum * 10) / 10,
            road: step.maneuver || 'continue',
          })
        })
      })
      setCustomTurns(turns)
      setCustomGenerated(true)

      // Save route to library
      if (user) {
        const { data: savedRoute } = await supabase.from('routes').insert({
          name: title || 'Custom drive route',
          states: selectedStates,
          miles,
          duration_mins: mins,
          character,
          rating: 0,
          drive_count: 0,
          is_curated: false,
          created_by: user.id,
          waypoints: valid.map(w => ({ name: w, address: w, lat: 0, lng: 0 })),
          turns,
        }).select().single()
        if (savedRoute) setCustomRouteId(savedRoute.id)
      }
    } else {
      alert('Could not generate route. Please check your waypoints.')
    }
    setGeneratingCustom(false)
  }
  
  const handlePublish = async () => {
    if (!user || !driveDate) return
    setSaving(true)
    const driveTitle = title || (character.charAt(0).toUpperCase() + character.slice(1) + ' drive')
    const { data, error } = await supabase.from('drives').insert({
      title: driveTitle, type: driveType, character, visibility,
      drive_date: driveDate, depart_time: driveTime,
      meeting_point: meetingPoint || null,
      destination: destination || null,
      states: selectedStates, organizer_id: user.id,
      max_spots: parseInt(maxSpots) || null,
      description: description || null,
      route_id: customRouteId || selectedRoute || null,
    }).select().single()
    setSaving(false)
    if (error) { alert(JSON.stringify(error)); return }
    if (data) router.push('/drives/' + data.id)
  }

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => step === -1 ? router.back() : step === 0 ? setStep(-1) : setStep(s => s - 1)

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

      {step === -1 && (
        <div className="animate-slide-up space-y-6">
          <div>
            <h2 className="font-display text-3xl text-white mb-1">Create a drive</h2>
            <p className="text-gray-500 text-sm">How would you like to plan your route?</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button onClick={() => setStep(0)}
              className="card p-6 text-left hover:border-gold-400 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-gold-400/30 flex items-center justify-center flex-shrink-0">
                  <MapPin size={22} className="text-gold-400" />
                </div>
                <div>
                  <div className="font-display text-xl text-white mb-1 group-hover:text-gold-400 transition-colors">Choose an existing route</div>
                  <div className="text-sm text-gray-500 leading-relaxed">Pick from our curated route library or community favourites. Set the date, invite friends and go.</div>
                </div>
              </div>
            </button>

            <button onClick={() => setStep(-2)}
              className="card p-6 text-left hover:border-gold-400 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-center justify-center flex-shrink-0">
                  <Navigation size={22} className="text-blue-400" />
                </div>
                <div>
                  <div className="font-display text-xl text-white mb-1 group-hover:text-gold-400 transition-colors">Create my own route</div>
                  <div className="text-sm text-gray-500 leading-relaxed">Plan a custom route with your own waypoints. Google Maps generates the turn-by-turn. Your route is saved to the community library.</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

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

     {step === -2 && (
        <div className="animate-slide-up space-y-6">
          <div>
            <h2 className="font-display text-3xl text-white mb-1">Plan your route</h2>
            <p className="text-gray-500 text-sm">Add your waypoints and we'll generate turn-by-turn directions</p>
          </div>

          {/* Waypoints */}
          <div>
            <p className="section-label mb-3">Waypoints</p>
            <div className="space-y-2">
              {customWaypoints.map((wp, i) => (
                <div key={i} className="relative">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      i === 0 ? 'bg-green-900 text-green-400' :
                      i === customWaypoints.length - 1 ? 'bg-amber-900 text-gold-400' :
                      'bg-surface border border-surface-border text-gray-500'
                    }`}>
                      {i === 0 ? '▶' : i === customWaypoints.length - 1 ? '⚑' : i}
                    </div>
                    <input type="text"
                      placeholder={i === 0 ? 'Start point...' : i === customWaypoints.length - 1 ? 'End point...' : 'Via...'}
                      value={wp}
                      onChange={e => {
                        const updated = [...customWaypoints]
                        updated[i] = e.target.value
                        setCustomWaypoints(updated)
                        searchCustomPlace(e.target.value, i)
                      }}
                      className="input-dark flex-1" />
                    {customWaypoints.length > 2 && i !== 0 && i !== customWaypoints.length - 1 && (
                      <button onClick={() => setCustomWaypoints(customWaypoints.filter((_, idx) => idx !== i))}
                        className="text-gray-500 hover:text-white">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  {activeCustomInput === i && customSuggestions.length > 0 && (
                    <div className="absolute top-full left-8 right-0 z-50 mt-1 card divide-y divide-surface-border shadow-xl">
                      {customSuggestions.map((place, si) => (
                        <button key={si} onClick={() => {
                          const updated = [...customWaypoints]
                          updated[i] = place.address
                          setCustomWaypoints(updated)
                          setCustomSuggestions([])
                          setActiveCustomInput(null)
                        }} className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors">
                          <div className="text-sm text-white font-medium">{place.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate">{place.address}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setCustomWaypoints([...customWaypoints.slice(0, -1), '', customWaypoints[customWaypoints.length - 1]])}
              className="mt-2 flex items-center gap-2 text-xs text-gold-400 hover:text-gold-200 transition-colors">
              <Plus size={12} /> Add a stop
            </button>
          </div>

          <button onClick={generateCustomRoute} disabled={generatingCustom}
            className="w-full btn-outline flex items-center justify-center gap-2 disabled:opacity-50">
            <Navigation size={15} />
            {generatingCustom ? 'Generating...' : 'Generate turn-by-turn directions'}
          </button>

          {customGenerated && (
            <div className="card p-4">
              <div className="text-sm font-medium text-white mb-1">Route generated ✓</div>
              <div className="text-xs text-gray-500">{customMiles} miles · {Math.round(customMins / 60 * 10) / 10} hours · {customTurns.length} turns</div>
            </div>
          )}

          <button onClick={() => setStep(3)} disabled={!customGenerated}
            className="w-full btn-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {customGenerated && customTurns.length > 0 && (
  <div className="card p-4">
    <p className="section-label mb-3">Route preview</p>
    <div className="max-h-48 overflow-y-auto divide-y divide-surface-border">
      {customTurns.slice(0, 6).map((turn: any, i: number) => (
        <div key={i} className="flex items-start gap-3 py-2">
          <div className="w-12 text-right flex-shrink-0">
            <div className="text-xs font-mono text-gold-400">{turn.miles} mi</div>
          </div>
          <div className="text-xs text-gray-300">{turn.instruction}</div>
        </div>
      ))}
      {customTurns.length > 6 && (
        <div className="py-2 text-center text-xs text-gray-500">+{customTurns.length - 6} more turns</div>
      )}
    </div>
  </div>
)}
            Next — Drive details <ArrowRight size={15} />
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
                With <span className="text-gold-400">{selectedStates.join(' + ')}</span> selected, we will find scenic roads across the area.
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
            <p className="text-gray-500 text-sm">Tap a route to preview before selecting</p>
          </div>
          {dbRoutes.map(route => (
            <button key={route.id} onClick={() => setPreviewRoute(route)}
              className={clsx('w-full text-left rounded-card border overflow-hidden transition-all',
                selectedRoute === route.id ? 'border-gold-400' : 'border-surface-border hover:border-gray-600'
              )}>
              <div className="h-16 map-placeholder" />
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div className="font-medium text-sm text-white">{route.name}</div>
                  {selectedRoute === route.id && <Check size={16} className="text-gold-400 flex-shrink-0" />}
                </div>
                <div className="text-xs text-gray-600 mb-2">{route.miles} mi · {Math.round((route.duration_mins || 0) / 60 * 10) / 10}h · {(route.states ?? []).join(', ')}</div>
                <div className="flex gap-2 flex-wrap">
                  {route.rating > 0 && <span className="pill-green">★ {route.rating}</span>}
                  {(route.character ?? []).map((c: string) => <span key={c} className="pill-gold capitalize">{c}</span>)}
                </div>
              </div>
            </button>
          ))}

          {/* Route preview modal */}
          {previewRoute && (
            <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setPreviewRoute(null)}>
              <div className="w-full max-w-2xl bg-surface-raised rounded-t-3xl overflow-hidden animate-slide-up max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}>
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-surface-border" />
                </div>

                {/* Map preview */}
                <div className="h-44 map-placeholder relative mx-4 rounded-xl overflow-hidden mb-4">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <h2 className="font-display text-2xl text-white">{previewRoute.name}</h2>
                  </div>
                  {previewRoute.is_curated && (
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-950/80 text-gold-400 border border-gold-400/20">Curated</span>
                    </div>
                  )}
                </div>

                <div className="px-4 pb-6 space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Distance', value: previewRoute.miles + ' mi' },
                      { label: 'Duration', value: Math.round((previewRoute.duration_mins || 0) / 60 * 10) / 10 + 'h' },
                      { label: 'Rating', value: previewRoute.rating > 0 ? '★ ' + previewRoute.rating : 'New' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-surface border border-surface-border rounded-xl p-3 text-center">
                        <div className="font-mono text-sm font-medium text-gold-400">{value}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Character tags */}
                  <div className="flex gap-2 flex-wrap">
                    {(previewRoute.character ?? []).map((c: string) => (
                      <span key={c} className="pill-gold capitalize">{c}</span>
                    ))}
                    {(previewRoute.states ?? []).map((s: string) => (
                      <span key={s} className="pill" style={{ background: '#1a1a1a', color: '#888' }}>{s}</span>
                    ))}
                    {previewRoute.drive_count > 0 && (
                      <span className="pill" style={{ background: '#1a1a1a', color: '#888' }}>{previewRoute.drive_count} drives</span>
                    )}
                  </div>

                  {/* Description */}
                  {previewRoute.description && (
                    <p className="text-sm text-gray-400 leading-relaxed">{previewRoute.description}</p>
                  )}

                  {/* Waypoints */}
                  {(previewRoute.waypoints ?? []).length > 0 && (
                    <div>
                      <p className="section-label mb-2">Waypoints</p>
                      <div className="card divide-y divide-surface-border">
                        {(previewRoute.waypoints ?? []).map((wp: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                              i === 0 ? 'bg-green-900 text-green-400' :
                              i === previewRoute.waypoints.length - 1 ? 'bg-amber-900 text-gold-400' :
                              'bg-surface border border-surface-border text-gray-500'
                            }`}>
                              {i === 0 ? '▶' : i === previewRoute.waypoints.length - 1 ? '⚑' : i}
                            </div>
                            <div className="text-sm text-white">{wp.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setPreviewRoute(null)}
                      className="flex-1 btn-outline">
                      Back
                    </button>
                    <button onClick={() => { setSelectedRoute(previewRoute.id); setPreviewRoute(null) }}
                      className="flex-1 btn-gold flex items-center justify-center gap-2">
                      <Check size={15} /> Select this route
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button onClick={next} className="w-full btn-gold flex items-center justify-center gap-2">
            Next — Details and publish <ArrowRight size={15} />
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
            <input type="text" placeholder="Name your drive"
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
            <p className="section-label mb-3">Date and time</p>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={driveDate} onChange={e => setDriveDate(e.target.value)} 
  min={new Date().toISOString().split('T')[0]}
  className="input-dark" />
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
                  <button key={i}
                    onClick={() => { setMeetingPoint(place.name + ', ' + place.address); setMeetingSuggestions([]) }}
                    className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors">
                    <div className="text-sm text-white font-medium">{place.name}</div>
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
                    <button key={i}
                      onClick={() => { setDestination(place.name + ', ' + place.address); setDestSuggestions([]) }}
                      className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors">
                      <div className="text-sm text-white font-medium">{place.name}</div>
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
