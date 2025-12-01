'use client'

import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface ReviewModalProps {
    appointmentId: string
    establishmentId: string
    establishmentName: string
    onClose: () => void
    onSuccess: () => void
}

export default function ReviewModal({
    appointmentId,
    establishmentId,
    establishmentName,
    onClose,
    onSuccess
}: ReviewModalProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Veuillez sélectionner une note')
            return
        }

        setLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                alert('Vous devez être connecté')
                return
            }

            // Créer l'avis
            const { data, error } = await supabase
                .from('reviews')
                .insert({
                    establishment_id: establishmentId,
                    client_id: session.user.id,
                    appointment_id: appointmentId,
                    rating: rating,
                    comment: comment.trim() || null
                })
                .select()

            if (error) throw error

            alert('Merci pour votre avis !')
            onSuccess()
            onClose()
        } catch (error: any) {
            console.error('Erreur création avis:', error)
            if (error.code === '23505') {
                alert('Vous avez déjà laissé un avis pour ce rendez-vous')
            } else {
                alert(`Erreur: ${error.message || 'Veuillez réessayer.'}`)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Laisser un avis</h3>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Établissement</p>
                        <p className="font-medium">{establishmentName}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 mb-3">Votre note</p>
                        <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 ${star <= (hoveredRating || rating)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 mb-2 block">
                            Votre commentaire (optionnel)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows={4}
                            placeholder="Partagez votre expérience..."
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {comment.length}/500 caractères
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t flex space-x-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                        disabled={loading || rating === 0}
                    >
                        {loading ? 'Envoi...' : 'Publier l\'avis'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
