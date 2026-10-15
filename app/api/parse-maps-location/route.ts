import { NextRequest, NextResponse } from 'next/server'
import algerianCities from '@/data/algerian-cities.json'

interface LocationResponse {
  success: boolean
  latitude?: number
  longitude?: number
  address?: string
  city?: string
  wilaya?: string
  postalCode?: string
  displayName?: string
  mapsUrl?: string
  placeName?: string
  error?: string
}

function extractCoordinatesFromTextOrUrl(input: string): { lat: number; lng: number } | null {
  if (!input) return null
  const cleaned = input.trim()

  // 1. Protobuf Google Maps: !3d36.752887!4d3.042048
  const protoMatch = cleaned.match(/!3d(-?\d+(?:\.\d+)?)[^!]*!4d(-?\d+(?:\.\d+)?)/)
  if (protoMatch) {
    const lat = parseFloat(protoMatch[1])
    const lng = parseFloat(protoMatch[2])
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
  }

  // 2. URL @latitude,longitude: @36.752887,3.042048
  const atMatch = cleaned.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (atMatch) {
    const lat = parseFloat(atMatch[1])
    const lng = parseFloat(atMatch[2])
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
  }

  // 3. Query params: ?q=36.752887,3.042048 ou ll=36.752887,3.042048
  const queryMatch = cleaned.match(/[?&](?:q|ll|query|loc|center)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1])
    const lng = parseFloat(queryMatch[2])
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
  }

  // 4. Coordonnées décimales directes: 36.752887, 3.042048 ou 36.752887 3.042048
  const decimalMatch = cleaned.match(/(-?\d{1,2}\.\d{3,})[,\s/]+(-?\d{1,3}\.\d{3,})/)
  if (decimalMatch) {
    const lat = parseFloat(decimalMatch[1])
    const lng = parseFloat(decimalMatch[2])
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
  }

  // 5. Coordonnées DMS (Degrés Minutes Secondes): 36°45'10.4"N 3°02'31.4"E
  const dmsRegex = /(\d+)[°\s]+(\d+)['\s]+([\d.]+)"?\s*([NSEWnsew])/g
  const dmsMatches = [...cleaned.matchAll(dmsRegex)]
  if (dmsMatches.length >= 2) {
    const latM = dmsMatches[0]
    const lngM = dmsMatches[1]
    let lat = parseInt(latM[1]) + parseInt(latM[2]) / 60 + parseFloat(latM[3]) / 3600
    if (latM[4].toUpperCase() === 'S') lat = -lat
    let lng = parseInt(lngM[1]) + parseInt(lngM[2]) / 60 + parseFloat(lngM[3]) / 3600
    if (lngM[4].toUpperCase() === 'W') lng = -lng
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
  }

  return null
}

