'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  MapPin, Navigation, Loader2, X, Search, 
  ExternalLink, Check, Sparkles, ClipboardPaste, 
  Building, Compass, CheckCircle2
} from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import algerianCities from '@/data/algerian-cities.json'

export interface LocationData {
  address: string
  city: string
  postalCode: string
  latitude: number
  longitude: number
  wilaya?: string
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void
  initialLocation?: {
    address?: string
    city?: string
    postalCode?: string
    latitude?: number | null
    longitude?: number | null
    wilaya?: string
  }
  className?: string
  showDirectFields?: boolean
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
    suburb?: string
    state?: string
    postcode?: string
    country?: string
  }
}

export default function LocationPicker({ 
  onLocationSelect, 
  initialLocation,
  className = '',
  showDirectFields = false
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'maps' | 'search' | 'gps'>('maps')

  // Données de localisation courantes
  const [formData, setFormData] = useState<LocationData>({
    address: initialLocation?.address || '',
    city: initialLocation?.city || '',
    postalCode: initialLocation?.postalCode || '',
    latitude: initialLocation?.latitude || 36.752887,
    longitude: initialLocation?.longitude || 3.042048,
    wilaya: initialLocation?.wilaya || ''
  })

  // États pour l'extraction Google Maps
  const [mapsInput, setMapsInput] = useState('')
  const [parsingMaps, setParsingMaps] = useState(false)
  const [mapsSuccessMsg, setMapsSuccessMsg] = useState<string | null>(null)
  const [mapsErrorMsg, setMapsErrorMsg] = useState<string | null>(null)

  // États pour la recherche d'adresse
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)

  // État GPS
  const [gettingLocation, setGettingLocation] = useState(false)

  // Mettre à jour si initialLocation change
  useEffect(() => {
    if (initialLocation) {
      setFormData(prev => ({
        address: initialLocation.address ?? prev.address,
        city: initialLocation.city ?? prev.city,
        postalCode: initialLocation.postalCode ?? prev.postalCode,
        latitude: initialLocation.latitude ?? prev.latitude,
        longitude: initialLocation.longitude ?? prev.longitude,
        wilaya: initialLocation.wilaya ?? prev.wilaya
      }))
    }
  }, [initialLocation])

  // Déduire la wilaya à partir de la ville si non définie
  const communesOfSelectedWilaya = formData.wilaya 
    ? algerianCities.find(w => w.wilaya.toLowerCase() === formData.wilaya?.toLowerCase())?.communes || []
    : []

  // 1. Extraire depuis un lien, des coordonnées ou une adresse Google Maps
  const handleParseGoogleMaps = async (textToParse?: string) => {
    const query = (textToParse ?? mapsInput).trim()
    if (!query) {
      setMapsErrorMsg('Veuillez coller un lien Google Maps ou des coordonnées GPS')
      return
    }

    setParsingMaps(true)
    setMapsErrorMsg(null)
    setMapsSuccessMsg(null)

    try {
      const res = await fetch('/api/parse-maps-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Impossible d\'extraire l\'adresse')
      }

      const updatedLocation: LocationData = {
        address: data.address || formData.address,
        city: data.city || formData.city,
        postalCode: data.postalCode || formData.postalCode,
        latitude: data.latitude ?? formData.latitude,
        longitude: data.longitude ?? formData.longitude,
        wilaya: data.wilaya || formData.wilaya
      }

      setFormData(updatedLocation)
      onLocationSelect(updatedLocation)
      setMapsSuccessMsg('✅ Localisation Google Maps extraite et appliquée avec succès !')
    } catch (err: any) {
      console.error('Erreur analyse Google Maps:', err)
      setMapsErrorMsg(err.message || 'Erreur lors de l\'analyse du lien Google Maps')
    } finally {
      setParsingMaps(false)
    }
  }

  // 2. Coller directement depuis le presse-papier
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText()
        if (text) {
          setMapsInput(text)
          handleParseGoogleMaps(text)
        }
      } else {
        alert('Veuillez coller manuellement le lien dans le champ (Ctrl + V ou appui long).')
      }
    } catch {
      alert('Veuillez coller manuellement le lien dans le champ.')
    }
  }

  // 3. Recherche texte Nominatim
  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=dz&addressdetails=1&limit=5&accept-language=fr`
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

  // Sélectionner un résultat de recherche
  const selectSearchResult = (result: NominatimResult) => {
    const addr = result.address || {}
    const streetAddress = [addr.house_number, addr.road].filter(Boolean).join(' ') || result.display_name.split(',')[0]
    const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || ''
    const postalCode = addr.postcode || ''
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const wilaya = addr.state || ''

    const newLoc: LocationData = {
      address: streetAddress,
      city: city || wilaya || 'Alger',
      postalCode,
      latitude: lat,
      longitude: lng,
      wilaya
    }

    setFormData(newLoc)
    onLocationSelect(newLoc)
    setSearchResults([])
    setSearchQuery('')
    setMapsSuccessMsg('✅ Adresse sélectionnée !')
  }

  // 4. Géolocalisation GPS directe du navigateur
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.')
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

      // Appel à notre API pour reverse-geocoder et normaliser
      const res = await fetch('/api/parse-maps-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `${latitude}, ${longitude}` })
      })
      const data = await res.json()

      const newLoc: LocationData = {
        address: data.address || 'Position GPS actuelle',
        city: data.city || 'Alger',
        postalCode: data.postalCode || '',
        latitude,
        longitude,
        wilaya: data.wilaya || ''
      }

      setFormData(newLoc)
      onLocationSelect(newLoc)
      setMapsSuccessMsg('✅ Position GPS détectée avec succès !')
    } catch (error: any) {
      if (error.code === 1) {
        alert('Veuillez autoriser l\'accès à votre position dans votre navigateur.')
      } else {
        alert('Impossible de récupérer votre position GPS actuelle.')
      }
    } finally {
      setGettingLocation(false)
    }
  }

  // Mettre à jour les champs manuels
  const handleManualChange = (field: keyof LocationData, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onLocationSelect(updated)
  }

  // URL Google Maps pour vérifier le point
  const googleMapsUrl = formData.latitude && formData.longitude
    ? `https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`
    : formData.address || formData.city
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([formData.address, formData.city, 'Algérie'].filter(Boolean).join(' '))}`
    : null

  const displaySummary = [
    formData.address,
    formData.city,
    formData.wilaya && formData.wilaya !== formData.city ? `(${formData.wilaya})` : ''
  ].filter(Boolean).join(', ')

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barre de prévisualisation cliquable */}
      <div 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl hover:border-nude-400 hover:shadow-sm cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-nude-50 border border-nude-200 flex items-center justify-center flex-shrink-0 group-hover:bg-nude-100 transition-colors">
            <MapPin className="w-5 h-5 text-nude-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium">Adresse & Localisation du salon</p>
            <p className="text-sm font-bold text-gray-900 truncate">
              {displaySummary || 'Définir l\'adresse ou coller depuis Google Maps...'}
            </p>
            {formData.latitude && formData.longitude && (
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                GPS: {Number(formData.latitude).toFixed(5)}, {Number(formData.longitude).toFixed(5)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
              title="Tester et voir sur Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Maps</span>
            </a>
          )}
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-semibold text-nude-700 bg-nude-50 hover:bg-nude-100 border border-nude-200 rounded-lg transition-colors"
          >
            Modifier
          </button>
        </div>
      </div>

      {/* Champs directs optionnels (si showDirectFields est actif) */}
      {showDirectFields && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Adresse précise (Rue, Quartier)</label>
            <Input
              value={formData.address}
              onChange={(e) => handleManualChange('address', e.target.value)}
              placeholder="Ex: 12 Rue Didouche Mourad"
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ville / Commune</label>
            <Input
              value={formData.city}
              onChange={(e) => handleManualChange('city', e.target.value)}
              placeholder="Ex: Alger Centre, Oran, Hydra..."
              className="text-sm"
            />
          </div>
        </div>
      )}

      {/* MODAL COMPLET DE SÉLECTION & LOCALISATION */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nude-600 to-warm-600 flex items-center justify-center text-white shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Localisation précise du salon</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Copiez depuis Google Maps, utilisez votre GPS ou saisissez manuellement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Onglets de méthodes */}
            <div className="flex border-b border-gray-200 px-4 sm:px-6 pt-3 gap-2 bg-gray-50/60">
              <button
                type="button"
                onClick={() => setActiveTab('maps')}
                className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'maps'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Coller depuis Google Maps</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'search'
                    ? 'border-nude-600 text-nude-800'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Search className="w-4 h-4 text-nude-600" />
                <span>Rechercher une rue</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('gps')}
                className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'gps'
                    ? 'border-blue-600 text-blue-800'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Position GPS</span>
              </button>
            </div>

            {/* Corps du modal */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* ONGLET GOOGLE MAPS */}
              {activeTab === 'maps' && (
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">📍</span>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        Copiez l'adresse ou le lien depuis Google Maps
                      </h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Sur votre téléphone ou ordinateur, ouvrez Google Maps sur votre salon, cliquez sur <strong>Partager &gt; Copier le lien</strong> (ex: <code className="bg-emerald-100 px-1 py-0.5 rounded text-[11px]">maps.app.goo.gl/...</code>) ou copiez directement les <strong>coordonnées GPS</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <div className="flex-1 relative">
                      <Input
                        type="text"
                        placeholder="Collez ici le lien Google Maps ou les coordonnées..."
                        value={mapsInput}
                        onChange={(e) => setMapsInput(e.target.value)}
                        className="pr-20 text-xs sm:text-sm bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleParseGoogleMaps()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handlePasteClipboard}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 rounded transition-colors flex items-center gap-1"
                        title="Coller depuis le presse-papier"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5" />
                        <span>Coller</span>
                      </button>
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleParseGoogleMaps()}
                      disabled={parsingMaps}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm flex-shrink-0"
                    >
                      {parsingMaps ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          Analyse en cours...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1.5" />
                          Extraire l'adresse
                        </>
                      )}
                    </Button>
                  </div>

                  {mapsSuccessMsg && (
                    <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <span>{mapsSuccessMsg}</span>
                    </div>
                  )}

                  {mapsErrorMsg && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                      {mapsErrorMsg}
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET RECHERCHE */}
              {activeTab === 'search' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Rechercher une rue, un quartier ou une commune en Algérie..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 text-sm"
                      autoFocus
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nude-600 animate-spin" />
                    )}
                  </div>

                  {searchResults.length > 0 && (
                    <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-xl divide-y bg-white">
                      {searchResults.map((result) => (
                        <button
                          key={result.place_id}
                          type="button"
                          onClick={() => selectSearchResult(result)}
                          className="w-full p-3 text-left hover:bg-nude-50/80 transition-colors flex items-start gap-2.5"
                        >
                          <MapPin className="w-4 h-4 text-nude-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900">
                              {[result.address.house_number, result.address.road].filter(Boolean).join(' ') || result.display_name.split(',')[0]}
                            </p>
                            <p className="text-xs text-gray-500">
                              {result.display_name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchQuery.length >= 3 && searchResults.length === 0 && !searching && (
                    <p className="text-center text-xs text-gray-500 py-3">
                      Aucun résultat correspondant trouvé. Essayez avec le nom de la wilaya ou utilisez l'onglet Google Maps.
                    </p>
                  )}
                </div>
              )}

              {/* ONGLET GPS */}
              {activeTab === 'gps' && (
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto text-blue-600">
                    <Navigation className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-950">
                      Utiliser la position GPS de votre appareil
                    </h4>
                    <p className="text-xs text-blue-800 mt-1 max-w-md mx-auto">
                      Si vous êtes actuellement dans votre salon, nous pouvons récupérer automatiquement vos coordonnées exactes.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm"
                  >
                    {gettingLocation ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Localisation en cours...
                      </>
                    ) : (
                      <>
                        <Compass className="w-4 h-4 mr-2" />
                        Détecter ma position actuelle
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* CHAMPS DE SAISIE ET D'AJUSTEMENT MANUEL (TOUJOURS DISPONIBLES) */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-gray-500" />
                    <span>Détails de l'adresse enregistrée</span>
                  </h4>
                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Vérifier sur Google Maps</span>
                    </a>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Adresse complète (Rue, Numéro, Repère ou Bâtiment) *
                    </label>
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleManualChange('address', e.target.value)}
                      placeholder="Ex : 15 Rue Didouche Mourad (en face de la poste)"
                      className="text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Wilaya
                      </label>
                      <select
                        value={formData.wilaya || ''}
                        onChange={(e) => {
                          const w = e.target.value
                          handleManualChange('wilaya', w)
                          if (!formData.city || communesOfSelectedWilaya.length === 0) {
                            handleManualChange('city', w)
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-nude-400"
                      >
                        <option value="">Sélectionner une wilaya...</option>
                        {algerianCities.map((w) => (
                          <option key={w.wilaya} value={w.wilaya}>
                            {w.wilaya}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ville / Commune *
                      </label>
                      {communesOfSelectedWilaya.length > 0 ? (
                        <div className="space-y-1">
                          <select
                            value={formData.city}
                            onChange={(e) => handleManualChange('city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-nude-400"
                          >
                            <option value="">Sélectionner la commune...</option>
                            {communesOfSelectedWilaya.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                            <option value="__other__">Autre commune...</option>
                          </select>
                          {formData.city === '__other__' && (
                            <Input
                              type="text"
                              placeholder="Précisez la commune..."
                              onChange={(e) => handleManualChange('city', e.target.value)}
                              className="text-sm mt-1"
                            />
                          )}
                        </div>
                      ) : (
                        <Input
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleManualChange('city', e.target.value)}
                          placeholder="Ex : Alger Centre, Hydra, Oran..."
                          className="text-sm"
                          required
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Code Postal
                      </label>
                      <Input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleManualChange('postalCode', e.target.value)}
                        placeholder="Ex : 16000"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Latitude GPS
                      </label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.latitude || ''}
                        onChange={(e) => handleManualChange('latitude', parseFloat(e.target.value) || 0)}
                        placeholder="36.752887"
                        className="text-sm font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Longitude GPS
                      </label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.longitude || ''}
                        onChange={(e) => handleManualChange('longitude', parseFloat(e.target.value) || 0)}
                        placeholder="3.042048"
                        className="text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pied du modal */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-white transition-colors"
              >
                Annuler
              </button>

              <Button
                type="button"
                onClick={() => {
                  onLocationSelect(formData)
                  setIsOpen(false)
                }}
                className="bg-gradient-to-r from-nude-600 to-warm-600 text-white font-semibold text-sm px-6"
              >
                Valider cette adresse
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
