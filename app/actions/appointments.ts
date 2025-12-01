'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export async function deleteAppointmentAction(appointmentId: string) {
    try {
        // 1. Vérifier l'authentification de l'utilisateur
        const supabase = createServerComponentClient({ cookies })
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return { error: 'Non authentifié' }
        }

        // 2. Initialiser le client Admin pour contourner les RLS
        const adminAuthClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 3. Vérifier que le rendez-vous appartient bien à l'utilisateur et est annulé
        // On utilise le client admin pour lire, mais on vérifie manuellement le client_id
        const { data: appointment, error: fetchError } = await adminAuthClient
            .from('appointments')
            .select('client_id, status')
            .eq('id', appointmentId)
            .single()

        if (fetchError || !appointment) {
            return { error: 'Rendez-vous introuvable' }
        }

        if (appointment.client_id !== session.user.id) {
            return { error: 'Non autorisé' }
        }

        if (appointment.status !== 'cancelled') {
            return { error: 'Seuls les rendez-vous annulés peuvent être supprimés' }
        }

        // 4. Supprimer le rendez-vous
        const { error: deleteError } = await adminAuthClient
            .from('appointments')
            .delete()
            .eq('id', appointmentId)

        if (deleteError) {
            console.error('Erreur suppression admin:', deleteError)
            return { error: 'Erreur lors de la suppression' }
        }

        return { success: true }
    } catch (error) {
        console.error('Erreur serveur:', error)
        return { error: 'Erreur serveur inattendue' }
    }
}
