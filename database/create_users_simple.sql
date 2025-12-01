-- SCRIPT DE CRÉATION SIMPLIFIÉE DES UTILISATEURS
-- Utilise uniquement les colonnes qui existent vraiment dans auth.users

-- Désactiver les contraintes temporairement
SET session_replication_role = replica;

-- Nettoyage complet
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

DELETE FROM auth.users WHERE email IN (
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

DO $$
BEGIN
    RAISE NOTICE '=== CRÉATION UTILISATEURS SIMPLIFIÉE ===';
    RAISE NOTICE 'Utilisation uniquement des colonnes existantes';
END $$;

-- Création des utilisateurs avec la structure de base
-- 1. Sophie Martin - Professionnelle
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    phone,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_uuid,
    'authenticated',
    'authenticated',
    'sophie.martin@salon-beaute.fr',
    crypt('demo123', gen_salt('bf')),
    NOW(),
    '0612345678',
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'sophie.martin@salon-beaute.fr', 'Sophie Martin', '0612345678', 'professional', NOW(), NOW());
  
  RAISE NOTICE '✅ Pro créé: Sophie Martin';
END $$;

-- 2. Pierre Durand - Professionnel
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    phone, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_uuid, 'authenticated', 'authenticated',
    'pierre.durand@barbershop.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0623456789', NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'pierre.durand@barbershop.fr', 'Pierre Durand', '0623456789', 'professional', NOW(), NOW());
  
  RAISE NOTICE '✅ Pro créé: Pierre Durand';
END $$;

-- 3. Marie Laurent - Professionnelle
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    phone, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_uuid, 'authenticated', 'authenticated',
    'marie.laurent@institut.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0634567890', NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'marie.laurent@institut.fr', 'Marie Laurent', '0634567890', 'professional', NOW(), NOW());
  
  RAISE NOTICE '✅ Pro créé: Marie Laurent';
END $$;

-- 4. Julie Moreau - Professionnelle
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    phone, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_uuid, 'authenticated', 'authenticated',
    'julie.moreau@nails-bar.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0645678901', NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'julie.moreau@nails-bar.fr', 'Julie Moreau', '0645678901', 'professional', NOW(), NOW());
  
  RAISE NOTICE '✅ Pro créé: Julie Moreau';
END $$;

-- 5. Thomas Bernard - Professionnel
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    phone, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_uuid, 'authenticated', 'authenticated',
    'thomas.bernard@salon-luxe.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0656789012', NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'thomas.bernard@salon-luxe.fr', 'Thomas Bernard', '0656789012', 'professional', NOW(), NOW());
  
  RAISE NOTICE '✅ Pro créé: Thomas Bernard';
END $$;

-- Clients
-- 1. Marie Dupont
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    phone, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_uuid, 'authenticated', 'authenticated',
    'marie.dupont@email.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0667890123', NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'marie.dupont@email.fr', 'Marie Dupont', '0667890123', 'client', NOW(), NOW());
  
  RAISE NOTICE '✅ Client créé: Marie Dupont';
END $$;

-- 2. Jean Bernard
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    phone, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_uuid, 'authenticated', 'authenticated',
    'jean.bernard@email.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0678901234', NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'jean.bernard@email.fr', 'Jean Bernard', '0678901234', 'client', NOW(), NOW());
  
  RAISE NOTICE '✅ Client créé: Jean Bernard';
END $$;

-- 3. Claire Petit
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    phone, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_uuid, 'authenticated', 'authenticated',
    'claire.petit@email.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0689012345', NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'claire.petit@email.fr', 'Claire Petit', '0689012345', 'client', NOW(), NOW());
  
  RAISE NOTICE '✅ Client créé: Claire Petit';
END $$;

-- 4. Robert Martin
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    phone, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_uuid, 'authenticated', 'authenticated',
    'robert.martin@email.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0690123456', NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'robert.martin@email.fr', 'Robert Martin', '0690123456', 'client', NOW(), NOW());
  
  RAISE NOTICE '✅ Client créé: Robert Martin';
END $$;

-- 5. Sophie Leroy
DO $$
DECLARE
  user_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    phone, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_uuid, 'authenticated', 'authenticated',
    'sophie.leroy@email.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0601234567', NOW(), NOW(), NOW(),
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
    RAISE NOTICE '=== VÉRIFICATION FINALE DES UTILISATEURS CRÉÉS ===';
END $$;

SELECT 
    u.email,
    u.id as "auth_id",
    p.id as "profile_id",
    p.user_type,
    p.full_name,
    CASE 
        WHEN u.id = p.id THEN '✅ CORRECT'
        ELSE '❌ ERREUR'
    END as "correspondance",
    u.email_confirmed_at as "confirmé_le"
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email IN (
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
ORDER BY p.user_type, u.email;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CRÉATION TERMINÉE ! ===';
    RAISE NOTICE '🔐 MOT DE PASSE UNIVERSEL: demo123';
    RAISE NOTICE '👩‍💼 5 professionnels prêts à se connecter';
    RAISE NOTICE '👩 5 clients prêts à se connecter';
    RAISE NOTICE '';
    RAISE NOTICE 'Les utilisateurs devraient maintenant pouvoir se connecter sans erreur !';
END $$;
