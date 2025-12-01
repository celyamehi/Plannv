-- ============================================================================
-- SCRIPT DE RÉINITIALISATION COMPLÈTE ET RECONSTRUCTION
-- ⚠️ ATTENTION : Ce script supprime TOUTES les données et reconstruit la base
-- ============================================================================

-- ÉTAPE 1 : DÉSACTIVER LES CONTRAINTES
SET session_replication_role = replica;

DO $$
BEGIN
    RAISE NOTICE '=== ÉTAPE 1 : SUPPRESSION DE TOUTES LES TABLES ===';
END $$;

-- Supprimer toutes les tables publiques (sauf auth.users qui est géré par Supabase)
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

-- Supprimer les types ENUM s'ils existent
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

DO $$
BEGIN
    RAISE NOTICE '✅ Toutes les tables ont été supprimées';
END $$;

-- ÉTAPE 2 : CRÉER LES TYPES ENUM
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ÉTAPE 2 : CRÉATION DES TYPES ===';
END $$;

-- Type pour le statut des rendez-vous
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

DO $$
BEGIN
    RAISE NOTICE '✅ Types ENUM créés';
END $$;

-- ÉTAPE 3 : CRÉER LA TABLE PROFILES (UNIFIÉE)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ÉTAPE 3 : CRÉATION DE LA TABLE PROFILES ===';
END $$;

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

-- Index pour recherche rapide
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_user_type ON profiles(user_type);

DO $$
BEGIN
    RAISE NOTICE '✅ Table profiles créée';
END $$;

-- ÉTAPE 4 : CRÉER LA TABLE ESTABLISHMENTS
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ÉTAPE 4 : CRÉATION DE LA TABLE ESTABLISHMENTS ===';
END $$;

CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'France',
    phone TEXT,
    email TEXT,
    website TEXT,
    opening_hours TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Index pour recherche rapide
CREATE INDEX idx_establishments_owner ON establishments(owner_id);
CREATE INDEX idx_establishments_city ON establishments(city);
CREATE INDEX idx_establishments_active ON establishments(is_active);

DO $$
BEGIN
    RAISE NOTICE '✅ Table establishments créée';
END $$;

-- ÉTAPE 5 : CRÉER LA TABLE SERVICES
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ÉTAPE 5 : CRÉATION DE LA TABLE SERVICES ===';
END $$;

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- en minutes
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_services_establishment ON services(establishment_id);
CREATE INDEX idx_services_active ON services(is_active);

DO $$
BEGIN
    RAISE NOTICE '✅ Table services créée';
END $$;

-- ÉTAPE 6 : CRÉER LA TABLE STAFF_MEMBERS
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ÉTAPE 6 : CRÉATION DE LA TABLE STAFF_MEMBERS ===';
END $$;

CREATE TABLE staff_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    specialties TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_staff_establishment ON staff_members(establishment_id);
CREATE INDEX idx_staff_active ON staff_members(is_active);

DO $$
BEGIN
    RAISE NOTICE '✅ Table staff_members créée';
END $$;

-- ÉTAPE 7 : CRÉER LA TABLE APPOINTMENTS
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ÉTAPE 7 : CRÉATION DE LA TABLE APPOINTMENTS ===';
END $$;

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    appointment_date TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL, -- en minutes
    status appointment_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_establishment ON appointments(establishment_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

DO $$
BEGIN
    RAISE NOTICE '✅ Table appointments créée';
END $$;

-- ÉTAPE 8 : CRÉER LA TABLE REVIEWS
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ÉTAPE 8 : CRÉATION DE LA TABLE REVIEWS ===';
END $$;

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_reviews_establishment ON reviews(establishment_id);
CREATE INDEX idx_reviews_client ON reviews(client_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

DO $$
BEGIN
    RAISE NOTICE '✅ Table reviews créée';
END $$;

-- ÉTAPE 9 : CRÉER LA TABLE FAVORITES
DO $$
BEGIN
    RAISE NOTICE '';
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
END $$;

-- ÉTAPE 10 : CRÉER LES TRIGGERS
DO $$
BEGIN
    RAISE NOTICE '';
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
END $$;

-- ÉTAPE 11 : CRÉER LES POLITIQUES RLS (Row Level Security)
DO $$
BEGIN
    RAISE NOTICE '';
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
CREATE POLICY "Les utilisateurs peuvent voir tous les profils publics"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Politiques pour establishments
CREATE POLICY "Tout le monde peut voir les établissements actifs"
    ON establishments FOR SELECT
    USING (is_active = true);

CREATE POLICY "Les propriétaires peuvent modifier leurs établissements"
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
CREATE POLICY "Tout le monde peut voir les avis"
    ON reviews FOR SELECT
    USING (true);

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
END $$;

-- RÉACTIVER LES CONTRAINTES
SET session_replication_role = DEFAULT;

-- RÉSUMÉ FINAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ✅ RÉINITIALISATION TERMINÉE ! ===';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables créées:';
    RAISE NOTICE '  ✅ profiles (table unifiée client/pro)';
    RAISE NOTICE '  ✅ establishments';
    RAISE NOTICE '  ✅ services';
    RAISE NOTICE '  ✅ staff_members';
    RAISE NOTICE '  ✅ appointments';
    RAISE NOTICE '  ✅ reviews';
    RAISE NOTICE '  ✅ favorites';
    RAISE NOTICE '';
    RAISE NOTICE 'Logique de connexion:';
    RAISE NOTICE '  1. Inscription → Création dans auth.users + profiles';
    RAISE NOTICE '  2. Type client → Dashboard client direct';
    RAISE NOTICE '  3. Type pro → Configuration établissement → Dashboard pro';
    RAISE NOTICE '';
    RAISE NOTICE 'Prochaine étape: Créer des comptes de test';
END $$;
