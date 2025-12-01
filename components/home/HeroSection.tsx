"use client"

import { motion } from "framer-motion"
import { Search, MapPin } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-purple-50/50 to-white">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-[40%] -right-[20%] w-[800px] h-[800px] rounded-full bg-purple-200/30 blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="absolute -bottom-[40%] -left-[20%] w-[800px] h-[800px] rounded-full bg-pink-200/30 blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Réservez votre{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              moment beauté
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Découvrez et réservez les meilleurs salons de coiffure, instituts et spas près de chez vous.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-xl p-3 rounded-3xl shadow-2xl border border-white/50">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex items-center px-6 py-4 bg-white rounded-2xl border border-gray-100 focus-within:border-purple-200 focus-within:ring-4 focus-within:ring-purple-50 transition-all duration-300">
                <Search className="w-6 h-6 text-purple-500 mr-4" />
                <input 
                  type="text" 
                  placeholder="Coiffeur, esthéticienne, spa..." 
                  className="flex-1 outline-none text-lg text-gray-700 placeholder:text-gray-400 bg-transparent"
                />
              </div>
              
              <div className="flex-1 flex items-center px-6 py-4 bg-white rounded-2xl border border-gray-100 focus-within:border-purple-200 focus-within:ring-4 focus-within:ring-purple-50 transition-all duration-300">
                <MapPin className="w-6 h-6 text-pink-500 mr-4" />
                <input 
                  type="text" 
                  placeholder="Ville ou code postal" 
                  className="flex-1 outline-none text-lg text-gray-700 placeholder:text-gray-400 bg-transparent"
                />
              </div>
              
              <button className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                Rechercher
              </button>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 font-medium"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Réservation instantanée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Avis vérifiés</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>24/7</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
