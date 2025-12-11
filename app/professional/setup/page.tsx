'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Cette page redirige vers la nouvelle page d'inscription professionnelle
export default function ProfessionalSetupPage() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers la nouvelle page d'inscription pro
    router.replace('/professionals/signup')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-nude-600 mx-auto mb-4" />
        <p className="text-gray-600">Redirection...</p>
      </div>
    </div>
  )
}
