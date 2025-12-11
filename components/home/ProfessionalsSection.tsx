"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Calendar, Phone, TrendingUp, Users, Clock, Shield } from "lucide-react"

const benefits = [
  {
    icon: Calendar,
    title: "Planning en ligne",
    description: "Gérez vos rendez-vous facilement depuis votre tableau de bord"
  },
  {
    icon: Phone,
    title: "Appels de confirmation",
    description: "Liste des clients à appeler pour confirmer leurs RDV du lendemain"
  },
  {
    icon: TrendingUp,
    title: "Visibilité accrue",
    description: "Soyez visible par des milliers de clients potentiels"
  },
  {
    icon: Users,
    title: "Nouveaux clients",
    description: "Attirez de nouveaux clients grâce à la plateforme"
  },
  {
    icon: Clock,
    title: "Réservations 24h/24",
    description: "Recevez des réservations même quand vous dormez"
  },
  {
    icon: Shield,
    title: "Gestion simplifiée",
    description: "Tout en un : agenda, clients, statistiques"
  }
]

export default function ProfessionalsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-nude-800 via-nude-700 to-warm-700 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-nude-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-warm-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-white/10 text-white/90 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              Espace Professionnel
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Vous avez un salon de beauté en Algérie ?
            </h2>
            <p className="text-xl text-nude-100 mb-4 leading-relaxed">
              Augmentez vos rendez-vous, réduisez les absences, recevez des réservations 24h/24.
            </p>
            <p className="text-lg text-nude-200 mb-8">
              Planning en ligne, liste d'appels de confirmation, visibilité sur la plateforme.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/professionals/signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-nude-700 rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Ajouter mon salon
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login?type=professional"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-full font-bold text-lg hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/20"
              >
                Connexion Pro
              </Link>
            </div>
          </motion.div>

          {/* Right Content - Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/15 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <benefit.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white mb-1 text-sm">
                  {benefit.title}
                </h3>
                <p className="text-nude-200 text-xs leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
