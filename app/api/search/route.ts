import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Liste des villes algériennes principales
const ALGERIAN_CITIES = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Sétif',
  'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'El Oued', 'Skikda', 'Tiaret', 'Béjaïa',
  'Tlemcen', 'Bordj Bou Arréridj', 'Béchar', 'Chlef', 'Médéa', 'Mostaganem',
  'Mascara', 'Ouargla', 'Saïda', 'Jijel', 'Relizane', 'M\'Sila', 'Laghouat',
  'Guelma', 'Ghardaïa', 'Khenchela', 'Souk Ahras', 'Mila', 'Aïn Defla',
  'Naâma', 'Aïn Témouchent', 'Tissemsilt', 'El Bayadh', 'Illizi', 'Tindouf',
  'Tamanrasset', 'Adrar', 'Tipaza', 'Boumerdès', 'El Tarf', 'Bouira'
]

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

// Fonction pour calculer la distance Haversine
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Fonction pour normaliser le texte (enlever accents, lowercase)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Fonction pour calculer le score de pertinence
function calculatePertinenceScore(
  establishment: any,
  services: any[],
  query: string
): number {
  if (!query) return 50 // Score neutre si pas de recherche

  const normalizedQuery = normalizeText(query)
  const queryWords = normalizedQuery.split(/\s+/)
  let score = 0
  let hasExactMatch = false

  // Match exact sur le nom du salon (priorité maximale)
  const normalizedName = normalizeText(establishment.name)
  if (normalizedName === normalizedQuery) {
    score += 100
    hasExactMatch = true
  } else if (normalizedName.includes(normalizedQuery)) {
    score += 80
  } else {
    // Match partiel sur les mots du nom
    for (const word of queryWords) {
      if (normalizedName.includes(word)) {
        score += 30
      }
    }
  }

  // Match sur la catégorie
  const normalizedCategory = normalizeText(establishment.category || '')
  if (normalizedCategory.includes(normalizedQuery)) {
    score += 60
    hasExactMatch = true
  } else {
    for (const word of queryWords) {
      if (normalizedCategory.includes(word)) {
        score += 25
      }
    }
  }

  // Match sur les prestations (plus important pour les recherches de services)
  let serviceMatchScore = 0
  for (const service of services) {
    const normalizedServiceName = normalizeText(service.name || '')
    if (normalizedServiceName.includes(normalizedQuery)) {
      serviceMatchScore = Math.max(serviceMatchScore, 70)
      hasExactMatch = true
    } else {
      for (const word of queryWords) {
        if (normalizedServiceName.includes(word)) {
          serviceMatchScore = Math.max(serviceMatchScore, 35)
        }
      }
    }
  }
  score += serviceMatchScore

  // Match sur la description
  const normalizedDescription = normalizeText(establishment.description || '')
  for (const word of queryWords) {
    if (normalizedDescription.includes(word)) {
      score += 5
    }
  }

  // Bonus si correspondance exacte trouvée
  if (hasExactMatch) {
    score += 20
  }

  return Math.min(score, 100) // Plafonner à 100
}

// Fonction pour calculer le score de proximité
function calculateProximiteScore(
  establishment: any,
  city: string,
  userLat?: number,
  userLng?: number
): { score: number; distance?: number } {
  let score = 0
  let distance: number | undefined

  // Match sur la ville
  if (city) {
    const normalizedCity = normalizeText(city)
    const normalizedEstCity = normalizeText(establishment.city || '')
    
    if (normalizedEstCity === normalizedCity) {
      score += 50
    } else if (normalizedEstCity.includes(normalizedCity) || normalizedCity.includes(normalizedEstCity)) {
      score += 30
    }
  }

  // Calcul de distance si coordonnées disponibles
  if (userLat && userLng && establishment.latitude && establishment.longitude) {
    distance = calculateDistance(userLat, userLng, establishment.latitude, establishment.longitude)
    
    // Score basé sur la distance (plus proche = meilleur score)
    if (distance < 1) score += 50
    else if (distance < 3) score += 40
    else if (distance < 5) score += 30
    else if (distance < 10) score += 20
    else if (distance < 20) score += 10
  }

  return { score: Math.min(score, 100), distance }
}

