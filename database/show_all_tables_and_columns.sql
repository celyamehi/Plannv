-- SCRIPT POUR LISTER TOUTES LES TABLES ET LEURS COLONNES
-- Affiche la structure complète de la base de données

DO $$
BEGIN
    RAISE NOTICE '=== STRUCTURE COMPLÈTE DE LA BASE DE DONNÉES ===';
END $$;

-- Pour chaque table, afficher ses colonnes
DO $$
DECLARE
    table_rec RECORD;
    col_rec RECORD;
    count_result INTEGER;
BEGIN
    FOR table_rec IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'TABLE: %', table_rec.tablename;
        RAISE NOTICE '========================================';
        
        -- Afficher les colonnes de cette table
        FOR col_rec IN 
            SELECT 
                column_name,
                data_type,
                character_maximum_length,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' 
            AND table_name = table_rec.tablename
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - % : % % %',
                col_rec.column_name,
                col_rec.data_type,
                CASE WHEN col_rec.is_nullable = 'NO' THEN 'NOT NULL' ELSE 'NULL' END,
                COALESCE('DEFAULT ' || col_rec.column_default, '');
        END LOOP;
        
        -- Compter les enregistrements
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM %I', table_rec.tablename) INTO count_result;
            RAISE NOTICE '  → % enregistrements', count_result;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '  → Erreur comptage: %', SQLERRM;
        END;
    END LOOP;
END $$;

-- Afficher aussi un résumé sous forme de tableau
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== RÉSUMÉ DES TABLES ===';
END $$;

SELECT 
    t.tablename as "Table",
    COUNT(c.column_name) as "Nb_Colonnes",
    STRING_AGG(c.column_name, ', ' ORDER BY c.ordinal_position) as "Colonnes"
FROM pg_tables t
LEFT JOIN information_schema.columns c 
    ON t.tablename = c.table_name 
    AND c.table_schema = 'public'
WHERE t.schemaname = 'public'
GROUP BY t.tablename
ORDER BY t.tablename;
