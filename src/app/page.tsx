import Link from 'next/link'
import { PlusCircle, TrendingUp, Leaf, Mountain, ArrowRight } from 'lucide-react'
import { DriveCard } from '@/components/drives/DriveCard'
import { mockDrives, mockRoutes, mockUser } from '@/lib/mock-data'

export default function HomePage() {
  const upcomingDrives = mockDrives.slice(0, 3)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">

      {/* Hero greeting */}
      <div className="mb-10">
        <p className="text-gray-500 text-sm mb-1">Good morning</p>
        <h1 className="font-display text-4xl md:text-5xl text-white mb-1">
          James Mitchell
        </h1>
        <p className="text-gray-500 text-sm">
          3 drives planned near you this weekend
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: 'Total drives', value: mockUser.totalDrives },
          { label: 'Miles driven', value: mockUser.totalMiles.toLocaleString() },
          { label: 'Cars in garage', value: mockUser.cars.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface-raised border border-surface-border rounded-xl p-4">
            <div className="font-mono text-2xl font-medium text-gold-400">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left — drives */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium tracking-widest text-gray-500 uppercase">Upcoming drives</h2>
            <Link href="/drives" className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-200 transition-colors">
              See all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {upcomingDrives.map(drive => (
              <DriveCard key={drive.id} drive={drive} />
            ))}

            {/* Create CTA card */}
            <Link
              href="/drives/create"
              className="border border-dashed border-surface-border rounded-card p-6 flex flex-col items-center justify-center gap-3 text-center hover:border-gold-400 hover:bg-surface-raised transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center group-hover:bg-surface-border transition-colors">
                <PlusCircle size={20} className="text-gray-600 group-hover:text-gold-400 transition-colors" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 group-hover:text-white transition-colors">Create a drive</div>
                <div className="text-xs text-gray-600 mt-0.5">Plan your next outing</div>
              </div>
            </Link>
          </div>

          {/* Nearby routes */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium tracking-widest text-gray-500 uppercase">Nearby routes</h2>
            <Link href="/drives" className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-200 transition-colors">
              Explore <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { route: mockRoutes[0], icon: TrendingUp, iconColor: '#C9A84C', tag: 'Spirited' },
              { route: mockRoutes[2], icon: Leaf, iconColor: '#4CAF70', tag: 'Scenic' },
              { route: mockRoutes[1], icon: Mountain, iconColor: '#5B9CF6', tag: 'Twisty' },
            ].map(({ route, icon: Icon, iconColor, tag }) => (
              <Link
                key={route.id}
                href={`/drives?route=${route.id}`}
                className="card p-4 hover:border-gray-600 transition-colors group"
              >
                <Icon size={20} className="mb-3" style={{ color: iconColor }} />
                <div className="text-sm font-medium text-white mb-0.5 group-hover:text-gold-400 transition-colors">{route.name}</div>
                <div className="text-xs text-gray-600">{route.states.join(', ')} · {route.miles} mi · {tag}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right — sidebar */}
        <div className="space-y-6">
          {/* My clubs */}
          <div>
            <h2 className="text-sm font-medium tracking-widest text-gray-500 uppercase mb-4">My clubs</h2>
            <div className="space-y-2">
              {[
                { name: 'AMOC', full: 'Aston Martin Owners Club', accent: '#c080e0', bg: '#1a1028', members: 142 },
                { name: 'Grenadier Club', full: 'INEOS Grenadier', accent: '#5B9CF6', bg: '#0f1e2a', members: 67 },
              ].map(club => (
                <Link
                  key={club.name}
                  href={`/clubs/${club.name.toLowerCase().replace(' ', '-')}`}
                  className="card p-4 flex items-center gap-3 hover:border-gray-600 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: club.bg, border: `1px solid ${club.accent}40` }}>
                    <span className="text-xs font-bold" style={{ color: club.accent }}>{club.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white group-hover:text-gold-400 transition-colors">{club.name}</div>
                    <div className="text-xs text-gray-600 truncate">{club.members} members · NE chapter</div>
                  </div>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: club.bg, color: club.accent }}>✓</span>
                </Link>
              ))}
              <Link href="/clubs" className="card p-3 flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-white hover:border-gray-600 transition-all">
                <PlusCircle size={13} /> Browse clubs
              </Link>
            </div>
          </div>

          {/* My garage preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium tracking-widest text-gray-500 uppercase">My garage</h2>
              <Link href="/garage" className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-200 transition-colors">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {mockUser.cars.map(car => (
                <div key={car.id} className="card p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex-shrink-0" style={{ background: car.colorHex, border: '1px solid rgba(255,255,255,0.1)' }} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white">{car.year} {car.make} {car.model}</div>
                    <div className="text-xs text-gray-600">{car.color} · {car.drives} drives</div>
                  </div>
                  {car.isPrimary && (
                    <span className="ml-auto text-xs text-gold-400 font-medium">Primary</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
