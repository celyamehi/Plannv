'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Check } from 'lucide-react'

export default function SetupProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    userType: 'client',
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      // Vérifier si le profil existe déjà
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        // Rediriger selon le type d'utilisateur
        if (profile.user_type === 'professional' || profile.user_type === 'admin') {
          router.push('/professional/pro-dashboard')
        } else {
          router.push('/dashboard')
        }
        return
      }

      setAuthChecked(true)
    } catch (error) {
      console.error('Erreur auth:', error)
      setAuthChecked(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) throw new Error('Non authentifié')

      // Créer le profil
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          user_type: formData.userType,
        })

      if (error) throw error

      setSuccess(true)

      // Rediriger après 2 secondes
      setTimeout(() => {
        if (formData.userType === 'professional' || formData.userType === 'admin') {
          router.push('/professional/setup')
        } else {
          router.push('/dashboard')
        }
      }, 2000)

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Profil créé !</h2>
            <p className="text-gray-600 mb-4">
              Votre profil est maintenant configuré.
            </p>
            <p className="text-sm text-gray-500">
              Redirection vers votre dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <span className="text-3xl font-semibold ml-2">Kalendo</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Configuration de votre profil
            </CardTitle>
            <CardDescription>
              Complétez vos informations pour continuer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Nom complet *
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Téléphone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="userType" className="text-sm font-medium">
                  Type de compte *
                </label>
                <select
                  id="userType"
                  value={formData.userType}
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                >
                  <option value="client">Client</option>
                  <option value="professional">Professionnel</option>
                </select>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600" disabled={loading}>
                {loading ? 'Configuration...' : 'Créer mon profil'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
