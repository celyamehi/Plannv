-- SCRIPT DE NETTOYAGE BASÉ SUR L'ANALYSE COMPLÈTE DE TON APPLICATION
-- Supprime uniquement les tables non utilisées dans ton code

-- Désactiver les contraintes temporairement
SET session_replication_role = replica;

-- Tables non utilisées dans ton application (aucune référence trouvée)
DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS client_preferences CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS spatial_ref_sys CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS ticket_messages CASCADE;
DROP TABLE IF EXISTS time_off CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS waiting_list CASCADE;

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;

-- Vérification: afficher les tables conservées (utilisées dans ton app)
DO $$
BEGIN
    RAISE NOTICE '=== TABLES CONSERVÉES (utilisées dans ton application) ===';
END $$;

SELECT 
    table_name as "Tables gardées",
    CASE 
        WHEN table_name IN ('profiles', 'establishments', 'services', 'staff_members', 'appointments') 
        THEN 'Cœur réservation'
        WHEN table_name IN ('favorites', 'reviews') 
        THEN 'Fonctionnalités sociales'
        WHEN table_name IN ('users', 'clients', 'professionals') 
        THEN 'Gestion utilisateurs'
        ELSE 'Autre'
    END as "Usage"
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
        ELSE 4
    END,
    table_name;
