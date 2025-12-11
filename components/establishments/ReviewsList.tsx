'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface ReviewsListProps {
    establishmentId: string
}

export default function ReviewsList({ establishmentId }: ReviewsListProps) {
    const [reviews, setReviews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReviews()
    }, [establishmentId])

    const fetchReviews = async () => {
        try {
            console.log('Fetching reviews for establishment:', establishmentId)

            // Récupérer les avis sans JOIN
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('establishment_id', establishmentId)
                .order('created_at', { ascending: false })

            console.log('Reviews fetched:', { data, error })

            if (error) {
                console.error('Error fetching reviews:', error)
                setReviews([])
            } else if (data && data.length > 0) {
                // Récupérer les noms des clients séparément
                const clientIds = data.map(r => r.client_id)
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', clientIds)

                console.log('Profiles fetched:', profiles)

                // Combiner les données
                const reviewsWithClients = data.map(review => ({
                    ...review,
                    client: profiles?.find(p => p.id === review.client_id)
                }))

                setReviews(reviewsWithClients)
            } else {
                setReviews([])
            }
        } catch (error) {
            console.error('Exception fetching reviews:', error)
            setReviews([])
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <p className="text-gray-500 text-center py-8">Chargement des avis...</p>
    }

    if (reviews.length === 0) {
        return <p className="text-gray-500 text-center py-8">Aucun avis pour le moment</p>
    }

    return (
        <div className="space-y-6">
            {reviews.map((review: any) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-nude-100 rounded-full flex items-center justify-center">
                                <span className="font-semibold text-nude-600">
                                    {review.client?.full_name?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <div>
                                <p className="font-semibold">{review.client?.full_name || 'Anonyme'}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-700">{review.comment || 'Pas de commentaire'}</p>
                </div>
            ))}
        </div>
    )
}
