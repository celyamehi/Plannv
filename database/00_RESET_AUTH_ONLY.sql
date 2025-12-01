-- ============================================================================
-- SCRIPT DE NETTOYAGE AUTHENTIFICATION UNIQUEMENT
-- Supprime seulement les tables liées à la connexion (users, clients, professionals, profiles)
-- GARDE: establishments, services, staff_members, appointments, reviews, etc.
-- ============================================================================

-- ÉTAPE 1 : DÉSACTIVER LES CONTRAINTES
SET session_replication_role = replica;

DO $$
BEGIN
    RAISE NOTICE '=== NETTOYAGE DES TABLES D''AUTHENTIFICATION ===';
END $$;

-- Supprimer SEULEMENT les tables d'authentification
DROP TABLE IF EXISTS professionals CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DO $$
BEGIN
    RAISE NOTICE '✅ Tables d''authentification supprimées';
    RAISE NOTICE '   - professionals';
    RAISE NOTICE '   - clients';
    RAISE NOTICE '   - users';
    RAISE NOTICE '   - profiles';
    RAISE NOTICE '';
    RAISE NOTICE '✅ CONSERVÉES: establishments, services, staff_members, appointments, etc.';
    RAISE NOTICE '';
END $$;

-- ÉTAPE 2 : RECRÉER LA TABLE PROFILES UNIFIÉE
DO $$
BEGIN
    RAISE NOTICE '=== CRÉATION DE LA TABLE PROFILES UNIFIÉE ===';
END $$;

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    user_type TEXT CHECK (user_type IN ('client', 'professional', 'admin')) NOT NULL DEFAULT 'client',
    
    -- Champs optionnels clients
    date_of_birth DATE,
    gender TEXT,
    preferences JSONB,
    
    -- Champs optionnels professionnels
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
    RAISE NOTICE '✅ Table profiles créée (remplace users + clients + professionals)';
    RAISE NOTICE '';
END $$;

-- ÉTAPE 3 : METTRE À JOUR LA TABLE ESTABLISHMENTS
DO $$
BEGIN
    RAISE NOTICE '=== MISE À JOUR DE LA TABLE ESTABLISHMENTS ===';
END $$;

-- Supprimer l'ancienne colonne professional_id si elle existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'establishments' AND column_name = 'professional_id'
    ) THEN
        ALTER TABLE establishments DROP COLUMN IF EXISTS professional_id CASCADE;
        RAISE NOTICE '✅ Colonne professional_id supprimée';
    END IF;
END $$;

-- S'assurer que owner_id existe et pointe vers profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'establishments' AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE establishments ADD COLUMN owner_id UUID;
        RAISE NOTICE '✅ Colonne owner_id ajoutée';
    END IF;
END $$;

-- Ajouter la contrainte de clé étrangère vers profiles
DO $$
BEGIN
    BEGIN
        ALTER TABLE establishments 
        ADD CONSTRAINT fk_establishments_owner 
        FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Contrainte FK owner_id → profiles ajoutée';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE '⚠️ Contrainte FK existe déjà';
    END;
END $$;

DO $$
BEGIN
    RAISE NOTICE '';
END $$;

-- ÉTAPE 4 : METTRE À JOUR LES AUTRES TABLES
DO $$
BEGIN
    RAISE NOTICE '=== MISE À JOUR DES AUTRES TABLES ===';
END $$;

-- Appointments : S'assurer que client_id pointe vers profiles
DO $$
BEGIN
    BEGIN
        ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_client_id_fkey CASCADE;
        ALTER TABLE appointments 
        ADD CONSTRAINT fk_appointments_client 
        FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ appointments.client_id → profiles';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur appointments: %', SQLERRM;
    END;
END $$;

-- Reviews : S'assurer que client_id pointe vers profiles
DO $$
BEGIN
    BEGIN
        ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_client_id_fkey CASCADE;
        ALTER TABLE reviews 
        ADD CONSTRAINT fk_reviews_client 
        FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ reviews.client_id → profiles';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur reviews: %', SQLERRM;
    END;
END $$;

-- Favorites : S'assurer que client_id pointe vers profiles
DO $$
BEGIN
    BEGIN
        ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_client_id_fkey CASCADE;
        ALTER TABLE favorites 
        ADD CONSTRAINT fk_favorites_client 
        FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ favorites.client_id → profiles';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur favorites: %', SQLERRM;
    END;
