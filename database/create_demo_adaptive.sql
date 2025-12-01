-- SCRIPT DE CRÉATION DE 5 COMPTES PRO + 5 CLIENTS + SERVICES + EMPLOYÉS
-- Version adaptée selon la structure réelle de la base de données

-- Désactiver les contraintes temporairement
SET session_replication_role = replica;

-- Nettoyage des données existantes
DELETE FROM staff_members WHERE email IN (
  'staff.sophie@salon-beaute.fr',
  'staff.pierre@barbershop.fr', 
  'staff.marie@institut.fr',
  'staff.julie@nails-bar.fr',
  'staff.thomas@salon-luxe.fr'
);

DELETE FROM services WHERE establishment_id IN (
  (SELECT id FROM establishments WHERE owner_id IN (
    SELECT id FROM profiles WHERE user_type = 'professional' AND email IN (
      'sophie.martin@salon-beaute.fr',
      'pierre.durand@barbershop.fr', 
      'marie.laurent@institut.fr',
      'julie.moreau@nails-bar.fr',
      'thomas.bernard@salon-luxe.fr'
    )
  ))
);

DELETE FROM establishments WHERE owner_id IN (
  SELECT id FROM profiles WHERE user_type = 'professional' AND email IN (
    'sophie.martin@salon-beaute.fr',
    'pierre.durand@barbershop.fr', 
    'marie.laurent@institut.fr',
    'julie.moreau@nails-bar.fr',
    'thomas.bernard@salon-luxe.fr'
  )
);

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
  'sophie.leroy@email.fr',
  'staff.sophie@salon-beaute.fr',
  'staff.pierre@barbershop.fr', 
  'staff.marie@institut.fr',
  'staff.julie@nails-bar.fr',
  'staff.thomas@salon-luxe.fr'
);

-- Message de début
DO $$
BEGIN
    RAISE NOTICE '=== CRÉATION COMPLÈTE: COMPTES + ÉTABLISSEMENTS + SERVICES + EMPLOYÉS ===';
    RAISE NOTICE 'Version adaptée selon structure réelle de la base';
END $$;

-- CRÉATION DES 5 COMPTES PROFESSIONNELS
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '👩‍💼 CRÉATION DES 5 COMPTES PROFESSIONNELS...';
END $$;

-- 1. Sophie Martin - Coiffeuse Expert
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
    'sophie.martin@salon-beaute.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0612345678', NULL, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'sophie.martin@salon-beaute.fr', 'Sophie Martin', '0612345678', 'professional', NOW(), NOW());
END $$;

-- 2. Pierre Durand - Barber
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
    'pierre.durand@barbershop.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0623456789', NULL, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'pierre.durand@barbershop.fr', 'Pierre Durand', '0623456789', 'professional', NOW(), NOW());
END $$;

-- 3. Marie Laurent - Esthéticienne
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
    'marie.laurent@institut.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0634567890', NULL, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'marie.laurent@institut.fr', 'Marie Laurent', '0634567890', 'professional', NOW(), NOW());
END $$;

-- 4. Julie Moreau - Prothésiste ongulaire
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
    'julie.moreau@nails-bar.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0645678901', NULL, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'julie.moreau@nails-bar.fr', 'Julie Moreau', '0645678901', 'professional', NOW(), NOW());
END $$;

-- 5. Thomas Bernard - Directeur Artistique
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
    'thomas.bernard@salon-luxe.fr', crypt('demo123', gen_salt('bf')), NOW(),
    '0656789012', NULL, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', false
  );
  
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at, updated_at)
  VALUES (user_uuid, 'thomas.bernard@salon-luxe.fr', 'Thomas Bernard', '0656789012', 'professional', NOW(), NOW());
END $$;

-- CRÉATION DES 5 COMPTES CLIENTS
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '👩 CRÉATION DES 5 COMPTES CLIENTS...';
END $$;

-- Clients
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
END $$;

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
END $$;

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
END $$;

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
END $$;

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
END $$;

-- CRÉATION DES ÉTABLISSEMENTS POUR CHAQUE PRO
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🏢 CRÉATION DES ÉTABLISSEMENTS...';
END $$;

-- 1. Salon de Sophie - Coiffure
INSERT INTO establishments (
    id, owner_id, name, slug, category, address, city, postal_code, country,
    phone, email, description, is_active, accepts_online_booking
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM profiles WHERE email = 'sophie.martin@salon-beaute.fr'),
    'Salon Prestige - Sophie Martin',
    'salon-prestige-sophie-martin',
    'coiffeur',
    '123 Avenue des Champs-Élysées',
    'Paris',
    '75008',
    'France',
    '0140123456',
    'contact@salon-prestige.fr',
    'Salon de coiffure haut de gamme spécialisé dans les colorations et coupes tendance',
    true,
    true
);

