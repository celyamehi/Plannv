'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Calendar,
  Share2,
  Check,
  ChevronRight,
  ExternalLink,
  Users,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Info,
  Search,
  X,
  ChevronLeft,
} from 'lucide-react'
import FavoriteButton from '@/components/establishments/FavoriteButton'
import ReviewsList from '@/components/establishments/ReviewsList'
import RatingStats from '@/components/establishments/RatingStats'
import { Button } from '@/components/ui/button'

interface EstablishmentDetailViewProps {
  establishment: any
  services: any[]
  staff: any[]
}

const DAYS_FR = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi'
]

const DAYS_DISPLAY: Record<string, string> = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
  samedi: 'Samedi',
  dimanche: 'Dimanche'
}

export default function EstablishmentDetailView({
  establishment,
  services = [],
  staff = []
}: EstablishmentDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'prestations' | 'informations' | 'equipe' | 'galerie' | 'avis'>('prestations')
  const [copiedLink, setCopiedLink] = useState(false)
  const [searchService, setSearchService] = useState('')
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>('all')
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const galleryImages: string[] = useMemo(() => {
    const list: string[] = []
    if (establishment.cover_image_url) {
      list.push(establishment.cover_image_url)
    }
    if (Array.isArray(establishment.gallery)) {
      establishment.gallery.forEach((img: string) => {
        if (img && !list.includes(img)) list.push(img)
      })
    }
    return list
  }, [establishment])

  const coverImage = establishment.cover_image_url || (galleryImages.length > 0 ? galleryImages[0] : null)

  // Calcul du statut d'ouverture (Ouvert / Fermé)
  const openStatus = useMemo(() => {
    const openingHours = establishment.opening_hours
    if (!openingHours || typeof openingHours !== 'object') {
      return { isOpen: true, text: 'Ouvert aujourd’hui', isNeutral: true }
    }

    try {
      const now = new Date()
      const dayIndex = now.getDay()
      const dayName = DAYS_FR[dayIndex]
      const currentHours = now.getHours()
      const currentMinutes = now.getMinutes()
      const currentTimeVal = currentHours * 60 + currentMinutes

      const todaySchedule = openingHours[dayName]

      if (!todaySchedule || todaySchedule.closed) {
        // Chercher le prochain jour d'ouverture
        for (let i = 1; i <= 7; i++) {
          const nextDayIndex = (dayIndex + i) % 7
          const nextDayName = DAYS_FR[nextDayIndex]
          const nextSchedule = openingHours[nextDayName]
          if (nextSchedule && !nextSchedule.closed && nextSchedule.open) {
            const dayLabel = i === 1 ? 'demain' : DAYS_DISPLAY[nextDayName]?.toLowerCase() || nextDayName
            return {
              isOpen: false,
              text: `Fermé • Ouvre ${dayLabel} à ${nextSchedule.open}`
            }
          }
        }
        return { isOpen: false, text: 'Fermé actuellement' }
      }

      const [openH, openM] = (todaySchedule.open || '09:00').split(':').map(Number)
      const [closeH, closeM] = (todaySchedule.close || '19:00').split(':').map(Number)
      const openVal = openH * 60 + (openM || 0)
      const closeVal = closeH * 60 + (closeM || 0)

      if (currentTimeVal >= openVal && currentTimeVal < closeVal) {
        return {
          isOpen: true,
          text: `Ouvert • Ferme à ${todaySchedule.close || '19:00'}`
        }
      } else if (currentTimeVal < openVal) {
        return {
          isOpen: false,
          text: `Fermé • Ouvre à ${todaySchedule.open || '09:00'}`
        }
      } else {
        // Fermé après l'heure de fermeture aujourd'hui
        return {
          isOpen: false,
          text: `Fermé • Ouvre demain`
        }
      }
    } catch {
      return { isOpen: true, text: 'Ouvert aujourd’hui', isNeutral: true }
    }
  }, [establishment.opening_hours])

  // Catégories uniques de prestations
  const serviceCategories = useMemo(() => {
    const cats = new Set<string>()
    services.forEach((s) => {
      if (s.category) cats.add(s.category)
    })
    return ['all', ...Array.from(cats)]
  }, [services])

  // Filtrage des prestations
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        searchService === '' ||
        s.name?.toLowerCase().includes(searchService.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchService.toLowerCase())
      const matchCat = selectedServiceCategory === 'all' || s.category === selectedServiceCategory
      return matchSearch && matchCat
    })
  }, [services, searchService, selectedServiceCategory])

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 3000)
    }
  }

  const fullAddress = [establishment.address, establishment.postal_code, establishment.city]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="min-h-screen bg-[#faf8f6] pb-24">
      {/* ============================================================ */}
      {/* 1. HERO BANNER CINÉMATOGRAPHIQUE (COMME ZAYNA / CAPTURE)    */}
      {/* ============================================================ */}
      <section className="relative w-full h-80 sm:h-96 md:h-[420px] bg-gray-900 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={establishment.name}
            className="w-full h-full object-cover opacity-90 scale-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-nude-600 via-warm-600 to-nude-800 flex items-center justify-center">
            <span className="text-8xl font-black text-white/20">{establishment.name?.charAt(0)}</span>
          </div>
        )}

        {/* Dégradé sombre pour lisibilité maximale */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />

        {/* Contenu textuel & boutons du Hero */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 sm:px-6 pb-6 sm:pb-8">
            <div className="max-w-4xl space-y-3 sm:space-y-4">
              {/* Badge Statut Ouvert/Fermé */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-black/40 border border-white/20 text-white shadow-sm">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    openStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span>{openStatus.text}</span>
              </div>

              {/* Titre du Salon */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
                {establishment.name}
              </h1>

              {/* Localisation & Note */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/90 text-sm">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-nude-300 mr-1.5 shrink-0" />
                  <span className="font-medium truncate max-w-xs sm:max-w-md">
                    {establishment.address ? `${establishment.address}, ${establishment.city}` : establishment.city}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-white text-xs">
                    {establishment.average_rating ? Number(establishment.average_rating).toFixed(1) : '5.0'}
                  </span>
                  <span className="text-white/70 text-xs">
                    ({establishment.total_reviews || 0} avis)
                  </span>
                </div>
              </div>

              {/* Boutons d'Action Principaux du Hero */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('prestations')
                    const el = document.getElementById('establishment-tabs')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="bg-gradient-to-r from-nude-600 to-warm-600 hover:from-nude-700 hover:to-warm-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-nude-600/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Réserver maintenant</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="bg-white/15 backdrop-blur-md hover:bg-white/25 text-white border border-white/25 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Lien copié !</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Partager</span>
                    </>
                  )}
                </button>

                <FavoriteButton
                  establishmentId={establishment.id}
                  establishmentName={establishment.name}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. BARRE D'ONGLETS STICKY (COMME ZAYNA / CAPTURE D'ÉCRAN)    */}
      {/* ============================================================ */}
      <div id="establishment-tabs" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-xs">
        <div className="container mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-8 overflow-x-auto no-scrollbar py-1" aria-label="Onglets du salon">
            {[
              { id: 'prestations', label: 'Prestations', count: services.length },
              { id: 'informations', label: 'Informations' },
              { id: 'equipe', label: 'Notre équipe', count: staff.length },
              { id: 'galerie', label: 'Galerie', count: galleryImages.length },
              { id: 'avis', label: `Avis clients (${establishment.total_reviews || 0})` },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative py-3.5 px-3 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'text-nude-700 font-bold'
                      : 'text-gray-500 hover:text-gray-900 font-medium'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-nude-100 text-nude-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-nude-600 to-warm-600 rounded-full" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. CONTENU PRINCIPAL PAR ONGLET + COLONNE DROITE STICKY      */}
      {/* ============================================================ */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Colonne Gauche : Contenu de l'onglet actif */}
          <div className="lg:col-span-2 space-y-6">
            {/* ---------------- ONGLET 1: PRESTATIONS ---------------- */}
            {activeTab === 'prestations' && (
              <div className="space-y-6">
                {/* Recherche & Filtres de prestations */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchService}
                      onChange={(e) => setSearchService(e.target.value)}
                      placeholder="Rechercher une prestation (soin, coupe, brushing...)..."
                      className="w-full text-xs sm:text-sm pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nude-500"
                    />
                    {searchService && (
                      <button
                        onClick={() => setSearchService('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {serviceCategories.length > 2 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                      {serviceCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedServiceCategory(cat)}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                            selectedServiceCategory === cat
                              ? 'bg-nude-600 text-white shadow-xs'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {cat === 'all' ? 'Toutes les prestations' : cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Liste des Prestations */}
                {filteredServices.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                    <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Aucune prestation trouvée</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Modifiez votre recherche ou sélectionnez une autre catégorie
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredServices.map((service) => (
                      <div
                        key={service.id}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 hover:border-nude-200 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-base">{service.name}</h3>
                          {service.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2.5 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="w-3.5 h-3.5 text-nude-600 mr-1" />
                              {service.duration || 30} min
                            </span>
                            <span className="font-extrabold text-gray-900 text-sm">
                              {service.price ? `${service.price} DA` : 'Sur devis'}
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/booking/${establishment.slug}?service=${service.id}`}
                          className="shrink-0"
                        >
                          <Button className="w-full sm:w-auto bg-gradient-to-r from-nude-600 to-warm-600 hover:from-nude-700 hover:to-warm-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95">
                            Réserver
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ---------------- ONGLET 2: INFORMATIONS ---------------- */}
            {activeTab === 'informations' && (
              <div className="space-y-6">
                {/* À propos */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-nude-600" />
                    <span>À propos du salon</span>
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {establishment.description ||
                      `Bienvenue chez ${establishment.name}. Notre équipe de professionnelles vous accueille dans un cadre chaleureux et raffiné pour prendre soin de votre beauté.`}
                  </p>
                </div>

                {/* Horaires d'ouverture détaillés */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-nude-600" />
                    <span>Horaires d&apos;ouverture</span>
                  </h3>

                  {establishment.opening_hours && typeof establishment.opening_hours === 'object' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                      {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map((day) => {
                        const sched = establishment.opening_hours[day]
                        const isToday = DAYS_FR[new Date().getDay()] === day
                        return (
                          <div
                            key={day}
                            className={`flex items-center justify-between p-3 rounded-xl border ${
                              isToday
                                ? 'bg-nude-50/80 border-nude-200 text-nude-950 font-bold'
                                : 'bg-gray-50/60 border-gray-100 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="capitalize">{DAYS_DISPLAY[day] || day}</span>
                              {isToday && (
                                <span className="text-[10px] bg-nude-600 text-white px-2 py-0.5 rounded-full font-bold">
                                  Aujourd&apos;hui
                                </span>
                              )}
                            </div>
                            <span className={sched?.closed ? 'text-rose-600 font-semibold' : 'font-medium'}>
                              {sched?.closed ? 'Fermé' : `${sched?.open || '09:00'} - ${sched?.close || '19:00'}`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Horaires non renseignés</p>
                  )}
                </div>

                {/* Adresse & Localisation */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-nude-600" />
                    <span>Adresse & Accès</span>
                  </h3>

                  <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                    <p className="text-sm font-bold text-gray-900">{establishment.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{fullAddress || 'Adresse disponible sur place'}</p>
                    {establishment.phone && (
                      <p className="text-xs text-gray-600 flex items-center gap-1.5 pt-1">
                        <Phone className="w-3.5 h-3.5 text-nude-600" />
                        <a href={`tel:${establishment.phone}`} className="font-semibold text-nude-700 hover:underline">
                          {establishment.phone}
                        </a>
                      </p>
                    )}
                  </div>

                  {/* Bouton Itinéraire Google Maps */}
                  <a
                    href={
                      establishment.latitude && establishment.longitude
                        ? `https://www.google.com/maps?q=${establishment.latitude},${establishment.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([establishment.name, establishment.address, establishment.city, 'Algérie'].filter(Boolean).join(' '))}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-nude-600 to-warm-600 hover:from-nude-700 hover:to-warm-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ouvrir dans Google Maps / Itinéraire</span>
                  </a>
                </div>
              </div>
            )}

            {/* ---------------- ONGLET 3: NOTRE ÉQUIPE ---------------- */}
            {activeTab === 'equipe' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                  <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-nude-600" />
                    <span>Les professionnels à votre service</span>
                  </h3>
                  <p className="text-xs text-gray-500 mb-6">
                    Découvrez notre équipe d&apos;expertes et choisissez votre professionnelle dédiée lors de la réservation
                  </p>

                  {staff.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center">Aucun membre de l&apos;équipe renseigné pour le moment.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {staff.map((member) => (
                        <div
                          key={member.id}
                          className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-nude-600 to-warm-600 flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0">
                              {member.avatar_url ? (
                                <img
                                  src={member.avatar_url}
                                  alt={`${member.first_name} ${member.last_name || ''}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>
                                  {member.first_name?.charAt(0)}
                                  {member.last_name?.charAt(0) || ''}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-gray-900 truncate">
                                {member.first_name} {member.last_name || ''}
                              </h4>
                              <p className="text-xs text-gray-500 truncate">
                                {Array.isArray(member.specialties) && member.specialties.length > 0
                                  ? member.specialties.join(', ')
                                  : 'Praticienne beauté'}
                              </p>
                            </div>
                          </div>

                          <Link
                            href={`/booking/${establishment.slug}?staff=${member.id}`}
                            className="shrink-0"
                          >
                            <span className="text-[11px] font-semibold text-nude-700 hover:text-nude-800 bg-nude-50 hover:bg-nude-100 border border-nude-200 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                              Choisir
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ---------------- ONGLET 4: GALERIE PHOTOS ---------------- */}
            {activeTab === 'galerie' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-nude-600" />
                      <span>Photos du salon et réalisations</span>
                    </h3>
                    <span className="text-xs font-semibold text-gray-500">
                      {galleryImages.length} photo{galleryImages.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {galleryImages.length === 0 ? (
                    <div className="py-12 text-center bg-gray-50 rounded-2xl">
                      <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-700">Aucune photo dans la galerie</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Les photos du salon apparaîtront ici dès qu&apos;elles seront ajoutées.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {galleryImages.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-pointer border border-gray-100 shadow-xs hover:shadow-lg transition-all"
                        >
                          <img
                            src={img}
                            alt={`Réalisation ${idx + 1} de ${establishment.name}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-xs transition-opacity">
                              Agrandir
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Encadré d'information pour le propriétaire du salon */}
                  <div className="mt-8 p-4 bg-nude-50/70 border border-nude-200/80 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-nude-200 text-nude-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-nude-900">Vous êtes le responsable de ce salon ?</p>
                      <p className="text-nude-800/80 leading-relaxed">
                        Vous pouvez enrichir cette galerie avec des photos de votre salon et de vos plus belles réalisations (coiffure, manucure, soins...) directement depuis votre{' '}
                        <Link
                          href="/professional/establishment/settings"
                          className="font-bold underline text-nude-900 hover:text-black"
                        >
                          Espace Pro &gt; Paramètres du salon &gt; Galerie photos
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- ONGLET 5: AVIS CLIENTS ---------------- */}
            {activeTab === 'avis' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-nude-600" />
                    <span>Avis des clientes vérifiées</span>
                  </h3>
                  <ReviewsList establishmentId={establishment.id} />
                </div>
              </div>
            )}
          </div>

          {/* Colonne Droite : Carte de Réservation Sticky (Desktop) */}
          <div className="lg:col-span-1 space-y-6 sticky top-20">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-200/50 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-nude-600">
                  {establishment.category || 'Salon de beauté'}
                </span>
                <h3 className="text-lg font-bold text-gray-900">{establishment.name}</h3>
                <div className="flex items-center text-xs text-gray-500 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-nude-600 mr-1 shrink-0" />
                  <span className="truncate">{establishment.city}</span>
                </div>
              </div>

              <Link
                href={`/booking/${establishment.slug}`}
                className="block w-full"
              >
                <Button className="w-full py-4 text-sm font-bold bg-gradient-to-r from-nude-600 to-warm-600 hover:from-nude-700 hover:to-warm-700 text-white rounded-2xl shadow-lg shadow-nude-600/25 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Prendre rendez-vous</span>
                </Button>
              </Link>

              <div className="pt-4 border-t border-gray-100 space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">{establishment.address || 'Adresse sur place'}</p>
                    <p>{establishment.postal_code} {establishment.city}</p>
                  </div>
                </div>

                {establishment.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <a href={`tel:${establishment.phone}`} className="font-semibold text-nude-700 hover:underline">
                      {establishment.phone}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className={openStatus.isOpen ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                    {openStatus.text}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================ */}
      {/* MODAL LIGHTBOX POUR LA GALERIE PHOTOS                       */}
      {/* ============================================================ */}
      {selectedImageIndex !== null && galleryImages[selectedImageIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setSelectedImageIndex((prev) => (prev === null || prev === 0 ? galleryImages.length - 1 : prev - 1))
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedImageIndex((prev) => (prev === null || prev === galleryImages.length - 1 ? 0 : prev + 1))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[85vh] relative flex flex-col items-center">
            <img
              src={galleryImages[selectedImageIndex]}
              alt={`Photo ${selectedImageIndex + 1}`}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <p className="text-white/70 text-xs mt-3 font-medium">
              Photo {selectedImageIndex + 1} sur {galleryImages.length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
