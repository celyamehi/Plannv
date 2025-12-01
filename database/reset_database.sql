-- =====================================================
-- NETTOYAGE COMPLET DE LA BASE DE DONNÉES
-- À UTILISER SEULEMENT SI VOUS VOULEZ RECOMMENCER À ZÉRO
-- =====================================================

-- ATTENTION: Ceci va supprimer TOUTES les données !

-- Désactiver les triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_establishments_updated_at ON establishments;
DROP TRIGGER IF EXISTS update_staff_members_updated_at ON staff_members;
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;

-- Supprimer les tables dans l'ordre inverse (à cause des foreign keys)
DROP TABLE IF EXISTS ticket_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS waiting_list CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS time_off CASCADE;
DROP TABLE IF EXISTS client_preferences CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS staff_members CASCADE;
DROP TABLE IF EXISTS establishments CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS search_establishments_nearby CASCADE;
DROP FUNCTION IF EXISTS get_available_slots CASCADE;
DROP FUNCTION IF EXISTS check_appointment_conflict CASCADE;
DROP FUNCTION IF EXISTS update_establishment_rating CASCADE;
DROP FUNCTION IF EXISTS update_staff_rating CASCADE;
DROP FUNCTION IF EXISTS send_appointment_notification CASCADE;
DROP FUNCTION IF EXISTS calculate_appointment_price CASCADE;
DROP FUNCTION IF EXISTS get_establishment_stats CASCADE;

-- Confirmer le nettoyage
SELECT 'Base de données nettoyée avec succès !' as status;