function extractPlaceNameFromUrl(url: string): string | null {
  try {
    const placeMatch = url.match(/\/place\/([^/@?]+)/)
    if (placeMatch && placeMatch[1]) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')).trim()
    }
  } catch {
    // Ignore error
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json<LocationResponse>({
        success: false,
        error: 'Veuillez fournir un lien Google Maps, des coordonnées ou une adresse.'
      }, { status: 200 })
    }

    const rawInput = query.trim()
    let targetUrl = rawInput
    let placeName: string | null = null

    // 1. Si c'est un lien court Google Maps (maps.app.goo.gl ou goo.gl/maps), suivre la redirection
    if (rawInput.startsWith('http') && (rawInput.includes('goo.gl') || rawInput.includes('maps.app'))) {
      try {
        const res = await fetch(rawInput, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        targetUrl = res.url
      } catch (err) {
        console.warn('Impossible de résoudre le lien court Google Maps:', err)
      }
    }

    // Extraire le nom de lieu si présent dans l'URL
    if (targetUrl.startsWith('http')) {
      placeName = extractPlaceNameFromUrl(targetUrl)
    }

    // 2. Extraire les coordonnées GPS
    let coords = extractCoordinatesFromTextOrUrl(targetUrl)
    if (!coords && targetUrl !== rawInput) {
      coords = extractCoordinatesFromTextOrUrl(rawInput)
    }

    // 3. Si coordonnées trouvées, faire un reverse geocoding via Nominatim
    if (coords) {
      try {
        const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1&accept-language=fr`
        const revRes = await fetch(reverseUrl, {
          headers: {
            'User-Agent': 'KalendoApp/1.0 (kalendodz@gmail.com)'
          }
        })
        
        if (revRes.ok) {
          const revData = await revRes.json()
          const addr = revData.address || {}

          const road = addr.road || addr.pedestrian || addr.suburb || ''
          const houseNumber = addr.house_number || ''
          const suburb = addr.suburb || addr.neighbourhood || ''
          const cityCandidate = addr.city || addr.town || addr.village || addr.municipality || suburb || addr.county || ''
          const stateCandidate = addr.state || ''
          const postcode = addr.postcode || ''

          // Construire l'adresse de rue
          let streetAddress = [houseNumber, road].filter(Boolean).join(' ')
          if (!streetAddress && placeName) {
            streetAddress = placeName
          } else if (!streetAddress && suburb) {
            streetAddress = suburb
          } else if (!streetAddress) {
            streetAddress = 'Adresse repérée sur carte'
          }

          // Déterminer la ville et la wilaya
          let city = cityCandidate || stateCandidate || 'Alger'
          let wilaya = stateCandidate || cityCandidate || 'Alger'

          // Chercher une correspondance dans la liste des villes algériennes
          for (const w of algerianCities) {
            if (
              stateCandidate.toLowerCase().includes(w.wilaya.toLowerCase()) ||
              cityCandidate.toLowerCase().includes(w.wilaya.toLowerCase())
            ) {
              wilaya = w.wilaya
              const matchedCommune = w.communes.find(c =>
                cityCandidate.toLowerCase().includes(c.toLowerCase()) ||
                suburb.toLowerCase().includes(c.toLowerCase())
              )
              if (matchedCommune) city = matchedCommune
              break
            }
          }

          return NextResponse.json<LocationResponse>({
            success: true,
            latitude: coords.lat,
            longitude: coords.lng,
            address: streetAddress,
            city: city,
            wilaya: wilaya,
            postalCode: postcode,
            displayName: revData.display_name,
            placeName: placeName || undefined,
            mapsUrl: `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
          })
        }
      } catch (revErr) {
        console.warn('Erreur reverse geocoding:', revErr)
      }

      // Si le reverse geocoding a échoué mais qu'on a les coordonnées GPS
      return NextResponse.json<LocationResponse>({
        success: true,
        latitude: coords.lat,
        longitude: coords.lng,
        address: placeName || 'Position repérée sur Google Maps',
        city: 'Algérie',
        wilaya: '',
        postalCode: '',
        displayName: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
        placeName: placeName || undefined,
        mapsUrl: `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
      })
    }

    // 4. Si aucune coordonnée n'a été extraite directement, effectuer une recherche par texte d'adresse
    const searchQuery = placeName || rawInput
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=dz&addressdetails=1&limit=5&accept-language=fr`
    
    const searchRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'KalendoApp/1.0 (kalendodz@gmail.com)'
      }
    })

    if (searchRes.ok) {
      const results = await searchRes.json()
      if (Array.isArray(results) && results.length > 0) {
        const best = results[0]
        const addr = best.address || {}

        const lat = parseFloat(best.lat)
        const lng = parseFloat(best.lon)
        const road = addr.road || addr.pedestrian || ''
        const houseNumber = addr.house_number || ''
        const suburb = addr.suburb || addr.neighbourhood || ''
        const cityCandidate = addr.city || addr.town || addr.village || addr.municipality || suburb || ''
        const stateCandidate = addr.state || ''

        let streetAddress = [houseNumber, road].filter(Boolean).join(' ') || best.display_name.split(',')[0]
        let city = cityCandidate || stateCandidate || 'Alger'

        return NextResponse.json<LocationResponse>({
          success: true,
          latitude: lat,
          longitude: lng,
          address: streetAddress,
          city: city,
          wilaya: stateCandidate,
          postalCode: addr.postcode || '',
          displayName: best.display_name,
          placeName: placeName || undefined,
          mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`
        })
      }
    }

    return NextResponse.json<LocationResponse>({
      success: false,
      error: 'Impossible d\'extraire automatiquement l\'adresse depuis ce lien ou ce texte. Vous pouvez renseigner votre adresse manuellement ci-dessous.'
    }, { status: 200 })

  } catch (error: any) {
    console.error('Erreur API parse-maps-location:', error)
    return NextResponse.json<LocationResponse>({
      success: false,
      error: error.message || 'Erreur lors du traitement de la localisation'
    }, { status: 500 })
  }
}
