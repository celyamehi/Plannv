-- =====================================================
-- NETTOYAGE COMPLET DE LA BASE DE DONNÉES
-- ⚠️ ATTENTION : Ceci supprime TOUT !
-- =====================================================

-- Désactiver temporairement les contraintes de clé étrangère
SET session_replication_role = 'replica';

-- Supprimer toutes les tables dans l'ordre inverse
DROP TABLE IF EXISTS ticket_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS waiting_list CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS time_off CASCADE;
DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS staff_members CASCADE;
DROP TABLE IF EXISTS client_preferences CASCADE;
DROP TABLE IF EXISTS establishments CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Supprimer toutes les fonctions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS search_establishments_nearby(DECIMAL, DECIMAL, INTEGER, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_available_slots(UUID, DATE, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS check_appointment_conflict() CASCADE;
DROP FUNCTION IF EXISTS update_establishment_rating() CASCADE;
DROP FUNCTION IF EXISTS update_staff_rating() CASCADE;
DROP FUNCTION IF EXISTS send_appointment_notification() CASCADE;
DROP FUNCTION IF EXISTS calculate_appointment_price() CASCADE;
DROP FUNCTION IF EXISTS get_establishment_stats(UUID) CASCADE;

-- Réactiver les contraintes
SET session_replication_role = 'origin';

-- Confirmer le nettoyage
SELECT '✅ Base de données nettoyée avec succès !' as status;
SELECT 'Vous pouvez maintenant exécuter le script 05_install_all.sql' as next_step;
