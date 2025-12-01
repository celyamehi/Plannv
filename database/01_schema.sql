-- =====================================================
-- SCHÉMA BASE DE DONNÉES - PLATEFORME RÉSERVATION BEAUTÉ
-- Supabase PostgreSQL
-- =====================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: profiles (extension de auth.users)
-- =====================================================
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

-- =====================================================
-- TABLE: establishments (Salons/Instituts)
-- =====================================================
CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'coiffeur', 'esthetique', 'spa', 'barbier', etc.
    
    -- Adresse
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'France',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Contact
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Médias
    logo_url TEXT,
    cover_image_url TEXT,
    images TEXT[], -- Array d'URLs
    
    -- Horaires (JSON format)
    opening_hours JSONB, -- {lundi: {open: "09:00", close: "19:00"}, ...}
    
    -- Paramètres
    is_active BOOLEAN DEFAULT true,
    accepts_online_booking BOOLEAN DEFAULT true,
    requires_prepayment BOOLEAN DEFAULT false,
    prepayment_percentage INTEGER DEFAULT 0,
    cancellation_policy TEXT,
    
    -- Stats
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la recherche géographique
CREATE INDEX idx_establishments_location ON establishments(latitude, longitude);
CREATE INDEX idx_establishments_city ON establishments(city);
CREATE INDEX idx_establishments_category ON establishments(category);

-- =====================================================
-- TABLE: staff_members (Collaborateurs)
-- =====================================================
CREATE TABLE staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    
    title TEXT, -- 'Coiffeur', 'Esthéticienne', etc.
    bio TEXT,
    specialties TEXT[],
    
    is_active BOOLEAN DEFAULT true,
    can_book_online BOOLEAN DEFAULT true,
    
    -- Horaires spécifiques (si différent de l'établissement)
    custom_hours JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_establishment ON staff_members(establishment_id);

-- =====================================================
-- TABLE: services (Prestations)
-- =====================================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'coupe', 'coloration', 'soin', etc.
    
    duration INTEGER NOT NULL, -- en minutes
    price DECIMAL(10, 2) NOT NULL,
    
    is_active BOOLEAN DEFAULT true,
    online_booking_enabled BOOLEAN DEFAULT true,
    
    -- Collaborateurs pouvant effectuer ce service
    available_staff_ids UUID[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_establishment ON services(establishment_id);

-- =====================================================
-- TABLE: appointments (Rendez-vous)
-- =====================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL NOT NULL,
    
    -- Date et heure
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Statut
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')) DEFAULT 'pending',
    
    -- Notes
    client_notes TEXT,
    staff_notes TEXT,
    
    -- Paiement
    total_price DECIMAL(10, 2) NOT NULL,
    prepayment_amount DECIMAL(10, 2) DEFAULT 0,
    prepayment_status TEXT CHECK (prepayment_status IN ('none', 'pending', 'paid', 'refunded')) DEFAULT 'none',
    payment_intent_id TEXT, -- Stripe payment intent
    
    -- Notifications
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMPTZ,
    
    -- Annulation
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES profiles(id),
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_establishment ON appointments(establishment_id);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_staff ON appointments(staff_member_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date, start_time);
CREATE INDEX idx_appointments_status ON appointments(status);

-- =====================================================
-- TABLE: availability_slots (Créneaux de disponibilité)
-- =====================================================
CREATE TABLE availability_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE NOT NULL,
    
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dimanche, 6=Samedi
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_availability_staff ON availability_slots(staff_member_id);

-- =====================================================
-- TABLE: time_off (Absences/Congés)
-- =====================================================
CREATE TABLE time_off (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE NOT NULL,
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeoff_staff ON time_off(staff_member_id);

-- =====================================================
-- TABLE: reviews (Avis clients)
-- =====================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    
    is_verified BOOLEAN DEFAULT false, -- Vérifié si lié à un RDV réel
    is_moderated BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    
    response TEXT, -- Réponse du professionnel
    response_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_establishment ON reviews(establishment_id);
CREATE INDEX idx_reviews_client ON reviews(client_id);

-- =====================================================
-- TABLE: waiting_list (Liste d'attente)
-- =====================================================
CREATE TABLE waiting_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    
    preferred_dates DATE[],
    preferred_times TEXT[], -- 'morning', 'afternoon', 'evening'
    
    status TEXT CHECK (status IN ('active', 'notified', 'converted', 'expired')) DEFAULT 'active',
    notified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_waiting_list_establishment ON waiting_list(establishment_id);
CREATE INDEX idx_waiting_list_client ON waiting_list(client_id);

-- =====================================================
-- TABLE: client_preferences (Préférences clients)
-- =====================================================
CREATE TABLE client_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    favorite_establishments UUID[],
    favorite_staff_members UUID[],
    
    preferred_times TEXT[],
    preferred_days INTEGER[],
    
    notifications_email BOOLEAN DEFAULT true,
    notifications_sms BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: transactions (Paiements)
-- =====================================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    
    payment_method TEXT CHECK (payment_method IN ('card', 'cash', 'check', 'transfer', 'online')) NOT NULL,
    payment_provider TEXT, -- 'stripe', 'paypal', etc.
    payment_intent_id TEXT,
    
    status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_appointment ON transactions(appointment_id);
CREATE INDEX idx_transactions_establishment ON transactions(establishment_id);

-- =====================================================
-- TABLE: marketing_campaigns (Campagnes marketing)
-- =====================================================
CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('email', 'sms', 'both')) NOT NULL,
    
    subject TEXT,
    message TEXT NOT NULL,
    
    target_audience JSONB, -- Critères de ciblage
    
    status TEXT CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')) DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    
    recipients_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_establishment ON marketing_campaigns(establishment_id);

-- =====================================================
-- TABLE: notifications (Notifications système)
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    type TEXT NOT NULL, -- 'appointment_reminder', 'appointment_confirmed', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    related_id UUID, -- ID de l'objet lié (appointment, etc.)
    related_type TEXT, -- 'appointment', 'review', etc.
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- =====================================================
-- TABLE: support_tickets (Tickets support)
-- =====================================================
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    establishment_id UUID REFERENCES establishments(id) ON DELETE SET NULL,
    
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT, -- 'technical', 'billing', 'general', etc.
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    
    status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    
    assigned_to UUID REFERENCES profiles(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);

-- =====================================================
-- TABLE: ticket_messages (Messages des tickets)
-- =====================================================
CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
    
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    message TEXT NOT NULL,
    
    attachments TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);
