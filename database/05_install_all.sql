-- =====================================================
-- INSTALLATION COMPLÈTE - TOUT EN UN
-- PlannV - Plateforme de Réservation Beauté
-- =====================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Pour les recherches géographiques

-- =====================================================
-- PARTIE 1: CRÉATION DES TABLES
-- =====================================================

-- TABLE: profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    user_type TEXT CHECK (user_type IN ('client', 'professional', 'admin')) NOT NULL DEFAULT 'client',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: establishments
CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'France',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    phone TEXT,
    email TEXT,
    website TEXT,
    
    logo_url TEXT,
    cover_image_url TEXT,
    images TEXT[],
    
    opening_hours JSONB,
    
    is_active BOOLEAN DEFAULT true,
    accepts_online_booking BOOLEAN DEFAULT true,
    requires_deposit BOOLEAN DEFAULT false,
    
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: staff_members
CREATE TABLE staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    title TEXT,
    bio TEXT,
    avatar_url TEXT,
    specialties TEXT[],
    
    is_active BOOLEAN DEFAULT true,
    can_book_online BOOLEAN DEFAULT true,
    
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: services
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    duration INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    
    is_active BOOLEAN DEFAULT true,
    online_booking_enabled BOOLEAN DEFAULT true,
    
    available_staff_ids UUID[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: availability_slots
CREATE TABLE availability_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(staff_member_id, day_of_week, start_time, end_time)
);

-- TABLE: time_off
CREATE TABLE time_off (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL NOT NULL,
    
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')) DEFAULT 'pending',
    
    total_price DECIMAL(10, 2) NOT NULL,
    deposit_paid DECIMAL(10, 2) DEFAULT 0.00,
    
    client_notes TEXT,
    staff_notes TEXT,
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    
    is_verified BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    
    owner_response TEXT,
    owner_response_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: client_preferences
CREATE TABLE client_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    preferred_establishments UUID[],
    preferred_staff_members UUID[],
    notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: waiting_list
CREATE TABLE waiting_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    
    preferred_dates DATE[],
    preferred_times TEXT[],
    
    status TEXT CHECK (status IN ('active', 'notified', 'booked', 'expired')) DEFAULT 'active',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notified_at TIMESTAMPTZ
);

-- TABLE: transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type TEXT CHECK (transaction_type IN ('deposit', 'full_payment', 'refund')) NOT NULL,
    payment_method TEXT,
    
    status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    
    stripe_payment_intent_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    is_read BOOLEAN DEFAULT false,
    
    related_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: marketing_campaigns
CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    
    campaign_type TEXT CHECK (campaign_type IN ('email', 'sms', 'push')) NOT NULL,
    
    target_audience JSONB,
    
    message_template TEXT NOT NULL,
    
    status TEXT CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')) DEFAULT 'draft',
    
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    
    total_recipients INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: support_tickets
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    subject TEXT NOT NULL,
    category TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    
    status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: ticket_messages
CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    message TEXT NOT NULL,
    attachments TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PARTIE 2: INDEX POUR PERFORMANCE
-- =====================================================

CREATE INDEX idx_establishments_owner ON establishments(owner_id);
CREATE INDEX idx_establishments_category ON establishments(category);
CREATE INDEX idx_establishments_city ON establishments(city);
CREATE INDEX idx_establishments_active ON establishments(is_active);

CREATE INDEX idx_staff_establishment ON staff_members(establishment_id);
CREATE INDEX idx_staff_active ON staff_members(is_active);

CREATE INDEX idx_services_establishment ON services(establishment_id);
CREATE INDEX idx_services_active ON services(is_active);

CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_establishment ON appointments(establishment_id);
CREATE INDEX idx_appointments_staff ON appointments(staff_member_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

CREATE INDEX idx_reviews_establishment ON reviews(establishment_id);
CREATE INDEX idx_reviews_client ON reviews(client_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- =====================================================
-- PARTIE 3: FONCTIONS SQL
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction de recherche géographique
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
        ROUND(
            (6371 * acos(
                cos(radians(p_latitude)) * 
                cos(radians(e.latitude)) * 
                cos(radians(e.longitude) - radians(p_longitude)) + 
                sin(radians(p_latitude)) * 
                sin(radians(e.latitude))
            ))::NUMERIC, 2
        ) as distance_km
    FROM establishments e
    WHERE e.is_active = true
        AND (p_category IS NULL OR e.category = p_category)
        AND (6371 * acos(
            cos(radians(p_latitude)) * 
            cos(radians(e.latitude)) * 
            cos(radians(e.longitude) - radians(p_longitude)) + 
            sin(radians(p_latitude)) * 
            sin(radians(e.latitude))
        )) <= p_radius_km
    ORDER BY distance_km
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les créneaux disponibles
CREATE OR REPLACE FUNCTION get_available_slots(
    p_staff_member_id UUID,
    p_date DATE,
    p_service_duration INTEGER
)
RETURNS TABLE (
    slot_time TIME
) AS $$
DECLARE
    v_day_of_week INTEGER;
BEGIN
    v_day_of_week := EXTRACT(DOW FROM p_date);
    
    RETURN QUERY
    WITH time_slots AS (
        SELECT 
            generate_series(
                av.start_time,
                av.end_time - (p_service_duration || ' minutes')::INTERVAL,
                '15 minutes'::INTERVAL
            )::TIME as slot
        FROM availability_slots av
        WHERE av.staff_member_id = p_staff_member_id
            AND av.day_of_week = v_day_of_week
            AND av.is_active = true
    )
    SELECT ts.slot
    FROM time_slots ts
    WHERE NOT EXISTS (
        SELECT 1
        FROM appointments a
        WHERE a.staff_member_id = p_staff_member_id
            AND a.appointment_date = p_date
            AND a.status NOT IN ('cancelled')
            AND ts.slot >= a.start_time
            AND ts.slot < a.end_time
    )
    ORDER BY ts.slot;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PARTIE 4: TRIGGERS
-- =====================================================

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

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PARTIE 5: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Politiques pour establishments (lecture publique)
CREATE POLICY "Tout le monde peut voir les établissements actifs"
    ON establishments FOR SELECT
    USING (is_active = true);

CREATE POLICY "Les propriétaires peuvent gérer leurs établissements"
    ON establishments FOR ALL
    USING (auth.uid() = owner_id);

-- Politiques pour staff_members (lecture publique)
CREATE POLICY "Tout le monde peut voir les collaborateurs actifs"
    ON staff_members FOR SELECT
    USING (is_active = true);

CREATE POLICY "Les propriétaires peuvent gérer leurs collaborateurs"
    ON staff_members FOR ALL
    USING (
        establishment_id IN (
            SELECT id FROM establishments WHERE owner_id = auth.uid()
        )
    );

-- Politiques pour services (lecture publique)
CREATE POLICY "Tout le monde peut voir les services actifs"
    ON services FOR SELECT
    USING (is_active = true);

CREATE POLICY "Les propriétaires peuvent gérer leurs services"
    ON services FOR ALL
    USING (
        establishment_id IN (
            SELECT id FROM establishments WHERE owner_id = auth.uid()
        )
    );

-- Politiques pour appointments
CREATE POLICY "Les clients voient leurs propres rendez-vous"
    ON appointments FOR SELECT
    USING (auth.uid() = client_id);

CREATE POLICY "Les professionnels voient les rendez-vous de leurs établissements"
    ON appointments FOR SELECT
    USING (
        establishment_id IN (
            SELECT id FROM establishments WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Les clients peuvent créer des rendez-vous"
    ON appointments FOR INSERT
    WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Les clients peuvent annuler leurs rendez-vous"
    ON appointments FOR UPDATE
    USING (auth.uid() = client_id);

-- =====================================================
-- PARTIE 6: CONFIRMATION
-- =====================================================

SELECT '✅ Installation complète terminée avec succès !' as status;
SELECT 'Tables créées: 15' as info;
SELECT 'Fonctions créées: 3' as info;
SELECT 'Triggers créés: 8' as info;
SELECT 'Politiques RLS activées' as info;
