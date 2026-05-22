'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Crown, PlusCircle } from 'lucide-react'
import { mockClubs, mockDrives, mockRoutes, mockLeaderboard } from '@/lib/mock-data'
import { DriveCard } from '@/components/drives/DriveCard'
import clsx from 'clsx'

const iconMap: Record<string, any> = { crown: Crown }

type Tab = 'drives' | 'members' | 'routes' | 'news'

export default function ClubPage({ params }: { params: { slug: string } }) {
  const club = mockClubs.find(c => c.slug === params.slug) ?? mockClubs[0]
  const [tab, setTab] = useState<Tab>('drives')
  const Icon = iconMap[club.icon] ?? Crown
  const clubDrives = mockDrives.filter(d => d.club === club.name || true).slice(0, 3)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 md:pb-8">

      {/* Club hero */}
      <div className="py-8" style={{ background: `linear-gradient(to bottom, ${club.accentBg}80, transparent)` }}>
        <Link href="/clubs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-6">
          <ArrowLeft size={15} /> All clubs
        </Link>

        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${club.accentColor}20`, border: `1.5px solid ${club.accentColor}60` }}>
            <Icon size={28} style={{ color: club.accentColor }} />
          </div>
          <div>
            <h1 className="font-display text-4xl text-white">{club.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{club.fullName}</p>
          </div>
          <span className="ml-auto text-xs px-3 py-1.5 rounded-full font-medium"
            style={{ background: `${club.accentColor}20`, color: club.accentColor }}>
            ✓ Member
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'NE members', value: club.memberCount },
            { label: 'Drives / month', value: club.monthlyDrives },
            { label: 'Your rank', value: '#4' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-raised border border-surface-border rounded-xl p-4">
              <div className="font-mono text-xl font-medium" style={{ color: club.accentColor }}>{value}</div>
              <div className="text-xs text-gray-600 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-surface-border">
          {(['drives', 'members', 'routes', 'news'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-4 py-3 text-sm capitalize transition-colors border-b-2 -mb-px',
                tab === t
                  ? 'border-current font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              )}
              style={{ color: tab === t ? club.accentColor : undefined }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="py-6">

        {tab === 'drives' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-label">Club drives</h2>
              <Link href="/drives/create" className="btn-gold flex items-center gap-2 text-xs">
                <PlusCircle size={13} /> Create club drive
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubDrives.map(drive => (
                <DriveCard key={drive.id} drive={drive} />
              ))}
            </div>
          </div>
        )}

        {tab === 'members' && (
          <div className="animate-fade-in">
            <h2 className="section-label mb-4">Leaderboard — Northeast chapter</h2>
            <div className="card divide-y divide-surface-border">
              {mockLeaderboard.map(member => (
                <div key={member.rank} className={clsx('flex items-center gap-4 p-4', member.isYou && 'bg-amber-950/10')}>
                  <div className={clsx('font-mono text-base font-medium w-6 text-right flex-shrink-0',
                    member.rank === 1 ? 'text-gold-400' :
                    member.rank === 2 ? 'text-gray-300' :
                    member.rank === 3 ? 'text-amber-700' : 'text-gray-600'
                  )}>#{member.rank}</div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                    style={{ background: member.avatarColor, color: member.textColor }}>
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      {member.name}
                      {member.isYou && <span className="text-xs text-gray-600">(you)</span>}
                    </div>
                    <div className="text-xs text-gray-600">{member.car}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-medium" style={{ color: club.accentColor }}>{member.miles.toLocaleString()} mi</div>
                    <div className="text-xs text-gray-600">{member.drives} drives</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'routes' && (
          <div className="animate-fade-in">
            <h2 className="section-label mb-4">Club favourite routes</h2>
            <div className="card divide-y divide-surface-border">
              {mockRoutes.slice(0, 3).map((route, i) => (
                <div key={route.id} className="flex items-center gap-4 p-4">
                  <div className="font-mono text-sm text-gray-600 w-4">#{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white mb-0.5">{route.name}</div>
                    <div className="text-xs text-gray-600">{route.states.join(', ')} · {route.miles} mi</div>
                  </div>
                  <div className="text-right">
                    {route.rating > 0 && <div className="text-xs text-green-400 mb-0.5">★ {route.rating}</div>}
                    <div className="text-xs text-gray-600">{route.driveCount} drives</div>
                  </div>
                  <Link href="/drives/create" className="btn-outline text-xs px-3 py-1.5">
                    Use route
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'news' && (
          <div className="animate-fade-in">
            <h2 className="section-label mb-4">Club news</h2>
            <div className="card divide-y divide-surface-border">
              {[
                { date: 'Jun 1', title: 'Annual Concours registration now open', body: 'Limited to 40 cars. Book your spot early — last year sold out in 48 hours.' },
                { date: 'May 28', title: 'Route 100 Vermont — peak conditions', body: 'Community rating at 5/5 this week. Zero construction, freshly paved north of Stowe.' },
                { date: 'May 15', title: 'New chapter record', body: 'Northeast chapter hit 2,000 combined miles this month. New all-time record.' },
              ].map(item => (
                <div key={item.title} className="p-5">
                  <div className="text-xs text-gray-600 mb-2">{item.date} · {club.name} Northeast</div>
                  <div className="text-sm font-medium text-white mb-1">{item.title}</div>
                  <div className="text-sm text-gray-500 leading-relaxed">{item.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
