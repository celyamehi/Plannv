"use client"

import { motion } from "framer-motion"
import { Calendar, Star, MapPin, Shield, Clock, Award } from "lucide-react"

const features = [
    {
        icon: Calendar,
        title: "Réservation instantanée",
        description: "Réservez en quelques clics, 24h/24 et 7j/7. Confirmation immédiate de votre rendez-vous.",
        color: "text-nude-600",
        bg: "bg-nude-100"
    },
    {
        icon: Star,
        title: "Avis vérifiés",
        description: "Consultez les avis authentiques de clients pour choisir le meilleur établissement.",
        color: "text-warm-600",
        bg: "bg-warm-100"
    },
    {
        icon: MapPin,
        title: "Près de chez vous",
        description: "Trouvez facilement les meilleurs établissements à proximité de votre localisation.",
        color: "text-blue-600",
        bg: "bg-blue-100"
    },
    {
        icon: Shield,
        title: "Paiement sécurisé",
        description: "Payez en ligne ou sur place en toute sécurité. Vos données sont protégées.",
        color: "text-green-600",
        bg: "bg-green-100"
    },
    {
        icon: Clock,
        title: "Confirmation personnalisée",
        description: "Les professionnels vous contactent pour confirmer vos rendez-vous du lendemain.",
        color: "text-orange-600",
        bg: "bg-orange-100"
    },
    {
        icon: Award,
        title: "Meilleurs pros",
        description: "Une sélection rigoureuse des meilleurs professionnels de la beauté et du bien-être.",
        color: "text-indigo-600",
        bg: "bg-indigo-100"
    }
]

export default function FeaturesSection() {
    return (
        <section className="py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-4">Pourquoi choisir Kalendo ?</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        La meilleure expérience de réservation pour vos soins beauté et bien-être
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
