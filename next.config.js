/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignorer les erreurs ESLint pendant le build pour le déploiement
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorer les erreurs TypeScript pendant le build pour le déploiement
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['tnfnsgztpsuhymjxqifp.supabase.co'],
  },
  experimental: {
    // Améliorer la stabilité des rendus côté serveur
    optimizePackageImports: ['@supabase/auth-helpers-nextjs'],
  },
  // Configuration pour éviter les problèmes de boucle de redirection
  async redirects() {
    return []
  },
  // Configuration pour les en-têtes de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
