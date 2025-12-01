import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kalendo - Réservation Beauté & Bien-être',
  description: 'Réservez vos rendez-vous beauté et bien-être en ligne avec Kalendo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
