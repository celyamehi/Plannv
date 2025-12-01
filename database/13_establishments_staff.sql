-- Établissements pour les professionnels
INSERT INTO establishments (id, owner_id, name, slug, category, address, city, postal_code, country, phone, email, created_at) VALUES
(
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'sophie.martin@salon-beaute.fr' LIMIT 1),
  'Salon de Beauté Prestige',
  'salon-beaute-prestige',
  'coiffeur',
  '123 Avenue des Champs-Élysées',
  'Paris',
  '75008',
  'France',
  '01 23 45 67 01',
  'contact@prestige-paris.fr',
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'pierre.durand@barbershop.fr' LIMIT 1),
  'BarberShop Homme',
  'barbershop-homme',
  'barbier',
  '45 Rue de la Victoire',
  'Paris',
  '75009',
  'France',
  '01 23 45 67 02',
  'info@barbershop-paris.fr',
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'marie.laurent@institut.fr' LIMIT 1),
  'Institut Marie Laurent',
  'institut-marie-laurent',
  'esthetique',
  '78 Avenue Montaigne',
  'Paris',
  '75008',
  'France',
  '01 23 45 67 03',
  'contact@institut-marie.fr',
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'julie.moreau@nails-bar.fr' LIMIT 1),
  'Nails & Beauty Center',
  'nails-beauty-center',
  'esthetique',
  '56 Rue Rivoli',
  'Paris',
  '75004',
  'France',
  '01 23 45 67 04',
  'hello@nails-center.fr',
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'thomas.bernard@salon-luxe.fr' LIMIT 1),
  'Salon de Coiffure Luxe',
  'salon-coiffure-luxe',
  'coiffeur',
  '89 Boulevard Saint-Germain',
  'Paris',
  '75006',
  'France',
  '01 23 45 67 05',
  'reservation@salon-luxe.fr',
  NOW()
);

-- Association des professionnels à leurs établissements
-- Note: Ces requêtes devront être adaptées avec les vrais IDs générés
-- Pour l'instant, utilisons des IDs fictifs pour la structure

-- Staff members pour chaque établissement
INSERT INTO staff_members (id, establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, created_at) VALUES
-- Salon Prestige - Sophie Martin
(
  gen_random_uuid(),
  (SELECT id FROM establishments WHERE name = 'Salon de Beauté Prestige' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'sophie.martin@salon-beaute.fr' LIMIT 1),
  'Sophie',
  'Martin',
  'sophie.martin@salon-beaute.fr',
  '06 12 34 56 01',
  'Coiffeuse Senior',
  ARRAY['Coupe femme', 'Coloration', 'Mèches', 'Balayage', 'Brushing'],
  NOW()
),
-- BarberShop - Pierre Durand
(
  gen_random_uuid(),
  (SELECT id FROM establishments WHERE name = 'BarberShop Homme' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'pierre.durand@barbershop.fr' LIMIT 1),
  'Pierre',
  'Durand',
  'pierre.durand@barbershop.fr',
  '06 12 34 56 02',
  'Barbier',
  ARRAY['Coupe homme', 'Barbe', 'Shampoing'],
  NOW()
),
-- Institut Marie - Marie Laurent
(
  gen_random_uuid(),
  (SELECT id FROM establishments WHERE name = 'Institut Marie Laurent' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'marie.laurent@institut.fr' LIMIT 1),
  'Marie',
  'Laurent',
  'marie.laurent@institut.fr',
  '06 12 34 56 03',
  'Esthéticienne',
  ARRAY['Soin visage', 'Soin cheveux', 'Massage'],
  NOW()
),
-- Nails Center - Julie Moreau
(
  gen_random_uuid(),
  (SELECT id FROM establishments WHERE name = 'Nails & Beauty Center' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'julie.moreau@nails-bar.fr' LIMIT 1),
  'Julie',
  'Moreau',
  'julie.moreau@nails-bar.fr',
  '06 12 34 56 04',
  'Prothésiste Ongulaire',
  ARRAY['Manucure', 'Pédicure', 'Vernis semi-permanent'],
  NOW()
),
-- Salon Luxe - Thomas Bernard
(
  gen_random_uuid(),
  (SELECT id FROM establishments WHERE name = 'Salon de Coiffure Luxe' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'thomas.bernard@salon-luxe.fr' LIMIT 1),
  'Thomas',
  'Bernard',
  'thomas.bernard@salon-luxe.fr',
  '06 12 34 56 05',
  'Directeur Artistique',
  ARRAY['Coupe femme', 'Coupe homme', 'Coloration expert', 'Coiffage'],
  NOW()
);
