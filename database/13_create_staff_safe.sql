-- Script pour créer les staff members en vérifiant la structure de la table

-- Vérifier si la colonne profile_id existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'staff_members' 
        AND column_name = 'profile_id'
    ) THEN
        RAISE NOTICE 'La colonne profile_id existe, utilisation de la structure complète';
        
        -- Insert avec profile_id
        INSERT INTO staff_members (id, establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, created_at) VALUES
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
    ELSE
        RAISE NOTICE 'La colonne profile_id n existe pas, utilisation sans profile_id';
        
        -- Insert sans profile_id
        INSERT INTO staff_members (id, establishment_id, first_name, last_name, email, phone, title, specialties, created_at) VALUES
        (
          gen_random_uuid(),
          (SELECT id FROM establishments WHERE name = 'Salon de Beauté Prestige' LIMIT 1),
          'Sophie',
          'Martin',
          'sophie.martin@salon-beaute.fr',
          '06 12 34 56 01',
          'Coiffeuse Senior',
          ARRAY['Coupe femme', 'Coloration', 'Mèches', 'Balayage', 'Brushing'],
          NOW()
        ),
        (
          gen_random_uuid(),
          (SELECT id FROM establishments WHERE name = 'BarberShop Homme' LIMIT 1),
          'Pierre',
          'Durand',
          'pierre.durand@barbershop.fr',
          '06 12 34 56 02',
          'Barbier',
          ARRAY['Coupe homme', 'Barbe', 'Shampoing'],
          NOW()
        ),
        (
          gen_random_uuid(),
          (SELECT id FROM establishments WHERE name = 'Institut Marie Laurent' LIMIT 1),
          'Marie',
          'Laurent',
          'marie.laurent@institut.fr',
          '06 12 34 56 03',
          'Esthéticienne',
          ARRAY['Soin visage', 'Soin cheveux', 'Massage'],
          NOW()
        ),
        (
          gen_random_uuid(),
          (SELECT id FROM establishments WHERE name = 'Nails & Beauty Center' LIMIT 1),
          'Julie',
          'Moreau',
          'julie.moreau@nails-bar.fr',
          '06 12 34 56 04',
          'Prothésiste Ongulaire',
          ARRAY['Manucure', 'Pédicure', 'Vernis semi-permanent'],
          NOW()
        ),
        (
          gen_random_uuid(),
          (SELECT id FROM establishments WHERE name = 'Salon de Coiffure Luxe' LIMIT 1),
          'Thomas',
          'Bernard',
          'thomas.bernard@salon-luxe.fr',
          '06 12 34 56 05',
          'Directeur Artistique',
          ARRAY['Coupe femme', 'Coupe homme', 'Coloration expert', 'Coiffage'],
          NOW()
        );
    END IF;
END $$;

-- Afficher les staff members créés
SELECT id, first_name, last_name, title, email FROM staff_members ORDER BY created_at DESC LIMIT 5;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Staff members créés avec succès !';
END $$;
