-- =====================================================
-- STRUCTURE DE BASE DE DONNÉES AVEC RÔLES ET TABLES SÉPARÉES
-- PlannV - Plateforme de réservation beauté
-- =====================================================

-- Extension pour UUID (si pas déjà installée)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: users (table de base pour tous les utilisateurs)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- Pour authentification locale
    role TEXT NOT NULL CHECK (role IN ('client', 'professional', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ
);

-- =====================================================
-- TABLE: clients (informations spécifiques aux clients)
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) STORED,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}', -- Préférences personnelles (notifications, etc.)
    addresses JSONB DEFAULT '[]', -- Adresses de livraison/rendez-vous
    payment_methods JSONB DEFAULT '[]', -- Moyens de paiement enregistrés
    loyalty_points INTEGER DEFAULT 0, -- Points de fidélité
    total_spent DECIMAL(10,2) DEFAULT 0.00, -- Total dépensé
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: professionals (informations spécifiques aux professionnels)
-- =====================================================
CREATE TABLE IF NOT EXISTS professionals (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL, -- Nom de l'entreprise/salon
    contact_first_name TEXT,
    contact_last_name TEXT,
    contact_full_name TEXT GENERATED ALWAYS AS (COALESCE(contact_first_name, '') || ' ' || COALESCE(contact_last_name, '')) STORED,
    phone TEXT NOT NULL,
    business_email TEXT,
    avatar_url TEXT,
    siret TEXT UNIQUE, -- Numéro SIRET (France)
    business_address JSONB, -- Adresse professionnelle
    business_description TEXT,
    website_url TEXT,
    social_media JSONB DEFAULT '{}', -- Réseaux sociaux
    business_hours JSONB DEFAULT '{}', -- Horaires d'ouverture
    specialties TEXT[], -- Spécialités (coiffure, esthétique, etc.)
    certifications JSONB DEFAULT '[]', -- Certifications et diplômes
    insurance_info JSONB, -- Informations d'assurance
    bank_account JSONB, -- Informations bancaires pour paiements
    subscription_plan TEXT DEFAULT 'basic', -- Plan d'abonnement
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended')),
    is_verified BOOLEAN DEFAULT false, -- Vérification du compte professionnel
    verification_documents JSONB DEFAULT '[]', -- Documents de vérification
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: establishments (salons/instituts des professionnels)
-- =====================================================
CREATE TABLE IF NOT EXISTS establishments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
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
    
    -- Services et tarifs
    price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    -- Statut
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: staff_members (employés des établissements)
-- =====================================================
CREATE TABLE IF NOT EXISTS staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email TEXT UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    specialties TEXT[], -- Spécialités de l'employé
    bio TEXT,
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    working_hours JSONB DEFAULT '{}', -- Horaires de travail spécifiques
    commission_rate DECIMAL(5,2), -- Taux de commission
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: services (services offerts par les établissements)
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'coupe', 'coloration', 'soin', etc.
    duration INTEGER NOT NULL, -- Durée en minutes
    price DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2), -- Commission pour l'employé
    is_active BOOLEAN DEFAULT true,
    requires_deposit BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10,2) DEFAULT 0.00,
    cancellation_policy JSONB, -- Politique d'annulation
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: appointments (rendez-vous)
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    
    -- Date et heure
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INTEGER NOT NULL, -- Durée en minutes
    
    -- Statut
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    
    -- Prix et paiement
    total_price DECIMAL(10,2) NOT NULL,
    deposit_paid DECIMAL(10,2) DEFAULT 0.00,
    
    -- Notes
    client_notes TEXT,
    professional_notes TEXT,
    
    -- Notifications
    reminder_sent BOOLEAN DEFAULT false,
    review_requested BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: reviews (avis des clients)
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    service_review JSONB, -- Avis détaillés par service
    staff_review JSONB, -- Avis sur le personnel
    response TEXT, -- Réponse du professionnel
    is_verified BOOLEAN DEFAULT false, -- Avis vérifié (client ayant vraiment pris RDV)
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(client_id, appointment_id) -- Un seul avis par rendez-vous
);

