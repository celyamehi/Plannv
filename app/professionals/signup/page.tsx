'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase/client'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { ArrowLeft, Building, MapPin, Phone, Mail, Check } from 'lucide-react'
import LocationPicker from '../../../components/ui/LocationPicker'

export default function ProfessionalSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Étape 1: Informations personnelles
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  // Étape 2: Informations établissement
  const [establishmentInfo, setEstablishmentInfo] = useState({
    establishmentName: '',
    category: 'coiffeur',
    address: '',
    city: '',
    postalCode: '',
    latitude: null as number | null,
    longitude: null as number | null,
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

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (personalInfo.password !== personalInfo.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (personalInfo.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setError(null)
    setStep(2)
  }

  const handleEstablishmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: personalInfo.email,
        password: personalInfo.password,
        options: {
          data: {
            full_name: personalInfo.fullName,
            phone: personalInfo.phone,
            user_type: 'professional'
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Créer le profil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            user_type: 'professional',
            full_name: personalInfo.fullName,
            phone: personalInfo.phone,
          })

        if (profileError) {
          // Si le profil existe déjà, faire un update
          if (profileError.message.includes('duplicate')) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                user_type: 'professional',
                full_name: personalInfo.fullName,
                phone: personalInfo.phone,
              })
              .eq('id', authData.user.id)
            if (updateError) throw updateError
          } else {
            throw profileError
          }
        }

        // 3. Créer l'établissement
        const slug = establishmentInfo.establishmentName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()

        const { error: establishmentError } = await supabase
          .from('establishments')
          .insert({
            owner_id: authData.user.id, // Pour la contrainte NOT NULL actuelle
            professional_id: authData.user.id, // Pour la nouvelle structure
            name: establishmentInfo.establishmentName,
            slug: slug,
            category: establishmentInfo.category,
            address: establishmentInfo.address,
            city: establishmentInfo.city,
            postal_code: establishmentInfo.postalCode,
            latitude: establishmentInfo.latitude,
            longitude: establishmentInfo.longitude,
            phone: establishmentInfo.phone,
            description: establishmentInfo.description,
            is_active: true,
          })

        if (establishmentError) throw establishmentError

        // 4. Rediriger vers le dashboard professionnel
        router.push('/professional/pro-dashboard')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <span className="text-3xl font-semibold">Kalendo</span>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowLeft className="w-5 h-5 mr-2 cursor-pointer" onClick={() => router.back()} />
                Inscription Professionnel
              </CardTitle>
              <CardDescription>
                Étape 1 sur 2 : Vos informations personnelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePersonalSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Nom complet
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Jean Dupont"
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email professionnel
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jean@salon.com"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Téléphone professionnel
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+33 6 12 34 56  78"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Mot de passe
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={personalInfo.password}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, password: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Minimum 8 caractères
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirmer le mot de passe
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={personalInfo.confirmPassword}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="text-xs text-gray-600">
                  En créant un compte, vous acceptez nos{' '}
                  <Link href="/terms" className="text-purple-600 hover:text-purple-700">
                    Conditions d'utilisation
                  </Link>{' '}
                  et notre{' '}
                  <Link href="/privacy" className="text-purple-600 hover:text-purple-700">
                    Politique de confidentialité
                  </Link>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600" disabled={loading}>
                  {loading ? 'Continuer' : 'Continuer →'}
                </Button>
              </form>

              <div className="mt-6 space-y-3">
                <div className="text-center text-sm">
                  <span className="text-gray-600">Vous avez déjà un compte ? </span>
                  <Link href="/professionals/login" className="text-purple-600 hover:text-purple-700 font-medium">
                    Se connecter
                  </Link>
                </div>

                <div className="text-center text-sm">
                  <Link href="/signup" className="text-purple-600 hover:text-purple-700">
                    Vous êtes un client ? Inscription client →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <span className="text-3xl font-semibold">Kalendo</span>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowLeft className="w-5 h-5 mr-2 cursor-pointer" onClick={() => setStep(1)} />
                Informations de l'établissement
              </CardTitle>
              <CardDescription>
                Étape 2 sur 2 : Détails de votre établissement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEstablishmentSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="establishmentName" className="text-sm font-medium">
                    Nom de l'établissement *
                  </label>
                  <Input
                    id="establishmentName"
                    type="text"
                    placeholder="Salon Beauté Paris"
                    value={establishmentInfo.establishmentName}
                    onChange={(e) => setEstablishmentInfo({ ...establishmentInfo, establishmentName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Catégorie *
                  </label>
                  <select
                    id="category"
                    value={establishmentInfo.category}
                    onChange={(e) => setEstablishmentInfo({ ...establishmentInfo, category: e.target.value })}
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
                  <label className="text-sm font-medium">
                    Adresse de l'établissement *
                  </label>
                  <LocationPicker
                    onLocationSelect={(location) => {
                      setEstablishmentInfo({
                        ...establishmentInfo,
                        address: location.address,
                        city: location.city,
                        postalCode: location.postalCode,
                        latitude: location.latitude,
                        longitude: location.longitude,
                      })
                    }}
                    initialLocation={{
                      address: establishmentInfo.address,
                      city: establishmentInfo.city,
                      postalCode: establishmentInfo.postalCode,
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Utilisez votre position GPS ou recherchez votre adresse
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="establishmentPhone" className="text-sm font-medium">
                    Téléphone de l'établissement *
                  </label>
                  <Input
                    id="establishmentPhone"
                    type="tel"
                    placeholder="+33 0 12 34 56  78"
                    value={establishmentInfo.phone}
                    onChange={(e) => setEstablishmentInfo({ ...establishmentInfo, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    placeholder="Décrivez votre établissement, vos services, votre ambiance..."
                    value={establishmentInfo.description}
                    onChange={(e) => setEstablishmentInfo({ ...establishmentInfo, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 min-h-[100px] resize-none"
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600" disabled={loading}>
                  {loading ? 'Création du compte...' : 'Créer mon compte professionnel'}
                </Button>
              </form>

              <div className="mt-6 space-y-3">
                <div className="text-center text-sm">
                  <span className="text-gray-600">Vous avez déjà un compte ? </span>
                  <Link href="/professionals/login" className="text-purple-600 hover:text-purple-700 font-medium">
                    Se connecter
                  </Link>
                </div>

                <div className="text-center text-sm">
                  <Link href="/signup" className="text-purple-600 hover:text-purple-700">
                    Vous êtes un client ? Inscription client →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
