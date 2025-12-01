-- =====================================================
-- MIGRATION DES UTILISATEURS EXISTANTS
-- Script pour transférer les utilisateurs de auth.users vers la nouvelle table users
-- =====================================================

-- ÉTAPE 1: Insérer tous les utilisateurs de auth.users dans la table users
-- en utilisant les informations de l'ancienne table profiles

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

-- ÉTAPE 2: Vérifier combien d'utilisateurs ont été migrés
SELECT 
    'auth.users' as table_name,
    COUNT(*) as total_count
FROM auth.users
UNION ALL
SELECT 
    'users' as table_name,
    COUNT(*) as total_count
FROM users
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as total_count
FROM profiles;

-- ÉTAPE 3: Vérifier les utilisateurs sans rôle
SELECT 
    au.id,
    au.email,
    au.created_at,
    u.role as new_role,
    p.user_type as old_role
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
LEFT JOIN profiles p ON au.id = p.id
WHERE u.id IS NULL OR u.role IS NULL
ORDER BY au.created_at DESC;

-- ÉTAPE 4: Forcer la mise à jour des utilisateurs sans rôle
UPDATE users 
SET role = 'client' 
WHERE role IS NULL;

-- ÉTAPE 5: Créer les profils clients pour les utilisateurs de type client
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

-- ÉTAPE 6: Créer les profils professionnels pour les utilisateurs de type professional
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

-- ÉTAPE 7: Vérification finale de la migration
SELECT 
    'users' as table_name,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE role = 'client') as clients,
    COUNT(*) FILTER (WHERE role = 'professional') as professionals,
    COUNT(*) FILTER (WHERE role = 'admin') as admins
FROM users
UNION ALL
SELECT 
    'clients' as table_name,
    COUNT(*) as total_count,
    COUNT(*) as total_count,
    0 as professionals,
    0 as admins
FROM clients
UNION ALL
SELECT 
    'professionals' as table_name,
    COUNT(*) as total_count,
    0 as clients,
    COUNT(*) as total_count,
    0 as admins
FROM professionals;

-- ÉTAPE 8: Vérifier l'utilisateur spécifique qui pose problème
-- Remplacer l'UUID par celui des logs
SELECT 
    u.id,
    u.email,
    u.role,
    u.created_at,
    c.id as client_id,
    p.id as professional_id
FROM users u
LEFT JOIN clients c ON u.id = c.id
LEFT JOIN professionals p ON u.id = p.id
WHERE u.id = 'd31dfb1c-547e-48a9-92fd-c543f7fa9fb3';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