-- 2. Barbier de Pierre - Barber Shop
INSERT INTO establishments (
    id, owner_id, name, slug, category, address, city, postal_code, country,
    phone, email, description, is_active, accepts_online_booking
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM profiles WHERE email = 'pierre.durand@barbershop.fr'),
    'Barbier Royal - Pierre Durand',
    'barbier-royal-pierre-durand',
    'barbier',
    '45 Rue de la Victoire',
    'Paris',
    '75009',
    'France',
    '0140987654',
    'bonjour@barbier-royal.fr',
    'Barbier traditionnel pour hommes : coupes, barbes, soins visage',
    true,
    true
);

-- 3. Institut Marie - Beauté
INSERT INTO establishments (
    id, owner_id, name, slug, category, address, city, postal_code, country,
    phone, email, description, is_active, accepts_online_booking
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM profiles WHERE email = 'marie.laurent@institut.fr'),
    'Institut Harmony - Marie Laurent',
    'institut-harmony-marie-laurent',
    'esthetique',
    '78 Boulevard Saint-Germain',
    'Paris',
    '75006',
    'France',
    '0144556677',
    'info@institut-harmony.fr',
    'Institut de beauté : soins du visage, manucure, pédicure, épilation',
    true,
    true
);

-- 4. Nails Bar Julie - Ongles
INSERT INTO establishments (
    id, owner_id, name, slug, category, address, city, postal_code, country,
    phone, email, description, is_active, accepts_online_booking
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM profiles WHERE email = 'julie.moreau@nails-bar.fr'),
    'Nails Studio - Julie Moreau',
    'nails-studio-julie-moreau',
    'ongles',
    '12 Rue Montorgueil',
    'Paris',
    '75002',
    'France',
    '0144332211',
    'contact@nails-studio.fr',
    'Spécialiste en nail art, vernis permanent, manucure de précision',
    true,
    true
);

-- 5. Salon Luxe Thomas - Coiffure Premium
INSERT INTO establishments (
    id, owner_id, name, slug, category, address, city, postal_code, country,
    phone, email, description, is_active, accepts_online_booking
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM profiles WHERE email = 'thomas.bernard@salon-luxe.fr'),
    'Maison Thomas - Coiffure d''Exception',
    'maison-thomas-coiffure-exception',
    'coiffeur',
    '15 Avenue Foch',
    'Paris',
    '75016',
    'France',
    '0145667788',
    'reservation@maison-thomas.fr',
    'Coiffure de luxe : colorations expert, coupes sur-mesure, soins capillaires premium',
    true,
    true
);

-- CRÉATION DES SERVICES POUR CHAQUE ÉTABLISSEMENT
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '💅 CRÉATION DES SERVICES...';
END $$;

-- Services pour Salon Prestige (Coiffure)
INSERT INTO services (establishment_id, name, description, duration, price, category, is_active) VALUES
((SELECT id FROM establishments WHERE name = 'Salon Prestige - Sophie Martin'), 'Consultation gratuite', 'Première consultation pour discuter de vos besoins', 15, 0, 'Consultation', true),
((SELECT id FROM establishments WHERE name = 'Salon Prestige - Sophie Martin'), 'Coupe femme', 'Coupe et coiffage femme avec brushing', 45, 45, 'Coupe', true),
((SELECT id FROM establishments WHERE name = 'Salon Prestige - Sophie Martin'), 'Coupe homme', 'Coupe homme traditionnelle', 30, 35, 'Coupe', true),
((SELECT id FROM establishments WHERE name = 'Salon Prestige - Sophie Martin'), 'Coloration complète', 'Coloration permanente avec soin', 120, 80, 'Coloration', true),
((SELECT id FROM establishments WHERE name = 'Salon Prestige - Sophie Martin'), 'Mèches', 'Mèches balayage effet soleil', 150, 120, 'Coloration', true),
((SELECT id FROM establishments WHERE name = 'Salon Prestige - Sophie Martin'), 'Brushing', 'Brushing et coiffage', 30, 30, 'Coiffage', true);

