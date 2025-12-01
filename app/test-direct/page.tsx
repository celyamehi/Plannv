'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestDirectPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)
    setLoading(false)
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test de Redirection</h1>
        
        {session ? (
          <div className="space-y-4">
            <p className="text-green-600 font-semibold">✅ Session active</p>
            <p>Email: {session.user.email}</p>
            
            <div className="space-y-2">
              <a href="/dashboard" className="block px-4 py-2 bg-blue-600 text-white rounded">
                Aller au Dashboard Client
              </a>
              <a href="/professional/pro-dashboard" className="block px-4 py-2 bg-green-600 text-white rounded">
                Aller au Dashboard Pro
              </a>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-red-600 font-semibold">❌ Pas de session</p>
            <a href="/login" className="block px-4 py-2 bg-purple-600 text-white rounded mt-4">
              Se connecter
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
