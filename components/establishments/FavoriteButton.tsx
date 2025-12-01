'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface FavoriteButtonProps {
    establishmentId: string
    establishmentName: string
}

export default function FavoriteButton({ establishmentId, establishmentName }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(false)
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        checkFavoriteStatus()
    }, [])

    const checkFavoriteStatus = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                setLoading(false)
                return
            }

            setUserId(session.user.id)

            const { data } = await supabase
                .from('favorites')
                .select('id')
                .eq('client_id', session.user.id)
                .eq('establishment_id', establishmentId)
                .single()

            setIsFavorite(!!data)
        } catch (error) {
            console.error('Erreur vérification favori:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleFavorite = async () => {
        if (!userId) {
            alert('Vous devez être connecté pour ajouter des favoris')
            return
        }

        setLoading(true)

        try {
            if (isFavorite) {
                // Retirer des favoris
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('client_id', userId)
                    .eq('establishment_id', establishmentId)

                if (error) throw error

                setIsFavorite(false)
            } else {
                // Ajouter aux favoris
                const { error } = await supabase
                    .from('favorites')
                    .insert({
                        client_id: userId,
                        establishment_id: establishmentId
                    })

                if (error) throw error

                setIsFavorite(true)
            }
        } catch (error) {
            console.error('Erreur toggle favori:', error)
            alert('Une erreur est survenue. Veuillez réessayer.')
        } finally {
            setLoading(false)
        }
    }

    if (!userId) {
        return null // Ne pas afficher le bouton si non connecté
    }

    return (
        <Button
            onClick={toggleFavorite}
            disabled={loading}
            variant={isFavorite ? "default" : "outline"}
            className={isFavorite ? "bg-red-500 hover:bg-red-600 text-white" : "text-gray-900 hover:text-gray-900 border-white hover:bg-white/20"}
        >
            <Heart
                className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-white' : ''}`}
            />
            {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        </Button>
    )
}
