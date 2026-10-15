"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Users,
  TrendingUp,
  ChevronDown,
  Check,
  Star,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  Headphones,
  Zap,
  Award,
  CheckCircle2,
  Building2,
  DollarSign,
  Gift,
  ArrowDown
} from "lucide-react"
import MainHeader from "@/components/layout/MainHeader"

export default function NosOffresView() {
  const [billingPeriod, setBillingPeriod] = useState<"mensuel" | "annuel">("mensuel")
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const scrollToPricing = () => {
    const el = document.getElementById("pricing-section")
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "Bonjour, je suis gérant(e) de salon et je souhaite avoir des informations sur l'offre Kalendo Pro (1500 DA / mois avec 30 jours d'essai gratuit)."
    )
    window.open(`https://wa.me/213776393135?text=${message}`, "_blank")
  }

  const faqItems = [
    {
      q: "Comment fonctionne l'essai gratuit de 30 jours ?",
      a: "Dès la création de votre compte professionnel, vous bénéficiez immédiatement de 30 jours d'accès complet et illimité à toutes les fonctionnalités de Kalendo Pro. Aucune carte bancaire n'est exigée à l'inscription. Vous pouvez configurer vos soins, tester l'agenda et recevoir vos premières réservations sans débourser un centime."
    },
    {
      q: "Combien coûte l'abonnement après les 30 jours d'essai ?",
      a: "L'abonnement Kalendo Pro est au tarif unique et avantageux de 1 500 DA par mois (ou 15 000 DA par an avec 2 mois offerts). Ce tarif comprend l'ensemble des fonctionnalités, les mises à jour et le support client. Aucun frais d'ouverture ni frais caché."
    },
    {
      q: "Prenez-vous une commission sur mes rendez-vous ?",
      a: "Absolument AUCUNE commission (0%). Tous les revenus générés par vos prestations vous reviennent à 100%. Vos clientes règlent directement au salon comme d'habitude."
    },
    {
      q: "Quels sont les moyens de paiement acceptés en Algérie ?",
      a: "Nous proposons des modes de paiement 100% adaptés aux professionnels en Algérie : BaridiMob (virement instantané RIP), versement CCP, virement bancaire, ou carte CIB / Edahabia."
    },
    {
      q: "Puis-je résilier mon abonnement à tout moment ?",
      a: "Oui, notre offre est totalement sans engagement. Si vous décidez de ne pas poursuivre à l'issue de vos 30 jours d'essai ou à tout autre moment, vous pouvez résilier en un clic depuis votre espace de gestion, sans préavis et sans frais."
    },
    {
      q: "Ai-je besoin d'un ordinateur ou d'un équipement spécifique ?",
      a: "Non, aucun matériel coûteux n'est requis. Kalendo fonctionne directement sur votre smartphone (Android ou iPhone), sur tablette ou sur ordinateur via n'importe quel navigateur web."
    }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-nude-200 selection:text-nude-900">
      <MainHeader />

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-nude-50/60 via-white to-gray-50/50">
        {/* Subtle decorative background blur shapes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-nude-200/40 via-warm-200/30 to-nude-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
          {/* Badge 1er mois offert */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nude-100 border border-nude-200/80 shadow-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-nude-700 animate-pulse" />
            <span className="text-xs md:text-sm font-semibold text-nude-800">
              1er mois d'essai offert — 30 jours 100% gratuits sans engagement
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6"
          >
            Kalendo <span className="bg-gradient-to-r from-nude-700 via-nude-600 to-warm-600 bg-clip-text text-transparent">Pro</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-4"
          >
            L'écosystème complet qui modernise et digitalise votre salon de beauté en Algérie : réservations en ligne 24h/24, planning intelligent et visibilité maximale.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base font-semibold text-nude-700 mb-10"
          >
            Testez sans aucun risque pendant 30 jours — Passez ensuite à seulement <span className="underline decoration-nude-400 font-bold">1 500 DA / mois</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <Link
              href="/professionals/signup"
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-full text-base font-semibold transition-all duration-300 hover:bg-black hover:scale-105 hover:shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2 group"
            >
              <span>Essayer gratuitement (30 jours)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={openWhatsApp}
              className="w-full sm:w-auto px-8 py-4 border border-gray-300 bg-white text-gray-700 rounded-full text-base font-medium transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 hover:scale-105 flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>Demander une démo WhatsApp</span>
            </button>
          </motion.div>

          {/* Scroll to pricing anchor */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center"
          >
            <button
              onClick={scrollToPricing}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:scale-105 transition-all duration-300 shadow-sm group"
            >
              <span>Découvrir nos offres & tarifs</span>
              <div className="w-6 h-6 rounded-full bg-nude-100 flex items-center justify-center group-hover:bg-nude-200 transition-colors">
                <ArrowDown className="w-3.5 h-3.5 text-nude-800" />
              </div>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ================= ÉCOSYSTÈME COMPLET (3 CARDS) ================= */}
      <section className="py-20 px-4 bg-white border-y border-gray-100">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Un écosystème complet pour votre salon
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              Une solution 360° conçue sur-mesure pour les coiffeurs, instituts de beauté et spas en Algérie.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Réservation Client */}
            <div className="bg-gradient-to-b from-white to-nude-50/40 border border-nude-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-nude-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-7 h-7 text-nude-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-nude-700 transition-colors">
                  Page Vitrine & Réservation 24/7
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Vos clientes réservent en toute autonomie 24h/24 et 7j/7 depuis leur smartphone. Fini les interruptions téléphoniques et les messages tard le soir pendant vos soins.
                </p>
              </div>
              <div className="pt-4 border-t border-nude-100/80 flex items-center justify-between text-xs font-semibold text-nude-700">
                <span>Disponible sur Mobile & Web</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>

            {/* Card 2: Espace Pro */}
            <div className="bg-gradient-to-b from-white to-nude-50/40 border border-nude-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7 text-emerald-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                  Planning Connecté & Équipe
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Agenda intelligent en temps réel. Gérez vos collaborateurs, assignez les prestations, bloquez des créneaux en un clic et évitez tout risque de chevauchement.
                </p>
              </div>
              <div className="pt-4 border-t border-nude-100/80 flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Synchronisation instantanée</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>

            {/* Card 3: Gestion & Statistiques */}
            <div className="bg-gradient-to-b from-white to-nude-50/40 border border-nude-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-warm-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-warm-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-warm-700 transition-colors">
                  Gestion Centralisée & Analyses
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Suivi détaillé de vos prestations, fiches clientes enrichies, volume de réservations et historique complet pour piloter et développer votre chiffre d'affaires.
                </p>
              </div>
              <div className="pt-4 border-t border-nude-100/80 flex items-center justify-between text-xs font-semibold text-warm-700">
                <span>Tableau de bord complet</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= POURQUOI CHOISIR KALENDO PRO (6 CARDS) ================= */}
      <section className="py-20 px-4 bg-gray-50/70">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-nude-700 font-semibold text-sm uppercase tracking-wider mb-2 block">
              Avantages exclusifs
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi les salons choisissent Kalendo Pro ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base">
              Tout a été pensé pour vous faire gagner du temps, fidéliser votre clientèle et éliminer les rendez-vous manqués.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: "Prise de RDV 24/7",
                desc: "Vos clientes réservent même quand vous dormez ou travaillez. Vous ne perdez plus aucun appel ni opportunité.",
                badge: "Gain de temps"
              },
              {
                icon: Sparkles,
                title: "Visibilité ciblée par Wilaya",
                desc: "Soyez trouvé par des centaines de clientes cherchant un salon dans votre ville (Alger, Oran, Constantine, etc.).",
                badge: "Croissance"
              },
              {
                icon: ShieldCheck,
                title: "Réduction des No-Shows",
                desc: "Rappels automatiques et liste d'appels de confirmation pour réduire jusqu'à 90% les absences imprévues.",
                badge: "Zéro perte"
              },
              {
                icon: Users,
                title: "Gestion multi-collaborateurs",
                desc: "Attribuez chaque rendez-vous à la bonne coiffeuse ou esthéticienne avec des plannings séparés et clairs.",
                badge: "Organisation"
              },
              {
                icon: Zap,
                title: "Zéro matériel à acheter",
                desc: "Pas de caisse spéciale ni de logiciel lourd. Kalendo fonctionne directement sur votre smartphone ou tablette.",
                badge: "Simple & mobile"
              },
              {
                icon: Headphones,
                title: "Support dédié en Algérie",
                desc: "Notre équipe locale vous accompagne pas à pas pour configurer votre salon et répondre à vos questions 7j/7.",
                badge: "Assistance 7j/7"
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-nude-200 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-nude-50 flex items-center justify-center group-hover:bg-nude-600 transition-colors">
                    <item.icon className="w-6 h-6 text-nude-700 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-nude-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION NOS OFFRES / PRICING ================= */}
      <section id="pricing-section" className="py-24 px-4 bg-white relative overflow-hidden">
        {/* Decorative backdrop */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-nude-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-nude-700 font-semibold text-sm uppercase tracking-wider mb-2 block">
              Tarification simple & transparente
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Nos offres
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-base sm:text-lg mb-8">
              Accès complet à la plateforme et au site pro. <br />
              <strong className="text-gray-900">1er mois d'essai offert (30 jours)</strong>, puis abonnement flexible sans engagement.
            </p>

            {/* Toggle Mensuel / Annuel */}
            <div className="inline-flex items-center bg-gray-100 p-1.5 rounded-2xl shadow-inner border border-gray-200">
              <button
                type="button"
                onClick={() => setBillingPeriod("mensuel")}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  billingPeriod === "mensuel"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Mensuel
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod("annuel")}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  billingPeriod === "annuel"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>Annuel</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-nude-100 text-nude-800">
                  -17% (2 mois offerts)
                </span>
              </button>
            </div>
          </div>

          {/* ================= CARTE PRINCIPALE KALENDO PRO ================= */}
          <div className="relative bg-white border-2 border-nude-400 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-nude-100 mb-10 transition-all">
            {/* Top Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-nude-700 to-warm-600 text-white px-5 py-2 rounded-full text-xs sm:text-sm font-bold shadow-md tracking-wide uppercase">
                <Gift className="w-4 h-4" />
                30 Jours d'essai 100% offerts
              </span>
            </div>

            <div className="text-center pt-2 mb-8">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
                Abonnement Kalendo Pro
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                La formule tout-en-un pour gérer vos réservations, fidéliser vos clientes et développer votre chiffre d'affaires.
              </p>

              {/* Price display */}
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight">
                  {billingPeriod === "mensuel" ? "1 500 DA" : "15 000 DA"}
                </span>
                <span className="text-gray-500 font-medium text-lg">
                  {billingPeriod === "mensuel" ? "/ mois" : "/ an"}
                </span>
              </div>

              {billingPeriod === "annuel" && (
                <p className="text-xs text-emerald-700 font-semibold mb-2">
                  Soit seulement 1 250 DA / mois (Vous économisez 3 000 DA)
                </p>
              )}

              <p className="text-sm font-medium text-nude-700 mb-1">
                Après votre période d'essai gratuit de 30 jours
              </p>
              <p className="text-xs text-gray-400">
                Installation, paramétrage de vos services et formation incluses
              </p>
            </div>

            {/* CTA Button */}
            <div className="text-center mb-8">
              <Link
                href="/professionals/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-gray-900 hover:bg-black text-white rounded-full text-base sm:text-lg font-bold transition-all duration-300 hover:scale-105 shadow-xl shadow-gray-900/15 group"
              >
                <span>Commencer l'essai gratuit de 30 jours</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-xs text-gray-500 mt-3 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
                Aucune carte bancaire requise • Sans engagement • Annulation en 1 clic
              </p>
            </div>

            {/* Checklist of features */}
            <div className="pt-8 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 text-center sm:text-left">
                Tout ce qui est inclus dans votre abonnement :
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Réservations en ligne 24h/24 et 7j/7 illimitées",
                  "0% de commission sur vos prestations",
                  "Planning interactif et gestion des créneaux",
                  "Page vitrine de votre salon avec photos & soins",
                  "Gestion d'équipe et des collaborateurs",
                  "Fichier clientes et historique des visites",
                  "Notifications et rappels automatiques",
                  "Tableau de bord et suivi d'activité",
                  "Support client prioritaire 7j/7 en Algérie",
                  "Mises à jour et nouvelles fonctionnalités incluses"
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2 Trust / Reassurance Cards below */}
          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-nude-100 flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 text-nude-700" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Essai 100% gratuit</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  30 jours pour tester toutes les fonctionnalités en conditions réelles avec vos clientes. Aucun paiement n'est requis au départ.
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Résiliation libre</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Sans aucun engagement. Vous pouvez suspendre ou résilier votre compte à tout moment depuis votre espace professionnel.
                </p>
              </div>
            </div>
          </div>

          {/* ================= SECTION OPTIONS ADD-ONS ================= */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Options complémentaires
              </h3>
              <p className="text-gray-600 text-sm">
                Des services additionnels pour booster encore plus la visibilité et la ponctualité de votre salon.
              </p>
            </div>

            <div className="space-y-4">
              {/* Option 1: WhatsApp */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">Rappels WhatsApp Automatiques</h4>
                      <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Populaire
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Messages de confirmation et rappels programmés la veille et le jour J directement sur WhatsApp.
                    </p>
                  </div>
                </div>
                <div className="sm:text-right flex-shrink-0">
                  <span className="text-lg font-bold text-gray-900 block">+2 000 DA</span>
                  <span className="text-xs text-gray-500">/ mois</span>
                </div>
              </div>

              {/* Option 2: Salon Vedette */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">Salon Vedette (Mise en avant)</h4>
                      <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Visibilité Max
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Badge "Recommandé" et affichage prioritaire en tête des résultats de recherche dans votre Wilaya.
                    </p>
                  </div>
                </div>
                <div className="sm:text-right flex-shrink-0">
                  <span className="text-lg font-bold text-gray-900 block">+3 000 DA</span>
                  <span className="text-xs text-gray-500">/ mois</span>
                </div>
              </div>

              {/* Option 3: Shooting & Setup Pro */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-nude-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-7 h-7 text-nude-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Pack Shooting & Configuration VIP</h4>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Un conseiller Kalendo vient vous accompagner pour sublimer vos photos et optimiser l'ensemble de votre carte.
                    </p>
                  </div>
                </div>
                <div className="sm:text-right flex-shrink-0">
                  <span className="text-sm font-semibold text-nude-700 block">Sur devis</span>
                  <span className="text-xs text-gray-500">Service personnalisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="py-20 px-4 bg-gray-50 border-t border-gray-200/60">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <span className="text-nude-700 font-semibold text-sm uppercase tracking-wider mb-2 block">
              Foire aux questions
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Des questions sur nos tarifs ?
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Tout ce que vous devez savoir avant de commencer votre essai gratuit de 30 jours.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left font-bold text-gray-900 flex items-center justify-between gap-4 hover:text-nude-700 transition-colors"
                  >
                    <span className="text-base sm:text-lg">{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-nude-700" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-6 pt-1 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* Need more help */}
          <div className="mt-12 text-center p-6 bg-white border border-nude-200/70 rounded-2xl shadow-sm">
            <p className="text-gray-700 font-medium mb-3">
              Vous avez une question spécifique pour votre établissement ?
            </p>
            <button
              onClick={openWhatsApp}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Poser ma question sur WhatsApp</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA SECTION ================= */}
      <section className="py-20 px-4 bg-gradient-to-br from-nude-900 via-nude-800 to-warm-900 text-white text-center relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-nude-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-warm-500/20 rounded-full blur-3xl" />

        <div className="container mx-auto max-w-4xl relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm">
            Prêt à moderniser votre salon ?
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
            Rejoignez dès aujourd'hui les meilleurs salons de beauté en Algérie
          </h2>

          <p className="text-base sm:text-lg text-nude-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            Profitez de vos 30 jours d'essai gratuit pour booster vos réservations et offrir une expérience moderne à vos clientes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/professionals/signup"
              className="w-full sm:w-auto px-10 py-4 bg-white text-nude-900 rounded-full font-bold text-base hover:bg-nude-50 hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Commencer mes 30 jours gratuits
            </Link>

            <button
              onClick={openWhatsApp}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full font-medium text-base hover:bg-white/20 backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Contacter notre équipe</span>
            </button>
          </div>

          <p className="text-xs text-nude-300 mt-6">
            Abonnement à 1 500 DA / mois après essai • Sans engagement • Support 7j/7
          </p>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-nude-100 bg-nude-50/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-nude-600 to-nude-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Kalendo</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 max-w-sm">
                La 1ère plateforme de réservation beauté en Algérie. Trouvez et réservez vos rendez-vous en quelques clics, 24h/24.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>📧</span>
                <a href="mailto:contact@kalendo.space" className="hover:text-nude-600 transition-colors">
                  contact@kalendo.space
                </a>
              </div>
            </div>

            {/* Pour les clients */}
            <div>
              <h4 className="font-bold mb-4 text-gray-900">Pour les clients</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <Link href="/search" className="hover:text-nude-600 transition-colors">
                    Trouver un salon
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-nude-600 transition-colors">
                    Comment ça marche
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-nude-600 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Pour les professionnels */}
            <div>
              <h4 className="font-bold mb-4 text-gray-900">Pour les professionnels</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <Link href="/professionals/signup" className="hover:text-nude-600 transition-colors">
                    Ajouter mon salon
                  </Link>
                </li>
                <li>
                  <Link href="/login?type=professional" className="hover:text-nude-600 transition-colors">
                    Espace Pro
                  </Link>
                </li>
                <li>
                  <Link href="/nos-offres" className="text-nude-700 font-bold hover:underline transition-colors">
                    Nos offres & Tarifs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h4 className="font-bold mb-4 text-gray-900">Légal</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <Link href="/mentions-legales" className="hover:text-nude-600 transition-colors">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="/cgu" className="hover:text-nude-600 transition-colors">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link href="/confidentialite" className="hover:text-nude-600 transition-colors">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-nude-600 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-nude-100 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Kalendo. Tous droits réservés. 🇩🇿
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Fait avec ❤️ en Algérie</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
