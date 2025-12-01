'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function HistoryPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [activities, setActivities] = useState<any[]>([])

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            router.push('/login')
            return
        }
        fetchHistory(session.user.id)
    }

    const fetchHistory = async (userId: string) => {
        try {
            // Récupérer les rendez-vous passés
            const { data: appointments } = await supabase
                .from('appointments')
                .select(`
          *,
          establishment:establishments(name, slug),
          service:services(name, price)
        `)
                .eq('client_id', userId)
                .order('appointment_date', { ascending: false })
                .order('start_time', { ascending: false })

            if (appointments) {
                // Transformer les rendez-vous en "activités"
                const historyItems = appointments.map(apt => ({
                    id: apt.id,
                    type: 'appointment',
                    date: new Date(apt.appointment_date),
                    time: apt.start_time,
                    status: apt.status,
                    title: apt.service?.name || 'Rendez-vous',
                    description: `Chez ${apt.establishment?.name}`,
                    price: apt.service?.price,
                    details: apt
                }))

                setActivities(historyItems)
            }
        } catch (error) {
            console.error('Erreur récupération historique:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />
            case 'no_show': return <AlertCircle className="w-5 h-5 text-orange-500" />
            default: return <Clock className="w-5 h-5 text-gray-500" />
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Terminé'
            case 'cancelled': return 'Annulé'
            case 'no_show': return 'Non présenté'
            case 'confirmed': return 'Confirmé'
            case 'pending': return 'En attente'
            default: return status
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Historique des activités</h1>
                <p className="text-gray-600">Retrouvez l'historique de vos rendez-vous et actions.</p>
            </div>

            <div className="space-y-4">
                {activities.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Aucune activité enregistrée pour le moment.
                        </CardContent>
                    </Card>
                ) : (
                    activities.map((activity) => (
                        <Card key={activity.id} className="hover:shadow-sm transition-shadow">
                            <CardContent className="p-4 flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    {getStatusIcon(activity.status)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {activity.title}
                                        </p>
                                        <span className="text-xs text-gray-500">
                                            {activity.date.toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">
                                        {activity.description}
                                    </p>
                                </div>

                                <div className="text-right text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            activity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                activity.status === 'no_show' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                        {getStatusLabel(activity.status)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
