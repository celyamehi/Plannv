-- Supprimer les profils existants et en recréer avec des IDs générés aléatoirement

-- Étape 1: Supprimer tous les profils de test existants
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

-- Étape 2: Désactiver la contrainte si elle existe
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Étape 3: Recréer les profils avec des UUID générés automatiquement
-- Profils Professionnels
INSERT INTO profiles (id, email, full_name, phone, user_type, created_at) VALUES
(
  gen_random_uuid(),
  'sophie.martin@salon-beaute.fr',
  'Sophie Martin',
  '06 12 34 56 01',
  'professional',
  NOW()
),
(
  gen_random_uuid(),
  'pierre.durand@barbershop.fr',
  'Pierre Durand',
  '06 12 34 56 02',
  'professional',
  NOW()
),
(
  gen_random_uuid(),
  'marie.laurent@institut.fr',
  'Marie Laurent',
  '06 12 34 56 03',
  'professional',
  NOW()
),
(
  gen_random_uuid(),
  'julie.moreau@nails-bar.fr',
  'Julie Moreau',
  '06 12 34 56 04',
  'professional',
  NOW()
),
(
  gen_random_uuid(),
  'thomas.bernard@salon-luxe.fr',
  'Thomas Bernard',
  '06 12 34 56 05',
  'professional',
  NOW()
);

-- Profils Clients
INSERT INTO profiles (id, email, full_name, phone, user_type, created_at) VALUES
(
  gen_random_uuid(),
  'marie.dupont@email.fr',
  'Marie Dupont',
  '06 23 45 67 01',
  'client',
  NOW()
),
(
  gen_random_uuid(),
  'jean.bernard@email.fr',
  'Jean Bernard',
  '06 23 45 67 02',
  'client',
  NOW()
),
(
  gen_random_uuid(),
  'claire.petit@email.fr',
  'Claire Petit',
  '06 23 45 67 03',
  'client',
  NOW()
),
(
  gen_random_uuid(),
  'robert.martin@email.fr',
  'Robert Martin',
  '06 23 45 67 04',
  'client',
  NOW()
),
(
  gen_random_uuid(),
  'sophie.leroy@email.fr',
  'Sophie Leroy',
  '06 23 45 67 05',
  'client',
  NOW()
);

-- Afficher les profils créés pour vérification
SELECT id, email, full_name, user_type FROM profiles WHERE email IN (
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
) ORDER BY user_type, full_name;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Profils créés avec succès !';
  RAISE NOTICE 'Tous les IDs sont générés aléatoirement pour éviter les conflits';
  RAISE NOTICE 'Mot de passe pour tous les comptes: demo123';
END $$;
