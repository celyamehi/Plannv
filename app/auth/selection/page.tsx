'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Building } from 'lucide-react'

export default function SelectionPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
            <div className="w-full max-w-4xl">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-nude-600 to-warm-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">K</span>
                        </div>
                        <span className="text-3xl font-semibold">Kalendo</span>
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Bienvenue sur Kalendo</h1>
                    <p className="text-gray-600">Choisissez votre espace de connexion</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Client Card */}
                    <Link href="/login" className="block h-full">
                        <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-nude-600 group">
                            <CardHeader className="text-center">
                                <div className="w-16 h-16 bg-nude-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <User className="w-8 h-8 text-nude-600" />
                                </div>
                                <CardTitle className="text-2xl group-hover:text-nude-600 transition-colors">Espace Client</CardTitle>
                                <CardDescription className="text-base">
                                    Accédez à vos réservations et favoris
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                                    <li className="flex items-start">
                                        <span className="text-nude-600 mr-2">✓</span>
                                        <span>Réserver facilement vos rendez-vous</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-nude-600 mr-2">✓</span>
                                        <span>Découvrir les meilleurs salons</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-nude-600 mr-2">✓</span>
                                        <span>Gérer vos réservations</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-nude-600 mr-2">✓</span>
                                        <span>Laisser des avis</span>
                                    </li>
                                </ul>

                                <Button className="w-full bg-nude-600 hover:bg-nude-700">
                                    Connexion Client
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Professional Card */}
                    <Link href="/professionals/login" className="block h-full">
                        <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-warm-600 group">
                            <CardHeader className="text-center">
                                <div className="w-16 h-16 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Building className="w-8 h-8 text-warm-600" />
                                </div>
                                <CardTitle className="text-2xl group-hover:text-warm-600 transition-colors">Espace Professionnel</CardTitle>
                                <CardDescription className="text-base">
                                    Gérez votre établissement et vos rendez-vous
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                                    <li className="flex items-start">
                                        <span className="text-warm-600 mr-2">✓</span>
                                        <span>Gérer votre établissement</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-warm-600 mr-2">✓</span>
                                        <span>Organiser vos rendez-vous</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-warm-600 mr-2">✓</span>
                                        <span>Gérer votre équipe</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-warm-600 mr-2">✓</span>
                                        <span>Augmenter votre visibilité</span>
                                    </li>
                                </ul>

                                <Button className="w-full bg-gradient-to-r from-nude-600 to-warm-600 hover:opacity-90">
                                    Connexion Pro
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <div className="mt-8 text-center">
                    <span className="text-gray-600">Pas encore de compte ? </span>
                    <Link href="/signup" className="text-nude-600 hover:text-nude-700 font-medium">
                        S'inscrire gratuitement
                    </Link>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                        ← Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    )
}
