-- Supprimer les profils de test existants puis les recréer

-- Étape 1: Supprimer les profils existants par email
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

-- Étape 3: Recréer les profils avec des UUID uniques
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

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Anciens profils supprimés et nouveaux profils créés avec succès !';
  RAISE NOTICE '10 profils créés : 5 professionnels + 5 clients';
  RAISE NOTICE 'Mot de passe pour tous: demo123';
END $$;