END $$;

-- Notifications : S'assurer que user_id pointe vers profiles
DO $$
BEGIN
    BEGIN
        ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey CASCADE;
        ALTER TABLE notifications 
        ADD CONSTRAINT fk_notifications_user 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ notifications.user_id → profiles';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur notifications: %', SQLERRM;
    END;
END $$;

-- Transactions : S'assurer que client_id pointe vers profiles
DO $$
BEGIN
    BEGIN
        ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_client_id_fkey CASCADE;
        ALTER TABLE transactions 
        ADD CONSTRAINT fk_transactions_client 
        FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ transactions.client_id → profiles';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur transactions: %', SQLERRM;
    END;
END $$;

-- Waiting_list : S'assurer que client_id pointe vers profiles
DO $$
BEGIN
    BEGIN
        ALTER TABLE waiting_list DROP CONSTRAINT IF EXISTS waiting_list_client_id_fkey CASCADE;
        ALTER TABLE waiting_list 
        ADD CONSTRAINT fk_waiting_list_client 
        FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ waiting_list.client_id → profiles';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur waiting_list: %', SQLERRM;
    END;
END $$;

DO $$
BEGIN
    RAISE NOTICE '';
END $$;

-- ÉTAPE 5 : CRÉER LES TRIGGERS
DO $$
BEGIN
    RAISE NOTICE '=== CRÉATION DES TRIGGERS ===';
END $$;

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger à profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
    RAISE NOTICE '✅ Trigger profiles créé';
    RAISE NOTICE '';
END $$;

-- ÉTAPE 6 : CRÉER LES POLITIQUES RLS
DO $$
BEGIN
    RAISE NOTICE '=== ACTIVATION RLS SUR PROFILES ===';
END $$;

-- Activer RLS sur profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Tout le monde peut voir les profils publics" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent insérer leur propre profil" ON profiles;

-- Politiques pour profiles
CREATE POLICY "Tout le monde peut voir les profils publics"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent insérer leur propre profil"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DO $$
BEGIN
    RAISE NOTICE '✅ Politiques RLS créées sur profiles';
    RAISE NOTICE '';
END $$;

-- RÉACTIVER LES CONTRAINTES
SET session_replication_role = DEFAULT;

-- RÉSUMÉ FINAL
DO $$
BEGIN
    RAISE NOTICE '=== ✅ NETTOYAGE TERMINÉ ! ===';
    RAISE NOTICE '';
    RAISE NOTICE '❌ SUPPRIMÉ:';
    RAISE NOTICE '  - users';
    RAISE NOTICE '  - clients';
    RAISE NOTICE '  - professionals';
    RAISE NOTICE '  - ancienne table profiles';
    RAISE NOTICE '';
    RAISE NOTICE '✅ CRÉÉ:';
    RAISE NOTICE '  - profiles (table unifiée)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ CONSERVÉ:';
    RAISE NOTICE '  - establishments';
    RAISE NOTICE '  - services';
    RAISE NOTICE '  - staff_members';
    RAISE NOTICE '  - appointments';
    RAISE NOTICE '  - reviews';
    RAISE NOTICE '  - favorites';
    RAISE NOTICE '  - notifications';
    RAISE NOTICE '  - transactions';
    RAISE NOTICE '  - waiting_list';
    RAISE NOTICE '  - availability_slots';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 LIENS RECRÉÉS:';
    RAISE NOTICE '  - establishments.owner_id → profiles';
    RAISE NOTICE '  - appointments.client_id → profiles';
    RAISE NOTICE '  - reviews.client_id → profiles';
    RAISE NOTICE '  - favorites.client_id → profiles';
    RAISE NOTICE '  - notifications.user_id → profiles';
    RAISE NOTICE '  - transactions.client_id → profiles';
    RAISE NOTICE '  - waiting_list.client_id → profiles';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 LOGIQUE:';
    RAISE NOTICE '  1. Inscription → auth.users + profiles';
    RAISE NOTICE '  2. user_type = "client" → Dashboard client';
    RAISE NOTICE '  3. user_type = "professional" → Setup établissement → Dashboard pro';
    RAISE NOTICE '';
    RAISE NOTICE '📝 PROCHAINE ÉTAPE: Créer des comptes de test';
END $$;
