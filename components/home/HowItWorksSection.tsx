"use client"

import { motion } from "framer-motion"
import { Search, Calendar, Phone, CreditCard } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Je cherche",
    description: "Recherchez une prestation ou un salon près de chez vous",
    color: "text-nude-600",
    bg: "bg-nude-100"
  },
  {
    number: "02",
    icon: Calendar,
    title: "Je choisis mon créneau",
    description: "Sélectionnez la date et l'heure qui vous conviennent",
    color: "text-warm-600",
    bg: "bg-warm-100"
  },
  {
    number: "03",
    icon: Phone,
    title: "Je confirme",
    description: "Confirmez avec votre numéro de téléphone",
    color: "text-blue-600",
    bg: "bg-blue-100"
  },
  {
    number: "04",
    icon: CreditCard,
    title: "Je paie sur place",
    description: "Recevez un SMS/email de confirmation et payez au salon",
    color: "text-green-600",
    bg: "bg-green-100"
  }
]

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-nude-100 text-nude-700 rounded-full text-sm font-medium mb-4">
            Simple et rapide
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Réservez votre rendez-vous beauté en 4 étapes simples
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-nude-200 to-warm-200" />
              )}
              
              <motion.div
                whileHover={{ y: -5 }}
                className="relative bg-white p-6 rounded-3xl border border-gray-100 hover:border-nude-100 hover:shadow-xl transition-all duration-300"
              >
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-nude-600 to-warm-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {step.number}
                </div>
                
                <div className={`w-16 h-16 ${step.bg} rounded-2xl flex items-center justify-center mb-5`}>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
