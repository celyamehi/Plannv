"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Sparkles, Hand, Heart, Scissors, ArrowRight } from "lucide-react"

const categories = [
  {
    name: "Institut de beauté",
    description: "Soin visage, épilation, maquillage & bien-être...",
    image: "/images/categories/institut.jpg",
    icon: Sparkles,
    href: "/search?category=institut",
    accentColor: "from-rose-500/30 to-nude-700/80"
  },
  {
    name: "Manucure & Pédicure",
    description: "Pose vernis, faux ongles, nail art, soins mains & pieds...",
    image: "/images/categories/manucure.jpg",
    icon: Hand,
    href: "/search?category=manucure",
    accentColor: "from-pink-500/30 to-warm-700/80"
  },
  {
    name: "Spa",
    description: "Massage relaxant, hammam traditionnel, détente...",
    image: "/images/categories/spa.jpg",
    icon: Heart,
    href: "/search?category=spa",
    accentColor: "from-cyan-500/30 to-teal-800/80"
  },
  {
    name: "Barbier",
    description: "Taille de barbe, coupe homme, traçage & soins...",
    image: "/images/categories/barbier.jpg",
    icon: Scissors,
    href: "/search?category=barbier",
    accentColor: "from-amber-500/30 to-slate-900/85"
  }
]

export default function CategoriesSectionAlgeria() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-nude-700 font-semibold text-sm uppercase tracking-wider mb-2 block">
            Prestations & Soins
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Trouvez votre établissement beauté
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Explorez nos catégories et trouvez les meilleurs professionnels près de chez vous en Algérie
          </p>
        </motion.div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="h-full"
              >
                <Link href={category.href} className="block h-full group focus:outline-none">
                  {/* Card Container with explicit background and isolation */}
                  <div className="relative h-[380px] sm:h-[420px] rounded-3xl overflow-hidden border border-gray-100 shadow-md group-hover:shadow-2xl group-hover:border-nude-300 transition-all duration-500 bg-gray-900 isolate">
                    
                    {/* Layer 0: Background Image (NO negative z-index) */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                        priority={true}
                        unoptimized
                      />
                    </div>

                    {/* Layer 1: Dark gradient overlay on top of image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 z-10 group-hover:from-black/95 transition-colors duration-500 pointer-events-none" />
                    
                    {/* Layer 2: Subtle color tint overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.accentColor} opacity-25 group-hover:opacity-40 transition-opacity duration-500 z-10 pointer-events-none`} />

                    {/* Layer 3: Foreground Interactive Content */}
                    <div className="relative z-20 flex flex-col justify-between h-full p-6">
                      {/* Top Tag & Number */}
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-sm group-hover:scale-110 group-hover:bg-white group-hover:text-nude-800 transition-all duration-300">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 border border-white/10">
                          0{index + 1}
                        </span>
                      </div>

                      {/* Bottom Content & Explorer Button on Hover */}
                      <div className="pt-4 flex flex-col justify-end">
                        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-nude-200 transition-colors">
                          {category.name}
                        </h3>
                        
                        <p className="text-white/85 text-sm leading-snug mb-4 line-clamp-2 font-normal">
                          {category.description}
                        </p>

                        {/* Explorer button that reveals on hover */}
                        <div className="overflow-hidden">
                          <div className="w-full py-3 px-5 rounded-2xl bg-white text-gray-900 font-bold text-sm flex items-center justify-center gap-2 shadow-xl transform translate-y-1 sm:translate-y-3 opacity-95 sm:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:bg-nude-50 transition-all duration-300">
                            <span>Explorer</span>
                            <ArrowRight className="w-4 h-4 text-nude-700 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
