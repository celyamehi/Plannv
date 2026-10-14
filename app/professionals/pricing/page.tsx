import { Metadata } from 'next'
import NosOffresView from '@/components/nos-offres/NosOffresView'

export const metadata: Metadata = {
  title: 'Tarifs et Abonnements Professionnels — Kalendo',
  description: 'Découvrez l\'offre Kalendo Pro : 30 jours d\'essai gratuit, abonnement à 1 500 DA / mois sans engagement ni commission.',
}

export default function ProfessionalPricingPage() {
  return <NosOffresView />
}
