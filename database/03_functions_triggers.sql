-- =====================================================
-- FONCTIONS ET TRIGGERS
-- Automatisations et logique métier
-- =====================================================

-- =====================================================
-- FONCTION: Mise à jour automatique de updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les tables concernées
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_establishments_updated_at BEFORE UPDATE ON establishments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_preferences_updated_at BEFORE UPDATE ON client_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FONCTION: Créer un profil automatiquement lors de l'inscription
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, user_type)
    VALUES (NEW.id, NEW.email, 'client');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users (table Supabase)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- FONCTION: Mettre à jour la note moyenne d'un établissement
-- =====================================================
CREATE OR REPLACE FUNCTION update_establishment_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    review_count INTEGER;
BEGIN
    -- Calculer la moyenne et le nombre d'avis
    SELECT 
        COALESCE(AVG(rating), 0),
        COUNT(*)
    INTO avg_rating, review_count
    FROM reviews
    WHERE establishment_id = COALESCE(NEW.establishment_id, OLD.establishment_id)
        AND is_visible = true
        AND is_moderated = true;
    
    -- Mettre à jour l'établissement
    UPDATE establishments
    SET 
        average_rating = avg_rating,
        total_reviews = review_count
    WHERE id = COALESCE(NEW.establishment_id, OLD.establishment_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour la note
CREATE TRIGGER update_rating_on_review_insert
    AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_establishment_rating();

CREATE TRIGGER update_rating_on_review_update
    AFTER UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_establishment_rating();

CREATE TRIGGER update_rating_on_review_delete
    AFTER DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_establishment_rating();

-- =====================================================
-- FONCTION: Vérifier les conflits de rendez-vous
-- =====================================================
CREATE OR REPLACE FUNCTION check_appointment_conflict()
RETURNS TRIGGER AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    -- Vérifier si le collaborateur a déjà un RDV à ce moment
    SELECT COUNT(*)
    INTO conflict_count
    FROM appointments
    WHERE staff_member_id = NEW.staff_member_id
        AND appointment_date = NEW.appointment_date
        AND status NOT IN ('cancelled', 'no_show')
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND (
            (start_time, end_time) OVERLAPS (NEW.start_time, NEW.end_time)
        );
    
    IF conflict_count > 0 THEN
        RAISE EXCEPTION 'Conflit de rendez-vous: le collaborateur n''est pas disponible à ce créneau';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_appointment_conflict_trigger
    BEFORE INSERT OR UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION check_appointment_conflict();

-- =====================================================
-- FONCTION: Créer une notification
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
    INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
    VALUES (p_user_id, p_type, p_title, p_message, p_related_id, p_related_type)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FONCTION: Notifier lors d'un nouveau rendez-vous
-- =====================================================
CREATE OR REPLACE FUNCTION notify_new_appointment()
RETURNS TRIGGER AS $$
DECLARE
    client_name TEXT;
    service_name TEXT;
    establishment_name TEXT;
BEGIN
    -- Récupérer les informations
    SELECT full_name INTO client_name FROM profiles WHERE id = NEW.client_id;
    SELECT name INTO service_name FROM services WHERE id = NEW.service_id;
    SELECT name INTO establishment_name FROM establishments WHERE id = NEW.establishment_id;
    
    -- Notifier le client
    PERFORM create_notification(
        NEW.client_id,
        'appointment_confirmed',
        'Rendez-vous confirmé',
        'Votre rendez-vous chez ' || establishment_name || ' le ' || 
        TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || ' à ' || 
        TO_CHAR(NEW.start_time, 'HH24:MI') || ' est confirmé.',
        NEW.id,
        'appointment'
    );
    
    -- Notifier le propriétaire de l'établissement
    PERFORM create_notification(
        (SELECT owner_id FROM establishments WHERE id = NEW.establishment_id),
        'new_appointment',
        'Nouveau rendez-vous',
        client_name || ' a réservé ' || service_name || ' le ' || 
        TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || ' à ' || 
        TO_CHAR(NEW.start_time, 'HH24:MI'),
        NEW.id,
        'appointment'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_new_appointment_trigger
    AFTER INSERT ON appointments
    FOR EACH ROW EXECUTE FUNCTION notify_new_appointment();

-- =====================================================
-- FONCTION: Notifier lors d'une annulation
-- =====================================================
CREATE OR REPLACE FUNCTION notify_appointment_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    client_name TEXT;
    establishment_name TEXT;
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        SELECT full_name INTO client_name FROM profiles WHERE id = NEW.client_id;
        SELECT name INTO establishment_name FROM establishments WHERE id = NEW.establishment_id;
        
        -- Notifier le client
        PERFORM create_notification(
            NEW.client_id,
            'appointment_cancelled',
            'Rendez-vous annulé',
            'Votre rendez-vous du ' || TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || 
            ' à ' || TO_CHAR(NEW.start_time, 'HH24:MI') || ' a été annulé.',
            NEW.id,
            'appointment'
        );
        
        -- Notifier le propriétaire
        PERFORM create_notification(
            (SELECT owner_id FROM establishments WHERE id = NEW.establishment_id),
            'appointment_cancelled',
            'Rendez-vous annulé',
            'Le rendez-vous de ' || client_name || ' du ' || 
            TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || ' à ' || 
            TO_CHAR(NEW.start_time, 'HH24:MI') || ' a été annulé.',
            NEW.id,
            'appointment'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_appointment_cancellation_trigger
    AFTER UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION notify_appointment_cancellation();

-- =====================================================
-- FONCTION: Recherche d'établissements par proximité
-- =====================================================
CREATE OR REPLACE FUNCTION search_establishments_nearby(
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_radius_km INTEGER DEFAULT 10,
    p_category TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    category TEXT,
    address TEXT,
    city TEXT,
    average_rating DECIMAL,
    total_reviews INTEGER,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.name,
        e.category,
        e.address,
        e.city,
        e.average_rating,
        e.total_reviews,
        ROUND(
            (6371 * acos(
                cos(radians(p_latitude)) * 
                cos(radians(e.latitude)) * 
                cos(radians(e.longitude) - radians(p_longitude)) + 
                sin(radians(p_latitude)) * 
                sin(radians(e.latitude))
            ))::NUMERIC, 
            2
        ) AS distance_km
    FROM establishments e
    WHERE e.is_active = true
        AND e.accepts_online_booking = true
        AND (p_category IS NULL OR e.category = p_category)
        AND (
            6371 * acos(
                cos(radians(p_latitude)) * 
                cos(radians(e.latitude)) * 
                cos(radians(e.longitude) - radians(p_longitude)) + 
                sin(radians(p_latitude)) * 
                sin(radians(e.latitude))
            )
        ) <= p_radius_km
    ORDER BY distance_km
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FONCTION: Obtenir les créneaux disponibles
-- =====================================================
CREATE OR REPLACE FUNCTION get_available_slots(
    p_staff_member_id UUID,
    p_date DATE,
    p_service_duration INTEGER
)
RETURNS TABLE (
    start_time TIME,
    end_time TIME
) AS $$
DECLARE
    slot_duration INTEGER := 30; -- Durée d'un créneau en minutes
    day_of_week INTEGER;
BEGIN
    day_of_week := EXTRACT(DOW FROM p_date);
    
    RETURN QUERY
    WITH 
    -- Créneaux de disponibilité du collaborateur
    available_periods AS (
        SELECT av.start_time, av.end_time
        FROM availability_slots av
        WHERE av.staff_member_id = p_staff_member_id
            AND av.day_of_week = day_of_week
            AND av.is_active = true
    ),
    -- Rendez-vous existants
    booked_slots AS (
        SELECT a.start_time, a.end_time
        FROM appointments a
        WHERE a.staff_member_id = p_staff_member_id
            AND a.appointment_date = p_date
            AND a.status NOT IN ('cancelled', 'no_show')
    ),
    -- Générer tous les créneaux possibles
    time_slots AS (
        SELECT 
            t::TIME AS slot_start,
            (t + (p_service_duration || ' minutes')::INTERVAL)::TIME AS slot_end
        FROM available_periods ap
        CROSS JOIN LATERAL generate_series(
            ap.start_time,
            ap.end_time - (p_service_duration || ' minutes')::INTERVAL,
            (slot_duration || ' minutes')::INTERVAL
        ) AS t
    )
    -- Filtrer les créneaux non réservés
    SELECT ts.slot_start, ts.slot_end
    FROM time_slots ts
    WHERE NOT EXISTS (
        SELECT 1 FROM booked_slots bs
        WHERE (ts.slot_start, ts.slot_end) OVERLAPS (bs.start_time, bs.end_time)
    )
    ORDER BY ts.slot_start;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FONCTION: Statistiques pour un établissement
-- =====================================================
CREATE OR REPLACE FUNCTION get_establishment_stats(
    p_establishment_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    total_appointments INTEGER,
    completed_appointments INTEGER,
    cancelled_appointments INTEGER,
    no_show_appointments INTEGER,
    total_revenue DECIMAL,
    average_rating DECIMAL,
    new_clients INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER AS total_appointments,
        COUNT(*) FILTER (WHERE status = 'completed')::INTEGER AS completed_appointments,
        COUNT(*) FILTER (WHERE status = 'cancelled')::INTEGER AS cancelled_appointments,
        COUNT(*) FILTER (WHERE status = 'no_show')::INTEGER AS no_show_appointments,
        COALESCE(SUM(total_price) FILTER (WHERE status = 'completed'), 0) AS total_revenue,
        e.average_rating,
        COUNT(DISTINCT a.client_id) FILTER (
            WHERE NOT EXISTS (
                SELECT 1 FROM appointments a2
                WHERE a2.client_id = a.client_id
                    AND a2.establishment_id = p_establishment_id
                    AND a2.appointment_date < p_start_date
            )
        )::INTEGER AS new_clients
    FROM appointments a
    JOIN establishments e ON e.id = a.establishment_id
    WHERE a.establishment_id = p_establishment_id
        AND a.appointment_date BETWEEN p_start_date AND p_end_date
    GROUP BY e.average_rating;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FONCTION: Vérifier si un avis est vérifié
-- =====================================================
CREATE OR REPLACE FUNCTION verify_review()
RETURNS TRIGGER AS $$
BEGIN
    -- Un avis est vérifié s'il est lié à un RDV complété
    IF NEW.appointment_id IS NOT NULL THEN
        NEW.is_verified := EXISTS (
            SELECT 1 FROM appointments
            WHERE id = NEW.appointment_id
                AND status = 'completed'
                AND client_id = NEW.client_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER verify_review_trigger
    BEFORE INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION verify_review();

-- =====================================================
-- FONCTION: Gérer la liste d'attente
-- =====================================================
CREATE OR REPLACE FUNCTION notify_waiting_list_on_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    waiting_client RECORD;
BEGIN
    -- Si un RDV est annulé, notifier les clients en liste d'attente
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        FOR waiting_client IN
            SELECT wl.*, p.full_name
            FROM waiting_list wl
            JOIN profiles p ON p.id = wl.client_id
            WHERE wl.establishment_id = NEW.establishment_id
                AND wl.service_id = NEW.service_id
                AND wl.status = 'active'
                AND NEW.appointment_date = ANY(wl.preferred_dates)
            ORDER BY wl.created_at
            LIMIT 5
        LOOP
            -- Créer une notification
            PERFORM create_notification(
                waiting_client.client_id,
                'waiting_list_available',
                'Créneau disponible',
                'Un créneau s''est libéré pour votre service souhaité le ' || 
                TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || ' à ' || 
                TO_CHAR(NEW.start_time, 'HH24:MI'),
                NEW.id,
                'appointment'
            );
            
            -- Marquer comme notifié
            UPDATE waiting_list
            SET status = 'notified', notified_at = NOW()
            WHERE id = waiting_client.id;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_waiting_list_trigger
    AFTER UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION notify_waiting_list_on_cancellation();
