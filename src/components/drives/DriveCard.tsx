import Link from 'next/link'
import { Calendar, Clock, MapPin, Users, Lock, Globe, Shield } from 'lucide-react'
import type { Drive } from '@/types'
import { format, parseISO } from 'date-fns'
import clsx from 'clsx'

interface DriveCardProps {
  drive: Drive
  compact?: boolean
}

function RouteMiniMap({ drive }: { drive: Drive }) {
  const coords = drive.route?.coordinates ?? []
  if (!coords.length) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: '#0d120d' }}>
        <MapPin size={20} className="text-gray-700" />
      </div>
    )
  }

  const xs = coords.map(c => c[0])
  const ys = coords.map(c => c[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const padX = (maxX - minX) * 0.15 || 0.1
  const padY = (maxY - minY) * 0.15 || 0.1
  const vx = minX - padX, vy = minY - padY
  const vw = (maxX - minX) + padX * 2 || 0.5
  const vh = (maxY - minY) + padY * 2 || 0.5

  const pts = coords.map(([x, y]) => `${x},${y}`).join(' ')

  return (
    <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect x={vx} y={vy} width={vw} height={vh} fill="#0d150d" />
      <polyline points={pts} fill="none" stroke="#1a3a1a" strokeWidth={vw * 0.04} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts} fill="none" stroke="#C9A84C" strokeWidth={vw * 0.012}
        strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${vw*0.02} ${vw*0.015}`}
        style={{ animation: 'dashMove 1.5s linear infinite' }} />
      <circle cx={coords[0][0]} cy={coords[0][1]} r={vw * 0.025} fill="#4CAF70" />
      <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r={vw * 0.025} fill="#C9A84C" />
    </svg>
  )
}

function VisibilityBadge({ visibility }: { visibility: Drive['visibility'] }) {
  if (visibility === 'private') return (
    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#1a1028', color: '#c080e0' }}>
      <Lock size={9} /> Invite only
    </span>
  )
  if (visibility === 'club') return (
    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#101a2a', color: '#5B9CF6' }}>
      <Shield size={9} /> Club
    </span>
  )
  return (
    <span className="flex items-center gap-1 pill-green">
      <Globe size={9} /> Open
    </span>
  )
}

export function DriveCard({ drive, compact }: DriveCardProps) {
  const goingCount = drive.attendees.filter(a => a.status === 'going').length
  const spotsLeft = drive.maxSpots ? drive.maxSpots - goingCount : null
  const dateStr = format(parseISO(drive.date), 'EEE, MMM d')

  return (
    <Link href={`/drives/${drive.id}`} className="card block overflow-hidden group hover:border-gray-600 transition-colors">
      {/* Map preview */}
      <div className={clsx('map-placeholder', compact ? 'h-24' : 'h-32')}>
        <RouteMiniMap drive={drive} />
        {/* Overlays */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {drive.club && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-black/60 text-gray-300">{drive.club}</span>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <VisibilityBadge visibility={drive.visibility} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-medium text-white text-sm mb-2 group-hover:text-gold-400 transition-colors">{drive.title}</h3>

        <div className="flex flex-wrap gap-2 mb-3">
          {drive.route && (
            <span className="pill-gold">
              <Clock size={9} className="inline mr-1" />
              {Math.round(drive.route.durationMinutes / 60 * 10) / 10}h · {drive.route.miles}mi
            </span>
          )}
          {drive.states.length > 0 && (
            <span className="pill" style={{ background: '#1a1a1a', color: '#888' }}>{drive.states.join(' · ')}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Attendee avatars */}
            <div className="flex">
              {drive.attendees.slice(0, 4).map((a, i) => (
                <div
                  key={a.userId}
                  className="w-6 h-6 rounded-full border-2 border-surface-raised flex items-center justify-center text-[9px] font-medium"
                  style={{ background: a.avatarColor, marginLeft: i > 0 ? '-6px' : '0', color: '#ddd' }}
                >
                  {a.initials}
                </div>
              ))}
              {drive.attendees.length > 4 && (
                <div className="w-6 h-6 rounded-full border-2 border-surface-raised bg-surface-hover flex items-center justify-center text-[9px] text-gray-500 font-medium" style={{ marginLeft: '-6px' }}>
                  +{drive.attendees.length - 4}
                </div>
              )}
            </div>
            {spotsLeft !== null && spotsLeft > 0 && (
              <span className="text-[10px] text-gray-500">{spotsLeft} spots left</span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <Calendar size={10} />
            {dateStr}
          </div>
        </div>
      </div>
    </Link>
  )
}
