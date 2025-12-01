-- SCRIPT DE RECHERCHE COMPLÈTE DU COMPTE PRO
-- Cherche le compte dans toutes les tables possibles

DO $$
BEGIN
    RAISE NOTICE '=== RECHERCHE COMPLÈTE DU COMPTE PRO ===';
END $$;

-- 1. Chercher dans auth.users (tous les emails)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '1. RECHERCHE DANS auth.users...';
END $$;

SELECT 
    email,
    id,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Chercher dans profiles (tous les emails)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '2. RECHERCHE DANS profiles...';
END $$;

SELECT 
    email,
    id,
    full_name,
    user_type,
    created_at
FROM profiles 
ORDER BY created_at DESC;

-- 3. Chercher les comptes qui existent dans auth.users mais pas dans profiles
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '3. COMPTES DANS auth.users MAIS PAS DANS profiles...';
END $$;

SELECT 
    u.email,
    u.id as "auth_id",
    u.created_at as "auth_created",
    '❌ MANQUE DANS profiles' as "statut"
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 4. Chercher les anciennes tables (au cas où)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '4. RECHERCHE DANS ANCIENNES TABLES...';
END $$;

-- Table professionals (si elle existe)
DO $$
BEGIN
    BEGIN
        SELECT 
            'professionals' as "table",
            email,
            id,
            created_at
        FROM professionals 
        ORDER BY created_at DESC;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Table professionals n''existe pas';
    END;
END $$;

-- Table users (si elle existe)
DO $$
BEGIN
    BEGIN
        SELECT 
            'users' as "table",
            email,
            id,
            role,
            created_at
        FROM users 
        ORDER BY created_at DESC;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Table users n''existe pas';
    END;
END $$;

-- 5. Statistiques globales
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '5. STATISTIQUES GLOBALES...';
END $$;

SELECT 
    'auth.users' as "table",
    COUNT(*) as "nombre_comptes"
FROM auth.users

UNION ALL

SELECT 
    'profiles' as "table",
    COUNT(*) as "nombre_comptes"
FROM profiles

UNION ALL

SELECT 
    'professionals' as "table",
    COUNT(*) as "nombre_comptes"
FROM professionals

UNION ALL

SELECT 
    'users' as "table",
    COUNT(*) as "nombre_comptes"
FROM users;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CONSEILS ===';
    RAISE NOTICE 'Si ton compte apparaît dans auth.users mais pas dans profiles:';
    RAISE NOTICE '1. Le compte existe dans Supabase auth';
    RAISE NOTICE '2. Mais le profil n''a pas été créé';
    RAISE NOTICE '3. Il faut créer le profil manuellement';
    RAISE NOTICE '';
    RAISE NOTICE 'Si le compte n''apparaît nulle part:';
    RAISE NOTICE '1. Le compte a été supprimé par le script de nettoyage';
    RAISE NOTICE '2. Il faut le recréer';
END $$;
