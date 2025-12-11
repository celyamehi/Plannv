'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, Star, Navigation, Loader2, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase/client'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import MainHeader from '../../components/layout/MainHeader'
import ClientSidebar from '../../components/layout/ClientSidebar'
import RatingStats from '@/components/establishments/RatingStats'

interface SearchResult {
  id: string
  name: string
  slug: string
  category: string
  city: string
  address: string
  postal_code: string
  description: string
  phone: string
  average_rating: number
  total_reviews: number
  cover_image_url: string | null
  logo_url: string | null
  gallery: string[] | null
  latitude: number | null
  longitude: number | null
  distance?: number
  score_pertinence: number
  score_proximite: number
  score_qualite: number
  score_disponibilite: number
  score_global: number
  main_services: string[]
  next_available_slot?: string
}

const CATEGORIES = [
  { value: 'all', label: 'Toutes catégories' },
  { value: 'coiffeur', label: 'Coiffeur' },
  { value: 'barbier', label: 'Barbier' },
  { value: 'esthetique', label: 'Institut de beauté' },
  { value: 'spa', label: 'Spa & Massage' },
  { value: 'onglerie', label: 'Manucure & Pédicure' },
]

const SORT_OPTIONS = [
  { value: 'recommandes', label: 'Recommandés' },
  { value: 'mieux_notes', label: 'Les mieux notés' },
  { value: 'plus_proches', label: 'Les plus proches' },
]

