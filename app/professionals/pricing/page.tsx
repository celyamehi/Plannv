'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Check, Star, Zap, Crown } from 'lucide-react'

const plans = [
  {
    name: 'Essai Gratuit',
    price: '0',
    duration: '14 jours',
    description: 'Découvrez Kalendo sans engagement',
    features: [
      'Gestion des rendez-vous',
      'Profil établissement',
      'Calendrier en ligne',
      'Notifications email',
      'Support par email'
    ],
    cta: 'Commencer l\'essai',
    popular: false,
    icon: Zap
  },
  {
    name: 'Professionnel',
    price: '2 500',
    duration: 'DA/mois',
    description: 'Pour les salons en croissance',
    features: [
      'Tout de l\'essai gratuit',
      'Réservations illimitées',
      'Statistiques avancées',
      'Gestion des employés',
      'Support prioritaire',
      'Personnalisation du profil'
    ],
    cta: 'Choisir ce plan',
    popular: true,
    icon: Star
  },
  {
    name: 'Premium',
    price: '5 000',
    duration: 'DA/mois',
    description: 'Pour les établissements exigeants',
    features: [
      'Tout du plan Professionnel',
      'Multi-établissements',
      'API personnalisée',
      'Rapports détaillés',
      'Account manager dédié',
      'Formation personnalisée'
    ],
    cta: 'Nous contacter',
    popular: false,
    icon: Crown
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour à l'accueil</span>
          </Link>
        </div>
      </header>

      <main className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Logo et titre */}
          <div className="text-center mb-16">
            <Link href="/" className="inline-flex items-center justify-center mb-8">
              <Image src="/logo.png" alt="Kalendo" width={180} height={60} className="h-14 w-auto" />
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tarifs simples et transparents
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choisissez le plan qui correspond à vos besoins. Pas de frais cachés.
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-3xl p-8 border-2 transition-all ${
                  plan.popular
                    ? 'border-nude-500 shadow-xl scale-105'
                    : 'border-gray-100 hover:border-nude-200 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-nude-600 to-warm-600 text-white text-sm font-medium px-4 py-1 rounded-full inline-block mb-4">
                    Le plus populaire
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  plan.popular ? 'bg-nude-100' : 'bg-gray-100'
                }`}>
                  <plan.icon className={`w-7 h-7 ${plan.popular ? 'text-nude-600' : 'text-gray-600'}`} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-500 mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-2">{plan.duration}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 mt-0.5 ${plan.popular ? 'text-nude-600' : 'text-gray-400'}`} />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/professionals/signup"
                  className={`block w-full py-4 rounded-xl font-semibold text-center transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-nude-600 to-warm-600 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ rapide */}
          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Des questions ?</h2>
            <p className="text-gray-600 mb-6">
              Consultez notre FAQ ou contactez-nous directement.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/faq"
                className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Voir la FAQ
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-nude-600 text-white rounded-xl font-medium hover:bg-nude-700 transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
