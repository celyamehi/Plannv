import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kalendo - Réservation Beauté & Bien-être',
  description: 'Réservez vos rendez-vous beauté et bien-être en ligne avec Kalendo',
  icons: {
    icon: '/fav.png',
    shortcut: '/fav.png',
    apple: '/fav.png',
  },
}

import AuthRedirectCatch from '@/components/auth/AuthRedirectCatch'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="font-sans">
      <head>
        <link rel="icon" href="/fav.png" type="image/png" />
        <meta name="google-site-verification" content="94J3jUNLPsqn8uTDYkSkyD9YJwb9wOKFHWeEiPK83wo" />
      </head>
      <body className="font-sans antialiased min-h-screen text-gray-800 selection:bg-nude-200 selection:text-nude-900">
        <AuthRedirectCatch />
        {children}
      </body>
    </html>
  )
}
