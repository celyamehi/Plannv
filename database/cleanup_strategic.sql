-- SCRIPT DE NETTOYAGE STRATÉGIQUE
-- Supprime uniquement les tables sans potentiel
-- Conserve les tables avec fort potentiel pour fonctionnalités futures

-- Désactiver les contraintes temporairement
SET session_replication_role = replica;

-- Tables à supprimer (sans potentiel immédiat)
DROP TABLE IF EXISTS marketing_campaigns CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS ticket_messages CASCADE;
DROP TABLE IF EXISTS time_off CASCADE;
DROP TABLE IF EXISTS client_preferences CASCADE;

-- Note: spatial_ref_sys est une table système PostGIS, on ne peut pas la supprimer
-- Elle ne prend pas beaucoup de place et n'interfère pas avec l'application

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;

-- Vérification: afficher les tables conservées
DO $$
BEGIN
    RAISE NOTICE '=== TABLES CONSERVÉES (14 tables) ===';
    RAISE NOTICE '';
    RAISE NOTICE 'CŒUR RÉSERVATION (5):';
    RAISE NOTICE '  - profiles, establishments, services, staff_members, appointments';
    RAISE NOTICE '';
    RAISE NOTICE 'FONCTIONNALITÉS SOCIALES (2):';
    RAISE NOTICE '  - favorites, reviews';
    RAISE NOTICE '';
    RAISE NOTICE 'GESTION UTILISATEURS (3):';
    RAISE NOTICE '  - users, clients, professionals';
    RAISE NOTICE '';
    RAISE NOTICE 'FONCTIONNALITÉS FUTURES (4):';
    RAISE NOTICE '  - availability_slots (disponibilités avancées)';
    RAISE NOTICE '  - notifications (rappels et communication)';
    RAISE NOTICE '  - transactions (paiements en ligne)';
    RAISE NOTICE '  - waiting_list (liste d attente)';
    RAISE NOTICE '';
    RAISE NOTICE 'TABLES SUPPRIMÉES (5):';
    RAISE NOTICE '  - marketing_campaigns, support_tickets, ticket_messages';
    RAISE NOTICE '  - time_off, client_preferences';
    RAISE NOTICE '';
    RAISE NOTICE 'NOTE: spatial_ref_sys est une table système PostGIS (non supprimable)';
END $$;

-- Afficher les tables restantes
SELECT 
    table_name as "Tables conservées",
    CASE 
        WHEN table_name IN ('profiles', 'establishments', 'services', 'staff_members', 'appointments') 
        THEN '🎯 Cœur réservation'
        WHEN table_name IN ('favorites', 'reviews') 
        THEN '⭐ Fonctionnalités sociales'
        WHEN table_name IN ('users', 'clients', 'professionals') 
        THEN '👥 Gestion utilisateurs'
        WHEN table_name IN ('availability_slots', 'notifications', 'transactions', 'waiting_list') 
        THEN '🚀 Fonctionnalités futures'
        ELSE '❓ Autre'
    END as "Catégorie"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN table_name IN ('profiles', 'establishments', 'services', 'staff_members', 'appointments') 
        THEN 1
        WHEN table_name IN ('favorites', 'reviews') 
        THEN 2
        WHEN table_name IN ('users', 'clients', 'professionals') 
        THEN 3
        WHEN table_name IN ('availability_slots', 'notifications', 'transactions', 'waiting_list') 
        THEN 4
        ELSE 5
    END,
    table_name;
