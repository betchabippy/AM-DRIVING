'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Navigation, Milestone, ChevronRight, ChevronLeft, Flag, Wifi, WifiOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Mode = 'select' | 'gps' | 'odometer'

export default function NavigatePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [route, setRoute] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<Mode>('select')
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
  const [gpsAvailable, setGpsAvailable] = useState(false)
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [distanceToNext, setDistanceToNext] = useState<number | null>(null)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const watchRef = useRef<number | null>(null)

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data } = await supabase.from('routes').select('*').eq('id', id).maybeSingle()
      setRoute(data)
      setLoading(false)
    }
    load()
    // Check GPS availability
    if ('geolocation' in navigator) setGpsAvailable(true)
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
    }
  }, [id])

  const turns = route?.turns ?? []
  const waypoints = route?.waypoints ?? []
  const currentTurn = turns[currentTurnIndex]
  const nextTurn = turns[currentTurnIndex + 1]

  const startGPS = () => {
    setMode('gps')
    setStarted(true)
    setCurrentTurnIndex(0)
    if (!navigator.geolocation) return

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserPosition({ lat: latitude, lng: longitude })
        // Check distance to next waypoint
        if (waypoints[currentTurnIndex + 1]) {
          const wp = waypoints[currentTurnIndex + 1]
          const dist = getDistanceMiles(latitude, longitude, wp.lat, wp.lng)
          setDistanceToNext(dist)
          // Auto advance if within 0.1 miles
          if (dist < 0.1 && currentTurnIndex < turns.length - 1) {
            setCurrentTurnIndex(prev => prev + 1)
          }
        }
      },
      (err) => console.error('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    )
  }

  const startOdometer = () => {
    setMode('odometer')
    setStarted(true)
    setCurrentTurnIndex(0)
  }

  const nextStep = () => {
    if (currentTurnIndex < turns.length - 1) {
      setCurrentTurnIndex(prev => prev + 1)
    } else {
      setFinished(true)
    }
  }

  const prevStep = () => {
    if (currentTurnIndex > 0) setCurrentTurnIndex(prev => prev - 1)
  }

  const getDistanceMiles = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3958.8
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>
  if (!route) return <div className="flex items-center justify-center h-screen text-gray-500">Route not found</div>

  // Finished screen
  if (finished) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-green-900/40 border border-green-700 flex items-center justify-center mx-auto mb-6">
          <Flag size={32} className="text-green-400" />
        </div>
        <h2 className="font-display text-4xl text-white mb-3">You made it!</h2>
        <p className="text-gray-500 text-sm mb-2">{route.name}</p>
        <p className="text-gray-600 text-sm mb-8">{route.miles} miles completed</p>
        <button onClick={() => router.push('/routes/' + id)} className="btn-gold w-full">
          Back to route
        </button>
      </div>
    </div>
  )

  // Mode selection screen
  if (mode === 'select') return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <button onClick={() => router.push('/routes/' + id)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-white mb-2">Let's Go</h1>
          <p className="text-gray-500 text-sm">{route.name}</p>
          <p className="text-gray-600 text-xs mt-1">{route.miles} miles · {turns.length} turns</p>
        </div>

        <div className="space-y-4">
          {/* GPS Mode */}
          <button onClick={startGPS}
            className={`w-full card p-5 text-left hover:border-gold-400 transition-all ${!gpsAvailable ? 'opacity-50' : ''}`}
            disabled={!gpsAvailable}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center flex-shrink-0">
                {gpsAvailable ? <Navigation size={20} className="text-blue-400" /> : <WifiOff size={20} className="text-gray-600" />}
              </div>
              <div>
                <div className="font-medium text-white mb-1">GPS Mode</div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  {gpsAvailable
                    ? 'Phone tracks your position. Turns surface automatically as you approach them.'
                    : 'GPS not available on this device.'}
                </div>
              </div>
            </div>
          </button>

          {/* Odometer Mode */}
          <button onClick={startOdometer} className="w-full card p-5 text-left hover:border-gold-400 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center flex-shrink-0">
                <Milestone size={20} className="text-gold-400" />
              </div>
              <div>
                <div className="font-medium text-white mb-1">Odometer Mode</div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  Set your trip meter to zero. Tap next turn as you complete each step. Works anywhere — no signal needed.
                </div>
              </div>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Keep your phone mounted and visible while driving
        </p>
      </div>
    </div>
  )

  // Active navigation screen (GPS or Odometer)
  return (
    <div className="min-h-screen flex flex-col bg-base">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 bg-base border-b border-surface-border flex items-center justify-between">
        <button onClick={() => { 
          if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
          setMode('select'); setStarted(false); setCurrentTurnIndex(0)
        }} className="text-gray-500 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <div className="text-xs text-gray-500">{route.name}</div>
          <div className="text-xs text-gray-600">{currentTurnIndex + 1} of {turns.length} steps</div>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {mode === 'gps' ? (
            <span className="text-blue-400 flex items-center gap-1"><Wifi size={12} /> GPS</span>
          ) : (
            <span className="text-gold-400 flex items-center gap-1"><Milestone size={12} /> ODO</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-surface-border">
        <div className="h-1 bg-gold-400 transition-all" style={{ width: ((currentTurnIndex + 1) / turns.length * 100) + '%' }} />
      </div>

      {/* Main turn display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {currentTurn && (
          <>
            {/* Mile marker */}
            <div className="mb-6 text-center">
              <div className="text-5xl font-mono font-medium text-gold-400 mb-1">{currentTurn.miles}</div>
              <div className="text-sm text-gray-500">miles</div>
            </div>

            {/* Instruction */}
            <div className="text-center mb-8">
              <div className="font-display text-3xl text-white leading-tight mb-3">{currentTurn.instruction}</div>
            </div>

            {/* Distance to next in GPS mode */}
            {mode === 'gps' && distanceToNext !== null && (
              <div className="card px-6 py-3 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-mono font-medium text-blue-400">{distanceToNext.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">miles to next turn</div>
                </div>
              </div>
            )}

            {/* Next turn preview */}
            {nextTurn && (
              <div className="w-full card p-4 mb-6 opacity-60">
                <div className="text-xs text-gray-500 mb-1">Then at {nextTurn.miles} mi</div>
                <div className="text-sm text-gray-300">{nextTurn.instruction}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 pb-8 pt-4 border-t border-surface-border">
        {mode === 'odometer' ? (
          <div className="flex gap-3">
            <button onClick={prevStep} disabled={currentTurnIndex === 0}
              className="btn-outline flex items-center gap-2 disabled:opacity-30">
              <ChevronLeft size={16} /> Prev
            </button>
            <button onClick={nextStep}
              className="flex-1 btn-gold flex items-center justify-center gap-2">
              {currentTurnIndex === turns.length - 1 ? (
                <><Flag size={15} /> Finish</>
              ) : (
                <>Next turn <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-3">GPS is tracking your position automatically</p>
            <button onClick={nextStep} className="btn-outline text-xs px-6">
              Skip to next turn
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
