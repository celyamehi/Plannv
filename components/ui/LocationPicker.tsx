'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Navigation, Loader2, X, Search } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'

interface LocationPickerProps {
  onLocationSelect: (location: {
    address: string
    city: string
    postalCode: string
    latitude: number
    longitude: number
  }) => void
  initialLocation?: {
    address?: string
    city?: string
    postalCode?: string
    latitude?: number
    longitude?: number
  }
  className?: string
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    road?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
    postcode?: string
    country?: string
  }
}

export default function LocationPicker({ 
  onLocationSelect, 
  initialLocation,
  className = ''
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    city: string
    postalCode: string
    latitude: number
    longitude: number
  } | null>(null)
  const [displayAddress, setDisplayAddress] = useState('')

  useEffect(() => {
    if (initialLocation?.address || initialLocation?.city) {
      const addr = [
        initialLocation.address,
        initialLocation.postalCode,
        initialLocation.city
      ].filter(Boolean).join(', ')
      setDisplayAddress(addr)
    }
  }, [initialLocation])

  // Recherche d'adresse avec debounce
  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=dz&addressdetails=1&limit=5`
      )
      const data: NominatimResult[] = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Erreur recherche adresse:', error)
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchAddress(searchQuery)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, searchAddress])

  // Obtenir la position GPS actuelle
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

      // Reverse geocoding pour obtenir l'adresse
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=fr`
      )
      const data = await response.json()

      const address = data.address
      const streetAddress = [address.house_number, address.road].filter(Boolean).join(' ')
      const city = address.city || address.town || address.village || address.municipality || ''
      const postalCode = address.postcode || ''

      const location = {
        address: streetAddress,
        city,
        postalCode,
        latitude,
        longitude
      }

      setSelectedLocation(location)
      setDisplayAddress([streetAddress, postalCode, city].filter(Boolean).join(', '))
      onLocationSelect(location)
      setIsOpen(false)
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

  // Sélectionner une adresse depuis les résultats de recherche
  const selectAddress = (result: NominatimResult) => {
    const address = result.address
    const streetAddress = [address.house_number, address.road].filter(Boolean).join(' ')
    const city = address.city || address.town || address.village || address.municipality || ''
    const postalCode = address.postcode || ''

    const location = {
      address: streetAddress,
      city,
      postalCode,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    }

    setSelectedLocation(location)
    setDisplayAddress([streetAddress, postalCode, city].filter(Boolean).join(', '))
    onLocationSelect(location)
    setIsOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <div className={`relative ${className}`}>
      {/* Champ d'affichage */}
      <div 
        className="flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-nude-300 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
        <span className={`flex-1 ${displayAddress ? 'text-gray-900' : 'text-gray-400'}`}>
          {displayAddress || 'Sélectionner une adresse...'}
        </span>
        {displayAddress && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setDisplayAddress('')
              setSelectedLocation(null)
            }}
            className="p-1 hover:bg-gray-200 rounded-full"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Modal de sélection */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Sélectionner une adresse</h3>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setSearchQuery('')
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
                className="w-full bg-gradient-to-r from-nude-600 to-warm-600 text-white"
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
                <Input
                  type="text"
                  placeholder="Rechercher une adresse..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nude-600 animate-spin" />
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
                      className="w-full p-3 text-left hover:bg-nude-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-nude-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {[result.address.house_number, result.address.road].filter(Boolean).join(' ') || result.display_name.split(',')[0]}
                          </p>
                          <p className="text-xs text-gray-500">
                            {[
                              result.address.postcode,
                              result.address.city || result.address.town || result.address.village || result.address.municipality
                            ].filter(Boolean).join(' ')}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 3 && searchResults.length === 0 && !searching && (
                <p className="text-center text-gray-500 py-4">
                  Aucune adresse trouvée
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
