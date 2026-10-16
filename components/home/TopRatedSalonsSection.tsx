"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, MapPin, Sparkles, CheckCircle2, ArrowRight, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import AuroraMeshBackground from "@/components/ui/AuroraMeshBackground"

interface SalonItem {
  id: string
  name: string
  slug: string
  category: string
  city: string
  address?: string
  average_rating: number
  total_reviews: number
  cover_image_url: string
  logo_url: string
  is_verified?: boolean
  services: string[]
}
export default function TopRatedSalonsSection() {
  const [salons, setSalons] = useState<SalonItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function loadSalonsFromDb() {
      try {
        setLoading(true)
        // Récupérer uniquement les vrais établissements créés dans la base de données
        const { data: dbEstabs, error: estError } = await supabase
          .from("establishments")
          .select(`
            id,
            name,
            slug,
            category,
            city,
            address,
            average_rating,
            total_reviews,
            cover_image_url,
            logo_url,
            is_verified
          `)
          .order("created_at", { ascending: false })
          .limit(6)

        if (!estError && dbEstabs && dbEstabs.length > 0) {
          const ids = dbEstabs.map((e) => e.id)
          const { data: dbServices } = await supabase
            .from("services")
            .select("establishment_id, name")
            .in("establishment_id", ids)
            .eq("is_active", true)

          const servicesMap: Record<string, string[]> = {}
          for (const s of dbServices || []) {
            if (!servicesMap[s.establishment_id]) {
              servicesMap[s.establishment_id] = []
            }
            if (servicesMap[s.establishment_id].length < 3) {
              servicesMap[s.establishment_id].push(s.name)
            }
          }

          const formatted: SalonItem[] = dbEstabs.map((e) => ({
            id: e.id,
            name: e.name,
            slug: e.slug || e.id,
            category: e.category || "Beauté",
            city: e.city || "Algérie",
            address: e.address || "",
            average_rating: e.average_rating || 5.0,
            total_reviews: e.total_reviews || 0,
            cover_image_url:
              e.cover_image_url ||
              "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
            logo_url:
              e.logo_url ||
              "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80",
            is_verified: e.is_verified ?? true,
            services:
              servicesMap[e.id] && servicesMap[e.id].length > 0
                ? servicesMap[e.id]
                : ["Réservation en ligne", "Prestations beauté"]
          }))

          setSalons(formatted)
        } else {
          setSalons([])
        }
      } catch (err) {
        console.warn("Erreur chargement des salons:", err)
        setSalons([])
      } finally {
        setLoading(false)
        setLoaded(true)
      }
    }

    loadSalonsFromDb()
  }, [])

  // S'il n'y a aucun vrai salon créé dans la base de données, ne rien afficher (pas de faux comptes)
  if (loaded && salons.length === 0) {
    return null
  }

  return (
    <section className="relative py-24 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/80 border-t border-gray-100 overflow-hidden">
      {/* Animated Aurora Mesh Background */}
      <AuroraMeshBackground variant="salons" opacity="opacity-75" showGrid={true} />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-nude-100/90 backdrop-blur-sm text-nude-800 text-xs font-semibold mb-3 border border-nude-200/60 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-nude-700" />
            <span>Ils nous font confiance • Sélection d'excellence en Algérie</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Les salons les mieux notés
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les établissements plébiscités par nos clientes pour la qualité de leurs prestations et leur accueil
          </p>
        </motion.div>

        {/* Salons Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {salons.map((salon, index) => (
            <motion.div
              key={salon.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="h-full"
            >
              <Link
                href={`/establishments/${salon.slug}`}
                className="group block bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/80 shadow-md hover:shadow-2xl hover:border-nude-300 transition-all duration-300 h-full flex flex-col justify-between focus:outline-none"
              >
                <div>
                  {/* Photo de couverture */}
                  <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                    <img
                      src={salon.cover_image_url}
                      alt={salon.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />

                    {/* Dark gradient for text & badges readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Category pill */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                      {salon.category}
                    </div>

                    {/* Rating badge */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{salon.average_rating ? salon.average_rating.toFixed(1) : "5.0"}</span>
                      <span className="text-white/70 text-[10px]">({salon.total_reviews})</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Salon Name & Verified Badge */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-nude-700 transition-colors line-clamp-1">
                          {salon.name}
                        </h3>
                        {salon.is_verified && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        )}
                      </div>

                      {/* Wilaya / Localisation */}
                      <div className="flex items-center text-xs font-medium text-gray-500 mb-2.5">
                        <MapPin className="w-3.5 h-3.5 text-nude-600 mr-1.5 flex-shrink-0" />
                        <span className="line-clamp-1">{salon.address ? `${salon.address}, ${salon.city}` : salon.city}</span>
                      </div>

                      {/* Étoiles & Note */}
                      <div className="flex items-center gap-1.5 mb-4">
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-900 ml-1">
                          {salon.average_rating ? salon.average_rating.toFixed(1) : "5.0"}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({salon.total_reviews || 0})
                        </span>
                      </div>
                    </div>

                    {/* Ligne inférieure : Catégorie à gauche + Bouton "Voir le salon >" à droite */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <span className="px-3 py-1 bg-gray-100/90 text-gray-700 text-xs font-medium rounded-full truncate max-w-[140px]">
                        {salon.category || "Beauté"}
                      </span>

                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-nude-600 to-warm-600 group-hover:from-nude-700 group-hover:to-warm-700 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-xs group-hover:shadow-md transition-all active:scale-95">
                        Voir le salon
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Explore all salons button */}
        <div className="text-center">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border border-gray-200 hover:border-nude-300 text-gray-800 hover:text-nude-800 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span>Explorer tous les établissements en Algérie</span>
            <ArrowRight className="w-4 h-4 text-nude-700" />
          </Link>
        </div>
      </div>
    </section>
  )
}
