'use client'
import { useState, useEffect } from 'react'
import { Plus, Check, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import clsx from 'clsx'

const MAKES = ['Aston Martin', 'Porsche', 'Ferrari', 'Land Rover', 'INEOS', 'BMW', 'Mercedes', 'Lamborghini', 'McLaren', 'Other']
const CLUBS = ['AMOC', 'PCA', 'Ferrari Club', 'Defender Club', 'Grenadier Club', 'None']

const COLOR_MAP: Record<string, string> = {
  'Midnight Blue': '#1a1a3a', 'Racing Green': '#0f2a0f', 'Guards Red': '#8a1a1a',
  'Silver': '#888', 'Black': '#111', 'White': '#eee', 'Yellow': '#c8a800',
  'Orange': '#c85000', 'Cavalry Green': '#2a4a1a', 'Onyx Black': '#1a1a1a',
}

export default function GaragePage() {
  const [user, setUser] = useState<any>(null)
  const [cars, setCars] = useState<any[]>([])
  const [showAddCar, setShowAddCar] = useState(false)
  const [loading, setLoading] = useState(true)
  const [make, setMake] = useState('Aston Martin')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [spec, setSpec] = useState('')
  const [nickname, setNickname] = useState('')
  const [club, setClub] = useState('None')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: userCars } = await supabase.from('cars').select('*').eq('user_id', user.id).order('is_primary', { ascending: false })
        setCars(userCars ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleAddCar = async () => {
    if (!user || !make || !model || !year) return
    setSaving(true)
    const colorHex = COLOR_MAP[color] || '#1a1a1a'
    const isPrimary = cars.length === 0
    const { data, error } = await supabase.from('cars').insert({
      user_id: user.id,
      make, model,
      year: parseInt(year),
      color: color || null,
      color_hex: colorHex,
      spec: spec || null,
      nickname: nickname || null,
      club_name: club === 'None' ? null : club,
      club_badge: club === 'None' ? 'none' : 'self-declared',
      is_primary: isPrimary,
    }).select().single()
    setSaving(false)
    if (!error && data) {
      setCars(prev => [...prev, data])
      setShowAddCar(false)
      setMake('Aston Martin'); setModel(''); setYear(''); setColor(''); setSpec(''); setNickname(''); setClub('None')
    }
  }

  const name = user?.user_metadata?.name || user?.email || 'My Profile'
  const initials = name.split(' ').length >= 2
    ? `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase()

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">

      <div className="flex items-start gap-6 mb-10">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium flex-shrink-0"
          style={{ background: '#1e1a0e', border: '2px solid #C9A84C', color: '#C9A84C' }}>
          {initials}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-4xl text-white mb-1">{name}</h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: 'Cars', value: cars.length },
          { label: 'Drives', value: 0 },
          { label: 'Miles', value: 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface-raised border border-surface-border rounded-xl p-4">
            <div className="font-mono text-2xl font-medium text-gold-400">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="section-label">My garage</h2>
        <button onClick={() => setShowAddCar(true)} className="flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-200 transition-colors">
          <Plus size={13} /> Add car
        </button>
      </div>

      {cars.length === 0 ? (
        <button onClick={() => setShowAddCar(true)}
          className="w-full border border-dashed border-surface-border rounded-card p-10 flex flex-col items-center justify-center gap-3 text-gray-500 hover:border-gold-400 hover:text-gold-400 transition-all mb-6">
          <Plus size={24} />
          <div className="text-center">
            <div className="font-medium mb-1">Add your first car</div>
            <div className="text-xs text-gray-600">Your car is your identity on every drive</div>
          </div>
        </button>
      ) : (
        <div className="space-y-4 mb-6">
          {cars.map(car => (
            <div key={car.id} className="card overflow-hidden">
              <div className="h-24 flex items-center justify-center px-6" style={{ background: `${car.color_hex || '#1a1a1a'}30` }}>
                <div className="text-center">
                  <div className="font-display text-xl text-white">{car.year} {car.make} {car.model}</div>
                  {car.color && <div className="text-sm text-gray-500 mt-1">{car.color}</div>}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 flex-wrap">
                  {car.is_primary && <span className="text-xs text-gold-400 font-medium">Primary car</span>}
                  {car.club_name && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#1a1028', color: '#c080e0' }}>
                      {car.club_badge === 'verified' && <Check size={8} />}
                      {car.club_name}{car.club_badge === 'self-declared' && ' · self-declared'}
                    </span>
                  )}
                </div>
                {car.spec && <div className="text-xs text-gray-600 mt-2">{car.spec}</div>}
                {car.club_badge === 'self-declared' && (
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-surface-border text-xs text-gray-500 mt-3">
                    <Shield size={13} className="text-gray-600" />
                    Club self-declared — upload proof to get verified badge
                  </div>
                )}
              </div>
            </div>
          ))}
          <button onClick={() => setShowAddCar(true)}
            className="w-full border border-dashed border-surface-border rounded-card p-6 flex items-center justify-center gap-3 text-gray-500 hover:border-gold-400 hover:text-gold-400 transition-all">
            <Plus size={18} />
            <span className="text-sm font-medium">Add another car</span>
          </button>
        </div>
      )}

      {showAddCar && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md card p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl text-white">Add a car</h3>
              <button onClick={() => setShowAddCar(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>

            <p className="section-label mb-3">Make</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {MAKES.map(m => (
                <button key={m} onClick={() => setMake(m)}
                  className={clsx('py-2.5 rounded-xl text-xs border transition-all',
                    make === m ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border text-gray-500 hover:border-gray-500'
                  )}>{m}</button>
              ))}
            </div>

            <div className="space-y-3 mb-5">
              <input type="text" placeholder="Model (e.g. DB11 V8)" value={model} onChange={e => setModel(e.target.value)} className="input-dark" />
              <input type="text" placeholder="Year (e.g. 2021)" value={year} onChange={e => setYear(e.target.value)} className="input-dark" />
              <input type="text" placeholder="Colour (e.g. Midnight Blue)" value={color} onChange={e => setColor(e.target.value)} className="input-dark" />
              <input type="text" placeholder="Spec / trim (optional)" value={spec} onChange={e => setSpec(e.target.value)} className="input-dark" />
              <input type="text" placeholder="Nickname (optional)" value={nickname} onChange={e => setNickname(e.target.value)} className="input-dark" />
            </div>

            <p className="section-label mb-3">Club membership</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {CLUBS.map(c => (
                <button key={c} onClick={() => setClub(c)}
                  className={clsx('py-2.5 rounded-xl text-xs border transition-all',
                    club === c ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border text-gray-500 hover:border-gray-500'
                  )}>{c}</button>
              ))}
            </div>

            <button onClick={handleAddCar} disabled={saving || !make || !model || !year}
              className="w-full btn-gold disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Adding...' : 'Add to garage'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