-- =====================================================
-- TABLE: favorites (salons favoris des clients)
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(client_id, establishment_id)
);

-- =====================================================
-- TABLE: notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'appointment_reminder', 'review_request', 'promotion', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Données additionnelles
    is_read BOOLEAN DEFAULT false,
    sent_via JSONB DEFAULT '{}', -- Canaux d'envoi (email, sms, push)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES pour optimiser les performances
-- =====================================================

-- Index pour la table users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Index pour la table clients
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_loyalty_points ON clients(loyalty_points);

-- Index pour la table professionals
CREATE INDEX IF NOT EXISTS idx_professionals_business_name ON professionals(business_name);
CREATE INDEX IF NOT EXISTS idx_professionals_siret ON professionals(siret);
CREATE INDEX IF NOT EXISTS idx_professionals_verified ON professionals(is_verified);

-- Index pour la table establishments
CREATE INDEX IF NOT EXISTS idx_establishments_professional_id ON establishments(professional_id);
CREATE INDEX IF NOT EXISTS idx_establishments_category ON establishments(category);
CREATE INDEX IF NOT EXISTS idx_establishments_city ON establishments(city);
CREATE INDEX IF NOT EXISTS idx_establishments_active ON establishments(is_active);
CREATE INDEX IF NOT EXISTS idx_establishments_rating ON establishments(average_rating);

-- Index pour la table appointments
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_establishment_id ON appointments(establishment_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Index pour la table reviews
CREATE INDEX IF NOT EXISTS idx_reviews_establishment_id ON reviews(establishment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);

-- =====================================================
-- TRIGGERS pour mettre à jour les timestamps
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux tables pertinentes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_establishments_updated_at BEFORE UPDATE ON establishments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VUES pour simplifier les requêtes
-- =====================================================

-- Vue complète des clients avec informations utilisateur
CREATE OR REPLACE VIEW client_details AS
SELECT 
    u.*,
    c.first_name,
    c.last_name,
    c.full_name,
    c.phone,
    c.date_of_birth,
    c.gender,
    c.avatar_url,
    c.preferences,
    c.addresses,
    c.payment_methods,
    c.loyalty_points,
    c.total_spent
FROM users u
LEFT JOIN clients c ON u.id = c.id
WHERE u.role = 'client';

-- Vue complète des professionnels avec informations utilisateur
CREATE OR REPLACE VIEW professional_details AS
SELECT 
    u.*,
    p.business_name,
    p.contact_first_name,
    p.contact_last_name,
    p.contact_full_name,
    p.phone,
    p.business_email,
    p.avatar_url,
    p.siret,
    p.business_address,
    p.business_description,
    p.website_url,
    p.social_media,
    p.business_hours,
    p.specialties,
    p.certifications,
    p.insurance_info,
    p.bank_account,
    p.subscription_plan,
    p.subscription_status,
    p.is_verified
FROM users u
LEFT JOIN professionals p ON u.id = p.id
WHERE u.role = 'professional';

-- =====================================================
-- COMMENTAIRES pour documenter la structure
-- =====================================================

COMMENT ON TABLE users IS 'Table principale des utilisateurs avec rôle';
COMMENT ON TABLE clients IS 'Informations spécifiques aux clients';
COMMENT ON TABLE professionals IS 'Informations spécifiques aux professionnels';
COMMENT ON TABLE establishments IS 'Salons et instituts des professionnels';
COMMENT ON TABLE staff_members IS 'Employés des établissements';
COMMENT ON TABLE services IS 'Services offerts par les établissements';
COMMENT ON TABLE appointments IS 'Rendez-vous entre clients et établissements';
COMMENT ON TABLE reviews IS 'Avis des clients sur les établissements';
COMMENT ON TABLE favorites IS 'Salons favoris des clients';
COMMENT ON TABLE notifications IS 'Notifications système pour les utilisateurs';

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
