'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface RatingStatsProps {
    establishmentId: string
}

export default function RatingStats({ establishmentId }: RatingStatsProps) {
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [establishmentId])

    const fetchStats = async () => {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('rating')
                .eq('establishment_id', establishmentId)

            if (!error && data) {
                const totalReviews = data.length
                const averageRating = totalReviews > 0
                    ? data.reduce((sum, review) => sum + review.rating, 0) / totalReviews
                    : 0

                setStats({ averageRating, totalReviews })
            }
        } catch (error) {
            console.error('Error fetching rating stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1 animate-pulse" />
                <span className="font-semibold">...</span>
            </div>
        )
    }

    return (
        <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="font-semibold">{stats.averageRating.toFixed(1)}</span>
            <span className="ml-1 opacity-90">({stats.totalReviews} avis)</span>
        </div>
    )
}
