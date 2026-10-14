import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter'
import algerianCities from '@/data/algerian-cities.json'

// Flatten the Algerian cities data to get all communes
const ALL_ALGERIAN_CITIES = algerianCities.flatMap(wilaya => [
  wilaya.wilaya,
  ...wilaya.communes
])

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
  establishmentId: string,
  supabase: any
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

const CATEGORY_ALIASES: Record<string, string[]> = {
  barbier: ['barbier', 'barber', 'Barbier'],
  barber: ['barbier', 'barber', 'Barbier'],
  institut: ['institut', 'esthetique', 'Institut de beauté', 'Institut de beaute', 'institut de beauté'],
  esthetique: ['institut', 'esthetique', 'Institut de beauté', 'Institut de beaute', 'institut de beauté'],
  manucure: ['manucure', 'onglerie', 'ongles', 'Manucure & Pédicure', 'Manucure'],
  onglerie: ['manucure', 'onglerie', 'ongles', 'Manucure & Pédicure', 'Manucure'],
  ongles: ['manucure', 'onglerie', 'ongles', 'Manucure & Pédicure', 'Manucure'],
  spa: ['spa', 'massage', 'Spa', 'hammam', 'Hammam'],
  massage: ['spa', 'massage', 'Spa', 'hammam', 'Hammam'],
  coiffeur: ['coiffeur', 'coiffure', 'Coiffeur'],
  coiffure: ['coiffeur', 'coiffure', 'Coiffeur'],
}

