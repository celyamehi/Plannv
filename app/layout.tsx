import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PlannV - Réservation Beauté & Bien-être',
  description: 'Plateforme de réservation en ligne pour salons de coiffure, instituts de beauté et spas',
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
