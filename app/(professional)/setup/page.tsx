'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Check, MapPin, Navigation, Loader2, Search, X } from 'lucide-react'

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
    latitude: null as number | null,
    longitude: null as number | null,
    phone: '',
    description: '',
  })

  // États pour la sélection d'adresse
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [addressSearch, setAddressSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  // Fonction pour obtenir la position GPS
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur')
      return
    }

    setGettingLocation(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const { latitude, longitude } = position.coords

      // Reverse geocoding pour obtenir l'adresse complète
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=fr`
      )
      const data = await response.json()
      const addr = data.address

      const streetNumber = addr?.house_number || ''
      const street = addr?.road || addr?.pedestrian || addr?.street || ''
      const city = addr?.city || addr?.town || addr?.village || addr?.municipality || ''
      const postalCode = addr?.postcode || ''

      setFormData({
        ...formData,
        address: [streetNumber, street].filter(Boolean).join(' '),
        city: city,
        postalCode: postalCode,
        latitude: latitude,
        longitude: longitude,
      })
      setShowLocationPicker(false)
    } catch (error: any) {
      if (error.code === 1) {
        alert('Veuillez autoriser l\'accès à votre position')
      } else {
        alert('Impossible d\'obtenir votre position')
      }
    } finally {
      setGettingLocation(false)
    }
  }

  // Recherche d'adresse
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=fr,dz&addressdetails=1&limit=5`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Erreur recherche adresse:', error)
    } finally {
      setSearching(false)
    }
  }

  // Debounce pour la recherche d'adresse
  useEffect(() => {
    const timer = setTimeout(() => {
      if (addressSearch) {
        searchAddress(addressSearch)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [addressSearch])

  // Sélectionner une adresse
  const selectAddress = (result: any) => {
    const addr = result.address
    const streetNumber = addr?.house_number || ''
    const street = addr?.road || addr?.pedestrian || addr?.street || ''
    const city = addr?.city || addr?.town || addr?.village || addr?.municipality || ''
    const postalCode = addr?.postcode || ''

    setFormData({
      ...formData,
      address: [streetNumber, street].filter(Boolean).join(' '),
      city: city,
      postalCode: postalCode,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    })
    setShowLocationPicker(false)
    setAddressSearch('')
    setSearchResults([])
  }

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
          latitude: formData.latitude,
          longitude: formData.longitude,
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
        <div className="flex items-center justify-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <span className="text-3xl font-semibold ml-2">Kalendo</span>
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

              {/* Sélection d'adresse avec GPS */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Adresse de l'établissement *
                </label>
                
                {/* Affichage de l'adresse sélectionnée ou bouton pour ouvrir le sélecteur */}
                <div 
                  className="flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-purple-300 transition-colors"
                  onClick={() => setShowLocationPicker(true)}
                >
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <span className={`flex-1 ${formData.address ? 'text-gray-900' : 'text-gray-400'}`}>
                    {formData.address 
                      ? `${formData.address}, ${formData.postalCode} ${formData.city}`
                      : 'Cliquez pour sélectionner votre adresse...'
                    }
                  </span>
                  {formData.address && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFormData({ ...formData, address: '', city: '', postalCode: '', latitude: null, longitude: null })
                      }}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Utilisez votre position GPS ou recherchez votre adresse
                </p>
              </div>

              {/* Modal de sélection d'adresse */}
              {showLocationPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="text-lg font-semibold">Sélectionner une adresse</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLocationPicker(false)
                          setAddressSearch('')
                          setSearchResults([])
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Contenu */}
                    <div className="p-4 space-y-4">
                      {/* Bouton GPS */}
                      <Button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={gettingLocation}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      >
                        {gettingLocation ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Localisation en cours...
                          </>
                        ) : (
                          <>
                            <Navigation className="w-5 h-5 mr-2" />
                            Utiliser ma position actuelle
                          </>
                        )}
                      </Button>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-sm text-gray-500">ou</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>

                      {/* Recherche d'adresse */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher une adresse..."
                          value={addressSearch}
                          onChange={(e) => setAddressSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                          autoFocus
                        />
                        {searching && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600 animate-spin" />
                        )}
                      </div>

                      {/* Résultats de recherche */}
                      {searchResults.length > 0 && (
                        <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                          {searchResults.map((result) => (
                            <button
                              key={result.place_id}
                              type="button"
                              onClick={() => selectAddress(result)}
                              className="w-full p-3 text-left hover:bg-purple-50 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {[result.address?.house_number, result.address?.road].filter(Boolean).join(' ') || result.display_name.split(',')[0]}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {[
                                      result.address?.postcode,
                                      result.address?.city || result.address?.town || result.address?.village || result.address?.municipality
                                    ].filter(Boolean).join(' ')}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {addressSearch.length >= 3 && searchResults.length === 0 && !searching && (
                        <p className="text-center text-gray-500 py-4">
                          Aucune adresse trouvée
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
