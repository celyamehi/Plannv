'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Check } from 'lucide-react'

export default function ProfessionalSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

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

      // Vérifier que c'est un professionnel
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single()

      if (profile?.user_type !== 'professional' && profile?.user_type !== 'admin') {
        router.push('/dashboard')
        return
      }

      setAuthChecked(true)
    } catch (error) {
      console.error('Erreur auth:', error)
      router.push('/login')
    }
  }

  const [formData, setFormData] = useState({
    name: '',
    category: 'coiffeur',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    description: '',
  })

  const categories = [
    { value: 'coiffeur', label: 'Coiffeur' },
    { value: 'barbier', label: 'Barbier' },
    { value: 'esthetique', label: 'Institut de beauté' },
    { value: 'spa', label: 'Spa' },
    { value: 'onglerie', label: 'Onglerie' },
    { value: 'massage', label: 'Massage' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Récupérer l'utilisateur
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Non authentifié')

      // Générer le slug
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      // Créer l'établissement
      const { error: establishmentError } = await supabase
        .from('establishments')
        .insert({
          owner_id: session.user.id,
          name: formData.name,
          slug: slug,
          category: formData.category,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          phone: formData.phone,
          description: formData.description,
          is_active: true,
        })

      if (establishmentError) throw establishmentError

      setSuccess(true)
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push('/professional/pro-dashboard')
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
            <h2 className="text-2xl font-bold mb-2">Établissement créé !</h2>
            <p className="text-gray-600 mb-4">
              Votre espace professionnel est maintenant configuré.
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
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <span className="text-3xl font-semibold ml-2">PlannV</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Configuration de votre établissement
            </CardTitle>
            <CardDescription>
              Complétez les informations pour activer votre espace professionnel
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
                <label htmlFor="name" className="text-sm font-medium">
                  Nom de l'établissement *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Salon Beauté Paris"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Catégorie *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Adresse *
                </label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Rue de la Paix"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="postalCode" className="text-sm font-medium">
                    Code postal *
                  </label>
                  <Input
                    id="postalCode"
                    type="text"
                    placeholder="75001"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    Ville *
                  </label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Paris"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Téléphone *
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 0 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="Décrivez votre établissement..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 min-h-[100px] resize-none"
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600" disabled={loading}>
                {loading ? 'Configuration...' : 'Créer mon établissement'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