-- Services pour Barbier Royal (Barber)
INSERT INTO services (establishment_id, name, description, duration, price, category, is_active) VALUES
((SELECT id FROM establishments WHERE name = 'Barbier Royal - Pierre Durand'), 'Consultation gratuite', 'Première consultation pour discuter de vos besoins', 15, 0, 'Consultation', true),
((SELECT id FROM establishments WHERE name = 'Barbier Royal - Pierre Durand'), 'Coupe homme', 'Coupe homme traditionnelle', 30, 25, 'Coupe', true),
((SELECT id FROM establishments WHERE name = 'Barbier Royal - Pierre Durand'), 'Barbe', 'Taille et entretien barbe', 30, 20, 'Barbe', true),
((SELECT id FROM establishments WHERE name = 'Barbier Royal - Pierre Durand'), 'Coupe + Barbe', 'Pack complet coupe et barbe', 45, 40, 'Pack', true),
((SELECT id FROM establishments WHERE name = 'Barbier Royal - Pierre Durand'), 'Soin visage', 'Soin hydratant pour homme', 20, 15, 'Soin', true);

-- Services pour Institut Harmony (Beauté)
INSERT INTO services (establishment_id, name, description, duration, price, category, is_active) VALUES
((SELECT id FROM establishments WHERE name = 'Institut Harmony - Marie Laurent'), 'Consultation gratuite', 'Première consultation pour discuter de vos besoins', 15, 0, 'Consultation', true),
((SELECT id FROM establishments WHERE name = 'Institut Harmony - Marie Laurent'), 'Soin visage hydratant', 'Soin visage profond hydratant', 60, 60, 'Soin', true),
((SELECT id FROM establishments WHERE name = 'Institut Harmony - Marie Laurent'), 'Manucure classique', 'Manucure avec vernis classique', 45, 30, 'Beauté', true),
((SELECT id FROM establishments WHERE name = 'Institut Harmony - Marie Laurent'), 'Pédicure', 'Pédicure complète', 60, 40, 'Beauté', true),
((SELECT id FROM establishments WHERE name = 'Institut Harmony - Marie Laurent'), 'Épilation sourcils', 'Épilation et mise en forme sourcils', 20, 15, 'Épilation', true);

-- Services pour Nails Studio (Ongles)
INSERT INTO services (establishment_id, name, description, duration, price, category, is_active) VALUES
((SELECT id FROM establishments WHERE name = 'Nails Studio - Julie Moreau'), 'Consultation gratuite', 'Première consultation pour discuter de vos besoins', 15, 0, 'Consultation', true),
((SELECT id FROM establishments WHERE name = 'Nails Studio - Julie Moreau'), 'Manucure semi-permanent', 'Vernis semi-permanent', 60, 35, 'Ongles', true),
((SELECT id FROM establishments WHERE name = 'Nails Studio - Julie Moreau'), 'Nail art', 'Décoration personnalisée des ongles', 90, 50, 'Ongles', true),
((SELECT id FROM establishments WHERE name = 'Nails Studio - Julie Moreau'), 'Pose d''ongles', 'Pose d''ongles en gel', 120, 60, 'Ongles', true),
((SELECT id FROM establishments WHERE name = 'Nails Studio - Julie Moreau'), 'Dépose semi-permanent', 'Dépose de vernis semi-permanent', 30, 15, 'Ongles', true);

-- Services pour Maison Thomas (Coiffure Premium)
INSERT INTO services (establishment_id, name, description, duration, price, category, is_active) VALUES
((SELECT id FROM establishments WHERE name = 'Maison Thomas - Coiffure d''Exception'), 'Consultation premium', 'Consultation personnalisée avec directeur artistique', 30, 30, 'Consultation', true),
((SELECT id FROM establishments WHERE name = 'Maison Thomas - Coiffure d''Exception'), 'Coupe sur-mesure', 'Coupe personnalisée selon votre morphologie', 60, 80, 'Coupe', true),
((SELECT id FROM establishments WHERE name = 'Maison Thomas - Coiffure d''Exception'), 'Coloration expert', 'Coloration haut de gamme avec produits premium', 150, 150, 'Coloration', true),
((SELECT id FROM establishments WHERE name = 'Maison Thomas - Coiffure d''Exception'), 'Soin capillaire luxe', 'Soin profond avec produits de luxe', 45, 60, 'Soin', true),
((SELECT id FROM establishments WHERE name = 'Maison Thomas - Coiffure d''Exception'), 'Balayage précision', 'Balayage technique de précision', 180, 180, 'Coloration', true);

