"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function CTASection() {
    return (
        <section className="py-24">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-20 text-center text-white shadow-2xl"
                >
                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Vous êtes un professionnel ?
                        </h2>
                        <p className="text-xl md:text-2xl mb-10 text-purple-100">
                            Rejoignez PlannV et développez votre activité avec notre plateforme de réservation tout-en-un.
                        </p>
                        <Link
                            href="/professionals/signup"
                            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            Créer mon espace professionnel
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
