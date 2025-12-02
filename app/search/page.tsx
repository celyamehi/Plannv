'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, Star, Navigation, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase/client'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import Navbar from '../../components/layout/Navbar'
import ClientSidebar from '../../components/layout/ClientSidebar'
import RatingStats from '@/components/establishments/RatingStats'

interface Establishment {
  id: string
  name: string
  slug: string
  category: string
  address: string
  city: string
  postal_code: string
  description: string
  phone: string
  average_rating: number
  total_reviews: number
  cover_image_url: string | null
  logo_url?: string | null
  gallery?: string[] | null
}

export default function SearchPage() {
  const router = useRouter()
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cityQuery, setCityQuery] = useState('')
  const [debouncedCityQuery, setDebouncedCityQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  const categories = [
    { value: 'all', label: 'Tous' },
    { value: 'coiffeur', label: 'Coiffeur' },
    { value: 'barbier', label: 'Barbier' },
    { value: 'esthetique', label: 'Esthétique' },
    { value: 'spa', label: 'Spa' },
    { value: 'onglerie', label: 'Onglerie' },
    { value: 'massage', label: 'Massage' },
  ]

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCityQuery(cityQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [cityQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    } catch (error) {
      console.error('Erreur vérification auth:', error)
    } finally {
      setCheckingAuth(false)
    }
  }

  const fetchEstablishments = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('establishments')
        .select('*')
        .eq('is_active', true)

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      if (debouncedCityQuery) {
        query = query.or(`city.ilike.%${debouncedCityQuery}%,postal_code.ilike.%${debouncedCityQuery}%`)
      }

      if (debouncedSearchQuery) {
        query = query.or(`name.ilike.%${debouncedSearchQuery}%,description.ilike.%${debouncedSearchQuery}%`)
      }

      const { data, error } = await query
        .order('average_rating', { ascending: false })
        .limit(20)

      if (error) throw error
      setEstablishments(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, debouncedCityQuery, debouncedSearchQuery])

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
      setUserLocation({ lat: latitude, lng: longitude })

      // Reverse geocoding pour obtenir l'adresse complète
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=fr`
        )
        const data = await response.json()
        const address = data.address
        // Construire l'adresse complète
        const streetNumber = address?.house_number || ''
        const street = address?.road || address?.pedestrian || address?.street || ''
        const city = address?.city || address?.town || address?.village || address?.municipality || ''
        const postalCode = address?.postcode || ''
        
        // Créer une adresse lisible
        const fullAddress = [
          [streetNumber, street].filter(Boolean).join(' '),
          postalCode,
          city
        ].filter(Boolean).join(', ')
        
        if (fullAddress) {
          setCityQuery(fullAddress)
        } else if (city) {
          setCityQuery(city)
        }
      } catch (geoError) {
        console.error('Erreur reverse geocoding:', geoError)
      }
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

  useEffect(() => {
    checkAuth()
    fetchEstablishments()
  }, [])

  useEffect(() => {
    fetchEstablishments()
  }, [selectedCategory, debouncedCityQuery, debouncedSearchQuery, fetchEstablishments])

  // Contenu de recherche (défini comme variable JSX, pas comme fonction)
  const searchContent = (
    <>
      <h1 className="text-3xl font-bold mb-6">Rechercher un salon</h1>

      <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Trouvez votre salon idéal</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
            <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Nom du salon, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
            <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Ville ou code postal"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-gray-900 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="ml-2 p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
              title="Utiliser ma position"
            >
              {gettingLocation ? (
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              ) : (
                <Navigation className="w-5 h-5 text-purple-600" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className={selectedCategory === category.value ? 'bg-purple-600' : ''}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : establishments.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Aucun établissement trouvé</h3>
          <p className="text-gray-600">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {establishments.map((establishment) => (
            <Link
              key={establishment.id}
              href={`/establishments/${establishment.slug}`}
            >
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-lg overflow-hidden">
                  {(() => {
                    const galleryImages = Array.isArray(establishment.gallery) ? establishment.gallery : []
                    const coverImage =
                      establishment.cover_image_url ||
                      (galleryImages.length > 0 ? galleryImages[0] : null) ||
                      establishment.logo_url

                    if (coverImage) {
                      return (
                        <img
                          src={coverImage}
                          alt={establishment.name}
                          className="w-full h-full object-cover"
                        />
                      )
                    }

                    return (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-bold text-purple-200">
                          {establishment.name.charAt(0)}
                        </span>
                      </div>
                    )
                  })()}
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">{establishment.name}</h3>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {establishment.category}
                    </span>
                  </div>

                  <div className="mb-3">
                    <RatingStats establishmentId={establishment.id} />
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{establishment.city}</span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {establishment.description || 'Découvrez nos services de qualité'}
                  </p>

                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                    Réserver
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  // Si l'utilisateur est connecté, utiliser ClientSidebar
  if (isLoggedIn) {
    return (
      <ClientSidebar>
        {searchContent}
      </ClientSidebar>
    )
  }

  // Sinon, utiliser le Navbar classique
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="search" />
      <main className="container mx-auto px-4 py-8">
        {searchContent}
      </main>
    </div>
  )
}
