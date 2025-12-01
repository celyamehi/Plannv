'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Star, User } from 'lucide-react'

export default function SimpleDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        console.log('👤 Utilisateur dans dashboard:', user)
        setUser(user)
      } catch (error) {
        console.error('❌ Erreur dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Chargement de votre dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Non connecté</CardTitle>
            <CardDescription>
              Vous devez être connecté pour voir cette page
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login/debug">
              <Button>Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-semibold">PlannV</span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link href="/search" className="text-gray-600 hover:text-gray-900">
              Rechercher
            </Link>
            <Link href="/dashboard/simple" className="text-purple-600 font-medium">
              Dashboard
            </Link>
            <Button 
              variant="outline" 
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/login/debug'
              }}
            >
              Déconnexion
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bonjour {user.user_metadata?.full_name || user.email} 👋
          </h1>
          <p className="text-gray-600">
            Bienvenue sur votre tableau de bord PlannV
          </p>
        </div>

        {/* User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Dernière connexion:</strong> {new Date(user.last_sign_in_at).toLocaleString('fr-FR')}</p>
              <p><strong>Compte créé:</strong> {new Date(user.created_at).toLocaleString('fr-FR')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Trouver un salon</h3>
                  <p className="text-sm text-gray-600">Rechercher près de chez vous</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Mes rendez-vous</h3>
                  <p className="text-sm text-gray-600">Voir tous mes RDV</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Mes favoris</h3>
                  <p className="text-sm text-gray-600">Établissements sauvegardés</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de Debug</CardTitle>
            <CardDescription>
              Pour vérifier que tout fonctionne
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-mono">
                Session active: ✅<br/>
                Base de données: ✅<br/>
                Authentification: ✅
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
