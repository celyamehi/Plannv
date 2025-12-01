-- ============================================================================
-- SCRIPT DE CRÉATION DE COMPTES DE TEST
-- Crée des comptes client et professionnel pour tester l'application
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== CRÉATION DE COMPTES DE TEST ===';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ IMPORTANT: Ces comptes doivent être créés via l''interface Supabase Auth';
    RAISE NOTICE 'ou via l''application (page /signup)';
    RAISE NOTICE '';
    RAISE NOTICE 'Ce script montre les données à insérer dans profiles APRÈS';
    RAISE NOTICE 'avoir créé les comptes dans auth.users';
END $$;

-- ============================================================================
-- MÉTHODE 1 : VIA L'APPLICATION (RECOMMANDÉ)
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== MÉTHODE 1 : VIA L''APPLICATION (RECOMMANDÉ) ===';
    RAISE NOTICE '';
    RAISE NOTICE '1. Va sur http://localhost:3000/signup';
    RAISE NOTICE '2. Crée un compte CLIENT avec:';
    RAISE NOTICE '   - Email: client@test.com';
    RAISE NOTICE '   - Mot de passe: test123456';
    RAISE NOTICE '   - Nom: Client Test';
    RAISE NOTICE '   - Type: Client';
    RAISE NOTICE '';
    RAISE NOTICE '3. Crée un compte PROFESSIONNEL avec:';
    RAISE NOTICE '   - Email: pro@test.com';
    RAISE NOTICE '   - Mot de passe: test123456';
    RAISE NOTICE '   - Nom: Pro Test';
    RAISE NOTICE '   - Type: Professionnel';
    RAISE NOTICE '';
    RAISE NOTICE '4. Pour le pro, configure l''établissement:';
    RAISE NOTICE '   - Nom: Salon Test';
    RAISE NOTICE '   - Adresse: 123 rue Test';
    RAISE NOTICE '   - Ville: Paris';
    RAISE NOTICE '   - Code postal: 75001';
END $$;

-- ============================================================================
-- MÉTHODE 2 : VIA SUPABASE DASHBOARD (MANUEL)
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== MÉTHODE 2 : VIA SUPABASE DASHBOARD ===';
    RAISE NOTICE '';
    RAISE NOTICE '1. Va dans Supabase Dashboard → Authentication → Users';
    RAISE NOTICE '2. Clique "Add user" → "Create new user"';
    RAISE NOTICE '3. Entre l''email et le mot de passe';
    RAISE NOTICE '4. Copie l''UUID généré';
    RAISE NOTICE '5. Exécute les INSERT ci-dessous avec cet UUID';
END $$;

-- Exemple d'INSERT pour un CLIENT (remplace l'UUID par celui généré)
-- INSERT INTO profiles (id, email, full_name, phone, user_type)
-- VALUES (
--   'UUID-DU-USER-CREE-DANS-AUTH',
--   'client@test.com',
--   'Client Test',
--   '0612345678',
--   'client'
-- );

-- Exemple d'INSERT pour un PROFESSIONNEL (remplace l'UUID par celui généré)
-- INSERT INTO profiles (id, email, full_name, phone, user_type)
-- VALUES (
--   'UUID-DU-USER-CREE-DANS-AUTH',
--   'pro@test.com',
--   'Pro Test',
--   '0698765432',
--   'professional'
-- );

-- Exemple d'INSERT pour un ÉTABLISSEMENT (remplace owner_id par l'UUID du pro)
-- INSERT INTO establishments (id, owner_id, name, address, city, postal_code, country)
-- VALUES (
--   gen_random_uuid(),
--   'UUID-DU-PRO',
--   'Salon Test',
--   '123 rue de Test',
--   'Paris',
--   '75001',
--   'France'
-- );

-- ============================================================================
-- VÉRIFICATION DES COMPTES CRÉÉS
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VÉRIFICATION DES COMPTES ===';
END $$;

-- Afficher tous les comptes dans auth.users
SELECT 
    'auth.users' as "source",
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Afficher tous les profils
SELECT 
    'profiles' as "source",
    id,
    email,
    full_name,
    user_type,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- Afficher les établissements
SELECT 
    'establishments' as "source",
    e.id,
    e.name,
    e.owner_id,
    p.email as "owner_email",
    p.full_name as "owner_name"
FROM establishments e
LEFT JOIN profiles p ON e.owner_id = p.id
ORDER BY e.created_at DESC;

-- ============================================================================
-- RÉSUMÉ
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== RÉSUMÉ ===';
    RAISE NOTICE '';
    RAISE NOTICE '✅ STRUCTURE PRÊTE:';
    RAISE NOTICE '  - Table profiles unifiée';
    RAISE NOTICE '  - user_type: client | professional | admin';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 FLUX DE CONNEXION:';
    RAISE NOTICE '  1. Inscription → auth.users + profiles créés';
    RAISE NOTICE '  2. Client → /dashboard';
    RAISE NOTICE '  3. Pro → /professional/setup → /professional/pro-dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '📝 PAGES MISES À JOUR:';
    RAISE NOTICE '  ✅ /signup (inscription unifiée)';
    RAISE NOTICE '  ✅ /professionals/login (login pro)';
    RAISE NOTICE '  ✅ /auth/callback (redirection)';
    RAISE NOTICE '  ✅ /professional/pro-dashboard';
    RAISE NOTICE '  ✅ /professional/settings';
    RAISE NOTICE '  ✅ /setup-profile';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÊT À TESTER !';
END $$;
