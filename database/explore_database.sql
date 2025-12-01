-- SCRIPT D'EXPLORATION COMPLÈTE DE LA BASE DE DONNÉES
-- Affiche toutes les tables et leurs colonnes

DO $$
BEGIN
    RAISE NOTICE '=== EXPLORATION COMPLÈTE DE LA BASE DE DONNÉES ===';
    RAISE NOTICE 'Liste de toutes les tables et leurs colonnes...';
END $$;

-- Afficher toutes les tables et leurs colonnes
DO $$
DECLARE
    table_record RECORD;
    column_record RECORD;
    table_counter INTEGER := 0;
    column_counter INTEGER;
    type_info TEXT;
    null_info TEXT;
    default_info TEXT;
    row_count INTEGER;
BEGIN
    -- Parcourir toutes les tables utilisateur
    FOR table_record IN 
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        table_counter := table_counter + 1;
        column_counter := 0;
        
        RAISE NOTICE '';
        RAISE NOTICE '=== TABLE #%: % ===', table_counter, table_record.table_name;
        
        -- Afficher les colonnes de cette table
        FOR column_record IN 
            SELECT 
                column_name,
                data_type,
                character_maximum_length,
                is_nullable,
                column_default,
                ordinal_position
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = table_record.table_name
            ORDER BY ordinal_position
        LOOP
            column_counter := column_counter + 1;
            
            -- Formatter l'affichage
            type_info := column_record.data_type;
            null_info := column_record.is_nullable;
            default_info := COALESCE(column_record.column_default::TEXT, 'NULL');
            
            IF column_record.character_maximum_length IS NOT NULL THEN
                type_info := type_info || '(' || column_record.character_maximum_length || ')';
            END IF;
            
            RAISE NOTICE '  %. % [%] NULL: % DEFAULT: %', 
                column_counter, 
                column_record.column_name, 
                type_info, 
                null_info, 
                default_info;
        END LOOP;
        
        RAISE NOTICE '  → % colonne(s) au total', column_counter;
        
        -- Afficher le nombre de lignes
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM %I', table_record.table_name) INTO row_count;
            RAISE NOTICE '  → % ligne(s) de données', row_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '  → Impossible de compter les lignes (table vide ou erreur)';
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== RÉSUMÉ ===';
    RAISE NOTICE 'Total: % table(s) trouvée(s) dans le schéma public', table_counter;
END $$;

-- Afficher également les contraintes foreign key
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CONTRAINTES FOREIGN KEY ===';
END $$;

SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Afficher les indexes importants
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== INDEXES IMPORTANTS ===';
END $$;

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname NOT LIKE '%_pkey'
ORDER BY tablename, indexname;

-- Message final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== EXPLORATION TERMINÉE ===';
    RAISE NOTICE 'Tu as maintenant une vue complète de ta base de données !';
END $$;
