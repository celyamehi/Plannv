"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Scissors, Sparkles, Hand, Flower2, Heart } from "lucide-react"

const categories = [
  { 
    name: 'Coiffeur', 
    icon: Scissors, 
    color: 'text-nude-600', 
    bg: 'bg-nude-100',
    gradient: 'from-nude-500 to-nude-600',
    description: 'Coupe, brushing, coloration...',
    href: '/search?category=coiffeur'
  },
  { 
    name: 'Barbier', 
    icon: Sparkles, 
    color: 'text-blue-600', 
    bg: 'bg-blue-100',
    gradient: 'from-blue-500 to-blue-600',
    description: 'Coupe homme, barbe, rasage...',
    href: '/search?category=barbier'
  },
  { 
    name: 'Manucure & Pédicure', 
    icon: Hand, 
    color: 'text-warm-600', 
    bg: 'bg-warm-100',
    gradient: 'from-warm-500 to-warm-600',
    description: 'Pose vernis, gel, nail art...',
    href: '/search?category=manucure'
  },
  { 
    name: 'Institut de beauté', 
    icon: Flower2, 
    color: 'text-rose-600', 
    bg: 'bg-rose-100',
    gradient: 'from-rose-500 to-rose-600',
    description: 'Épilation, soin visage, maquillage...',
    href: '/search?category=institut'
  },
  { 
    name: 'Massage / Spa', 
    icon: Heart, 
    color: 'text-cyan-600', 
    bg: 'bg-cyan-100',
    gradient: 'from-cyan-500 to-cyan-600',
    description: 'Massage relaxant, hammam...',
    href: '/search?category=spa'
  },
]

export default function CategoriesSectionAlgeria() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trouvez votre établissement beauté
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explorez nos catégories et trouvez le professionnel qu'il vous faut
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={category.href}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-nude-100 transition-all duration-300 cursor-pointer h-full"
                >
                  <div className={`w-16 h-16 ${category.bg} rounded-2xl flex items-center justify-center mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <category.icon className={`w-8 h-8 ${category.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-center mb-2 group-hover:text-nude-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 text-center">
                    {category.description}
                  </p>
                  
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`} />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
