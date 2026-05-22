export type DriveType = 'loop' | 'destination' | 'equidistant' | 'multiday'
export type DriveCharacter = 'spirited' | 'leisurely' | 'scenic' | 'breakfast' | 'sunset'
export type DriveVisibility = 'private' | 'club' | 'open'
export type RsvpStatus = 'going' | 'maybe' | 'declined' | 'pending'
export type ClubBadge = 'none' | 'self-declared' | 'verified'

export interface Car {
  id: string
  make: string
  model: string
  year: number
  color: string
  colorHex: string
  spec?: string
  nickname?: string
  club?: string
  clubBadge: ClubBadge
  isPrimary: boolean
  drives: number
  miles: number
}

export interface User {
  id: string
  name: string
  initials: string
  location: string
  memberSince: string
  cars: Car[]
  clubs: string[]
  totalDrives: number
  totalMiles: number
}

export interface Route {
  id: string
  name: string
  description: string
  states: string[]
  miles: number
  durationMinutes: number
  character: DriveCharacter[]
  rating: number
  driveCount: number
  coordinates: [number, number][]
}

export interface Drive {
  id: string
  title: string
  type: DriveType
  character: DriveCharacter
  visibility: DriveVisibility
  date: string
  departTime: string
  meetingPoint: string
  destination?: string
  route?: Route
  states: string[]
  club?: string
  organizerId: string
  organizer: { name: string; initials: string }
  attendees: Attendee[]
  maxSpots?: number
  description?: string
}

export interface Attendee {
  userId: string
  name: string
  initials: string
  avatarColor: string
  car: string
  carColor: string
  club?: string
  status: RsvpStatus
  note?: string
}

export interface Club {
  slug: string
  name: string
  fullName: string
  make: string
  accentColor: string
  accentBg: string
  memberCount: number
  monthlyDrives: number
  icon: string
  verified: boolean
}
