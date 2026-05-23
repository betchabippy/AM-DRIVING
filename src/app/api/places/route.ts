import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')
  const lat = request.nextUrl.searchParams.get('lat')
  const lng = request.nextUrl.searchParams.get('lng')

  if (!query) return NextResponse.json({ predictions: [] })

  const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY
  const url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + encodeURIComponent(query) + '&location=' + lat + ',' + lng + '&radius=100000&key=' + key

  const res = await fetch(url)
  const data = await res.json()
  return NextResponse.json(data)
}