-- Vérifier la structure de staff_members avant de créer les employés
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Vérification de la structure de staff_members...';
    
    -- Vérifier si la colonne profile_id existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_members' 
        AND column_name = 'profile_id'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ profile_id existe - utilisation avec profile_id';
        
        -- Créer les employés avec profile_id
        -- Employés pour Salon Prestige (Sophie)
        INSERT INTO staff_members (establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Salon Prestige - Sophie Martin'), 
         (SELECT id FROM profiles WHERE email = 'sophie.martin@salon-beaute.fr'),
         'Sophie', 'Martin', 'sophie.martin@salon-beaute.fr', '0612345678', 
         'Directrice Artistique', ARRAY['Coloration', 'Coupe femme', 'Mèches'], true, true);
        
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Salon Prestige - Sophie Martin'), 
         'Emma', 'Petit', 'emma.sophie@salon-prestige.fr', '0611223344', 
         'Coiffeuse Senior', ARRAY['Coupe femme', 'Brushing'], true, true);
        
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Salon Prestige - Sophie Martin'), 
         'Lucas', 'Dubois', 'lucas.sophie@salon-prestige.fr', '0611334455', 
         'Coiffeur', ARRAY['Coupe homme', 'Coloration'], true, true);
        
        -- Employés pour Barbier Royal (Pierre)
        INSERT INTO staff_members (establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Barbier Royal - Pierre Durand'), 
         (SELECT id FROM profiles WHERE email = 'pierre.durand@barbershop.fr'),
         'Pierre', 'Durand', 'pierre.durand@barbershop.fr', '0623456789', 
         'Barbier Principal', ARRAY['Coupe homme', 'Barbe', 'Soin visage'], true, true);
        
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Barbier Royal - Pierre Durand'), 
         'Maxime', 'Leroy', 'maxime.pierre@barbier-royal.fr', '0622445566', 
         'Barbier', ARRAY['Barbe', 'Coupe homme'], true, true);
        
        -- Employés pour Institut Harmony (Marie)
        INSERT INTO staff_members (establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Institut Harmony - Marie Laurent'), 
         (SELECT id FROM profiles WHERE email = 'marie.laurent@institut.fr'),
         'Marie', 'Laurent', 'marie.laurent@institut.fr', '0634567890', 
         'Esthéticienne Chief', ARRAY['Soin visage', 'Manucure', 'Pédicure'], true, true);
        
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Institut Harmony - Marie Laurent'), 
         'Chloé', 'Rousseau', 'chloe.marie@institut-harmony.fr', '0632556677', 
         'Esthéticienne', ARRAY['Manucure', 'Épilation'], true, true);
        
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Institut Harmony - Marie Laurent'), 
         'Léa', 'Garnier', 'lea.marie@institut-harmony.fr', '0633667788', 
         'Esthéticienne', ARRAY['Pédicure', 'Soin visage'], true, true);
        
        -- Employés pour Nails Studio (Julie)
        INSERT INTO staff_members (establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Nails Studio - Julie Moreau'), 
         (SELECT id FROM profiles WHERE email = 'julie.moreau@nails-bar.fr'),
         'Julie', 'Moreau', 'julie.moreau@nails-bar.fr', '0645678901', 
         'Prothésiste Ongulaire', ARRAY['Nail art', 'Vernis semi-permanent', 'Pose ongles'], true, true);
        
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Nails Studio - Julie Moreau'), 
         'Camille', 'Blanc', 'camille.julie@nails-studio.fr', '0644778899', 
         'Prothésiste', ARRAY['Manucure', 'Vernis semi-permanent'], true, true);
        
        -- Employés pour Maison Thomas (Thomas)
        INSERT INTO staff_members (establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Maison Thomas - Coiffure d''Exception'), 
         (SELECT id FROM profiles WHERE email = 'thomas.bernard@salon-luxe.fr'),
         'Thomas', 'Bernard', 'thomas.bernard@salon-luxe.fr', '0656789012', 
         'Directeur Artistique', ARRAY['Coupe sur-mesure', 'Coloration expert', 'Balayage'], true, true);
        
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Maison Thomas - Coiffure d''Exception'), 
         'Alexandre', 'Fournier', 'alexandre.thomas@maison-thomas.fr', '0655998877', 
         'Coiffeur Expert', ARRAY['Coupe homme', 'Soin capillaire'], true, true);
        
    ELSE
        RAISE NOTICE '❌ profile_id n existe pas - utilisation sans profile_id';
        
        -- Créer les employés sans profile_id (version simplifiée)
        -- Employés pour Salon Prestige (Sophie)
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Salon Prestige - Sophie Martin'), 
         'Sophie', 'Martin', 'sophie.martin@salon-beaute.fr', '0612345678', 
         'Directrice Artistique', ARRAY['Coloration', 'Coupe femme', 'Mèches'], true, true);
        
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Salon Prestige - Sophie Martin'), 
         'Emma', 'Petit', 'emma.sophie@salon-prestige.fr', '0611223344', 
         'Coiffeuse Senior', ARRAY['Coupe femme', 'Brushing'], true, true);
        
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Salon Prestige - Sophie Martin'), 
         'Lucas', 'Dubois', 'lucas.sophie@salon-prestige.fr', '0611334455', 
         'Coiffeur', ARRAY['Coupe homme', 'Coloration'], true, true);
        
        -- Employés pour Barbier Royal (Pierre)
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Barbier Royal - Pierre Durand'), 
         'Pierre', 'Durand', 'pierre.durand@barbershop.fr', '0623456789', 
         'Barbier Principal', ARRAY['Coupe homme', 'Barbe', 'Soin visage'], true, true);
        
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Barbier Royal - Pierre Durand'), 
         'Maxime', 'Leroy', 'maxime.pierre@barbier-royal.fr', '0622445566', 
         'Barbier', ARRAY['Barbe', 'Coupe homme'], true, true);
        
        -- Employés pour Institut Harmony (Marie)
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Institut Harmony - Marie Laurent'), 
         'Marie', 'Laurent', 'marie.laurent@institut.fr', '0634567890', 
         'Esthéticienne Chief', ARRAY['Soin visage', 'Manucure', 'Pédicure'], true, true);
        
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Institut Harmony - Marie Laurent'), 
         'Chloé', 'Rousseau', 'chloe.marie@institut-harmony.fr', '0632556677', 
         'Esthéticienne', ARRAY['Manucure', 'Épilation'], true, true);
        
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Institut Harmony - Marie Laurent'), 
         'Léa', 'Garnier', 'lea.marie@institut-harmony.fr', '0633667788', 
         'Esthéticienne', ARRAY['Pédicure', 'Soin visage'], true, true);
        
        -- Employés pour Nails Studio (Julie)
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Nails Studio - Julie Moreau'), 
         'Julie', 'Moreau', 'julie.moreau@nails-bar.fr', '0645678901', 
         'Prothésiste Ongulaire', ARRAY['Nail art', 'Vernis semi-permanent', 'Pose ongles'], true, true);
        
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Nails Studio - Julie Moreau'), 
         'Camille', 'Blanc', 'camille.julie@nails-studio.fr', '0644778899', 
         'Prothésiste', ARRAY['Manucure', 'Vernis semi-permanent'], true, true);
        
        -- Employés pour Maison Thomas (Thomas)
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Maison Thomas - Coiffure d''Exception'), 
         'Thomas', 'Bernard', 'thomas.bernard@salon-luxe.fr', '0656789012', 
         'Directeur Artistique', ARRAY['Coupe sur-mesure', 'Coloration expert', 'Balayage'], true, true);
        
        INSERT INTO staff_members (establishment_id, first_name, last_name, email, phone, title, specialties, is_active, can_book_online) VALUES
        ((SELECT id FROM establishments WHERE name = 'Maison Thomas - Coiffure d''Exception'), 
         'Alexandre', 'Fournier', 'alexandre.thomas@maison-thomas.fr', '0655998877', 
         'Coiffeur Expert', ARRAY['Coupe homme', 'Soin capillaire'], true, true);
    END IF;
