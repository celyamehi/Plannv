-- ============================================================================
-- SCRIPT DE RÉINITIALISATION COMPLÈTE - ADAPTÉ À TA BASE
-- ⚠️ ATTENTION : Ce script supprime TOUTES les données et reconstruit proprement
-- ============================================================================

-- ÉTAPE 1 : DÉSACTIVER LES CONTRAINTES
SET session_replication_role = replica;

DO $$
BEGIN
    RAISE NOTICE '=== ÉTAPE 1 : SUPPRESSION DE TOUTES LES TABLES ===';
END $$;

-- Supprimer toutes les tables dans le bon ordre (dépendances)
DROP TABLE IF EXISTS waiting_list CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS staff_members CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS establishments CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- NE PAS supprimer spatial_ref_sys (table système PostGIS)

-- Supprimer les types ENUM s'ils existent
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;

DO $$
BEGIN
    RAISE NOTICE '✅ Toutes les tables ont été supprimées';
    RAISE NOTICE '';
END $$;

-- ÉTAPE 2 : CRÉER LES TYPES ENUM
DO $$
BEGIN
    RAISE NOTICE '=== ÉTAPE 2 : CRÉATION DES TYPES ===';
END $$;

-- Type pour le statut des rendez-vous
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

-- Type pour les transactions
CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'deposit');

-- Type pour les méthodes de paiement
CREATE TYPE payment_method AS ENUM ('card', 'cash', 'transfer', 'other');

DO $$
BEGIN
    RAISE NOTICE '✅ Types ENUM créés';
    RAISE NOTICE '';
END $$;

-- ÉTAPE 3 : CRÉER LA TABLE PROFILES (UNIFIÉE - REMPLACE users, clients, professionals)
DO $$
BEGIN
    RAISE NOTICE '=== ÉTAPE 3 : CRÉATION DE LA TABLE PROFILES (UNIFIÉE) ===';
END $$;

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    user_type TEXT CHECK (user_type IN ('client', 'professional', 'admin')) NOT NULL DEFAULT 'client',
    
    -- Champs spécifiques clients (optionnels)
    date_of_birth DATE,
    gender TEXT,
    preferences JSONB,
    
    -- Champs spécifiques professionnels (optionnels)
    business_name TEXT,
    siret TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_phone ON profiles(phone);

DO $$
BEGIN
    RAISE NOTICE '✅ Table profiles créée (remplace users, clients, professionals)';
    RAISE NOTICE '';
END $$;

-- ÉTAPE 4 : CRÉER LA TABLE ESTABLISHMENTS
DO $$
BEGIN
    RAISE NOTICE '=== ÉTAPE 4 : CRÉATION DE LA TABLE ESTABLISHMENTS ===';
END $$;

CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Informations de base
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    category TEXT,
    
    -- Adresse
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'France',
    
    -- Contact
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Images
    logo_url TEXT,
    cover_image_url TEXT,
    images TEXT[],
    
    -- Horaires et configuration
    opening_hours JSONB,
    is_active BOOLEAN DEFAULT true,
    accepts_online_booking BOOLEAN DEFAULT true,
    requires_deposit BOOLEAN DEFAULT false,
    
    -- Statistiques
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_establishments_owner ON establishments(owner_id);
CREATE INDEX idx_establishments_city ON establishments(city);
CREATE INDEX idx_establishments_active ON establishments(is_active);
CREATE INDEX idx_establishments_slug ON establishments(slug);
CREATE INDEX idx_establishments_category ON establishments(category);

DO $$
BEGIN
    RAISE NOTICE '✅ Table establishments créée';
    RAISE NOTICE '';
END $$;

-- ÉTAPE 5 : CRÉER LA TABLE SERVICES
DO $$
BEGIN
    RAISE NOTICE '=== ÉTAPE 5 : CRÉATION DE LA TABLE SERVICES ===';
END $$;

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    duration INTEGER NOT NULL, -- en minutes
    price DECIMAL(10,2) NOT NULL,
    
    is_active BOOLEAN DEFAULT true,
    online_booking_enabled BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_services_establishment ON services(establishment_id);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_category ON services(category);

DO $$
BEGIN
    RAISE NOTICE '✅ Table services créée';
    RAISE NOTICE '';
END $$;

-- ÉTAPE 6 : CRÉER LA TABLE STAFF_MEMBERS
DO $$
BEGIN
    RAISE NOTICE '=== ÉTAPE 6 : CRÉATION DE LA TABLE STAFF_MEMBERS ===';
END $$;

CREATE TABLE staff_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    
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
    
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_staff_establishment ON staff_members(establishment_id);
CREATE INDEX idx_staff_active ON staff_members(is_active);
CREATE INDEX idx_staff_email ON staff_members(email);

DO $$
BEGIN
    RAISE NOTICE '✅ Table staff_members créée';
    RAISE NOTICE '';
END $$;

-- ÉTAPE 7 : CRÉER LA TABLE APPOINTMENTS
DO $$
BEGIN
    RAISE NOTICE '=== ÉTAPE 7 : CRÉATION DE LA TABLE APPOINTMENTS ===';
