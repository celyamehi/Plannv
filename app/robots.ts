import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/professional/pro-dashboard/',
        '/client/dashboard/',
        '/dashboard/',
        '/auth/',
        '/debug-logs/',
        '/test-auth/',
        '/test-session/',
        '/test-connection/',
      ],
    },
    sitemap: 'https://kalendo.space/sitemap.xml',
  }
}
