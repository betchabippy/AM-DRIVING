import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  //const authHeader = request.headers.get('authorization')
  //if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
   // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  //}

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date().toISOString().split('T')[0]

  const { data: drives } = await supabase
    .from('drives')
    .select('*, profiles(name)')
    .eq('drive_date', today)

  if (!drives || drives.length === 0) {
    return NextResponse.json({ message: 'No drives today' })
  }

  const emailsSent = []

  for (const drive of drives) {
    const { data: rsvps } = await supabase
      .from('rsvps')
      .select('*, profiles(name)')
      .eq('drive_id', drive.id)
      .eq('status', 'going')

    if (!rsvps || rsvps.length === 0) continue

    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .in('id', rsvps.map((r: any) => r.user_id))

    const { data: authUsers } = await supabase.auth.admin.listUsers()
    
    for (const rsvp of rsvps) {
      const authUser = authUsers?.users?.find((u: any) => u.id === rsvp.user_id)
      for (const rsvp of rsvps) {
      console.log('RSVP user_id:', rsvp.user_id)
      console.log('Auth users count:', authUsers?.users?.length)
      const authUser = authUsers?.users?.find((u: any) => u.id === rsvp.user_id)
      console.log('Found auth user:', authUser?.email)
      if (!authUser?.email) continue 

      const driveUrl = process.env.NEXT_PUBLIC_SITE_URL + '/drives/' + drive.id
      const departTime = drive.depart_time || '9:00 AM'
      const meetingPoint = drive.meeting_point || 'See drive details'

      const emailRes = await fetch('https://api.resend.com/emails', {
        const emailData = await emailRes.json()
console.log('Resend response:', JSON.stringify(emailData))
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
        },
        body: JSON.stringify({
          from: 'DoTheDrive <onboarding@resend.dev>',
          to: authUser.email,
          subject: 'Today is drive day — ' + drive.title,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px 24px; border-radius: 16px;">
              <div style="margin-bottom: 32px;">
                <span style="background: #C9A84C; color: #0a0a0a; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 1px;">DRIVE DAY</span>
              </div>
              
              <h1 style="font-size: 28px; font-weight: 400; color: #ffffff; margin: 0 0 8px 0;">${drive.title}</h1>
              <p style="color: #888; font-size: 14px; margin: 0 0 32px 0;">Organised by ${drive.profiles?.name || 'a fellow enthusiast'}</p>

              <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 11px; color: #666; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;">Departs</div>
                  <div style="font-size: 16px; color: #fff;">Today at ${departTime}</div>
                </div>
                <div>
                  <div style="font-size: 11px; color: #666; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;">Meeting point</div>
                  <div style="font-size: 16px; color: #fff;">${meetingPoint}</div>
                </div>
              </div>

              <div style="margin-bottom: 32px;">
                <div style="font-size: 12px; color: #888; margin-bottom: 8px;">${rsvps.length} going today</div>
              </div>

              <a href="${driveUrl}" style="display: block; background: #C9A84C; color: #0a0a0a; text-align: center; padding: 14px 24px; border-radius: 12px; font-weight: 600; text-decoration: none; font-size: 15px; margin-bottom: 24px;">
                View drive & follow route →
              </a>

              <p style="color: #555; font-size: 12px; text-align: center; margin: 0;">
                You're receiving this because you RSVPd going to this drive.
              </p>
            </div>
          `
        })
      })

      if (emailRes.ok) emailsSent.push(authUser.email)
    }
  }

  return NextResponse.json({ sent: emailsSent.length, emails: emailsSent })
}}
