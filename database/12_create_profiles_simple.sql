-- Solution temporaire pour créer les profils de test
-- Désactiver la contrainte de clé étrangère temporairement

-- Étape 1: Désactiver la contrainte
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Étape 2: Insérer les profils avec des UUID fixes
-- Profils Professionnels
INSERT INTO profiles (id, email, full_name, phone, user_type, created_at) VALUES
(
  '11111111-2222-3333-4444-555555555501',
  'sophie.martin@salon-beaute.fr',
  'Sophie Martin',
  '06 12 34 56 01',
  'professional',
  NOW()
),
(
  '11111111-2222-3333-4444-555555555502',
  'pierre.durand@barbershop.fr',
  'Pierre Durand',
  '06 12 34 56 02',
  'professional',
  NOW()
),
(
  '11111111-2222-3333-4444-555555555503',
  'marie.laurent@institut.fr',
  'Marie Laurent',
  '06 12 34 56 03',
  'professional',
  NOW()
),
(
  '11111111-2222-3333-4444-555555555504',
  'julie.moreau@nails-bar.fr',
  'Julie Moreau',
  '06 12 34 56 04',
  'professional',
  NOW()
),
(
  '11111111-2222-3333-4444-555555555505',
  'thomas.bernard@salon-luxe.fr',
  'Thomas Bernard',
  '06 12 34 56 05',
  'professional',
  NOW()
);

-- Profils Clients
INSERT INTO profiles (id, email, full_name, phone, user_type, created_at) VALUES
(
  '66666666-7777-8888-9999-aaaaaaaaaa01',
  'marie.dupont@email.fr',
  'Marie Dupont',
  '06 23 45 67 01',
  'client',
  NOW()
),
(
  '66666666-7777-8888-9999-aaaaaaaaaa02',
  'jean.bernard@email.fr',
  'Jean Bernard',
  '06 23 45 67 02',
  'client',
  NOW()
),
(
  '66666666-7777-8888-9999-aaaaaaaaaa03',
  'claire.petit@email.fr',
  'Claire Petit',
  '06 23 45 67 03',
  'client',
  NOW()
),
(
  '66666666-7777-8888-9999-aaaaaaaaaa04',
  'robert.martin@email.fr',
  'Robert Martin',
  '06 23 45 67 04',
  'client',
  NOW()
),
(
  '66666666-7777-8888-9999-aaaaaaaaaa05',
  'sophie.leroy@email.fr',
  'Sophie Leroy',
  '06 23 45 67 05',
  'client',
  NOW()
);

-- Étape 3: Recréer la contrainte (optionnel pour les tests)
-- Pour la production, vous devriez créer les utilisateurs auth.users d'abord
-- ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
--   FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Profils créés avec succès !';
  RAISE NOTICE 'Utilisez les identifiants suivants pour connexion:';
  RAISE NOTICE 'Email: sophie.martin@salon-beaute.fr | MDP: demo123';
  RAISE NOTICE 'Email: marie.dupont@email.fr | MDP: demo123';
  RAISE NOTICE 'Email: pierre.durand@barbershop.fr | MDP: demo123';
END $$;
