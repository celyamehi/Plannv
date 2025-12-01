-- =====================================================
-- VÉRIFICATION DE L'ÉTAT ACTUEL DE LA BASE DE DONNÉES
-- =====================================================

-- Vérifier les tables existantes
SELECT 'Tables existantes:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Vérifier les triggers existants
SELECT 'Triggers existants:' as info;
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Vérifier les RLS policies
SELECT 'Politiques RLS actives:' as info;
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vérifier les fonctions SQL
SELECT 'Fonctions SQL existantes:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Compter les enregistrements dans chaque table
SELECT 'Nombre d''enregistrements par table:' as info;

-- Pour chaque table existante, afficher le nombre d'enregistrements
DO $$
DECLARE
    table_record RECORD;
    table_count INTEGER;
BEGIN
    RAISE NOTICE '=== Nombre d''enregistrements par table ===';
    
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        BEGIN
            EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(table_record.table_name) INTO table_count;
            RAISE NOTICE '%: % enregistrements', table_record.table_name, table_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '%: Erreur de comptage (%)', table_record.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Afficher la liste des tables avec leur statut
SELECT 
    table_name,
    'Table créée' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
