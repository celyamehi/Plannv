-- SCRIPT DE SIMPLIFICATION - SUPPRESSION DES TABLES NON ESSENTIELLES
-- Conserve uniquement les tables de base pour la réservation

-- Désactiver les contraintes temporairement
SET session_replication_role = replica;

DO $$
BEGIN
    RAISE NOTICE '=== DÉBUT DE LA SIMPLIFICATION DE LA BASE DE DONNÉES ===';
    RAISE NOTICE 'Suppression des tables non essentielles...';
END $$;

-- Tables à supprimer (non essentielles pour une réservation de base)
DO $$
BEGIN
    RAISE NOTICE 'Suppression des tables sociales et avancées...';
END $$;

-- Supprimer dans l'ordre pour éviter les erreurs de clés étrangères
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Vérifier les tables restantes
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TABLES CONSERVÉES (essentielles) ===';
END $$;

DO $$
DECLARE
    table_name TEXT;
    row_count INTEGER;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'profiles', 
            'establishments', 
            'staff_members', 
            'services', 
            'appointments'
        ])
    LOOP
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO row_count;
            RAISE NOTICE '✓ % : % lignes', table_name, row_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '✗ % : Table inexistante ou erreur', table_name;
        END;
    END LOOP;
END $$;

-- Afficher les tables supprimées
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TABLES SUPPRIMÉES ===';
    RAISE NOTICE '× favorites (favoris)';
    RAISE NOTICE '× reviews (avis)';
    RAISE NOTICE '× notifications (notifications)';
    RAISE NOTICE '× availability_slots (créneaux disponibles)');
    RAISE NOTICE '× clients (détails clients)');
    RAISE NOTICE '× professionals (détails professionnels)');
    RAISE NOTICE '× users (utilisaires séparés)');
END $$;

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== SIMPLIFICATION TERMINÉE ===';
    RAISE NOTICE 'Base de données réduite à l essentiel :';
    RAISE NOTICE '• profiles (utilisateurs)';
    RAISE NOTICE '• establishments (salons/instituts)';
    RAISE NOTICE '• staff_members (employés)';
    RAISE NOTICE '• services (prestations)';
    RAISE NOTICE '• appointments (rendez-vous)';
    RAISE NOTICE '';
    RAISE NOTICE 'Tu peux maintenant utiliser les scripts de test simplifiés !';
END $$;
