-- =====================================================
-- CORRECTION DES POLITIQUES RLS POUR LA NOUVELLE STRUCTURE
-- Script pour permettre l'inscription des utilisateurs
-- =====================================================

-- ÉTAPE 1: Activer RLS sur toutes les tables (si pas déjà fait)
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS professionals ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 2: Supprimer les anciennes politiques qui bloquent l'inscription
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Clients can view their own profile" ON clients;
DROP POLICY IF EXISTS "Clients can update their own profile" ON clients;
DROP POLICY IF EXISTS "Professionals can view their own profile" ON professionals;
DROP POLICY IF EXISTS "Professionals can update their own profile" ON professionals;

-- ÉTAPE 3: Créer les nouvelles politiques RLS correctes

-- Politiques pour la table users
CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for own user" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for own user" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour la table clients
CREATE POLICY "Enable insert for authenticated clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for own client" ON clients
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for own client" ON clients
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour la table professionals
CREATE POLICY "Enable insert for authenticated professionals" ON professionals
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for own professional" ON professionals
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for own professional" ON professionals
    FOR UPDATE USING (auth.uid() = id);

-- ÉTAPE 4: Politiques pour les établissements (professionnels)
DROP POLICY IF EXISTS "Professionals can view their establishments" ON establishments;
DROP POLICY IF EXISTS "Professionals can manage their establishments" ON establishments;

CREATE POLICY "Professionals can view their establishments" ON establishments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM professionals 
            WHERE id = professional_id AND auth.uid() = id
        )
    );

CREATE POLICY "Professionals can manage their establishments" ON establishments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM professionals 
            WHERE id = professional_id AND auth.uid() = id
        )
    );

-- ÉTAPE 5: Permettre aux utilisateurs de voir leur propre rôle
-- Cette politique est cruciale pour l'inscription
CREATE POLICY "Users can insert their own profile during signup" ON users
    FOR INSERT WITH CHECK (
        auth.uid() = id OR 
        (auth.role() = 'anon' AND id IS NOT NULL) -- Permettre l'insertion lors de l'inscription
    );

-- ÉTAPE 6: Vérifier que les politiques sont bien créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('users', 'clients', 'professionals', 'establishments')
ORDER BY tablename, policyname;

-- ÉTAPE 7: Test rapide pour vérifier que l'insertion fonctionne
-- (Commenté car nécessite un UID réel)
-- INSERT INTO users (id, email, role) 
-- VALUES ('test-uuid', 'test@example.com', 'client')
-- ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
