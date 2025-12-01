-- SCRIPT DE CRÉATION DE 5 COMPTES PRO + 5 CLIENTS
-- Processus complet: auth.users → profiles → redirection automatique

-- Désactiver les contraintes temporairement pour éviter les erreurs
SET session_replication_role = replica;

-- Supprimer d'abord les profils existants pour éviter les conflits
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

-- Fonction helper pour créer utilisateur + profil atomiquement
CREATE OR REPLACE FUNCTION create_user_with_profile(
  email_param TEXT,
  password_param TEXT,
  full_name_param TEXT,
  phone_param TEXT,
  user_type_param TEXT
) RETURNS UUID AS $$
DECLARE
  user_uuid UUID;
  profile_uuid UUID;
BEGIN
  -- 1. Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    phone,
    phone_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at = NOW(),
    updated_at = NOW()
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    email_param,
    crypt(password_param, gen_salt('bf')),
    NOW(),
    phone_param,
    NULL,
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
  ) RETURNING id INTO user_uuid;
  
  -- 2. Créer le profil correspondant
  INSERT INTO profiles (
    id,
    email,
    full_name,
    phone,
    user_type,
    created_at,
    updated_at
  ) VALUES (
    user_uuid,
    email_param,
    full_name_param,
    phone_param,
    user_type_param,
    NOW(),
    NOW()
  ) RETURNING id INTO profile_uuid;
  
  RETURN profile_uuid;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Erreur création utilisateur/profil: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Message de début
DO $$
BEGIN
    RAISE NOTICE '=== CRÉATION DES 10 COMPTES UTILISATEURS ===';
    RAISE NOTICE 'Processus: auth.users → profiles → redirection automatique';
END $$;

-- CRÉATION DES 5 COMPTES PROFESSIONNELS
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '👩‍💼 CRÉATION DES 5 COMPTES PROFESSIONNELS...';
END $$;

-- 1. Sophie Martin - Coiffeuse Expert
SELECT create_user_with_profile(
  'sophie.martin@salon-beaute.fr',
  'demo123',
  'Sophie Martin',
  '0612345678',
  'professional'
);

-- 2. Pierre Durand - Barber  
SELECT create_user_with_profile(
  'pierre.durand@barbershop.fr',
  'demo123',
  'Pierre Durand',
  '0623456789',
  'professional'
);

-- 3. Marie Laurent - Esthéticienne
SELECT create_user_with_profile(
  'marie.laurent@institut.fr',
  'demo123',
  'Marie Laurent',
  '0634567890',
  'professional'
);

-- 4. Julie Moreau - Prothésiste ongulaire
SELECT create_user_with_profile(
  'julie.moreau@nails-bar.fr',
  'demo123',
  'Julie Moreau',
  '0645678901',
  'professional'
);

-- 5. Thomas Bernard - Directeur Artistique
SELECT create_user_with_profile(
  'thomas.bernard@salon-luxe.fr',
  'demo123',
  'Thomas Bernard',
  '0656789012',
  'professional'
);

-- CRÉATION DES 5 COMPTES CLIENTS
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '👩 CRÉATION DES 5 COMPTES CLIENTS...';
END $$;

-- 1. Marie Dupont - Cliente régulière
SELECT create_user_with_profile(
  'marie.dupont@email.fr',
  'demo123',
  'Marie Dupont',
  '0667890123',
  'client'
);

-- 2. Jean Bernard - Client barbershop
SELECT create_user_with_profile(
  'jean.bernard@email.fr',
  'demo123',
  'Jean Bernard',
  '0678901234',
  'client'
);

-- 3. Claire Petit - Cliente institut
SELECT create_user_with_profile(
  'claire.petit@email.fr',
  'demo123',
  'Claire Petit',
  '0689012345',
  'client'
);

-- 4. Robert Martin - Nouveau client
SELECT create_user_with_profile(
  'robert.martin@email.fr',
  'demo123',
  'Robert Martin',
  '0690123456',
  'client'
);

-- 5. Sophie Leroy - Client beauté
SELECT create_user_with_profile(
  'sophie.leroy@email.fr',
  'demo123',
  'Sophie Leroy',
  '0601234567',
  'client'
);

-- Vérification des comptes créés
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VÉRIFICATION DES COMPTES CRÉÉS ===';
END $$;

SELECT 
  email,
  full_name,
  user_type,
  CASE 
    WHEN user_type = 'professional' THEN '👩‍💼 PROFESSIONNEL'
    WHEN user_type = 'client' THEN '👩 CLIENT'
    ELSE '❓ INCONNU'
  END as "Type",
  created_at as "Créé le"
FROM profiles 
WHERE email IN (
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
)
ORDER BY user_type, full_name;

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;

-- Message final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CRÉATION TERMINÉE AVEC SUCCÈS ! ===';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 MOT DE PASSE UNIVERSEL: demo123';
    RAISE NOTICE '';
    RAISE NOTICE '👩‍💼 COMPTES PROFESSIONNELS (5):';
    RAISE NOTICE '  sophie.martin@salon-beaute.fr → /professional/pro-dashboard';
    RAISE NOTICE '  pierre.durand@barbershop.fr → /professional/pro-dashboard';
    RAISE NOTICE '  marie.laurent@institut.fr → /professional/pro-dashboard';
    RAISE NOTICE '  julie.moreau@nails-bar.fr → /professional/pro-dashboard';
    RAISE NOTICE '  thomas.bernard@salon-luxe.fr → /professional/pro-dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '👩 COMPTES CLIENTS (5):';
    RAISE NOTICE '  marie.dupont@email.fr → /dashboard';
    RAISE NOTICE '  jean.bernard@email.fr → /dashboard';
    RAISE NOTICE '  claire.petit@email.fr → /dashboard';
    RAISE NOTICE '  robert.martin@email.fr → /dashboard';
    RAISE NOTICE '  sophie.leroy@email.fr → /dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Les comptes sont prêts à être utilisés !';
END $$;