END $$;

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relations
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    
    -- Date et heure
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Statut et paiement
    status appointment_status DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    deposit_paid DECIMAL(10,2) DEFAULT 0,
    
    -- Notes
    client_notes TEXT,
    staff_notes TEXT,
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_establishment ON appointments(establishment_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_staff ON appointments(staff_member_id);

DO $$
BEGIN
    RAISE NOTICE '✅ Table appointments créée';
    RAISE NOTICE '';
END $$;

-- ÉTAPE 8 : CRÉER LA TABLE REVIEWS
DO $$
BEGIN
    RAISE NOTICE '=== ÉTAPE 8 : CRÉATION DE LA TABLE REVIEWS ===';
END $$;

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    is_verified BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    
    owner_response TEXT,
    owner_response_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_reviews_establishment ON reviews(establishment_id);
CREATE INDEX idx_reviews_client ON reviews(client_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_visible ON reviews(is_visible);

DO $$
BEGIN
    RAISE NOTICE '✅ Table reviews créée';
    RAISE NOTICE '';
END $$;

-- ÉTAPE 9 : CRÉER LA TABLE FAVORITES
DO $$
BEGIN
    RAISE NOTICE '=== ÉTAPE 9 : CRÉATION DE LA TABLE FAVORITES ===';
END $$;

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, establishment_id)
);

-- Index pour recherche rapide
CREATE INDEX idx_favorites_client ON favorites(client_id);
CREATE INDEX idx_favorites_establishment ON favorites(establishment_id);

DO $$
BEGIN
    RAISE NOTICE '✅ Table favorites créée';
    RAISE NOTICE '';
END $$;

-- ÉTAPE 10 : CRÉER LES TRIGGERS
DO $$
BEGIN
    RAISE NOTICE '=== ÉTAPE 10 : CRÉATION DES TRIGGERS ===';
END $$;

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger à toutes les tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_establishments_updated_at BEFORE UPDATE ON establishments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
    RAISE NOTICE '✅ Triggers créés';
    RAISE NOTICE '';
END $$;

-- ÉTAPE 11 : CRÉER LES POLITIQUES RLS
DO $$
BEGIN
    RAISE NOTICE '=== ÉTAPE 11 : ACTIVATION RLS ===';
END $$;

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Tout le monde peut voir les profils publics"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Politiques pour establishments
CREATE POLICY "Tout le monde peut voir les établissements actifs"
    ON establishments FOR SELECT
    USING (is_active = true);

CREATE POLICY "Les propriétaires peuvent gérer leurs établissements"
    ON establishments FOR ALL
    USING (auth.uid() = owner_id);

-- Politiques pour services
CREATE POLICY "Tout le monde peut voir les services actifs"
    ON services FOR SELECT
    USING (is_active = true);

CREATE POLICY "Les propriétaires peuvent gérer les services"
    ON services FOR ALL
    USING (establishment_id IN (
        SELECT id FROM establishments WHERE owner_id = auth.uid()
    ));

-- Politiques pour appointments
CREATE POLICY "Les clients voient leurs rendez-vous"
    ON appointments FOR SELECT
    USING (client_id = auth.uid());

CREATE POLICY "Les pros voient les rendez-vous de leurs établissements"
    ON appointments FOR SELECT
    USING (establishment_id IN (
        SELECT id FROM establishments WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Les clients peuvent créer des rendez-vous"
    ON appointments FOR INSERT
    WITH CHECK (client_id = auth.uid());

CREATE POLICY "Les clients peuvent modifier leurs rendez-vous"
    ON appointments FOR UPDATE
    USING (client_id = auth.uid());

-- Politiques pour reviews
CREATE POLICY "Tout le monde peut voir les avis visibles"
    ON reviews FOR SELECT
    USING (is_visible = true);

CREATE POLICY "Les clients peuvent créer des avis"
    ON reviews FOR INSERT
    WITH CHECK (client_id = auth.uid());

-- Politiques pour favorites
CREATE POLICY "Les clients voient leurs favoris"
    ON favorites FOR SELECT
    USING (client_id = auth.uid());

CREATE POLICY "Les clients peuvent gérer leurs favoris"
    ON favorites FOR ALL
    USING (client_id = auth.uid());

DO $$
BEGIN
    RAISE NOTICE '✅ Politiques RLS créées';
    RAISE NOTICE '';
END $$;

-- RÉACTIVER LES CONTRAINTES
SET session_replication_role = DEFAULT;

-- RÉSUMÉ FINAL
DO $$
BEGIN
    RAISE NOTICE '=== ✅ RÉINITIALISATION TERMINÉE ! ===';
    RAISE NOTICE '';
    RAISE NOTICE '📋 STRUCTURE SIMPLIFIÉE:';
    RAISE NOTICE '  ✅ profiles (REMPLACE users + clients + professionals)';
    RAISE NOTICE '  ✅ establishments';
    RAISE NOTICE '  ✅ services';
    RAISE NOTICE '  ✅ staff_members';
    RAISE NOTICE '  ✅ appointments';
    RAISE NOTICE '  ✅ reviews';
    RAISE NOTICE '  ✅ favorites';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 LOGIQUE DE CONNEXION UNIFIÉE:';
    RAISE NOTICE '  1. Inscription → auth.users + profiles créés';
    RAISE NOTICE '  2. user_type = "client" → Dashboard client';
    RAISE NOTICE '  3. user_type = "professional" → Setup établissement → Dashboard pro';
    RAISE NOTICE '';
    RAISE NOTICE '📝 PROCHAINES ÉTAPES:';
    RAISE NOTICE '  1. Créer des comptes de test';
    RAISE NOTICE '  2. Tester la connexion client';
    RAISE NOTICE '  3. Tester la connexion pro';
END $$;
