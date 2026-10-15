import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/welcome'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { to, fullName, userType } = body

    if (!to) {
      return NextResponse.json({ error: 'Adresse e-mail requise' }, { status: 400 })
    }

    const result = await sendWelcomeEmail({
      to,
      fullName: fullName || '',
      userType: userType === 'professional' ? 'professional' : 'client'
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Erreur route /api/send-welcome-email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