// Fonction pour calculer le score de qualité
function calculateQualiteScore(establishment: any): number {
  let score = 0

  // Note moyenne (0-5 → 0-40 points)
  const rating = establishment.average_rating || 0
  score += (rating / 5) * 40

  // Nombre d'avis (bonus jusqu'à 30 points)
  const reviewCount = establishment.total_reviews || 0
  if (reviewCount >= 50) score += 30
  else if (reviewCount >= 20) score += 25
  else if (reviewCount >= 10) score += 20
  else if (reviewCount >= 5) score += 15
  else if (reviewCount >= 1) score += 10

  // Complétude du profil (jusqu'à 30 points)
  let completeness = 0
  if (establishment.description) completeness += 5
  if (establishment.phone) completeness += 5
  if (establishment.address) completeness += 5
  if (establishment.cover_image_url || establishment.logo_url) completeness += 5
  if (establishment.gallery && establishment.gallery.length > 0) completeness += 5
  if (establishment.latitude && establishment.longitude) completeness += 5
  score += completeness

  return Math.min(score, 100)
}

// Fonction pour calculer le score de disponibilité
async function calculateDisponibiliteScore(
  establishmentId: string
): Promise<{ score: number; nextSlot?: string }> {
  try {
    // Vérifier les rendez-vous des 7 prochains jours
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('appointment_date, start_time')
      .eq('establishment_id', establishmentId)
      .gte('appointment_date', today.toISOString().split('T')[0])
      .lte('appointment_date', nextWeek.toISOString().split('T')[0])
      .in('status', ['pending', 'confirmed'])

    if (error) {
      return { score: 50 } // Score neutre en cas d'erreur
    }

    // Moins de rendez-vous = plus de disponibilité = meilleur score
    const appointmentCount = appointments?.length || 0
    let score = 50

    if (appointmentCount < 5) score = 80
    else if (appointmentCount < 10) score = 60
    else if (appointmentCount < 20) score = 40
    else score = 20

    return { score }
  } catch {
    return { score: 50 }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Paramètres de recherche
    const q = searchParams.get('q') || ''
    const city = searchParams.get('city') || ''
    const category = searchParams.get('category') || ''
    const prestation = searchParams.get('prestation') || ''
    const noteMin = parseFloat(searchParams.get('note_min') || '0')
    const sortBy = searchParams.get('sort') || 'recommandes' // recommandes, mieux_notes, plus_proches
    const userLat = parseFloat(searchParams.get('lat') || '0') || undefined
    const userLng = parseFloat(searchParams.get('lng') || '0') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')

    // Récupérer les établissements actifs
    let query = supabase
      .from('establishments')
      .select('*')
      .eq('is_active', true)

    // Filtre par catégorie
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Filtre par note minimale
    if (noteMin > 0) {
      query = query.gte('average_rating', noteMin)
    }

    const { data: establishments, error: estError } = await query

    if (estError) {
      console.error('Erreur récupération établissements:', estError)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    if (!establishments || establishments.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
        filters: { categories: [], cities: [] }
      })
    }

    // Récupérer les services pour tous les établissements
    const establishmentIds = establishments.map(e => e.id)
    const { data: allServices } = await supabase
      .from('services')
      .select('id, name, establishment_id, category')
      .in('establishment_id', establishmentIds)
      .eq('is_active', true)

    const servicesByEstablishment: Record<string, any[]> = {}
    for (const service of allServices || []) {
      if (!servicesByEstablishment[service.establishment_id]) {
        servicesByEstablishment[service.establishment_id] = []
      }
      servicesByEstablishment[service.establishment_id].push(service)
    }

    // Filtrer par prestation si spécifié OU si recherche principale contient une prestation
    let filteredEstablishments = establishments
    const searchTerms = q || prestation
    
    console.log('🔍 Recherche:', { searchTerms, totalEstablishments: establishments?.length })
    
    if (searchTerms) {
      const normalizedSearch = normalizeText(searchTerms)
      filteredEstablishments = establishments.filter(est => {
        const services = servicesByEstablishment[est.id] || []
        
        // Vérifier si le nom du salon correspond
        if (normalizeText(est.name).includes(normalizedSearch)) {
          console.log(`✅ ${est.name} - Match nom`)
          return true
        }
        
        // Vérifier si la catégorie correspond
        if (normalizeText(est.category || '').includes(normalizedSearch)) {
          console.log(`✅ ${est.name} - Match catégorie: ${est.category}`)
          return true
        }
        
        // Vérifier si une prestation correspond
        const matchingService = services.find(s => normalizeText(s.name).includes(normalizedSearch))
        if (matchingService) {
          console.log(`✅ ${est.name} - Match service: ${matchingService.name}`)
          return true
        }
        
        // Vérifier si la description contient le terme
        if (normalizeText(est.description || '').includes(normalizedSearch)) {
          console.log(`✅ ${est.name} - Match description`)
          return true
        }
        
        return false
      })
      
      console.log(`📊 Résultats filtrés: ${filteredEstablishments.length} / ${establishments?.length}`)
    }

    // Calculer les scores pour chaque établissement
    const results: SearchResult[] = await Promise.all(
      filteredEstablishments.map(async (est) => {
        const services = servicesByEstablishment[est.id] || []
        
        // Calculer les scores
        const scorePertinence = calculatePertinenceScore(est, services, searchTerms || '')
        const { score: scoreProximite, distance } = calculateProximiteScore(est, city, userLat, userLng)
        const scoreQualite = calculateQualiteScore(est)
        const { score: scoreDisponibilite, nextSlot } = await calculateDisponibiliteScore(est.id)

        // Score global pondéré
        const scoreGlobal = (
          scorePertinence * 0.35 +
          scoreProximite * 0.25 +
          scoreQualite * 0.25 +
          scoreDisponibilite * 0.15
        )

        // Extraire les 3 principales prestations
        const mainServices = services.slice(0, 3).map(s => s.name)

        return {
          id: est.id,
          name: est.name,
          slug: est.slug,
          category: est.category,
          city: est.city,
          address: est.address,
          postal_code: est.postal_code,
          description: est.description,
          phone: est.phone,
          average_rating: est.average_rating || 0,
          total_reviews: est.total_reviews || 0,
          cover_image_url: est.cover_image_url,
          logo_url: est.logo_url,
          gallery: est.gallery,
          latitude: est.latitude,
          longitude: est.longitude,
          distance,
          score_pertinence: Math.round(scorePertinence),
          score_proximite: Math.round(scoreProximite),
          score_qualite: Math.round(scoreQualite),
          score_disponibilite: Math.round(scoreDisponibilite),
          score_global: Math.round(scoreGlobal),
          main_services: mainServices,
          next_available_slot: nextSlot
        }
      })
    )

    // Trier selon le critère choisi
    let sortedResults = [...results]
    switch (sortBy) {
      case 'mieux_notes':
        sortedResults.sort((a, b) => b.average_rating - a.average_rating)
        break
      case 'plus_proches':
        sortedResults.sort((a, b) => (a.distance || 9999) - (b.distance || 9999))
        break
      case 'recommandes':
      default:
        sortedResults.sort((a, b) => b.score_global - a.score_global)
        break
    }

    // Limiter les résultats
    sortedResults = sortedResults.slice(0, limit)

    // Extraire les filtres disponibles
    const allCategories = [...new Set(establishments.map(e => e.category).filter(Boolean))]
    const allCities = [...new Set(establishments.map(e => e.city).filter(Boolean))]

    return NextResponse.json({
      results: sortedResults,
      total: results.length,
      filters: {
        categories: allCategories,
        cities: allCities.sort()
      }
    })

  } catch (error) {
    console.error('Erreur recherche:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Endpoint pour l'auto-complétion des villes
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query || query.length < 2) {
      return NextResponse.json({ cities: [] })
    }

    const normalizedQuery = normalizeText(query)
    
    // Filtrer les villes algériennes
    const matchingCities = ALGERIAN_CITIES.filter(city => 
      normalizeText(city).includes(normalizedQuery)
    ).slice(0, 10)

    // Aussi chercher dans les villes des établissements existants
    const { data: dbCities } = await supabase
      .from('establishments')
      .select('city, address')
      .ilike('city', `%${query}%`)
      .eq('is_active', true)
      .limit(10)

    // Extraire les villes uniques et aussi les adresses si elles contiennent des noms de villes
    const dbCityList = [...new Set(dbCities?.map(c => c.city).filter(Boolean) || [])]
    const addressCities = dbCities?.map(c => {
      // Extraire le nom de la ville depuis l'adresse si possible
      const address = c.address || ''
      const words = address.split(' ').filter((w: string) => w.length > 2)
      return words.find((w: string) => 
        w.charAt(0).toUpperCase() === w.charAt(0) && 
        normalizeText(w).includes(normalizedQuery)
      )
    }).filter(Boolean) || []
    
    // Combiner et dédupliquer
    const allCities = [...new Set([...matchingCities, ...dbCityList, ...addressCities])].slice(0, 10)

    return NextResponse.json({ cities: allCities })

  } catch (error) {
    console.error('Erreur auto-complétion:', error)
    return NextResponse.json({ cities: [] })
  }
}
