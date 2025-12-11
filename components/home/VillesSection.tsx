"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { MapPin } from "lucide-react"

const villesPopulaires = [
  { name: "Alger", salons: 150 },
  { name: "Oran", salons: 85 },
  { name: "Constantine", salons: 65 },
  { name: "Annaba", salons: 45 },
  { name: "Sétif", salons: 40 },
  { name: "Blida", salons: 38 },
  { name: "Béjaïa", salons: 35 },
  { name: "Tizi Ouzou", salons: 32 },
]

const liensRapides = [
  { label: "Coiffeur à Alger", href: "/search?category=coiffeur&ville=Alger" },
  { label: "Barbier à Oran", href: "/search?category=barbier&ville=Oran" },
  { label: "Institut à Constantine", href: "/search?category=institut&ville=Constantine" },
  { label: "Spa à Annaba", href: "/search?category=spa&ville=Annaba" },
  { label: "Manucure à Sétif", href: "/search?category=manucure&ville=Sétif" },
  { label: "Coiffeur à Blida", href: "/search?category=coiffeur&ville=Blida" },
  { label: "Barbier à Béjaïa", href: "/search?category=barbier&ville=Béjaïa" },
  { label: "Institut à Tizi Ouzou", href: "/search?category=institut&ville=Tizi Ouzou" },
]

export default function VillesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Villes populaires en Algérie
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trouvez les meilleurs salons de beauté dans votre ville
          </p>
        </motion.div>

        {/* Villes Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {villesPopulaires.map((ville, index) => (
            <motion.div
              key={ville.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/search?ville=${ville.name}`}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="group p-5 bg-white rounded-2xl border border-gray-100 hover:border-nude-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-nude-100 rounded-xl flex items-center justify-center group-hover:bg-nude-600 transition-colors">
                      <MapPin className="w-5 h-5 text-nude-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-nude-600 transition-colors">
                        {ville.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {ville.salons}+ salons
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
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100"
        >
          <h3 className="font-bold text-lg mb-4 text-gray-900">Recherches populaires</h3>
          <div className="flex flex-wrap gap-3">
            {liensRapides.map((lien) => (
              <Link
                key={lien.label}
                href={lien.href}
                className="px-4 py-2 bg-gray-50 hover:bg-nude-50 text-gray-600 hover:text-nude-600 rounded-full text-sm font-medium transition-all duration-300 border border-transparent hover:border-nude-200"
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
