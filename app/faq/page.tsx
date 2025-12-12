"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ArrowLeft, Search, MessageCircle } from "lucide-react"

const faqData = [
  {
    category: "Pour les clients",
    questions: [
      {
        q: "Comment réserver un rendez-vous ?",
        a: "C'est simple ! Recherchez un salon ou une prestation, choisissez votre créneau horaire, confirmez avec votre numéro de téléphone et c'est fait. Vous recevrez une confirmation par SMS."
      },
      {
        q: "La réservation est-elle gratuite ?",
        a: "Oui, la réservation sur Kalendo est 100% gratuite pour les clients. Vous payez uniquement vos prestations directement au salon."
      },
      {
        q: "Puis-je annuler ou modifier mon rendez-vous ?",
        a: "Oui, vous pouvez annuler ou modifier votre rendez-vous depuis le lien reçu par SMS ou en contactant directement le salon. Nous vous recommandons de prévenir au moins 24h à l'avance."
      },
      {
        q: "Comment recevoir un rappel de mon rendez-vous ?",
        a: "Vous recevez automatiquement un SMS de rappel 24h avant votre rendez-vous. Assurez-vous d'avoir renseigné un numéro de téléphone valide."
      },
      {
        q: "Comment laisser un avis sur un salon ?",
        a: "Après votre rendez-vous, vous recevrez un SMS vous invitant à noter votre expérience. Vos avis aident les autres clients à choisir !"
      }
    ]
  },
  {
    category: "Pour les professionnels",
    questions: [
      {
        q: "Comment inscrire mon salon sur Kalendo ?",
        a: "Cliquez sur 'Ajouter mon salon' et suivez les étapes d'inscription. Vous pourrez configurer vos services, horaires et tarifs en quelques minutes."
      },
      {
        q: "Combien coûte l'inscription ?",
        a: "L'inscription de base est gratuite. Nous proposons également des formules premium avec des fonctionnalités avancées. Contactez-nous pour plus d'informations."
      },
      {
        q: "Comment gérer mes rendez-vous ?",
        a: "Depuis votre tableau de bord professionnel, vous avez accès à votre planning, vos réservations, vos clients et vos statistiques en temps réel."
      },
      {
        q: "Les rappels SMS sont-ils inclus ?",
        a: "Oui, les rappels SMS automatiques sont inclus pour réduire les rendez-vous manqués. Vos clients reçoivent un rappel 24h avant leur rendez-vous."
      },
      {
        q: "Puis-je gérer plusieurs employés ?",
        a: "Oui, vous pouvez ajouter votre équipe et gérer les plannings individuels de chaque membre depuis votre espace professionnel."
      }
    ]
  }
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border-b border-gray-100 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left hover:text-nude-600 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-600 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Kalendo" width={140} height={50} className="h-10 w-auto" />
          </Link>
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-nude-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-nude-600 to-warm-600 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Questions fréquentes
            </h1>
            <p className="text-xl text-nude-100 mb-8 max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions sur Kalendo
            </p>
            
            {/* Search */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une question..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-white/30"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {filteredFAQ.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune question trouvée pour "{searchQuery}"</p>
            </div>
          ) : (
            filteredFAQ.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-nude-100 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-nude-600" />
                  </div>
                  {category.category}
                </h2>
                <div className="bg-white rounded-2xl border border-gray-100 px-6">
                  {category.questions.map((item, i) => (
                    <FAQItem key={i} question={item.q} answer={item.a} />
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Vous n'avez pas trouvé votre réponse ?</h2>
          <p className="text-gray-600 mb-6">Notre équipe est là pour vous aider</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-nude-600 to-warm-600 text-white rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Nous contacter
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Kalendo. Tous droits réservés. 🇩🇿</p>
        </div>
      </footer>
    </main>
  )
}
