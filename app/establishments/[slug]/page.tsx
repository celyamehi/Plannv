import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import MainHeader from '@/components/layout/MainHeader'
import ClientSidebar from '@/components/layout/ClientSidebar'
import EstablishmentDetailView from '@/components/establishments/EstablishmentDetailView'

interface PageProps {
  params: {
    slug: string
  }
}

// Revalider la page toutes les 10 secondes
export const revalidate = 10

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data: establishment } = await supabase
    .from('establishments')
    .select('name, description, city')
    .eq('slug', params.slug)
    .single()

  if (!establishment) {
    return {
      title: 'Salon non trouvé | Kalendo',
    }
  }

  return {
    title: `${establishment.name} à ${establishment.city} | Réservation sur Kalendo`,
    description: establishment.description || `Prenez rendez-vous en ligne chez ${establishment.name} à ${establishment.city} sur Kalendo.`,
  }
}

export default async function EstablishmentPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 1. Récupérer l'établissement
  const { data: establishment, error } = await supabase
    .from('establishments')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !establishment) {
    notFound()
  }

  // 2. Récupérer les services actifs
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('establishment_id', establishment.id)
    .eq('is_active', true)
    .order('price', { ascending: true })

  // 3. Récupérer les collaborateurs actifs
  const { data: staff } = await supabase
    .from('staff_members')
    .select('*')
    .eq('establishment_id', establishment.id)
    .eq('is_active', true)

  const detailContent = (
    <EstablishmentDetailView
      establishment={establishment}
      services={services || []}
      staff={staff || []}
    />
  )

  // Si l'utilisateur est connecté en tant que client
  if (session) {
    return (
      <ClientSidebar>
        <div className="min-h-screen bg-[#faf8f6]">
          {detailContent}
        </div>
      </ClientSidebar>
    )
  }

  // Visiteur public non connecté : afficher le MainHeader
  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <MainHeader />
      <div className="pt-20">
        {detailContent}
      </div>
    </div>
  )
}