END $$;

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;

-- Vérification finale
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== RÉCAPITULATIF FINAL ===';
END $$;

SELECT 
  p.email,
  p.full_name,
  p.user_type,
  e.name as establishment_name,
  e.category,
  COUNT(DISTINCT s.id) as nb_services,
  COUNT(DISTINCT sm.id) as nb_staff
FROM profiles p
LEFT JOIN establishments e ON p.id = e.owner_id
LEFT JOIN services s ON e.id = s.establishment_id
LEFT JOIN staff_members sm ON e.id = sm.establishment_id
WHERE p.user_type = 'professional'
AND p.email IN (
  'sophie.martin@salon-beaute.fr',
  'pierre.durand@barbershop.fr', 
  'marie.laurent@institut.fr',
  'julie.moreau@nails-bar.fr',
  'thomas.bernard@salon-luxe.fr'
)
GROUP BY p.email, p.full_name, p.user_type, e.name, e.category
ORDER BY p.full_name;

-- Message final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CRÉATION TERMINÉE AVEC SUCCÈS ! ===';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 MOT DE PASSE UNIVERSEL: demo123';
    RAISE NOTICE '';
    RAISE NOTICE '👩‍💼 COMPTES PROFESSIONNELS AVEC ÉTABLISSEMENTS COMPLETS:';
    RAISE NOTICE '  5 pros → 5 établissements → 25 services → 12 employés';
    RAISE NOTICE '';
    RAISE NOTICE '👩 COMPTES CLIENTS: 5 comptes prêts à réserver';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Tous les comptes sont prêts à être utilisés !';
END $$;
