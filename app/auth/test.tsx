'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthTestPage() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier la session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔍 Session:', session)
        setSession(session)

        // Vérifier l'utilisateur
        const { data: { user } } = await supabase.auth.getUser()
        console.log('👤 User:', user)
        setUser(user)

      } catch (error) {
        console.error('❌ Erreur auth test:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Changement auth:', _event, session)
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login/direct'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nude-600 mx-auto mb-4"></div>
          <p>Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-nude-600 to-warm-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-semibold">PlannV</span>
          </Link>
          
          <Button onClick={handleLogout} variant="outline">
            Déconnexion
          </Button>
        </div>

        {/* Test Results */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🧪 Test d'Authentification</CardTitle>
            <CardDescription>
              Vérification de l'état de connexion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg ${user ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="font-semibold">
                {user ? '✅ Utilisateur connecté' : '❌ Aucun utilisateur connecté'}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${session ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="font-semibold">
                {session ? '✅ Session active' : '❌ Aucune session active'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Details */}
        {user && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>👤 Détails de l'utilisateur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Email confirmé:</strong> {user.email_confirmed_at ? '✅ Oui' : '❌ Non'}</p>
                <p><strong>Dernière connexion:</strong> {new Date(user.last_sign_in_at).toLocaleString()}</p>
                <p><strong>Compte créé:</strong> {new Date(user.created_at).toLocaleString()}</p>
                <p><strong>Métadonnées:</strong> {JSON.stringify(user.user_metadata, null, 2)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Details */}
        {session && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>🔐 Détails de la session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                <p><strong>Access Token:</strong> {session.access_token ? '✅ Présent' : '❌ Manquant'}</p>
                <p><strong>Refresh Token:</strong> {session.refresh_token ? '✅ Présent' : '❌ Manquant'}</p>
                <p><strong>Expires At:</strong> {new Date(session.expires_at * 1000).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Actions de test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/simple">
              <Button className="w-full">
                → Aller au dashboard simple
              </Button>
            </Link>
            
            <Link href="/login/direct">
              <Button variant="outline" className="w-full">
                → Page de connexion directe
              </Button>
            </Link>
            
            <Link href="/signup/no-confirm">
              <Button variant="outline" className="w-full">
                → Inscription sans confirmation
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
