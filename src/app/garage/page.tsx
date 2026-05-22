'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Check, Shield, Circle } from 'lucide-react'
import { mockUser } from '@/lib/mock-data'
import type { Car } from '@/types'
import clsx from 'clsx'

function CarSilhouette({ car }: { car: Car }) {
  const isOffRoad = car.make === 'INEOS' || car.model.includes('Defender')
  if (isOffRoad) {
    return (
      <svg viewBox="0 0 280 100" className="w-full h-full">
        <rect width="280" height="100" fill="transparent"/>
        <ellipse cx="60" cy="78" rx="18" ry="10" fill="rgba(255,255,255,0.15)"/>
        <ellipse cx="220" cy="78" rx="18" ry="10" fill="rgba(255,255,255,0.15)"/>
        <ellipse cx="60" cy="78" rx="10" ry="6" fill="rgba(255,255,255,0.1)"/>
        <ellipse cx="220" cy="78" rx="10" ry="6" fill="rgba(255,255,255,0.1)"/>
        <path d="M 35 70 L 35 40 L 55 28 L 225 28 L 245 40 L 245 70 Z" fill={car.colorHex} opacity="0.9"/>
        <rect x="55" y="30" width="50" height="24" rx="2" fill="rgba(0,0,0,0.4)"/>
        <rect x="110" y="30" width="45" height="24" rx="2" fill="rgba(0,0,0,0.4)"/>
        <rect x="160" y="30" width="44" height="24" rx="2" fill="rgba(0,0,0,0.4)"/>
        <rect x="36" y="44" width="16" height="10" rx="1" fill="rgba(255,255,255,0.15)"/>
        <rect x="228" y="44" width="16" height="10" rx="1" fill="rgba(255,255,255,0.15)"/>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 280 100" className="w-full h-full">
      <rect width="280" height="100" fill="transparent"/>
      <ellipse cx="65" cy="80" rx="22" ry="12" fill="rgba(255,255,255,0.15)"/>
      <ellipse cx="215" cy="80" rx="22" ry="12" fill="rgba(255,255,255,0.15)"/>
      <ellipse cx="65" cy="80" rx="12" ry="7" fill="rgba(255,255,255,0.1)"/>
      <ellipse cx="215" cy="80" rx="12" ry="7" fill="rgba(255,255,255,0.1)"/>
      <path d="M 28 72 L 40 48 Q 62 24 106 20 Q 135 18 164 20 Q 200 24 218 40 L 252 72 Z" fill={car.colorHex} opacity="0.9"/>
      <path d="M 55 48 Q 82 30 135 28 Q 175 27 200 40 L 215 48 Z" fill="rgba(0,0,0,0.35)"/>
      <path d="M 95 48 L 100 29 L 170 29 L 175 48 Z" fill="rgba(0,0,0,0.3)"/>
      <line x1="135" y1="29" x2="135" y2="48" stroke="rgba(0,0,0,0.3)" strokeWidth="1"/>
      <rect x="28" y="58" width="14" height="9" rx="1" fill="rgba(201,168,76,0.7)"/>
      <rect x="238" y="58" width="14" height="9" rx="1" fill="rgba(226,75,74,0.7)"/>
    </svg>
  )
}

function ClubBadgeChip({ badge, club }: { badge: Car['clubBadge']; club?: string }) {
  if (!club || badge === 'none') return null
  return (
    <span className={clsx(
      'flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium',
      badge === 'verified' ? '' : 'opacity-70'
    )} style={{ background: '#1a1028', color: '#c080e0' }}>
      {badge === 'verified' && <Check size={8} />}
      {club}
      {badge === 'self-declared' && ' (self-declared)'}
    </span>
  )
}

export default function GaragePage() {
  const [showAddCar, setShowAddCar] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">

      {/* Profile header */}
      <div className="flex items-start gap-6 mb-10">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium flex-shrink-0"
          style={{ background: '#1e1a0e', border: '2px solid #C9A84C', color: '#C9A84C' }}>
          {mockUser.initials}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-4xl text-white mb-1">{mockUser.name}</h1>
          <p className="text-gray-500 text-sm mb-3">Member since {mockUser.memberSince} · {mockUser.location}</p>
          <div className="flex gap-2 flex-wrap">
            <span className="pill" style={{ background: '#1a1028', color: '#c080e0' }}>AMOC · Verified</span>
            <span className="pill" style={{ background: '#0f1e2a', color: '#5B9CF6' }}>Grenadier Club · Verified</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: 'Total drives', value: mockUser.totalDrives },
          { label: 'Miles driven', value: mockUser.totalMiles.toLocaleString() },
          { label: 'Cars', value: mockUser.cars.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface-raised border border-surface-border rounded-xl p-4">
            <div className="font-mono text-2xl font-medium text-gold-400">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Garage */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-label">My garage</h2>
        <button onClick={() => setShowAddCar(true)} className="flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-200 transition-colors">
          <Plus size={13} /> Add car
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {mockUser.cars.map(car => (
          <div key={car.id} className="card overflow-hidden hover:border-gray-600 transition-colors">
            {/* Car illustration */}
            <div className="h-36 relative flex items-center justify-center px-6" style={{ background: `${car.colorHex}18` }}>
              <CarSilhouette car={car} />
              {car.isPrimary && (
                <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-medium text-gold-400 bg-amber-950/60">Primary</span>
              )}
              {car.club && (
                <div className="absolute top-3 left-3">
                  <ClubBadgeChip badge={car.clubBadge} club={car.club} />
                </div>
              )}
            </div>

            {/* Car info */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-display text-xl text-white">{car.year} {car.make} {car.model}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">{car.color}{car.spec ? ` · ${car.spec}` : ''}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-surface rounded-lg p-3">
                  <div className="font-mono text-lg font-medium text-gold-400">{car.drives}</div>
                  <div className="text-xs text-gray-600 mt-0.5">Drives taken</div>
                </div>
                <div className="bg-surface rounded-lg p-3">
                  <div className="font-mono text-lg font-medium text-gold-400">{car.miles.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 mt-0.5">Miles with club</div>
                </div>
              </div>

              {car.clubBadge === 'self-declared' && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-surface-border text-xs text-gray-500">
                  <Shield size={13} className="text-gray-600" />
                  Club membership self-declared — <button className="text-gold-400 hover:text-gold-200">upload proof to verify</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add car button */}
      <button
        onClick={() => setShowAddCar(true)}
        className="w-full border border-dashed border-surface-border rounded-card p-6 flex items-center justify-center gap-3 text-gray-500 hover:border-gold-400 hover:text-gold-400 transition-all"
      >
        <Plus size={18} />
        <span className="text-sm font-medium">Add another car to your garage</span>
      </button>

      {/* Add car modal */}
      {showAddCar && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md card p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl text-white">Add a car</h3>
              <button onClick={() => setShowAddCar(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>

            <p className="section-label mb-3">Make</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {['Aston Martin', 'Porsche', 'Ferrari', 'Defender', 'Grenadier', 'Other'].map((make, i) => (
                <button key={make} className={clsx('py-2.5 rounded-xl text-xs border transition-all',
                  i === 0 ? 'border-gold-400 bg-amber-950/40 text-gold-400' : 'border-surface-border text-gray-500 hover:border-gray-500'
                )}>{make}</button>
              ))}
            </div>

            <div className="space-y-3 mb-5">
              <input type="text" placeholder="Model (e.g. DB11 V8)" className="input-dark" />
              <input type="text" placeholder="Year" className="input-dark" />
              <input type="text" placeholder="Colour" className="input-dark" />
              <input type="text" placeholder="Nickname (optional)" className="input-dark" />
            </div>

            <p className="section-label mb-3">Club membership</p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-gold-400/40 bg-amber-950/20 text-sm text-white">
                <div className="w-2.5 h-2.5 rounded-full bg-gold-400 flex-shrink-0" />
                AMOC Member (self-declare)
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-surface-border text-sm text-gray-500">
                <div className="w-2.5 h-2.5 rounded-full border border-gray-600 flex-shrink-0" />
                No club membership
              </div>
            </div>

            <button onClick={() => setShowAddCar(false)} className="w-full btn-gold">
              Add to garage
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