const NOTE_FILTERS = [
  { value: 0, label: 'Toutes les notes' },
  { value: 3, label: '3+ étoiles' },
  { value: 4, label: '4+ étoiles' },
  { value: 4.5, label: '4.5+ étoiles' },
]

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // États de recherche
  const [searchQuery, setSearchQuery] = useState('')
  const [cityQuery, setCityQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSort, setSelectedSort] = useState('recommandes')
  const [noteMin, setNoteMin] = useState(0)
  
  // États UI
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  
  // Géolocalisation
  const [gettingLocation, setGettingLocation] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  
  // Auto-complétion villes
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const cityInputRef = useRef<HTMLInputElement>(null)

  // Lire les paramètres URL au chargement
  useEffect(() => {
    if (!initialized) {
      const categoryParam = searchParams.get('category')
      const villeParam = searchParams.get('ville')
      const queryParam = searchParams.get('q')
      const sortParam = searchParams.get('sort')
      const noteParam = searchParams.get('note_min')

      if (categoryParam) {
        const categoryMap: { [key: string]: string } = {
          'coiffeur': 'coiffeur',
          'barbier': 'barbier',
          'manucure': 'onglerie',
          'institut': 'esthetique',
          'spa': 'spa',
          'massage': 'spa'
        }
        setSelectedCategory(categoryMap[categoryParam] || categoryParam)
      }
      if (villeParam) setCityQuery(villeParam)
      if (queryParam) setSearchQuery(queryParam)
      if (sortParam) setSelectedSort(sortParam)
      if (noteParam) setNoteMin(parseFloat(noteParam))
      
      setInitialized(true)
    }
  }, [searchParams, initialized])

  // Vérifier l'authentification
  useEffect(() => {
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
    checkAuth()
  }, [])

  // Auto-complétion des villes
  useEffect(() => {
    const fetchCitySuggestions = async () => {
      if (cityQuery.length < 2) {
        setCitySuggestions([])
        return
      }

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: cityQuery })
        })
        const data = await response.json()
        setCitySuggestions(data.cities || [])
      } catch (error) {
        console.error('Erreur auto-complétion:', error)
      }
    }

    const timer = setTimeout(fetchCitySuggestions, 300)
    return () => clearTimeout(timer)
  }, [cityQuery])

  // Recherche principale
  const performSearch = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (cityQuery) params.set('city', cityQuery)
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (noteMin > 0) params.set('note_min', noteMin.toString())
      params.set('sort', selectedSort)
      if (userLocation) {
        params.set('lat', userLocation.lat.toString())
        params.set('lng', userLocation.lng.toString())
      }
      params.set('limit', '30')

      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()

      setResults(data.results || [])
      setTotalResults(data.total || 0)
    } catch (error) {
      console.error('Erreur recherche:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, cityQuery, selectedCategory, selectedSort, noteMin, userLocation])

  // Déclencher la recherche
  useEffect(() => {
    if (initialized) {
      const timer = setTimeout(performSearch, 300)
      return () => clearTimeout(timer)
    }
  }, [initialized, searchQuery, cityQuery, selectedCategory, selectedSort, noteMin, userLocation, performSearch])

  // Géolocalisation
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
      setSelectedSort('plus_proches')

      // Reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=fr`
        )
        const data = await response.json()
        const city = data.address?.city || data.address?.town || data.address?.village || ''
        if (city) setCityQuery(city)
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

  // Sélectionner une ville suggérée
  const selectCity = (city: string) => {
    setCityQuery(city)
    setShowCitySuggestions(false)
  }

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSelectedCategory('all')
    setNoteMin(0)
    setSelectedSort('recommandes')
    setUserLocation(null)
  }

  // Contenu de recherche
  const searchContent = (
    <>
      {/* En-tête avec compteur */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Trouver un salon</h1>
          {!loading && initialized && (
            <p className="text-gray-600 mt-1">
              {totalResults} établissement{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {userLocation && (
          <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <Navigation className="w-4 h-4 mr-1" />
            <span>Position activée</span>
            <button 
              onClick={() => setUserLocation(null)}
              className="ml-2 hover:text-green-800"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Barre de recherche principale */}
      <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Champ de recherche texte */}
          <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-nude-300 focus-within:ring-2 focus-within:ring-nude-100">
            <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Nom du salon ou prestation (ex : coupe homme, manucure...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-gray-900 placeholder-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Champ de localisation avec auto-complétion */}
          <div className="relative flex-1">
            <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-nude-300 focus-within:ring-2 focus-within:ring-nude-100">
              <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input
                ref={cityInputRef}
                type="text"
                placeholder="Ville / Commune (ex : Alger, Oran...)"
                value={cityQuery}
                onChange={(e) => {
                  setCityQuery(e.target.value)
                  setShowCitySuggestions(true)
                }}
                onFocus={() => setShowCitySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-gray-900 placeholder-gray-400"
              />
              {cityQuery && (
                <button onClick={() => setCityQuery('')} className="text-gray-400 hover:text-gray-600 mr-2">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                title="Utiliser ma position"
              >
                {gettingLocation ? (
                  <Loader2 className="w-5 h-5 text-nude-600 animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5 text-nude-600" />
                )}
              </button>
            </div>

            {/* Suggestions de villes */}
            {showCitySuggestions && citySuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {citySuggestions.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => selectCity(city)}
                    className="w-full px-4 py-3 text-left hover:bg-nude-50 flex items-center"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bouton rechercher */}
          <Button 
            onClick={performSearch}
            className="px-8 py-3 bg-gradient-to-r from-nude-600 to-warm-600 text-white rounded-xl font-semibold"
          >
            <Search className="w-5 h-5 mr-2" />
            Rechercher
          </Button>
        </div>
      </section>

      {/* Filtres et tri */}
      <section className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Catégorie */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:border-nude-300"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Note minimale */}
          <div className="relative">
            <select
              value={noteMin}
              onChange={(e) => setNoteMin(parseFloat(e.target.value))}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:border-nude-300"
            >
              {NOTE_FILTERS.map((note) => (
                <option key={note.value} value={note.value}>{note.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Tri */}
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:border-nude-300"
            >
              {SORT_OPTIONS.map((sort) => (
                <option key={sort.value} value={sort.value}>{sort.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Bouton réinitialiser */}
          {(selectedCategory !== 'all' || noteMin > 0 || selectedSort !== 'recommandes') && (
            <button
              onClick={resetFilters}
              className="text-sm text-nude-600 hover:text-nude-700 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Réinitialiser
            </button>
          )}
        </div>
      </section>

      {/* Résultats */}
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
      ) : results.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Aucun établissement trouvé</h3>
          <p className="text-gray-600 mb-4">
            Essayez de modifier vos critères de recherche
          </p>
          <Button onClick={resetFilters} variant="outline">
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((establishment) => (
            <Link
              key={establishment.id}
              href={`/establishments/${establishment.slug}`}
            >
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer h-full group">
                <div className="relative h-48 bg-gradient-to-br from-nude-100 to-warm-100 rounded-t-lg overflow-hidden">
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
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )
                    }

                    return (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-bold text-nude-200">
                          {establishment.name.charAt(0)}
                        </span>
                      </div>
                    )
                  })()}
                  
                  {/* Badge distance */}
                  {establishment.distance !== undefined && establishment.distance < 9999 && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-nude-600">
                      {establishment.distance < 1 
                        ? `${Math.round(establishment.distance * 1000)}m` 
                        : `${establishment.distance.toFixed(1)}km`}
                    </div>
                  )}
                </div>

                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold line-clamp-1">{establishment.name}</h3>
                    <span className="px-2 py-1 bg-nude-100 text-nude-700 text-xs rounded-full whitespace-nowrap ml-2">
                      {establishment.category}
                    </span>
                  </div>

                  {/* Note et avis */}
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 font-medium">{establishment.average_rating?.toFixed(1) || '—'}</span>
                    </div>
                    <span className="text-gray-400 text-sm ml-2">
                      ({establishment.total_reviews || 0} avis)
                    </span>
                  </div>

                  {/* Localisation */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{establishment.city}</span>
                  </div>

                  {/* Prestations principales */}
                  {establishment.main_services && establishment.main_services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {establishment.main_services.slice(0, 3).map((service, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {service}
                        </span>
                      ))}
                    </div>
                  )}

                  <Button className="w-full bg-gradient-to-r from-nude-600 to-warm-600 group-hover:shadow-lg transition-shadow">
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
          <div className="w-16 h-16 border-4 border-nude-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (isLoggedIn) {
    return (
      <ClientSidebar>
        {searchContent}
      </ClientSidebar>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />
      <main className="container mx-auto px-4 py-8 pt-24">
        {searchContent}
      </main>
    </div>
  )
}
