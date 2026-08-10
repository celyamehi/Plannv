// =====================================================
// RATE LIMITING POUR LES ENDPOINTS CRITIQUES
// =====================================================
// Ce module implémente un rate limiting simple basé sur IP
// pour protéger contre les abus et les attaques DoS
// =====================================================

interface RateLimitStore {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitStore>()

// Nettoyer les entrées expirées toutes les minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000)

/**
 * Vérifie si une requête doit être limitée
 * @param identifier Identifiant unique (IP, user ID, etc.)
 * @param limit Nombre maximum de requêtes
 * @param window Fenêtre de temps en millisecondes
 * @returns true si la requête est autorisée, false sinon
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  window: number = 60000 // 1 minute par défaut
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Nouvelle fenêtre ou fenêtre expirée
    const resetTime = now + window
    rateLimitStore.set(identifier, { count: 1, resetTime })
    return { allowed: true, remaining: limit - 1, resetTime }
  }

  // Fenêtre existante
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetTime: entry.resetTime }
}

/**
 * Middleware Next.js pour le rate limiting
 */
export function withRateLimit(limit: number = 100, window: number = 60000) {
  return async (request: Request) => {
    // Extraire l'IP de la requête
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    const result = checkRateLimit(ip, limit, window)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    return null // Continuer normalement
  }
}

/**
 * Limites spécifiques par type d'endpoint
 */
export const RATE_LIMITS = {
  // Recherche : 60 requêtes/minute
  search: { limit: 60, window: 60000 },
  
  // Auth : 10 requêtes/minute
  auth: { limit: 10, window: 60000 },
  
  // Création de rendez-vous : 5 requêtes/minute
  appointments: { limit: 5, window: 60000 },
  
  // Upload d'images : 10 requêtes/minute
  upload: { limit: 10, window: 60000 },
  
  // API générale : 100 requêtes/minute
  general: { limit: 100, window: 60000 }
} as const
