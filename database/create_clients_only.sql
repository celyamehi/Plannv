-- SCRIPT DE CRÉATION UNIQUEMENT DES 5 COMPTES CLIENTS
-- Si les clients n'ont pas été créés précédemment

-- Désactiver les contraintes temporairement
SET session_replication_role = replica;

-- Supprimer d'abord les clients existants pour éviter les doublons
DELETE FROM profiles WHERE email IN (
  'marie.dupont@email.fr',
  'jean.bernard@email.fr',
  'claire.petit@email.fr',
  'robert.martin@email.fr',
  'sophie.leroy@email.fr'
);

DO $$
BEGIN
    RAISE NOTICE '=== CRÉATION DES 5 COMPTES CLIENTS UNIQUEMENT ===';
END $$;

-- 1. Marie Dupont - Cliente régulière
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    phone, phone_confirmed_at, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_uuid, 'authenticated', 'authenticated',
    'marie.dupont@email.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0667890123', NULL, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'marie.dupont@email.fr', 'Marie Dupont', '0667890123', 'client', NOW(), NOW());
  
  RAISE NOTICE '✅ Client créé: Marie Dupont';
END $$;

-- 2. Jean Bernard - Client barbershop
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    phone, phone_confirmed_at, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_uuid, 'authenticated', 'authenticated',
    'jean.bernard@email.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0678901234', NULL, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'jean.bernard@email.fr', 'Jean Bernard', '0678901234', 'client', NOW(), NOW());
  
  RAISE NOTICE '✅ Client créé: Jean Bernard';
END $$;

-- 3. Claire Petit - Cliente institut
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    phone, phone_confirmed_at, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_uuid, 'authenticated', 'authenticated',
    'claire.petit@email.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0689012345', NULL, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'claire.petit@email.fr', 'Claire Petit', '0689012345', 'client', NOW(), NOW());
  
  RAISE NOTICE '✅ Client créé: Claire Petit';
END $$;

-- 4. Robert Martin - Nouveau client
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    phone, phone_confirmed_at, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_uuid, 'authenticated', 'authenticated',
    'robert.martin@email.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0690123456', NULL, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'robert.martin@email.fr', 'Robert Martin', '0690123456', 'client', NOW(), NOW());
  
  RAISE NOTICE '✅ Client créé: Robert Martin';
END $$;

-- 5. Sophie Leroy - Client beauté
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    phone, phone_confirmed_at, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_uuid, 'authenticated', 'authenticated',
    'sophie.leroy@email.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0601234567', NULL, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'sophie.leroy@email.fr', 'Sophie Leroy', '0601234567', 'client', NOW(), NOW());
  
  RAISE NOTICE '✅ Client créé: Sophie Leroy';
END $$;

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;

-- Vérification finale
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VÉRIFICATION DES CLIENTS CRÉÉS ===';
END $$;

SELECT 
    email,
    full_name,
    user_type,
    created_at
FROM profiles 
WHERE user_type = 'client'
AND email IN (
  'marie.dupont@email.fr',
  'jean.bernard@email.fr',
  'claire.petit@email.fr',
  'robert.martin@email.fr',
  'sophie.leroy@email.fr'
)
ORDER BY full_name;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CRÉATION DES CLIENTS TERMINÉE ! ===';
    RAISE NOTICE '🔐 MOT DE PASSE UNIVERSEL: demo123';
    RAISE NOTICE '👩 5 comptes clients sont maintenant disponibles !';
END $$;
