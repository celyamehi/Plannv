-- SCRIPT DE MIGRATION ET CORRECTION DES COMPTES
-- Pour trouver et migrer le bon compte professionnel

DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION DES COMPTES PROFESSIONNELS ===';
END $$;

-- 1. Trouver le compte dans auth.users
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '1. COMPTE DANS auth.users...';
END $$;

SELECT 
    email,
    id as "auth_id",
    created_at,
    '🔑 COMPTE AUTH' as "statut"
FROM auth.users;

-- 2. Trouver les comptes dans professionals qui ne sont pas dans profiles
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '2. COMPTES PROFESSIONNELS ORPHELINS...';
END $$;

SELECT 
    p.email,
    p.id as "professional_id",
    p.full_name,
    p.created_at,
    CASE 
        WHEN pr.id IS NULL THEN '❌ MANQUE DANS profiles'
        ELSE '✅ DÉJÀ DANS profiles'
    END as "statut_profile"
FROM professionals p
LEFT JOIN profiles pr ON p.id = pr.id
WHERE pr.id IS NULL;

-- 3. Trouver les profiles qui n'ont pas de compte auth
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '3. PROFILES SANS COMPTE AUTH...';
END $$;

SELECT 
    pr.email,
    pr.id as "profile_id", 
    pr.user_type,
    pr.created_at,
    CASE 
        WHEN au.id IS NULL THEN '❌ PAS DE COMPTE AUTH'
        ELSE '✅ A UN COMPTE AUTH'
    END as "statut_auth"
FROM profiles pr
LEFT JOIN auth.users au ON pr.id = au.id
WHERE au.id IS NULL;

-- 4. Script pour migrer un compte spécifique
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== SCRIPT DE MIGRATION ===';
    RAISE NOTICE 'Pour migrer un compte de professionals vers profiles:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Trouver l''ID du compte dans professionals:';
    RAISE NOTICE 'SELECT id, email, full_name FROM professionals WHERE email = ''ton-email@email.com'';';
    RAISE NOTICE '';
    RAISE NOTICE '2. Insérer dans profiles avec le bon ID:';
    RAISE NOTICE 'INSERT INTO profiles (id, email, full_name, user_type)';
    RAISE NOTICE 'SELECT id, email, full_name, ''professional'' FROM professionals WHERE email = ''ton-email@email.com'';';
    RAISE NOTICE '';
    RAISE NOTICE '3. Vérifier la migration:';
    RAISE NOTICE 'SELECT * FROM profiles WHERE email = ''ton-email@email.com'';';
END $$;

-- 5. Créer un établissement si nécessaire
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CRÉATION ÉTABLISSEMENT ===';
    RAISE NOTICE 'Si le professionnel n''a pas d''établissement:';
    RAISE NOTICE '';
    RAISE NOTICE 'INSERT INTO establishments (id, owner_id, name, address, city, postal_code, country)';
    RAISE NOTICE 'VALUES (';
    RAISE NOTICE '  gen_random_uuid(),';
    RAISE NOTICE '  (SELECT id FROM profiles WHERE email = ''ton-email@email.com'' AND user_type = ''professional''),';
    RAISE NOTICE '  ''Nom de ton établissement'',';
    RAISE NOTICE '  ''Adresse complète'',';
    RAISE NOTICE '  ''Ville'',';
    RAISE NOTICE '  ''Code postal'',';
    RAISE NOTICE '  ''Pays''';
    RAISE NOTICE ');';
END $$;
