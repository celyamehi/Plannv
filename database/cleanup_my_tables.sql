-- SCRIPT DE NETTOYAGE PERSONNALISÉ
-- Supprime les tables non essentielles pour garder que le cœur

-- Désactiver les contraintes temporairement
SET session_replication_role = replica;

-- Tables à supprimer (non essentielles pour la réservation de base)
DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS client_preferences CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS spatial_ref_sys CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS ticket_messages CASCADE;
DROP TABLE IF EXISTS time_off CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS waiting_list CASCADE;

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;

-- Afficher les tables restantes
SELECT 
    table_name as "Tables conservées (essentielles)"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
