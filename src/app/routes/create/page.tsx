'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, Flag, MapPin, Navigation } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import clsx from 'clsx'

const CHARACTERS = ['spirited', 'leisurely', 'scenic', 'breakfast', 'sunset']
const NE_STATES = ['NY', 'CT', 'VT', 'MA', 'NH', 'ME', 'NJ', 'PA']
const MID_STATES = ['VA', 'MD', 'NC', 'SC', 'TN', 'WV']

interface Waypoint {
  name: string
  address: string
  lat: number
  lng: number
}

interface Turn {
  instruction: string
  miles: number
  road: string
}

export default function CreateRoutePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [character, setCharacter] = useState<string[]>([])
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { name: '', address: '', lat: 0, lng: 0 },
    { name: '', address: '', lat: 0, lng: 0 },
  ])
  const [turns, setTurns] = useState<Turn[]>([])
  const [totalMiles, setTotalMiles] = useState(0)
  const [totalMins, setTotalMins] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [activeInput, setActiveInput] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
    }
    load()
  }, [])

  const searchAddress = async (query: string, index: number) => {
    if (!query || query.length < 3) { setSuggestions([]); return }
    setActiveInput(index)
    const wp = waypoints[index]
    const lat = wp.lat || 41.6
    const lng = wp.lng || -73.0
    const res = await fetch('/api/places?query=' + encodeURIComponent(query) + '&lat=' + lat + '&lng=' + lng)
    const data = await res.json()
    const places = (data.predictions ?? []).map((p: any) => ({
      name: p.structured_formatting?.main_text || p.description,
      address: p.description,
    }))
    setSuggestions(places)
  }

  const selectPlace = async (place: any, index: number) => {
    // Geocode the address to get lat/lng
    const res = await fetch('/api/places?query=' + encodeURIComponent(place.address) + '&lat=41.6&lng=-73.0')
    const data = await res.json()
    const prediction = data.predictions?.[0]
    const newWaypoints = [...waypoints]
    newWaypoints[index] = {
      name: place.name,
      address: place.address,
      lat: 41.6, // Will be updated when we generate route
      lng: -73.0,
    }
    setWaypoints(newWaypoints)
    setSuggestions([])
    setActiveInput(null)
  }

  const updateWaypoint = (index: number, value: string) => {
    const newWaypoints = [...waypoints]
    newWaypoints[index] = { ...newWaypoints[index], name: value, address: value }
    setWaypoints(newWaypoints)
    searchAddress(value, index)
  }

  const addWaypoint = () => {
    setWaypoints([...waypoints.slice(0, -1), { name: '', address: '', lat: 0, lng: 0 }, waypoints[waypoints.length - 1]])
  }

  const removeWaypoint = (index: number) => {
    if (waypoints.length <= 2) return
    setWaypoints(waypoints.filter((_, i) => i !== index))
  }

  const toggleCharacter = (c: string) => {
    setCharacter(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  const toggleState = (s: string) => {
    setSelectedStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const generateRoute = async () => {
    const validWaypoints = waypoints.filter(wp => wp.address.trim())
    if (validWaypoints.length < 2) {
      alert('Please add at least a start and end point')
      return
    }
    setGenerating(true)

    const origin = encodeURIComponent(validWaypoints[0].address)
    const destination = encodeURIComponent(validWaypoints[validWaypoints.length - 1].address)
    const waypts = validWaypoints.slice(1, -1).map(wp => encodeURIComponent(wp.address)).join('|')

    const url = '/api/directions?origin=' + origin + '&destination=' + destination + (waypts ? '&waypoints=' + waypts : '')
    const res = await fetch(url)
    const data = await res.json()

    if (data.status === 'OK' && data.routes?.[0]) {
      const route = data.routes[0]
      const legs = route.legs

      // Calculate totals
      const totalMeters = legs.reduce((sum: number, leg: any) => sum + leg.distance.value, 0)
      const totalSeconds = legs.reduce((sum: number, leg: any) => sum + leg.duration.value, 0)
      setTotalMiles(Math.round(totalMeters * 0.000621371 * 10) / 10)
      setTotalMins(Math.round(totalSeconds / 60))

      // Extract turn by turn
      let cumulativeMiles = 0
      const allTurns: Turn[] = []
      legs.forEach((leg: any) => {
        leg.steps.forEach((step: any) => {
          const stepMiles = Math.round(step.distance.value * 0.000621371 * 100) / 100
          cumulativeMiles += stepMiles
          // Strip HTML from instructions
          const instruction = step.html_instructions.replace(/<[^>]*>/g, '')
          allTurns.push({
            instruction,
            miles: Math.round(cumulativeMiles * 10) / 10,
            road: step.maneuver || 'continue',
          })
        })
      })
      setTurns(allTurns)
      setGenerated(true)
    } else {
      alert('Could not generate route. Please check your waypoints and try again.')
    }
    setGenerating(false)
  }

  const handleSave = async () => {
    if (!user || !name || !generated) return
    setSaving(true)
    const validWaypoints = waypoints.filter(wp => wp.address.trim())
    
    const { data, error } = await supabase.from('routes').insert({
      name,
      description: description || null,
      states: selectedStates,
      start_point: validWaypoints[0]?.name || validWaypoints[0]?.address,
      end_point: validWaypoints[validWaypoints.length - 1]?.name || validWaypoints[validWaypoints.length - 1]?.address,
      miles: totalMiles,
      duration_mins: totalMins,
      character,
      rating: 0,
      drive_count: 0,
      is_curated: false,
      created_by: user.id,
      waypoints: validWaypoints,
      turns,
    }).select().single()

    setSaving(false)
    if (error) { alert(JSON.stringify(error)); return }
    if (data) router.push('/routes/' + data.id)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/routes')}
          className="w-9 h-9 rounded-xl bg-surface-raised border border-surface-border flex items-center justify-center hover:border-gray-500 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="font-display text-2xl text-white">Plan a route</h1>
          <p className="text-xs text-gray-500 mt-0.5">Build your own scenic drive</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Route name */}
        <div>
          <p className="section-label mb-2">Route name</p>
          <input type="text" placeholder="e.g. Litchfield Hills Sunday Run"
            value={name} onChange={e => setName(e.target.value)} className="input-dark" />
        </div>

        {/* Waypoints */}
        <div>
          <p className="section-label mb-3">Waypoints</p>
          <div className="space-y-2">
            {waypoints.map((wp, i) => (
              <div key={i} className="relative">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    i === 0 ? 'bg-green-900 text-green-400' :
                    i === waypoints.length - 1 ? 'bg-amber-900 text-gold-400' :
                    'bg-surface border border-surface-border text-gray-500'
                  }`}>
                    {i === 0 ? '▶' : i === waypoints.length - 1 ? '⚑' : i}
                  </div>
                  <input
                    type="text"
                    placeholder={i === 0 ? 'Start point...' : i === waypoints.length - 1 ? 'End point...' : 'Via...'}
                    value={wp.name}
                    onChange={e => updateWaypoint(i, e.target.value)}
                    className="input-dark flex-1"
                  />
                  {waypoints.length > 2 && i !== 0 && i !== waypoints.length - 1 && (
                    <button onClick={() => removeWaypoint(i)}
                      className="text-gray-500 hover:text-white flex-shrink-0">
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Suggestions dropdown */}
                {activeInput === i && suggestions.length > 0 && (
                  <div className="absolute top-full left-8 right-0 z-50 mt-1 card divide-y divide-surface-border shadow-xl">
                    {suggestions.map((place, si) => (
                      <button key={si} onClick={() => selectPlace(place, i)}
                        className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors">
                        <div className="text-sm text-white font-medium">{place.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{place.address}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={addWaypoint}
            className="mt-2 flex items-center gap-2 text-xs text-gold-400 hover:text-gold-200 transition-colors">
            <Plus size={12} /> Add a stop
          </button>
        </div>

        {/* Character */}
        <div>
          <p className="section-label mb-3">Drive character</p>
          <div className="flex flex-wrap gap-2">
            {CHARACTERS.map(c => (
              <button key={c} onClick={() => toggleCharacter(c)}
                className={clsx('px-4 py-2 rounded-full text-xs font-medium border transition-all capitalize',
                  character.includes(c) ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border text-gray-500 hover:border-gray-500'
                )}>{c}</button>
            ))}
          </div>
        </div>

        {/* States */}
        <div>
          <p className="section-label mb-3">States</p>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {NE_STATES.map(s => (
              <button key={s} onClick={() => toggleState(s)}
                className={clsx('py-2.5 rounded-xl text-xs font-medium border transition-all',
                  selectedStates.includes(s) ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border text-gray-500 hover:border-gray-500'
                )}>{s}</button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {MID_STATES.map(s => (
              <button key={s} onClick={() => toggleState(s)}
                className={clsx('py-2.5 rounded-xl text-xs font-medium border transition-all',
                  selectedStates.includes(s) ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border text-gray-500 hover:border-gray-500'
                )}>{s}</button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="section-label mb-2">Description (optional)</p>
          <textarea placeholder="Tell people what makes this route special..."
            value={description} onChange={e => setDescription(e.target.value)}
            rows={3} className="input-dark resize-none" />
        </div>

        {/* Generate button */}
        <button onClick={generateRoute} disabled={generating}
          className="w-full btn-outline flex items-center justify-center gap-2 disabled:opacity-50">
          <Navigation size={15} />
          {generating ? 'Generating route...' : 'Generate turn-by-turn directions'}
        </button>

        {/* Generated route preview */}
        {generated && (
          <div className="card p-5 animate-slide-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-white mb-1">Route generated</div>
                <div className="text-xs text-gray-500">{totalMiles} miles · {Math.round(totalMins / 60 * 10) / 10} hours</div>
              </div>
              <span className="pill-green">✓ Ready</span>
            </div>

            {turns.length > 0 && (
              <div>
                <p className="section-label mb-2">Turn by turn ({turns.length} steps)</p>
                <div className="max-h-48 overflow-y-auto space-y-0 card divide-y divide-surface-border">
                  {turns.slice(0, 8).map((turn, i) => (
                    <div key={i} className="flex items-start gap-3 p-3">
                      <div className="w-12 text-right flex-shrink-0">
                        <div className="text-xs font-mono text-gold-400">{turn.miles} mi</div>
                      </div>
                      <div className="text-xs text-gray-300">{turn.instruction}</div>
                    </div>
                  ))}
                  {turns.length > 8 && (
                    <div className="p-3 text-center text-xs text-gray-500">
                      +{turns.length - 8} more steps saved
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save button */}
        <button onClick={handleSave} disabled={saving || !name || !generated}
          className="w-full btn-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {saving ? 'Saving...' : 'Save route'} <Flag size={15} />
        </button>
      </div>
    </div>
  )
}