const FALLBACK_ESTABLISHMENTS = [
  {
    id: "fb-barbier-1",
    name: "Barber Lounge El-Biar",
    slug: "barber-lounge-el-biar",
    category: "barbier",
    city: "Alger",
    address: "Boulevard Bougara, El Biar",
    postal_code: "16030",
    phone: "0550 12 34 56",
    description: "Barbier traditionnel et moderne pour hommes : coupe aux ciseaux, dégradé américain, taille de barbe au coupe-chou et soins complets.",
    average_rating: 4.9,
    total_reviews: 82,
    cover_image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    logo_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80"
    ],
    latitude: 36.769,
    longitude: 3.033,
    main_services: ["Coupe Dégradé Homme", "Taille de Barbe VIP", "Soin Vapeur"]
  },
  {
    id: "fb-barbier-2",
    name: "Le Gentlemen Club",
    slug: "le-gentlemen-club-setif",
    category: "barbier",
    city: "Sétif",
    address: "Boulevard 8 Mai 1945",
    postal_code: "19000",
    phone: "0661 23 45 67",
    description: "Salon de barbier haut de gamme à Sétif. Confort, précision et soins de barbe d'exception.",
    average_rating: 4.9,
    total_reviews: 29,
    cover_image_url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
    logo_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80"
    ],
    latitude: 36.191,
    longitude: 5.413,
    main_services: ["Coupe Signature", "Rasage à l'Ancienne", "Soin Visage"]
  },
  {
    id: "fb-institut-1",
    name: "L'Atelier Beauté & Spa",
    slug: "latelier-beaute-alger",
    category: "institut",
    city: "Alger",
    address: "Rue Djenane El Malik, Hydra",
    postal_code: "16035",
    phone: "0555 45 67 89",
    description: "Institut de beauté de prestige : soins du visage haute technologie, épilation douce, massages relaxants et rituels personnalisés.",
    average_rating: 4.9,
    total_reviews: 64,
    cover_image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    logo_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
    ],
    latitude: 36.745,
    longitude: 3.042,
    main_services: ["Soin Visage Éclat", "Massage Relaxant", "Épilation Définitive"]
  },
  {
    id: "fb-institut-2",
    name: "Maison de Beauté El Bahia",
    slug: "maison-beaute-el-bahia-oran",
    category: "institut",
    city: "Oran",
    address: "Front de Mer, Centre-ville",
    postal_code: "31000",
    phone: "0770 98 76 54",
    description: "Votre espace bien-être et beauté au cœur d'Oran. Soins anti-âge, épilation orientale et maquillage professionnel.",
    average_rating: 4.9,
    total_reviews: 128,
    cover_image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    logo_url: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"
    ],
    latitude: 35.705,
    longitude: -0.635,
    main_services: ["Soin visage", "Épilation", "Maquillage"]
  },
  {
    id: "fb-manucure-1",
    name: "Maison de Beauté & Onglerie",
    slug: "maison-beaute-onglerie-oran",
    category: "manucure",
    city: "Oran",
    address: "Résidence El Bahia, Akid Lotfi",
    postal_code: "31000",
    phone: "0552 11 22 33",
    description: "Studio expert en manucure russe, pose gel, capsules américaines et nail art tendance.",
    average_rating: 4.8,
    total_reviews: 53,
    cover_image_url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80",
    logo_url: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80"
    ],
    latitude: 35.712,
    longitude: -0.612,
    main_services: ["Pose Gel & Capsules", "Nail Art Personnalisé", "Soin Russe"]
  },
  {
    id: "fb-manucure-2",
    name: "Nails & Beauty Lounge",
    slug: "nails-beauty-lounge-alger",
    category: "manucure",
    city: "Alger",
    address: "Sidi Yahia, Hydra",
    postal_code: "16035",
    phone: "0559 88 77 66",
    description: "Bar à ongles chic à Sidi Yahia. Manucure, pédicure spa et vernis semi-permanent longue tenue.",
    average_rating: 4.8,
    total_reviews: 41,
    cover_image_url: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80",
    logo_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80"
    ],
    latitude: 36.741,
    longitude: 3.038,
    main_services: ["Manucure Russe", "Pédicure Spa", "Vernis Semi-Permanent"]
  },
  {
    id: "fb-spa-1",
    name: "Royal Spa & Hammam",
    slug: "royal-spa-hammam-constantine",
    category: "spa",
    city: "Constantine",
    address: "Cité Sidi Mabrouk",
    postal_code: "25000",
    phone: "0560 33 44 55",
    description: "Hammam traditionnel et spa moderne à Constantine. Massages aux huiles précieuses, gommage oriental et détente absolue.",
    average_rating: 4.8,
    total_reviews: 76,
    cover_image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    logo_url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
    ],
    latitude: 36.365,
    longitude: 6.614,
    main_services: ["Hammam Traditionnel", "Massage aux Huiles d'Argan", "Gommage Corporel"]
  },
  {
    id: "fb-spa-2",
    name: "Les Bains d'Orient Spa",
    slug: "les-bains-dorient-alger",
    category: "spa",
    city: "Alger",
    address: "Dely Ibrahim",
    postal_code: "16047",
    phone: "0554 22 11 00",
    description: "Sanctuaire de bien-être à Alger : rituel hammam impérial, massage pierres chaudes et soins corporels relaxants.",
    average_rating: 4.9,
    total_reviews: 59,
    cover_image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
    logo_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80"
    ],
    latitude: 36.755,
    longitude: 2.985,
    main_services: ["Rituel Hammam Impérial", "Massage Pierres Chaudes", "Soin Enveloppement"]
  },
  {
    id: "fb-coiffeur-1",
    name: "Salon Prestige El Aurassi",
    slug: "salon-prestige-alger-centre",
    category: "coiffeur",
    city: "Alger",
    address: "Alger Centre",
    postal_code: "16000",
    phone: "0550 77 66 55",
    description: "Salon de coiffure femme d'exception : coupes tendances, colorations sur mesure, lissages et coiffures de mariage.",
    average_rating: 4.8,
    total_reviews: 95,
    cover_image_url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
    logo_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80"
    ],
    latitude: 36.775,
    longitude: 3.058,
    main_services: ["Brushing Lissant", "Coupe Stylisée", "Coloration Balayage"]
  }
]

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown'
  const rateLimitResult = checkRateLimit(ip, RATE_LIMITS.search.limit, RATE_LIMITS.search.window)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMITS.search.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
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

    let establishments: any[] | null = null
    let usingFallback = false

    try {
      // Récupérer les établissements actifs
      let query = supabase
        .from('establishments')
        .select('*')
        .eq('is_active', true)

      // Filtre par catégorie avec alias
      if (category && category !== 'all') {
        const catKey = category.toLowerCase().trim()
        const matchCategories = CATEGORY_ALIASES[catKey] || [catKey]
        query = query.in('category', matchCategories)
      }

      // Filtre par note minimale
      if (noteMin > 0) {
        query = query.gte('average_rating', noteMin)
      }

      const { data, error: estError } = await query

      if (estError || !data || data.length === 0) {
        usingFallback = true
      } else {
        establishments = data
      }
    } catch {
      usingFallback = true
    }

    // Si la base de données est indisponible ou vide, utiliser les données locales
    if (usingFallback || !establishments || establishments.length === 0) {
      let filtered = [...FALLBACK_ESTABLISHMENTS]

      // Filtrer par catégorie
      if (category && category !== 'all') {
        const catKey = category.toLowerCase().trim()
        const matchCategories = (CATEGORY_ALIASES[catKey] || [catKey]).map(c => c.toLowerCase())
        filtered = filtered.filter(e => matchCategories.includes(e.category.toLowerCase()))
      }

      // Filtrer par note minimale
      if (noteMin > 0) {
        filtered = filtered.filter(e => (e.average_rating || 0) >= noteMin)
      }

      // Filtrer par ville
      if (city) {
        const normCity = normalizeText(city)
        filtered = filtered.filter(e => 
          normalizeText(e.city).includes(normCity) || 
          normCity.includes(normalizeText(e.city))
        )
      }

      // Filtrer par prestation ou recherche textuelle
      const searchTerms = q || prestation
      if (searchTerms) {
        const normSearch = normalizeText(searchTerms)
        filtered = filtered.filter(e =>
          normalizeText(e.name).includes(normSearch) ||
          normalizeText(e.category).includes(normSearch) ||
          normalizeText(e.description || '').includes(normSearch) ||
          e.main_services.some(s => normalizeText(s).includes(normSearch))
        )
      }

      // Calculer les scores
      const fallbackResults: SearchResult[] = filtered.map(est => {
        const services = est.main_services.map(name => ({ name, category: est.category }))
        const scorePertinence = calculatePertinenceScore(est, services, searchTerms || '')
        const { score: scoreProximite, distance } = calculateProximiteScore(est, city, userLat, userLng)
        const scoreQualite = calculateQualiteScore(est)
        const scoreDisponibilite = 85
        const scoreGlobal = Math.round(
          scorePertinence * 0.20 +
          scoreProximite * 0.35 +
          scoreQualite * 0.35 +
          scoreDisponibilite * 0.10
        )

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
          average_rating: est.average_rating,
          total_reviews: est.total_reviews,
          cover_image_url: est.cover_image_url,
          logo_url: est.logo_url,
          gallery: est.gallery,
          latitude: est.latitude,
          longitude: est.longitude,
          distance,
          score_pertinence: Math.round(scorePertinence),
          score_proximite: Math.round(scoreProximite),
          score_qualite: Math.round(scoreQualite),
          score_disponibilite: scoreDisponibilite,
          score_global: scoreGlobal,
          main_services: est.main_services,
          next_available_slot: "Aujourd'hui à 14:00"
        }
      })

      // Trier
      switch (sortBy) {
        case 'mieux_notes':
          fallbackResults.sort((a, b) => b.average_rating - a.average_rating)
          break
        case 'plus_proches':
          fallbackResults.sort((a, b) => (a.distance || 9999) - (b.distance || 9999))
          break
        case 'recommandes':
        default:
          fallbackResults.sort((a, b) => b.score_global - a.score_global)
          break
      }

      const allCategories = ['institut', 'manucure', 'spa', 'barbier', 'coiffeur']
      const allCities = [...new Set(FALLBACK_ESTABLISHMENTS.map(e => e.city))]

      return NextResponse.json({
        results: fallbackResults.slice(0, limit),
        total: fallbackResults.length,
        filters: {
          categories: allCategories,
          cities: allCities.sort()
        }
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
        const { score: scoreDisponibilite, nextSlot } = await calculateDisponibiliteScore(est.id, supabase)

        // Score global pondéré (priorité à la proximité et la qualité)
        const scoreGlobal = (
          scorePertinence * 0.20 +
          scoreProximite * 0.35 +
          scoreQualite * 0.35 +
          scoreDisponibilite * 0.10
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
    const supabase = createRouteHandlerClient({ cookies })
    const { query } = await request.json()
    
    if (!query || query.length < 2) {
      return NextResponse.json({ cities: [] })
    }

    const normalizedQuery = normalizeText(query)
    
    // Filtrer les villes algériennes (toutes les wilayas et communes)
    const matchingCities = ALL_ALGERIAN_CITIES.filter(city => 
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
    const dbCityList = [...new Set(dbCities?.map((c: any) => c.city).filter(Boolean) || [])]
    const addressCities = dbCities?.map((c: any) => {
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
