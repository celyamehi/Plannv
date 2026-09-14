-- =====================================================
-- FIX: Erreurs RLS lors de la réservation
-- Problème 1: "new row violates row-level security policy for table notifications"
-- Problème 2: 403 sur appointments
-- =====================================================
-- À exécuter dans Supabase Dashboard → SQL Editor
-- =====================================================

-- =====================================================
-- FIX 1 : La fonction create_notification() doit être
-- SECURITY DEFINER pour bypasser RLS lors d'un trigger
-- =====================================================

CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_related_id UUID DEFAULT NULL,
    p_related_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    -- Insérer uniquement si p_user_id n'est pas NULL
    IF p_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
    VALUES (p_user_id, p_type, p_title, p_message, p_related_id, p_related_type)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIX 2 : notify_new_appointment() aussi SECURITY DEFINER
-- =====================================================

CREATE OR REPLACE FUNCTION notify_new_appointment()
RETURNS TRIGGER AS $$
DECLARE
    client_name TEXT;
    service_name TEXT;
    establishment_name TEXT;
    owner_id_val UUID;
BEGIN
    SELECT full_name INTO client_name FROM profiles WHERE id = NEW.client_id;
    SELECT name INTO service_name FROM services WHERE id = NEW.service_id;
    SELECT name, owner_id INTO establishment_name, owner_id_val 
    FROM establishments WHERE id = NEW.establishment_id;

    IF NEW.client_id IS NOT NULL THEN
        PERFORM create_notification(
            NEW.client_id,
            'appointment_confirmed',
            'Rendez-vous confirmé',
            'Votre rendez-vous chez ' || COALESCE(establishment_name, 'le salon') || ' le ' ||
            TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || ' à ' ||
            TO_CHAR(NEW.start_time::time, 'HH24:MI') || ' est confirmé.',
            NEW.id,
            'appointment'
        );
    END IF;

    IF owner_id_val IS NOT NULL THEN
        PERFORM create_notification(
            owner_id_val,
            'new_appointment',
            'Nouveau rendez-vous',
            COALESCE(client_name, 'Un client') || ' a réservé ' || COALESCE(service_name, 'une prestation') || ' le ' ||
            TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || ' à ' ||
            TO_CHAR(NEW.start_time::time, 'HH24:MI'),
            NEW.id,
            'appointment'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIX 3 : Ajouter politique INSERT sur notifications
-- =====================================================

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create own notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;

CREATE POLICY "Authenticated users can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()
    );

-- =====================================================
-- FIX 4 : Recréer la politique SELECT appointments
-- =====================================================

DROP POLICY IF EXISTS "Clients can view own appointments" ON appointments;

CREATE POLICY "Clients can view own appointments"
    ON appointments FOR SELECT
    USING (
        client_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM establishments
            WHERE id = appointments.establishment_id AND owner_id = auth.uid()
        )
    );

-- =====================================================
-- FIX 5 : Recréer la politique INSERT appointments
-- =====================================================

DROP POLICY IF EXISTS "Clients can create appointments" ON appointments;

CREATE POLICY "Clients can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND client_id = auth.uid()
    );

-- =====================================================
-- VÉRIFICATION
-- =====================================================

SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename IN ('notifications', 'appointments')
ORDER BY tablename, cmd, policyname;
