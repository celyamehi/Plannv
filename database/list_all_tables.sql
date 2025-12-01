-- SCRIPT POUR LISTER TOUTES LES TABLES
-- Exécute ce script et donne-moi le résultat

DO $$
BEGIN
    RAISE NOTICE '=== LISTE DE TOUTES LES TABLES ===';
END $$;

-- Lister toutes les tables publiques
SELECT 
    schemaname as "schema",
    tablename as "table_name",
    CASE 
        WHEN schemaname = 'public' THEN '📋 TABLE PUBLIQUE'
        WHEN schemaname = 'auth' THEN '🔐 TABLE AUTH'
        ELSE '📁 AUTRE'
    END as "type"
FROM pg_tables 
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename;

-- Compter les enregistrements dans chaque table publique
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== NOMBRE D''ENREGISTREMENTS PAR TABLE ===';
END $$;

DO $$
DECLARE
    r RECORD;
    count_result INTEGER;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM %I', r.tablename) INTO count_result;
            RAISE NOTICE '% : % enregistrements', r.tablename, count_result;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '% : ERREUR - %', r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;
