'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Star, MapPin, Heart, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import RatingStats from '@/components/establishments/RatingStats'

export default function FavoritesPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [favorites, setFavorites] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchFavorites()
    }, [])

    const fetchFavorites = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            const { data } = await supabase
                .from('favorites')
                .select(`
          *,
          establishment:establishments(
            *,
            services(name, price)
          )
        `)
                .eq('client_id', session.user.id)
                .order('created_at', { ascending: false })

            setFavorites(data?.map(fav => fav.establishment).filter(Boolean) || [])
        } catch (error) {
            console.error('Erreur récupération favoris:', error)
        } finally {
            setLoading(false)
        }
    }

    const removeFromFavorites = async (establishmentId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            await supabase
                .from('favorites')
                .delete()
                .eq('client_id', session.user.id)
                .eq('establishment_id', establishmentId)

            setFavorites(favorites.filter(fav => fav.id !== establishmentId))
        } catch (error) {
            console.error('Erreur suppression favori:', error)
        }
    }

    const filteredFavorites = favorites.filter(establishment =>
        establishment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        establishment.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        establishment.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getCategoryIcon = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'coiffure': return '✂️'
            case 'beauté': return '💅'
            case 'spa': return '🧖'
            case 'ongles': return '💅'
            case 'soin': return '🌿'
            default: return '💇'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Chargement...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Mes Favoris</h1>

            {/* Barre de recherche */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Rechercher un salon favori..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Liste des favoris */}
            {filteredFavorites.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'Aucun favori trouvé' : 'Aucun favori'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm
                                ? 'Essayez une autre recherche ou parcourez tous vos favoris.'
                                : 'Ajoutez des salons à vos favoris pour les retrouver facilement ici.'
                            }
                        </p>
                        <div className="flex justify-center space-x-4">
                            {searchTerm && (
                                <Button variant="outline" onClick={() => setSearchTerm('')}>
                                    Effacer la recherche
                                </Button>
                            )}
                            <Link href="/client/search">
                                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                                    <Search className="w-4 h-4 mr-2" />
                                    Explorer les salons
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFavorites.map((establishment) => (
                        <Card key={establishment.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white text-xl">
                                            {getCategoryIcon(establishment.category)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{establishment.name}</CardTitle>
                                            <CardDescription className="flex items-center mt-1">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {establishment.city || 'Adresse non spécifiée'}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFromFavorites(establishment.id)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Heart className="w-4 h-4 fill-current" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                {/* Rating */}
                                <div className="mb-3">
                                    <RatingStats establishmentId={establishment.id} />
                                </div>

                                {/* Services */}
                                {establishment.services && establishment.services.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Services populaires:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {establishment.services.slice(0, 3).map((service: any, index: number) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
                                                >
                                                    {service.name}
                                                </span>
                                            ))}
                                            {establishment.services.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                    +{establishment.services.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex space-x-2">
                                    <Link href={`/establishments/${establishment.slug}`} className="flex-1">
                                        <Button className="w-full" size="sm">
                                            Voir le salon
                                        </Button>
                                    </Link>
                                    <Link href={`/booking/${establishment.slug}`} className="flex-1">
                                        <Button variant="outline" className="w-full" size="sm">
                                            Réserver
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
