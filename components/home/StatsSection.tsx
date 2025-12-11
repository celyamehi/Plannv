"use client"

import { motion } from "framer-motion"
import { Building2, CalendarCheck, MessageSquare, Star } from "lucide-react"

const stats = [
  {
    icon: Building2,
    value: "500+",
    label: "Salons inscrits en Algérie",
    color: "text-nude-600",
    bg: "bg-nude-100"
  },
  {
    icon: CalendarCheck,
    value: "10 000+",
    label: "Rendez-vous pris chaque mois",
    color: "text-warm-600",
    bg: "bg-warm-100"
  },
  {
    icon: MessageSquare,
    value: "100%",
    label: "Rappels SMS automatiques",
    color: "text-blue-600",
    bg: "bg-blue-100"
  },
  {
    icon: Star,
    value: "4.8/5",
    label: "Note moyenne des salons",
    color: "text-amber-600",
    bg: "bg-amber-100"
  }
]

export default function StatsSection() {
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
            Ils nous font confiance
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kalendo, c'est la plateforme de référence pour la beauté en Algérie
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 text-center"
            >
              <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 mx-auto`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <p className="text-gray-600 text-sm md:text-base">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-400"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Inscription gratuite</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Sans engagement</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Support réactif</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
