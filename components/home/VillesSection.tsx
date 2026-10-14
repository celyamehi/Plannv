"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"

const villesPopulaires = [
  "Alger",
  "Oran",
  "Constantine",
  "Annaba",
  "Sétif",
  "Blida",
  "Béjaïa",
  "Tizi Ouzou",
]

const liensRapides = [
  { label: "Institut de beauté à Alger", href: "/search?category=institut&ville=Alger" },
  { label: "Barbier à Oran", href: "/search?category=barbier&ville=Oran" },
  { label: "Spa à Constantine", href: "/search?category=spa&ville=Constantine" },
  { label: "Manucure à Annaba", href: "/search?category=manucure&ville=Annaba" },
  { label: "Institut à Sétif", href: "/search?category=institut&ville=Sétif" },
  { label: "Barbier à Blida", href: "/search?category=barbier&ville=Blida" },
  { label: "Spa à Béjaïa", href: "/search?category=spa&ville=Béjaïa" },
  { label: "Manucure à Tizi Ouzou", href: "/search?category=manucure&ville=Tizi Ouzou" },
]

export default function VillesSection() {
  return (
    <section className="py-20 bg-gray-50/70">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-nude-700 font-semibold text-sm uppercase tracking-wider mb-2 block">
            Proximité
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Villes populaires en Algérie
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Trouvez et réservez facilement dans les établissements de votre ville
          </p>
        </motion.div>

        {/* Villes Grid (sans faux chiffres de salons) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {villesPopulaires.map((ville, index) => (
            <motion.div
              key={ville}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
            >
              <Link href={`/search?ville=${encodeURIComponent(ville)}`}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="group p-5 bg-white rounded-2xl border border-gray-100 hover:border-nude-200 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-nude-100 rounded-xl flex items-center justify-center group-hover:bg-nude-600 transition-colors flex-shrink-0">
                      <MapPin className="w-5 h-5 text-nude-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-nude-600 transition-colors text-base">
                        {ville}
                      </h3>
                      <p className="text-xs text-gray-500 group-hover:text-nude-600 transition-colors flex items-center gap-1 mt-0.5">
                        <span>Explorer</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Liens rapides */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm"
        >
          <h3 className="font-bold text-base md:text-lg mb-4 text-gray-900">
            Recherches populaires par catégorie & ville
          </h3>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {liensRapides.map((lien) => (
              <Link
                key={lien.label}
                href={lien.href}
                className="px-4 py-2 bg-gray-50 hover:bg-nude-50 text-gray-700 hover:text-nude-700 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border border-gray-100 hover:border-nude-200"
              >
                {lien.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
