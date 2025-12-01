'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase/client'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'

export default function ProfessionalLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 PRO LOGIN - Tentative de connexion:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ PRO LOGIN - Erreur auth:', error)
        throw error
      }

      console.log('✅ PRO LOGIN - Auth réussie:', data.user?.id)

      if (data.user) {
        // Vérifier le type d'utilisateur dans profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .maybeSingle()

        console.log('🔍 PRO LOGIN - Données profil:', profileData)

        if (profileError) {
          console.error('❌ PRO LOGIN - Erreur profil:', profileError)
          throw profileError
        }

        if (profileData?.user_type === 'professional' || profileData?.user_type === 'admin') {
          console.log('✅ PRO LOGIN - Type professionnel confirmé')
          
          // Vérifier si l'établissement existe
          const { data: establishmentData } = await supabase
            .from('establishments')
            .select('*')
            .eq('owner_id', data.user.id)
            .maybeSingle()

          console.log('🔍 PRO LOGIN - Établissement:', establishmentData)

          if (establishmentData) {
            console.log('🔄 PRO LOGIN - Redirection vers dashboard pro')
            router.push('/professional/pro-dashboard')
          } else {
            console.log('🔄 PRO LOGIN - Redirection vers setup')
            router.push('/professional/setup')
          }
        } else if (profileData?.user_type === 'client') {
          console.log('❌ PRO LOGIN - C\'est un compte client')
          setError('Ce compte est un compte client. Utilisez la connexion client.')
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          console.log('❌ PRO LOGIN - Type incorrect ou manquant:', profileData?.user_type)
          setError('Ce compte n\'est pas un compte professionnel. Type: ' + (profileData?.user_type || 'non défini'))
        }
      }
    } catch (error: any) {
      console.error('❌ PRO LOGIN - Erreur générale:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion Professionnel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              connectez-vous en tant que client
            </Link>
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Accédez à votre espace professionnel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link href="/professional/setup" className="font-medium text-blue-600 hover:text-blue-500">
                  Créer votre établissement
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
