import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, Clock, Star, Calendar, Euro } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import FavoriteButton from '@/components/establishments/FavoriteButton'
import ReviewsList from '@/components/establishments/ReviewsList'
import RatingStats from '@/components/establishments/RatingStats'
import ClientSidebar from '@/components/layout/ClientSidebar'

interface PageProps {
  params: {
    slug: string
  }
}

// Revalider la page toutes les 10 secondes pour afficher les nouveaux avis
export const revalidate = 10

export default async function EstablishmentPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Récupérer l'établissement
  const { data: establishment, error } = await supabase
    .from('establishments')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !establishment) {
    notFound()
  }

  // Récupérer les services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('establishment_id', establishment.id)
    .eq('is_active', true)
    .order('price', { ascending: true })

  // Récupérer les collaborateurs
  const { data: staff } = await supabase
    .from('staff_members')
    .select('*')
    .eq('establishment_id', establishment.id)
    .eq('is_active', true)

  const openingHours = establishment.opening_hours as any
  const galleryImages = Array.isArray(establishment.gallery) ? establishment.gallery : []
  const coverImage = establishment.cover_image_url || galleryImages[0]

  const content = (
    <>
      {/* Cover Image */}
      <div className="relative h-96 bg-gradient-to-br from-nude-100 to-warm-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={establishment.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-9xl font-bold text-nude-200">
              {establishment.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto">
            <div className="flex items-center gap-4 mb-4">
              {establishment.logo_url && (
                <div className="w-20 h-20 rounded-2xl border border-white/30 overflow-hidden">
                  <img
                    src={establishment.logo_url}
                    alt={`Logo ${establishment.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="inline-flex px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                {establishment.category}
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-2">{establishment.name}</h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-lg">
                <RatingStats establishmentId={establishment.id} />
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-1" />
                  <span>{establishment.city}</span>
                </div>
              </div>
              <FavoriteButton
                establishmentId={establishment.id}
                establishmentName={establishment.name}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>À propos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {establishment.description || 'Bienvenue dans notre établissement !'}
                </p>
              </CardContent>
            </Card>

            {galleryImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Galerie photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                    {galleryImages.map((image: string, index: number) => (
                      <div key={index} className="relative w-full h-40 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Photo ${index + 1} de ${establishment.name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Nos services</CardTitle>
              </CardHeader>
              <CardContent>
                {services && services.length > 0 ? (
                  <div className="space-y-4">
                    {services.map((service: any) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{service.name}</h4>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {service.duration} min
                            </span>
                            <span className="flex items-center">
                              <Euro className="w-4 h-4 mr-1" />
                              {service.price}DA
                            </span>
                          </div>
                        </div>
                        <Link href={`/booking/${establishment.slug}?service=${service.id}`}>
                          <Button className="bg-gradient-to-r from-nude-600 to-warm-600">
                            Réserver
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Aucun service disponible</p>
                )}
              </CardContent>
            </Card>

            {/* Team */}
            {staff && staff.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Notre équipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {staff.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-nude-600 to-warm-600 flex items-center justify-center text-white font-bold text-xl">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt={`${member.first_name} ${member.last_name}`} className="w-full h-full object-cover" />
                          ) : (
                            <span>
                              {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {member.first_name} {member.last_name}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Avis clients</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewsList establishmentId={establishment.id} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Réserver un rendez-vous</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/booking/${establishment.slug}`}>
                  <Button className="w-full bg-gradient-to-r from-nude-600 to-warm-600 text-lg py-6">
                    <Calendar className="w-5 h-5 mr-2" />
                    Prendre rendez-vous
                  </Button>
                </Link>

                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">{establishment.address}</p>
                      <p className="text-gray-600">
                        {establishment.postal_code} {establishment.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a
                      href={`tel:${establishment.phone}`}
                      className="text-sm text-nude-600 hover:text-nude-700"
                    >
                      {establishment.phone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Horaires d'ouverture
                </CardTitle>
              </CardHeader>
              <CardContent>
                {openingHours ? (
                  <div className="space-y-2 text-sm">
                    {Object.entries(openingHours).map(([day, hours]: [string, any]) => (
                      <div key={day} className="flex justify-between">
                        <span className="font-medium capitalize">{day}</span>
                        <span className="text-gray-600">
                          {hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Horaires non renseignés</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )

  if (session) {
    return (
      <ClientSidebar>
        <div className="min-h-screen bg-gray-50">
          {content}
        </div>
      </ClientSidebar>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Public (si non connecté) */}
      {!content && (
        <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-nude-600 to-warm-600 rounded-xl flex items-center justify-center shadow-lg shadow-nude-200">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-nude-600 to-warm-600 bg-clip-text text-transparent">
                Kalendo
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Connexion</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-black text-white hover:bg-gray-800 rounded-full">
                  S'inscrire
                </Button>
              </Link>
            </div>
          </div>
        </header>
      )}{content}
    </div>
  )
}
