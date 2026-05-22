import Link from 'next/link'
import { Settings, Car, Users, LogOut } from 'lucide-react'
import { mockUser } from '@/lib/mock-data'

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-white">Profile</h1>
        <button className="btn-outline flex items-center gap-2 text-xs">
          <Settings size={13} /> Settings
        </button>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium"
            style={{ background: '#1e1a0e', border: '2px solid #C9A84C', color: '#C9A84C' }}>
            {mockUser.initials}
          </div>
          <div>
            <h2 className="text-xl font-medium text-white">{mockUser.name}</h2>
            <p className="text-sm text-gray-500">{mockUser.location} · Member since {mockUser.memberSince}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Drives', value: mockUser.totalDrives },
            { label: 'Miles', value: mockUser.totalMiles.toLocaleString() },
            { label: 'Cars', value: mockUser.cars.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface rounded-lg p-3 text-center">
              <div className="font-mono text-xl font-medium text-gold-400">{value}</div>
              <div className="text-xs text-gray-600 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {[
          { icon: Car, label: 'My garage', sub: `${mockUser.cars.length} cars`, href: '/garage' },
          { icon: Users, label: 'My clubs', sub: 'AMOC · Grenadier Club', href: '/clubs' },
        ].map(({ icon: Icon, label, sub, href }) => (
          <Link key={href} href={href} className="card p-4 flex items-center gap-3 hover:border-gray-600 transition-colors group">
            <Icon size={18} className="text-gray-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-white group-hover:text-gold-400 transition-colors">{label}</div>
              <div className="text-xs text-gray-600">{sub}</div>
            </div>
          </Link>
        ))}
        <button className="w-full card p-4 flex items-center gap-3 hover:border-gray-600 transition-colors text-left">
          <LogOut size={18} className="text-gray-500 flex-shrink-0" />
          <div className="text-sm font-medium text-gray-500">Sign out</div>
        </button>
      </div>
    </div>
  )
}
