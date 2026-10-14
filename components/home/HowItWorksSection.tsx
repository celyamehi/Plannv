"use client"

import { motion } from "framer-motion"
import { Search, Calendar, Phone, CreditCard } from "lucide-react"
import AuroraMeshBackground from "@/components/ui/AuroraMeshBackground"

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
    <section className="relative py-24 bg-gradient-to-b from-white via-nude-50/20 to-white overflow-hidden">
      {/* Animated Aurora Mesh Background */}
      <AuroraMeshBackground variant="steps" opacity="opacity-70" showGrid={true} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-nude-100/80 backdrop-blur-sm text-nude-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-nude-200/60">
            Simple et rapide
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Comment ça marche ?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Réservez votre rendez-vous beauté en 4 étapes simples et sans frais
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
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-nude-300/80 to-warm-200/80 z-0" />
              )}
              
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative bg-white/85 backdrop-blur-xl p-7 rounded-3xl border border-white/80 hover:border-nude-200 shadow-md hover:shadow-2xl transition-all duration-300 z-10"
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
