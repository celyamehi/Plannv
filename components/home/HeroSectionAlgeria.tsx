"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Search, MapPin, X } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HeroSectionAlgeria() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [cityQuery, setCityQuery] = useState("")
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const cityInputRef = useRef<HTMLInputElement>(null)

  // Auto-complétion des villes via l'API
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

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (cityQuery) params.set("ville", cityQuery)
    if (userLocation) {
      params.set("lat", userLocation.lat.toString())
      params.set("lng", userLocation.lng.toString())
    }
    router.push(`/search?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const selectCity = (city: string) => {
    setCityQuery(city)
    setShowCitySuggestions(false)
  }

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setCityQuery("Ma position")
        setShowCitySuggestions(false)
        setIsLocating(false)
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error)
        alert("Impossible d'obtenir votre position. Veuillez autoriser la géolocalisation.")
        setIsLocating(false)
      },
      { enableHighAccuracy: true }
    )
  }

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#faf8f5] via-white to-white">

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-2 bg-nude-100 text-nude-700 rounded-full text-sm font-medium mb-6">
            🇩🇿 La 1ère plateforme de réservation beauté en Algérie
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Réservez vos rendez-vous beauté{' '}
            <span className="bg-gradient-to-r from-nude-600 to-warm-500 bg-clip-text text-transparent">
              partout en Algérie
            </span>
            <span className="block text-3xl md:text-4xl lg:text-5xl mt-2 text-gray-700">24h/24</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Fini les appels et l'attente ! Trouvez votre coiffeur, barbier ou institut de beauté 
            et réservez en ligne <span className="font-semibold text-nude-600">gratuitement</span>.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/90 backdrop-blur-xl p-3 md:p-4 rounded-3xl shadow-2xl border border-white/50">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-1 flex items-center px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-nude-300 focus-within:ring-4 focus-within:ring-nude-50 focus-within:bg-white transition-all duration-300">
                <Search className="w-5 h-5 text-nude-500 mr-3 flex-shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Coupe homme, brushing, épilation, manucure..." 
                  className="flex-1 outline-none text-base md:text-lg text-gray-700 placeholder:text-gray-400 bg-transparent"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* City Input avec auto-complétion */}
              <div className="relative flex-1 md:max-w-[280px]">
                <div className="flex items-center px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-nude-300 focus-within:ring-4 focus-within:ring-nude-50 focus-within:bg-white transition-all duration-300">
                  <button 
                    onClick={handleGeolocation}
                    disabled={isLocating}
                    className={`mr-3 flex-shrink-0 transition-colors ${isLocating ? 'animate-spin text-nude-500' : 'text-warm-500 hover:text-nude-600'}`}
                    title="Utiliser ma position"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                  <input 
                    ref={cityInputRef}
                    type="text" 
                    value={cityQuery}
                    onChange={(e) => {
                      setCityQuery(e.target.value)
                      setShowCitySuggestions(true)
                      setUserLocation(null)
                    }}
                    onFocus={() => setShowCitySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ville / Commune" 
                    className="flex-1 outline-none text-base md:text-lg text-gray-700 placeholder:text-gray-400 bg-transparent"
                  />
                  {cityQuery && (
                    <button 
                      onClick={() => {
                        setCityQuery('')
                        setUserLocation(null)
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {/* Suggestions de villes */}
                {showCitySuggestions && (citySuggestions.length > 0 || cityQuery.length > 2) && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 max-h-64 overflow-y-auto"
                  >
                    {citySuggestions.map((city, index) => (
                      <button
                        key={index}
                        onClick={() => selectCity(city)}
                        className="w-full px-5 py-3 text-left hover:bg-nude-50 text-gray-700 hover:text-nude-600 transition-colors flex items-center"
                      >
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        {city}
                      </button>
                    ))}
                    
                    {/* Option pour utiliser la ville tapée manuellement */}
                    {cityQuery.length > 2 && !citySuggestions.includes(cityQuery) && (
                      <button
                        onClick={() => selectCity(cityQuery)}
                        className="w-full px-5 py-3 text-left hover:bg-nude-50 flex items-center border-t border-gray-100"
                      >
                        <MapPin className="w-4 h-4 text-nude-500 mr-2" />
                        <span className="text-nude-600 font-medium">Utiliser "{cityQuery}"</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
              
              {/* Search Button */}
              <button 
                onClick={handleSearch}
                className="px-8 md:px-10 py-4 bg-gradient-to-r from-nude-600 to-nude-500 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-nude-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Rechercher
              </button>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm text-gray-500 font-medium"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Réservation instantanée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>100% Gratuit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Disponible 24h/24</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
