-- SCRIPT D'ANALYSE PRÉCISE DES TABLES EXISTANTES
-- Affiche TOUTES les tables et propose quoi supprimer

DO $$
BEGIN
    RAISE NOTICE '=== ANALYSE COMPLÈTE DE TA BASE DE DONNÉES ===';
END $$;

-- Lister toutes les tables existantes
DO $$
DECLARE
    table_record RECORD;
    table_counter INTEGER := 0;
    essential_tables TEXT[] := ARRAY['profiles', 'establishments', 'staff_members', 'services', 'appointments'];
    is_essential BOOLEAN;
    row_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TABLES TROUVÉES DANS TA BASE ===';
    
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        table_counter := table_counter + 1;
        is_essential := table_record.table_name = ANY(essential_tables);
        
        -- Compter les lignes
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM %I', table_record.table_name) INTO row_count;
        EXCEPTION WHEN OTHERS THEN
            row_count := 0;
        END;
        
        IF is_essential THEN
            RAISE NOTICE '✓ KEEP: % (% lignes) - TABLE ESSENTIELLE', table_record.table_name, row_count;
        ELSE
            RAISE NOTICE '× DELETE: % (% lignes) - Table optionnelle', table_record.table_name, row_count;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Total: % table(s) trouvée(s)', table_counter;
END $$;

-- Proposition de script de suppression personnalisé
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== PROPOSITION DE NETTOYAGE ===';
    RAISE NOTICE 'Voici les tables que tu pourrais supprimer:';
    RAISE NOTICE '';
    RAISE NOTICE 'Copie et exécute ce script pour nettoyer ta base:';
    RAISE NOTICE '';
    RAISE NOTICE 'SET session_replication_role = replica;';
END $$;

-- Afficher les commandes DROP une par une
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('profiles', 'establishments', 'staff_members', 'services', 'appointments')
        ORDER BY table_name
    LOOP
        RAISE NOTICE 'DROP TABLE IF EXISTS % CASCADE;', table_record.table_name;
    END LOOP;
END $$;

DO $$
BEGIN
    RAISE NOTICE 'SET session_replication_role = DEFAULT;';
    RAISE NOTICE '';
    RAISE NOTICE 'DO $$';
    RAISE NOTICE '  BEGIN';
    RAISE NOTICE '    RAISE NOTICE "Nettoyage terminé ! Il reste uniquement les 5 tables essentielles.";';
    RAISE NOTICE '  END $$;';
END $$;
