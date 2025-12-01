-- Création des utilisateurs dans auth.users d'abord
-- Note: En pratique, ces utilisateurs devraient être créés via Supabase Auth
-- Pour les tests, nous utilisons des IDs fixes et créons les profils manuellement

-- Profils Professionnels (avec des UUID fixes pour la cohérence)
INSERT INTO profiles (id, email, full_name, phone, user_type, created_at) VALUES
(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0001',
  'sophie.martin@salon-beaute.fr',
  'Sophie Martin',
  '06 12 34 56 01',
  'professional',
  NOW()
),
(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0002',
  'pierre.durand@barbershop.fr',
  'Pierre Durand',
  '06 12 34 56 02',
  'professional',
  NOW()
),
(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0003',
  'marie.laurent@institut.fr',
  'Marie Laurent',
  '06 12 34 56 03',
  'professional',
  NOW()
),
(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0004',
  'julie.moreau@nails-bar.fr',
  'Julie Moreau',
  '06 12 34 56 04',
  'professional',
  NOW()
),
(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0005',
  'thomas.bernard@salon-luxe.fr',
  'Thomas Bernard',
  '06 12 34 56 05',
  'professional',
  NOW()
);

-- Profils Clients (avec des UUID fixes pour la cohérence)
INSERT INTO profiles (id, email, full_name, phone, user_type, created_at) VALUES
(
  'bbbbbbbb-cccc-dddd-eeee-ffffffff0001',
  'marie.dupont@email.fr',
  'Marie Dupont',
  '06 23 45 67 01',
  'client',
  NOW()
),
(
  'bbbbbbbb-cccc-dddd-eeee-ffffffff0002',
  'jean.bernard@email.fr',
  'Jean Bernard',
  '06 23 45 67 02',
  'client',
  NOW()
),
(
  'bbbbbbbb-cccc-dddd-eeee-ffffffff0003',
  'claire.petit@email.fr',
  'Claire Petit',
  '06 23 45 67 03',
  'client',
  NOW()
),
(
  'bbbbbbbb-cccc-dddd-eeee-ffffffff0004',
  'robert.martin@email.fr',
  'Robert Martin',
  '06 23 45 67 04',
  'client',
  NOW()
),
(
  'bbbbbbbb-cccc-dddd-eeee-ffffffff0005',
  'sophie.leroy@email.fr',
  'Sophie Leroy',
  '06 23 45 67 05',
  'client',
  NOW()
);

-- Création des utilisateurs correspondants dans auth.users
-- Note: Ces requêtes nécessitent les droits appropriés ou doivent être faites via l'API Supabase
-- Pour l'instant, nous allons créer une fonction pour gérer cela

-- Fonction pour créer un utilisateur auth et son profil
CREATE OR REPLACE FUNCTION create_user_with_profile(
  user_email TEXT,
  user_full_name TEXT,
  user_phone TEXT,
  user_type TEXT,
  user_password TEXT DEFAULT 'demo123'
) RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (email, email_confirmed_at, phone, raw_user_meta_data, created_at)
  VALUES (
    user_email,
    NOW(),
    user_phone,
    jsonb_build_object('full_name', user_full_name, 'user_type', user_type),
    NOW()
  ) RETURNING id INTO user_id;
  
  -- Créer le profil correspondant
  INSERT INTO profiles (id, email, full_name, phone, user_type, created_at)
  VALUES (user_id, user_email, user_full_name, user_phone, user_type, NOW());
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative: Créer les profils sans contrainte temporairement
-- Si vous ne pouvez pas créer les utilisateurs auth directement, 
-- vous pouvez désactiver temporairement la contrainte

-- Pour désactiver la contrainte (temporaire pour les tests):
-- ALTER TABLE profiles DISABLE TRIGGER ALL;
-- ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;

-- Pour réactiver après la création des utilisateurs auth:
-- ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
--   FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
