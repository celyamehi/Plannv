import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/welcome'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { to, fullName, userType, establishmentName } = body

    if (!to) {
      return NextResponse.json({ error: 'Adresse e-mail requise' }, { status: 400 })
    }

    const validUserType = 
      userType === 'professional_completed' 
        ? 'professional_completed' 
        : userType === 'professional' 
        ? 'professional' 
        : 'client'

    const result = await sendWelcomeEmail({
      to,
      fullName: fullName || '',
      userType: validUserType,
      establishmentName
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Erreur route /api/send-welcome-email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
