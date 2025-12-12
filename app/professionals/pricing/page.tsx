import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Check, Calendar, CreditCard, Database } from 'lucide-react'

const services = [
  {
    name: 'Agenda',
    subtitle: 'Sans engagement',
    description: 'Gérez vos rendez-vous et votre planning en toute simplicité.',
    features: [
      'Calendrier en ligne personnalisable',
      'Gestion des rendez-vous clients',
      'Notifications et rappels automatiques',
      'Profil établissement visible',
      'Statistiques de base'
    ],
    cta: 'Échanger avec un conseiller',
    popular: false,
    icon: Calendar,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    name: 'Agenda + Caisse',
    subtitle: 'Sans engagement',
    description: 'Encaissez vos clients et suivez votre activité en une seule interface.',
    features: [
      'Toutes les options de l\'offre Agenda',
      'Logiciel de caisse certifié',
      'Gestion des stocks de vos produits',
      'Vente de cartes cadeaux et prestations en ligne',
      'Export des données comptables'
    ],
    cta: 'Échanger avec un conseiller',
    popular: true,
    icon: Database,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    name: 'Solution Complète',
    subtitle: 'Sans engagement',
    description: 'La solution tout-en-un pour les établissements exigeants.',
    features: [
      'Toutes les options Agenda + Caisse',
      'Multi-établissements',
      'Rapports et analyses détaillés',
      'Account manager dédié',
      'Formation personnalisée'
    ],
    cta: 'Échanger avec un conseiller',
    popular: false,
    icon: CreditCard,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
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
              Nos services pour les professionnels
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des solutions adaptées à vos besoins, sans engagement.
            </p>
          </div>

          {/* Services */}
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.name}
                className="bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all relative overflow-hidden"
              >
                {service.popular && (
                  <div className="absolute top-6 -right-8 bg-violet-500 text-white text-xs font-semibold px-10 py-1.5 rotate-45">
                    Le plus populaire
                  </div>
                )}
                
                <div className={`w-14 h-14 ${service.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                  <service.icon className={`w-7 h-7 ${service.iconColor}`} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-1">{service.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{service.subtitle}</p>
                <p className="text-gray-600 mb-8">{service.description}</p>

                <Link
                  href="/contact"
                  className="block w-full py-4 bg-gray-900 text-white rounded-xl font-semibold text-center hover:bg-gray-800 transition-all mb-8"
                >
                  {service.cta}
                </Link>

                <ul className="space-y-4">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
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
