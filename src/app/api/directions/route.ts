import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.searchParams.get('origin')
  const destination = request.nextUrl.searchParams.get('destination')
  const waypoints = request.nextUrl.searchParams.get('waypoints')

  if (!origin || !destination) return NextResponse.json({ status: 'ERROR' })

  const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY
  let url = 'https://maps.googleapis.com/maps/api/directions/json?origin=' + origin + '&destination=' + destination + '&key=' + key

  if (waypoints) url += '&waypoints=' + waypoints

  const res = await fetch(url)
  const data = await res.json()
  return NextResponse.json(data)
}
