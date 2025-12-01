-- SCRIPT DE VÉRIFICATION DES STRUCTURES DE TABLES
-- Pour voir exactement quelles colonnes existent

DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION STRUCTURES DES TABLES ===';
END $$;

-- 1. Structure de la table professionals
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '1. STRUCTURE DE professionals...';
END $$;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'professionals' 
ORDER BY ordinal_position;

-- 2. Structure de la table users
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '2. STRUCTURE DE users...';
END $$;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 3. Structure de la table profiles
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '3. STRUCTURE DE profiles...';
END $$;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Voir les données dans professionals
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '4. DONNÉES DANS professionals...';
END $$;

DO $$
BEGIN
    BEGIN
        -- Essayer de voir toutes les colonnes
        EXECUTE 'SELECT * FROM professionals LIMIT 5';
        RAISE NOTICE 'Données dans professionals disponibles';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lecture professionals: %', SQLERRM;
        
        -- Essayer avec juste l'ID
        BEGIN
            EXECUTE 'SELECT id FROM professionals LIMIT 5';
            RAISE NOTICE 'Seulement l''ID est disponible dans professionals';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erreur même avec l''ID: %', SQLERRM;
        END;
    END;
END $$;
