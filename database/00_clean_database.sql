-- SCRIPT DE NETTOYAGE COMPLET - BASE DE DONNÉES VIERGE
-- Ce script supprime TOUTES les données de test

-- Désactiver les contraintes temporairement
SET session_replication_role = replica;

-- Message d'avertissement
DO $$
BEGIN
    RAISE NOTICE '=== DÉBUT DU NETTOYAGE COMPLET ===';
    RAISE NOTICE 'ATTENTION: Toutes les données vont être supprimées !';
END $$;

-- Supprimer les rendez-vous
DELETE FROM appointments;

-- Supprimer les services
DELETE FROM services;

-- Supprimer les staff members
DELETE FROM staff_members;

-- Supprimer les établissements
DELETE FROM establishments;

-- Supprimer les profils de test
DELETE FROM profiles WHERE email IN (
  'sophie.martin@salon-beaute.fr',
  'pierre.durand@barbershop.fr',
  'marie.laurent@institut.fr',
  'julie.moreau@nails-bar.fr',
  'thomas.bernard@salon-luxe.fr',
  'marie.dupont@email.fr',
  'jean.bernard@email.fr',
  'claire.petit@email.fr',
  'robert.martin@email.fr',
  'sophie.leroy@email.fr'
);

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;

-- Vérifier que tout est vide
DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES TABLES VIDES ===';
END $$;

DO $$
DECLARE
    table_name TEXT;
    row_count INTEGER;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY['appointments', 'services', 'staff_members', 'establishments', 'profiles'])
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO row_count;
        RAISE NOTICE 'Table %s: %s lignes', table_name, row_count;
    END LOOP;
END $$;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '=== NETTOYAGE TERMINÉ ===';
    RAISE NOTICE 'La base de données est maintenant vierge !';
    RAISE NOTICE 'Tu peux réexécuter les scripts de création de profils si nécessaire.';
END $$;
