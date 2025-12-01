-- ============================================================================
-- SCRIPT DE NETTOYAGE AUTHENTIFICATION - VERSION SÉCURISÉE
-- Nettoie les données orphelines AVANT de recréer les contraintes
-- ============================================================================

-- ÉTAPE 1 : DÉSACTIVER LES CONTRAINTES
SET session_replication_role = replica;

DO $$
BEGIN
    RAISE NOTICE '=== NETTOYAGE DES TABLES D''AUTHENTIFICATION ===';
END $$;

-- ÉTAPE 1.5 : SUPPRIMER LES ANCIENNES CONTRAINTES
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== SUPPRESSION DES ANCIENNES CONTRAINTES ===';
END $$;

ALTER TABLE IF EXISTS establishments DROP CONSTRAINT IF EXISTS fk_establishments_owner CASCADE;
ALTER TABLE IF EXISTS establishments DROP CONSTRAINT IF EXISTS establishments_owner_id_fkey CASCADE;
ALTER TABLE IF EXISTS establishments DROP CONSTRAINT IF EXISTS establishments_professional_id_fkey CASCADE;
ALTER TABLE IF EXISTS appointments DROP CONSTRAINT IF EXISTS appointments_client_id_fkey CASCADE;
ALTER TABLE IF EXISTS appointments DROP CONSTRAINT IF EXISTS fk_appointments_client CASCADE;
ALTER TABLE IF EXISTS reviews DROP CONSTRAINT IF EXISTS reviews_client_id_fkey CASCADE;
ALTER TABLE IF EXISTS reviews DROP CONSTRAINT IF EXISTS fk_reviews_client CASCADE;
ALTER TABLE IF EXISTS favorites DROP CONSTRAINT IF EXISTS favorites_client_id_fkey CASCADE;
ALTER TABLE IF EXISTS favorites DROP CONSTRAINT IF EXISTS fk_favorites_client CASCADE;
ALTER TABLE IF EXISTS notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey CASCADE;
ALTER TABLE IF EXISTS notifications DROP CONSTRAINT IF EXISTS fk_notifications_user CASCADE;
ALTER TABLE IF EXISTS transactions DROP CONSTRAINT IF EXISTS transactions_client_id_fkey CASCADE;
ALTER TABLE IF EXISTS transactions DROP CONSTRAINT IF EXISTS fk_transactions_client CASCADE;
ALTER TABLE IF EXISTS waiting_list DROP CONSTRAINT IF EXISTS waiting_list_client_id_fkey CASCADE;
ALTER TABLE IF EXISTS waiting_list DROP CONSTRAINT IF EXISTS fk_waiting_list_client CASCADE;

DO $$
BEGIN
    RAISE NOTICE '✅ Anciennes contraintes supprimées';
    RAISE NOTICE '';
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
    RAISE NOTICE '✅ Table profiles créée';
    RAISE NOTICE '';
END $$;

-- ÉTAPE 3 : NETTOYER LES DONNÉES ORPHELINES
DO $$
BEGIN
    RAISE NOTICE '=== NETTOYAGE DES DONNÉES ORPHELINES ===';
END $$;

-- Nettoyer establishments sans owner valide
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Supprimer les établissements avec owner_id NULL ou invalide
    DELETE FROM establishments WHERE owner_id IS NULL;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ % établissements avec owner_id NULL supprimés', deleted_count;
    
    -- Mettre owner_id à NULL pour ceux qui n'ont pas de correspondance
    -- (on les réattribuera manuellement plus tard si besoin)
    UPDATE establishments SET owner_id = NULL 
    WHERE owner_id IS NOT NULL 
    AND owner_id NOT IN (SELECT id FROM auth.users);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '⚠️ % établissements avec owner_id invalide mis à NULL', deleted_count;
END $$;

-- Nettoyer appointments sans client valide
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM appointments 
    WHERE client_id IS NOT NULL 
    AND client_id NOT IN (SELECT id FROM auth.users);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ % rendez-vous orphelins supprimés', deleted_count;
END $$;

-- Nettoyer reviews sans client valide
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM reviews 
    WHERE client_id IS NOT NULL 
    AND client_id NOT IN (SELECT id FROM auth.users);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ % avis orphelins supprimés', deleted_count;
END $$;

-- Nettoyer favorites sans client valide
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM favorites 
    WHERE client_id IS NOT NULL 
    AND client_id NOT IN (SELECT id FROM auth.users);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ % favoris orphelins supprimés', deleted_count;
END $$;

-- Nettoyer notifications sans user valide
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications 
    WHERE user_id IS NOT NULL 
    AND user_id NOT IN (SELECT id FROM auth.users);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ % notifications orphelines supprimées', deleted_count;
END $$;

-- Nettoyer transactions sans client valide
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM transactions 
    WHERE client_id IS NOT NULL 
    AND client_id NOT IN (SELECT id FROM auth.users);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ % transactions orphelines supprimées', deleted_count;
END $$;

-- Nettoyer waiting_list sans client valide
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM waiting_list 
    WHERE client_id IS NOT NULL 
    AND client_id NOT IN (SELECT id FROM auth.users);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ % entrées waiting_list orphelines supprimées', deleted_count;
END $$;

DO $$
BEGIN
    RAISE NOTICE '';
END $$;

-- ÉTAPE 4 : METTRE À JOUR LA TABLE ESTABLISHMENTS
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
        ALTER TABLE establishments DROP COLUMN professional_id CASCADE;
        RAISE NOTICE '✅ Colonne professional_id supprimée';
    END IF;
END $$;

-- S'assurer que owner_id existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'establishments' AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE establishments ADD COLUMN owner_id UUID;
        RAISE NOTICE '✅ Colonne owner_id ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne owner_id existe déjà';
    END IF;
END $$;

-- Rendre owner_id nullable temporairement (pour les établissements existants)
ALTER TABLE establishments ALTER COLUMN owner_id DROP NOT NULL;

DO $$
BEGIN
    RAISE NOTICE '✅ owner_id rendu nullable (temporaire)';
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
    RAISE NOTICE '  - users, clients, professionals, profiles (anciennes)';
    RAISE NOTICE '  - Données orphelines (sans auth.users valide)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ CRÉÉ:';
    RAISE NOTICE '  - profiles (table unifiée)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ CONSERVÉ:';
    RAISE NOTICE '  - establishments (owner_id nullable temporairement)';
    RAISE NOTICE '  - services, staff_members, appointments';
    RAISE NOTICE '  - reviews, favorites, notifications';
    RAISE NOTICE '  - transactions, waiting_list, availability_slots';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ IMPORTANT:';
    RAISE NOTICE '  - Les établissements sans owner valide ont owner_id = NULL';
    RAISE NOTICE '  - Tu devras créer des comptes et les réattribuer';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 LOGIQUE:';
    RAISE NOTICE '  1. Inscription → auth.users + profiles';
    RAISE NOTICE '  2. user_type = "client" → Dashboard client';
    RAISE NOTICE '  3. user_type = "professional" → Setup établissement → Dashboard pro';
    RAISE NOTICE '';
    RAISE NOTICE '📝 PROCHAINE ÉTAPE: Créer des comptes de test';
END $$;
