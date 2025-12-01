-- =====================================================
-- SCRIPT DE MIGRATION VERS LA NOUVELLE STRUCTURE
-- Transfert des données de l'ancienne structure vers les tables séparées
-- =====================================================

-- ATTENTION: Exécuter d'abord le script 06_roles_and_separated_tables.sql

-- =====================================================
-- ÉTAPE 1: Migration des utilisateurs vers la table users
-- =====================================================

-- Créer les utilisateurs à partir de auth.users
INSERT INTO users (id, email, role, created_at, email_verified)
SELECT 
    au.id,
    au.email,
    COALESCE(p.user_type, 'client') as role,
    au.created_at,
    au.email_confirmed_at IS NOT NULL as email_verified
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ÉTAPE 2: Migration des profils clients vers la table clients
-- =====================================================

-- Insérer les clients
INSERT INTO clients (id, first_name, last_name, phone, avatar_url, created_at)
SELECT 
    u.id,
    CASE 
        WHEN p.full_name ~ ' ' THEN split_part(p.full_name, ' ', 1)
        ELSE p.full_name
    END as first_name,
    CASE 
        WHEN p.full_name ~ ' ' THEN split_part(p.full_name, ' ', array_length(string_to_array(p.full_name, ' '), 1))
        ELSE NULL
    END as last_name,
    p.phone,
    p.avatar_url,
    p.created_at
FROM users u
JOIN profiles p ON u.id = p.id
WHERE u.role = 'client'
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ÉTAPE 3: Migration des profils professionnels vers la table professionals
-- =====================================================

-- Insérer les professionnels
INSERT INTO professionals (id, business_name, contact_first_name, contact_last_name, phone, avatar_url, created_at)
SELECT 
    u.id,
    COALESCE(p.full_name, 'Professionnel') as business_name,
    CASE 
        WHEN p.full_name ~ ' ' THEN split_part(p.full_name, ' ', 1)
        ELSE p.full_name
    END as contact_first_name,
    CASE 
        WHEN p.full_name ~ ' ' THEN split_part(p.full_name, ' ', array_length(string_to_array(p.full_name, ' '), 1))
        ELSE NULL
    END as contact_last_name,
    p.phone,
    p.avatar_url,
    p.created_at
FROM users u
JOIN profiles p ON u.id = p.id
WHERE u.role = 'professional'
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ÉTAPE 4: Migration des établissements existants
-- =====================================================

-- Mettre à jour les établissements pour les lier aux professionnels
UPDATE establishments e
SET professional_id = p.id
FROM professionals p
WHERE e.owner_id = p.id;

-- Si la colonne owner_id existe encore, la supprimer
-- ALTER TABLE establishments DROP COLUMN IF EXISTS owner_id;

-- =====================================================
-- ÉTAPE 5: Nettoyage et validation
-- =====================================================

-- Vérifier que tous les utilisateurs ont un profil correspondant
SELECT 
    u.role,
    COUNT(u.id) as total_users,
    COUNT(c.id) as clients_migrated,
    COUNT(p.id) as professionals_migrated
FROM users u
LEFT JOIN clients c ON u.id = c.id AND u.role = 'client'
LEFT JOIN professionals p ON u.id = p.id AND u.role = 'professional'
GROUP BY u.role;

-- Vérifier les établissements sans professionnel
SELECT COUNT(*) as establishments_without_professional
FROM establishments e
WHERE e.professional_id IS NULL;

-- =====================================================
-- ÉTAPE 6: Mise à jour des contraintes (optionnel)
-- =====================================================

-- Ajouter des contraintes FOREIGN KEY si nécessaire
-- ALTER TABLE appointments 
-- ADD CONSTRAINT fk_appointments_client 
-- FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
