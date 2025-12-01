-- Rendez-vous exemples pour les profils créés

-- Services disponibles
INSERT INTO services (id, establishment_id, name, description, duration, price, category, created_at) VALUES
-- Services pour Salon Prestige
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'Salon de Beauté Prestige' LIMIT 1), 'Coupe femme', 'Coupe et coiffage femme', 45, 45, 'Coupe', NOW()),
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'Salon de Beauté Prestige' LIMIT 1), 'Coloration', 'Coloration complète', 120, 80, 'Coloration', NOW()),
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'Salon de Beauté Prestige' LIMIT 1), 'Mèches', 'Mèches highlight', 90, 65, 'Coloration', NOW()),
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'Salon de Beauté Prestige' LIMIT 1), 'Brushing', 'Brushing et coiffage', 30, 30, 'Shampoing', NOW()),

-- Services pour BarberShop
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'BarberShop Homme' LIMIT 1), 'Coupe homme', 'Coupe homme traditionnelle', 30, 35, 'Coupe', NOW()),
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'BarberShop Homme' LIMIT 1), 'Barbe', 'Taille et entretien barbe', 30, 25, 'Coupe', NOW()),
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'BarberShop Homme' LIMIT 1), 'Shampoing', 'Shampoing et coiffage homme', 20, 20, 'Shampoing', NOW()),

-- Services pour Institut Marie
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'Institut Marie Laurent' LIMIT 1), 'Soin visage', 'Soin visage hydratant', 60, 60, 'Soin', NOW()),
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'Institut Marie Laurent' LIMIT 1), 'Soin cheveux', 'Soin cheveux profond', 45, 40, 'Soin', NOW()),
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'Institut Marie Laurent' LIMIT 1), 'Massage', 'Massage relaxant', 60, 70, 'Soin', NOW()),

-- Services pour Nails Center
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'Nails & Beauty Center' LIMIT 1), 'Manucure', 'Manucure classique', 60, 40, 'Beauté', NOW()),
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'Nails & Beauty Center' LIMIT 1), 'Pédicure', 'Pédicure complète', 45, 35, 'Beauté', NOW()),
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'Nails & Beauty Center' LIMIT 1), 'Vernis semi-permanent', 'Pose vernis semi-permanent', 45, 30, 'Beauté', NOW()),

-- Services pour Salon Luxe
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'Salon de Coiffure Luxe' LIMIT 1), 'Coupe luxe femme', 'Coupe femme haut de gamme', 60, 65, 'Coupe', NOW()),
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'Salon de Coiffure Luxe' LIMIT 1), 'Coupe luxe homme', 'Coupe homme premium', 45, 50, 'Coupe', NOW()),
(gen_random_uuid(), (SELECT id FROM establishments WHERE name = 'Salon de Coiffure Luxe' LIMIT 1), 'Coloration expert', 'Coloration expert personnalisée', 150, 120, 'Coloration', NOW());

-- Rendez-vous exemples
INSERT INTO appointments (id, client_id, staff_id, service_id, establishment_id, appointment_date, start_time, end_time, status, notes, price, created_at) VALUES
-- Rendez-vous pour Marie Dupont (Sophie Martin - Salon Prestige)
(
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'marie.dupont@email.fr' LIMIT 1),
  (SELECT id FROM staff_members WHERE name = 'Sophie Martin' LIMIT 1),
  (SELECT id FROM services WHERE name = 'Coupe femme' AND establishment_id = (SELECT id FROM establishments WHERE name = 'Salon de Beauté Prestige' LIMIT 1) LIMIT 1),
  (SELECT id FROM establishments WHERE name = 'Salon de Beauté Prestige' LIMIT 1),
  CURRENT_DATE,
  '09:00',
  '09:45',
  'confirmed',
  'Client fidèle, préfère les coupes modernes',
  45,
  NOW()
),

-- Rendez-vous pour Jean Bernard (Pierre Durand - BarberShop)
(
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'jean.bernard@email.fr' LIMIT 1),
  (SELECT id FROM staff_members WHERE name = 'Pierre Durand' LIMIT 1),
  (SELECT id FROM services WHERE name = 'Barbe' AND establishment_id = (SELECT id FROM establishments WHERE name = 'BarberShop Homme' LIMIT 1) LIMIT 1),
  (SELECT id FROM establishments WHERE name = 'BarberShop Homme' LIMIT 1),
  CURRENT_DATE,
  '10:30',
  '11:00',
  'confirmed',
  'Entretien barbe toutes les 2 semaines',
  25,
  NOW()
),

-- Rendez-vous pour Claire Petit (Marie Laurent - Institut Marie)
(
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'claire.petit@email.fr' LIMIT 1),
  (SELECT id FROM staff_members WHERE name = 'Marie Laurent' LIMIT 1),
  (SELECT id FROM services WHERE name = 'Soin visage' AND establishment_id = (SELECT id FROM establishments WHERE name = 'Institut Marie Laurent' LIMIT 1) LIMIT 1),
  (SELECT id FROM establishments WHERE name = 'Institut Marie Laurent' LIMIT 1),
  CURRENT_DATE,
  '14:00',
  '15:00',
  'confirmed',
  'Peau sensible, utiliser des produits hypoallergéniques',
  60,
  NOW()
),

-- Rendez-vous pour Robert Martin (Pierre Durand - BarberShop)
(
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'robert.martin@email.fr' LIMIT 1),
  (SELECT id FROM staff_members WHERE name = 'Pierre Durand' LIMIT 1),
  (SELECT id FROM services WHERE name = 'Coupe homme' AND establishment_id = (SELECT id FROM establishments WHERE name = 'BarberShop Homme' LIMIT 1) LIMIT 1),
  (SELECT id FROM establishments WHERE name = 'BarberShop Homme' LIMIT 1),
  CURRENT_DATE,
  '11:00',
  '11:30',
  'pending',
  'Nouveau client',
  35,
  NOW()
),

-- Rendez-vous pour Sophie Leroy (Julie Moreau - Nails Center)
(
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'sophie.leroy@email.fr' LIMIT 1),
  (SELECT id FROM staff_members WHERE name = 'Julie Moreau' LIMIT 1),
  (SELECT id FROM services WHERE name = 'Manucure' AND establishment_id = (SELECT id FROM establishments WHERE name = 'Nails & Beauty Center' LIMIT 1) LIMIT 1),
  (SELECT id FROM establishments WHERE name = 'Nails & Beauty Center' LIMIT 1),
  CURRENT_DATE,
  '15:00',
  '16:00',
  'confirmed',
  'Préfère les couleurs nude',
  40,
  NOW()
);
