"use client"

import { motion } from "framer-motion"
import { Scissors, Sparkles, Droplets, Palette, Flower2, Heart } from "lucide-react"

const categories = [
    { name: 'Coiffeur', icon: Scissors, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Barbier', icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Esthétique', icon: Flower2, color: 'text-pink-600', bg: 'bg-pink-100' },
    { name: 'Spa', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { name: 'Onglerie', icon: Palette, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Massage', icon: Heart, color: 'text-red-600', bg: 'bg-red-100' },
]

export default function CategoriesSection() {
    return (
        <section className="py-12 border-b border-gray-100">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-wrap justify-center gap-4 md:gap-8"
                >
                    {categories.map((category, index) => (
                        <motion.button
                            key={category.name}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300"
                        >
                            <div className={`w-16 h-16 ${category.bg} rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-6`}>
                                <category.icon className={`w-8 h-8 ${category.color}`} />
                            </div>
                            <span className="font-medium text-gray-600 group-hover:text-gray-900">{category.name}</span>
                        </motion.button>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
