'use client'

import { useState, useEffect } from 'react'
import { Navigation, MapPin, Loader2, CheckCircle2, ExternalLink, RotateCcw } from 'lucide-react'
import algerianCities from '@/data/algerian-cities.json'

export interface LocationData {
  address: string
  city: string
  postalCode: string
  latitude: number | null
  longitude: number | null
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

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  className = '',
}: LocationPickerProps) {
  // Trouver la wilaya initiale
  const findInitialWilaya = () => {
    if (initialLocation?.wilaya) return initialLocation.wilaya
    if (initialLocation?.city) {
      const match = algerianCities.find(w => 
        w.wilaya.toLowerCase() === initialLocation.city?.toLowerCase() ||
        w.communes.some(c => c.toLowerCase() === initialLocation.city?.toLowerCase())
      )
      if (match) return match.wilaya
    }
    return 'Alger'
  }

  const [wilaya, setWilaya] = useState<string>(findInitialWilaya())
  const [city, setCity] = useState<string>(initialLocation?.city || 'Alger Centre')
  const [address, setAddress] = useState<string>(initialLocation?.address || '')
  const [postalCode, setPostalCode] = useState<string>(initialLocation?.postalCode || '')
  const [latitude, setLatitude] = useState<number | null>(initialLocation?.latitude || null)
  const [longitude, setLongitude] = useState<number | null>(initialLocation?.longitude || null)
  
  const [isCustomCity, setIsCustomCity] = useState<boolean>(false)
  const [gettingGps, setGettingGps] = useState<boolean>(false)
  const [gpsSuccess, setGpsSuccess] = useState<string | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)

  // Liste des communes de la wilaya actuelle
  const currentWilayaData = algerianCities.find(w => w.wilaya.toLowerCase() === wilaya.toLowerCase())
  const availableCommunes = currentWilayaData ? currentWilayaData.communes : []

  // Synchronisation avec initialLocation si mis à jour
  useEffect(() => {
    if (initialLocation) {
      if (initialLocation.address !== undefined) setAddress(initialLocation.address)
      if (initialLocation.city !== undefined) setCity(initialLocation.city)
      if (initialLocation.postalCode !== undefined) setPostalCode(initialLocation.postalCode)
      if (initialLocation.latitude !== undefined) setLatitude(initialLocation.latitude)
      if (initialLocation.longitude !== undefined) setLongitude(initialLocation.longitude)
      if (initialLocation.wilaya) {
        setWilaya(initialLocation.wilaya)
      }
    }
  }, [initialLocation])

  // Notifier le parent des changements
  const notifyParent = (updates: Partial<LocationData>) => {
    const updated: LocationData = {
      address: updates.address !== undefined ? updates.address : address,
      city: updates.city !== undefined ? updates.city : city,
      postalCode: updates.postalCode !== undefined ? updates.postalCode : postalCode,
      latitude: updates.latitude !== undefined ? updates.latitude : latitude,
      longitude: updates.longitude !== undefined ? updates.longitude : longitude,
      wilaya: updates.wilaya !== undefined ? updates.wilaya : wilaya,
    }
    onLocationSelect(updated)
  }

  // Changement de Wilaya
  const handleWilayaChange = (newWilaya: string) => {
    setWilaya(newWilaya)
    const wilayaObj = algerianCities.find(w => w.wilaya.toLowerCase() === newWilaya.toLowerCase())
    const defaultCommune = wilayaObj && wilayaObj.communes.length > 0 ? wilayaObj.communes[0] : newWilaya
    setCity(defaultCommune)
    setIsCustomCity(false)
    notifyParent({ wilaya: newWilaya, city: defaultCommune })
  }

  // Changement de Commune
  const handleCommuneChange = (val: string) => {
    if (val === '__custom__') {
      setIsCustomCity(true)
      return
    }
    setCity(val)
    notifyParent({ city: val })
  }

  // Géolocalisation GPS (parfaitement fonctionnelle et directe)
  const handleGetGps = async () => {
    if (!navigator.geolocation) {
      setGpsError('La géolocalisation n\'est pas supportée par votre navigateur.')
      return
    }

    setGettingGps(true)
    setGpsError(null)
    setGpsSuccess(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0
        })
      })

      const lat = position.coords.latitude
      const lng = position.coords.longitude
      setLatitude(lat)
      setLongitude(lng)

      let detectedWilaya = wilaya
      let detectedCity = city
      let detectedAddress = address
      let detectedPostal = postalCode

      // Reverse geocoding via Nominatim
      try {
        const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=fr`
        const revRes = await fetch(revUrl, {
          headers: {
            'User-Agent': 'KalendoApp/1.0 (kalendodz@gmail.com)'
          }
        })

        if (revRes.ok) {
          const revData = await revRes.json()
          const addr = revData.address || {}

          const road = addr.road || addr.pedestrian || ''
          const houseNumber = addr.house_number || ''
          const suburb = addr.suburb || addr.neighbourhood || ''
          const cityCandidate = addr.city || addr.town || addr.village || addr.municipality || suburb || ''
          const stateCandidate = addr.state || ''
          const postcode = addr.postcode || ''

          if (postcode) detectedPostal = postcode

          // Adresse de rue
          const street = [houseNumber, road].filter(Boolean).join(' ')
          if (street) {
            detectedAddress = street
          } else if (suburb) {
            detectedAddress = suburb
          }

          // Détection de la Wilaya et Commune dans la liste algérienne
          for (const w of algerianCities) {
            if (
              stateCandidate.toLowerCase().includes(w.wilaya.toLowerCase()) ||
              cityCandidate.toLowerCase().includes(w.wilaya.toLowerCase())
            ) {
              detectedWilaya = w.wilaya
              const matchedCommune = w.communes.find(c =>
                cityCandidate.toLowerCase().includes(c.toLowerCase()) ||
                suburb.toLowerCase().includes(c.toLowerCase())
              )
              if (matchedCommune) {
                detectedCity = matchedCommune
              } else if (cityCandidate) {
                detectedCity = cityCandidate
              }
              break
            }
          }
        }
      } catch (revErr) {
        console.warn('Reverse geocoding partiel:', revErr)
      }

      // Mettre à jour l'état local
      setWilaya(detectedWilaya)
      setCity(detectedCity)
      if (detectedAddress) setAddress(detectedAddress)
      if (detectedPostal) setPostalCode(detectedPostal)

      // Notifier le parent
      onLocationSelect({
        address: detectedAddress || 'Position GPS',
        city: detectedCity,
        postalCode: detectedPostal,
        latitude: lat,
        longitude: lng,
        wilaya: detectedWilaya,
      })

      setGpsSuccess(`Position GPS enregistrée avec succès ! (${detectedCity}, ${detectedWilaya})`)
      setTimeout(() => setGpsSuccess(null), 5000)

    } catch (err: any) {
      if (err.code === 1) {
        setGpsError('Veuillez autoriser l\'accès à la localisation dans votre navigateur.')
      } else if (err.code === 3) {
        setGpsError('Délai d\'attente GPS dépassé. Veuillez réessayer ou remplir manuellement.')
      } else {
        setGpsError('Impossible d\'obtenir votre position GPS. Veuillez renseigner l\'adresse ci-dessous.')
      }
    } finally {
      setGettingGps(false)
    }
  }

  const googleMapsUrl = latitude && longitude
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null

  return (
    <div className={`space-y-3.5 bg-gray-50/70 p-4 rounded-2xl border border-gray-200/90 shadow-2xs ${className}`}>
      
      {/* 1. Bouton GPS Principal - Simple & Instantané */}
      <div>
        <button
          type="button"
          onClick={handleGetGps}
          disabled={gettingGps}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-r from-nude-700 via-nude-600 to-warm-600 text-white font-semibold text-sm rounded-xl shadow-xs hover:shadow-md hover:from-nude-800 hover:to-warm-700 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {gettingGps ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Détection de votre position GPS en cours...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 text-white fill-white/20" />
              <span>Remplir automatiquement avec ma position GPS</span>
            </>
          )}
        </button>

        {/* Message de succès GPS */}
        {gpsSuccess && (
          <div className="mt-2.5 flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{gpsSuccess}</span>
          </div>
        )}

        {/* Message d'erreur GPS */}
        {gpsError && (
          <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
            {gpsError}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Ou renseignez ci-dessous
        </span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* 2. Champs de localisation directs : Wilaya & Commune */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Wilaya (58 Wilayas d'Algérie) */}
        <div className="space-y-1">
          <label htmlFor="wilaya-select" className="text-xs font-semibold text-gray-700">
            Wilaya *
          </label>
          <select
            id="wilaya-select"
            value={wilaya}
            onChange={(e) => handleWilayaChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-nude-600 focus:border-transparent transition-all"
          >
            {algerianCities.map((item, index) => {
              const wilayaNumber = String(index + 1).padStart(2, '0')
              return (
                <option key={item.wilaya} value={item.wilaya}>
                  {wilayaNumber} - {item.wilaya}
                </option>
              )
            })}
          </select>
        </div>

        {/* Commune / Ville */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="commune-select" className="text-xs font-semibold text-gray-700">
              Commune / Ville *
            </label>
            {isCustomCity && (
              <button
                type="button"
                onClick={() => setIsCustomCity(false)}
                className="text-[11px] text-nude-600 hover:text-nude-700 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Liste des communes
              </button>
            )}
          </div>

          {!isCustomCity ? (
            <select
              id="commune-select"
              value={city}
              onChange={(e) => handleCommuneChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-nude-600 focus:border-transparent transition-all"
            >
              {availableCommunes.map((com) => (
                <option key={com} value={com}>
                  {com}
                </option>
              ))}
              <option value="__custom__">➕ Autre commune (saisie libre)...</option>
            </select>
          ) : (
            <input
              type="text"
              id="commune-input"
              value={city}
              onChange={(e) => {
                setCity(e.target.value)
                notifyParent({ city: e.target.value })
              }}
              placeholder="Nom de votre commune ou quartier"
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-nude-600 focus:border-transparent transition-all"
              required
            />
          )}
        </div>
      </div>

      {/* 3. Adresse précise (Rue, Quartier) */}
      <div className="space-y-1">
        <label htmlFor="address-precise" className="text-xs font-semibold text-gray-700">
          Adresse précise (Rue, quartier, n° de porte, bâtiment) *
        </label>
        <div className="relative flex items-center">
          <MapPin className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            id="address-precise"
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value)
              notifyParent({ address: e.target.value })
            }}
            placeholder="Ex : 12 Rue Didouche Mourad, Centre-ville"
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-nude-600 focus:border-transparent transition-all"
            required
          />
        </div>
      </div>

      {/* 4. Code Postal (Optionnel) & Badge GPS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="w-full sm:w-44 space-y-1">
          <label htmlFor="postal-code" className="text-xs font-medium text-gray-600">
            Code postal (optionnel)
          </label>
          <input
            id="postal-code"
            type="text"
            value={postalCode}
            onChange={(e) => {
              setPostalCode(e.target.value)
              notifyParent({ postalCode: e.target.value })
            }}
            placeholder="Ex : 16000"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-nude-600 transition-all"
          />
        </div>

        {/* Badge Coordonnées GPS avec lien de vérification Google Maps */}
        {latitude && longitude ? (
          <div className="flex items-center gap-2 self-end sm:self-center bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] text-gray-600 font-mono">
              GPS : {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
            </span>
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-nude-600 hover:text-nude-800 inline-flex items-center gap-0.5 ml-1"
                title="Vérifier sur Google Maps"
              >
                <span>Voir sur Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-gray-400 self-end sm:self-center">
            💡 Astuce : Cliquez sur le bouton GPS pour géolocaliser votre salon au mètre près.
          </p>
        )}
      </div>

    </div>
  )
}
