import { Metadata } from 'next'
import NosOffresView from '@/components/nos-offres/NosOffresView'

export const metadata: Metadata = {
  title: 'Nos Offres & Tarifs Professionnels — Kalendo Algérie',
  description: 'Découvrez l\'abonnement Kalendo Pro à 1 500 DA / mois avec 30 jours d\'essai gratuit sans engagement. Planning en ligne, réservations 24h/24 et visibilité pour votre salon de beauté en Algérie.',
  openGraph: {
    title: 'Kalendo Pro — Tarifs et Offres pour Salons de Beauté en Algérie',
    description: '30 jours d\'essai gratuit sans engagement puis 1 500 DA / mois. Gérez vos réservations et attirez de nouveaux clients.',
    url: 'https://kalendo.space/nos-offres',
    siteName: 'Kalendo',
    locale: 'fr_DZ',
    type: 'website',
  },
}

export default function NosOffresPage() {
  return <NosOffresView />
}
