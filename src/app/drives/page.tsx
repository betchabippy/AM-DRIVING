import Link from 'next/link'
import { PlusCircle, Filter } from 'lucide-react'
import { DriveCard } from '@/components/drives/DriveCard'
import { mockDrives } from '@/lib/mock-data'

export default function DrivesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white mb-1">Drives</h1>
          <p className="text-gray-500 text-sm">Discover and join upcoming drives near you</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline flex items-center gap-2 text-xs">
            <Filter size={13} /> Filter
          </button>
          <Link href="/drives/create" className="btn-gold flex items-center gap-2 text-xs">
            <PlusCircle size={13} /> Create
          </Link>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['All', 'Open', 'AMOC', 'PCA', 'This weekend', 'CT', 'NY', 'VT'].map((f, i) => (
          <button key={f} className={i === 0 ? 'pill-gold' : 'pill border border-surface-border text-gray-500 hover:border-gray-500 hover:text-gray-300 transition-colors'}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockDrives.map(drive => (
          <DriveCard key={drive.id} drive={drive} />
        ))}
      </div>
    </div>
  )
}
