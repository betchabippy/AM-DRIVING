import Link from 'next/link'
import { Crown, Mountain, Shield, Plus, Check, ArrowRight } from 'lucide-react'
import { mockClubs, mockUser } from '@/lib/mock-data'

const iconMap: Record<string, any> = {
  crown: Crown,
  mountain: Mountain,
  'shield-chevron': Shield,
}

export default function ClubsPage() {
  const myClubs = mockClubs.filter(c => mockUser.clubs.includes(c.slug))
  const discoverClubs = mockClubs.filter(c => !mockUser.clubs.includes(c.slug))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white mb-1">Clubs</h1>
        <p className="text-gray-500 text-sm">Your memberships and communities</p>
      </div>

      {/* My clubs */}
      <h2 className="section-label mb-4">My clubs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {myClubs.map(club => {
          const Icon = iconMap[club.icon] ?? Crown
          return (
            <Link key={club.slug} href={`/clubs/${club.slug}`}
              className="card overflow-hidden hover:border-gray-600 transition-colors group">
              {/* Club header bar */}
              <div className="p-5 flex items-center gap-4" style={{ background: club.accentBg, borderBottom: `0.5px solid ${club.accentColor}30` }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${club.accentColor}20`, border: `1px solid ${club.accentColor}50` }}>
                  <Icon size={22} style={{ color: club.accentColor }} />
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-white group-hover:text-gold-400 transition-colors">{club.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{club.fullName}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1"
                  style={{ background: `${club.accentColor}20`, color: club.accentColor }}>
                  <Check size={10} /> Verified
                </span>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-surface-border">
                {[
                  { label: 'Members', value: club.memberCount },
                  { label: 'Drives / mo', value: club.monthlyDrives },
                  { label: 'Chapter', value: 'NE' },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 text-center">
                    <div className="font-mono text-lg font-medium" style={{ color: club.accentColor }}>{value}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Discover */}
      <h2 className="section-label mb-4">Discover clubs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {discoverClubs.map(club => {
          const Icon = iconMap[club.icon] ?? Shield
          return (
            <Link key={club.slug} href={`/clubs/${club.slug}`}
              className="card p-5 hover:border-gray-600 transition-colors group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: club.accentBg, border: `1px solid ${club.accentColor}40` }}>
                  <Icon size={18} style={{ color: club.accentColor }} />
                </div>
                <div>
                  <div className="text-sm font-medium text-white group-hover:text-gold-400 transition-colors">{club.name}</div>
                  <div className="text-xs text-gray-600">{club.fullName}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{club.memberCount} members</span>
                <span className="flex items-center gap-1 text-gold-400 hover:text-gold-200">Join <ArrowRight size={10} /></span>
              </div>
            </Link>
          )
        })}

        {/* Request a club */}
        <button className="card p-5 flex flex-col items-center justify-center gap-3 border-dashed hover:border-gray-500 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
            <Plus size={18} className="text-gray-600" />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Request a club</div>
            <div className="text-xs text-gray-600 mt-0.5">Don't see yours listed?</div>
          </div>
        </button>
      </div>
    </div>
  )
}
