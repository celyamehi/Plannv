-- Script pour créer les staff members en vérifiant que les établissements existent

-- D'abord, vérifier et afficher les établissements existants
DO $$
BEGIN
    RAISE NOTICE 'Vérification des établissements existants...';
    PERFORM 1; -- Just pour afficher le message
END $$;

SELECT id, name, category FROM establishments ORDER BY created_at;

-- Vérifier si les établissements nécessaires existent
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM establishments WHERE name = 'Salon de Beauté Prestige') THEN
        RAISE NOTICE 'ATTENTION: L établissement "Salon de Beauté Prestige" n existe pas';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM establishments WHERE name = 'BarberShop Homme') THEN
        RAISE NOTICE 'ATTENTION: L établissement "BarberShop Homme" n existe pas';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM establishments WHERE name = 'Institut Marie Laurent') THEN
        RAISE NOTICE 'ATTENTION: L établissement "Institut Marie Laurent" n existe pas';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM establishments WHERE name = 'Nails & Beauty Center') THEN
        RAISE NOTICE 'ATTENTION: L établissement "Nails & Beauty Center" n existe pas';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM establishments WHERE name = 'Salon de Coiffure Luxe') THEN
        RAISE NOTICE 'ATTENTION: L établissement "Salon de Coiffure Luxe" n existe pas';
    END IF;
END $$;

-- Créer les staff members seulement si les établissements existent
DO $$
BEGIN
    -- Vérifier si la colonne profile_id existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'staff_members' 
        AND column_name = 'profile_id'
    ) THEN
        RAISE NOTICE 'Création des staff members avec profile_id';
        
        -- Insert avec profile_id et vérification des établissements
        INSERT INTO staff_members (id, establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            e.id,
            p.id,
            'Sophie',
            'Martin',
            'sophie.martin@salon-beaute.fr',
            '06 12 34 56 01',
            'Coiffeuse Senior',
            ARRAY['Coupe femme', 'Coloration', 'Mèches', 'Balayage', 'Brushing'],
            NOW()
        FROM establishments e, profiles p 
        WHERE e.name = 'Salon de Beauté Prestige' 
        AND p.email = 'sophie.martin@salon-beaute.fr'
        LIMIT 1;
        
        INSERT INTO staff_members (id, establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            e.id,
            p.id,
            'Pierre',
            'Durand',
            'pierre.durand@barbershop.fr',
            '06 12 34 56 02',
            'Barbier',
            ARRAY['Coupe homme', 'Barbe', 'Shampoing'],
            NOW()
        FROM establishments e, profiles p 
        WHERE e.name = 'BarberShop Homme' 
        AND p.email = 'pierre.durand@barbershop.fr'
        LIMIT 1;
        
        INSERT INTO staff_members (id, establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            e.id,
            p.id,
            'Marie',
            'Laurent',
            'marie.laurent@institut.fr',
            '06 12 34 56 03',
            'Esthéticienne',
            ARRAY['Soin visage', 'Soin cheveux', 'Massage'],
            NOW()
        FROM establishments e, profiles p 
        WHERE e.name = 'Institut Marie Laurent' 
        AND p.email = 'marie.laurent@institut.fr'
        LIMIT 1;
        
        INSERT INTO staff_members (id, establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            e.id,
            p.id,
            'Julie',
            'Moreau',
            'julie.moreau@nails-bar.fr',
            '06 12 34 56 04',
            'Prothésiste Ongulaire',
            ARRAY['Manucure', 'Pédicure', 'Vernis semi-permanent'],
            NOW()
        FROM establishments e, profiles p 
        WHERE e.name = 'Nails & Beauty Center' 
        AND p.email = 'julie.moreau@nails-bar.fr'
        LIMIT 1;
        
        INSERT INTO staff_members (id, establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            e.id,
            p.id,
            'Thomas',
            'Bernard',
            'thomas.bernard@salon-luxe.fr',
            '06 12 34 56 05',
            'Directeur Artistique',
            ARRAY['Coupe femme', 'Coupe homme', 'Coloration expert', 'Coiffage'],
            NOW()
        FROM establishments e, profiles p 
        WHERE e.name = 'Salon de Coiffure Luxe' 
        AND p.email = 'thomas.bernard@salon-luxe.fr'
        LIMIT 1;
        
    ELSE
        RAISE NOTICE 'Création des staff members sans profile_id';
        
        -- Insert sans profile_id et vérification des établissements
        INSERT INTO staff_members (id, establishment_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            e.id,
            'Sophie',
            'Martin',
            'sophie.martin@salon-beaute.fr',
            '06 12 34 56 01',
            'Coiffeuse Senior',
            ARRAY['Coupe femme', 'Coloration', 'Mèches', 'Balayage', 'Brushing'],
            NOW()
        FROM establishments e 
        WHERE e.name = 'Salon de Beauté Prestige'
        LIMIT 1;
        
        INSERT INTO staff_members (id, establishment_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            e.id,
            'Pierre',
            'Durand',
            'pierre.durand@barbershop.fr',
            '06 12 34 56 02',
            'Barbier',
            ARRAY['Coupe homme', 'Barbe', 'Shampoing'],
            NOW()
        FROM establishments e 
        WHERE e.name = 'BarberShop Homme'
        LIMIT 1;
        
        INSERT INTO staff_members (id, establishment_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            e.id,
            'Marie',
            'Laurent',
            'marie.laurent@institut.fr',
            '06 12 34 56 03',
            'Esthéticienne',
            ARRAY['Soin visage', 'Soin cheveux', 'Massage'],
            NOW()
        FROM establishments e 
        WHERE e.name = 'Institut Marie Laurent'
        LIMIT 1;
        
        INSERT INTO staff_members (id, establishment_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            e.id,
            'Julie',
            'Moreau',
            'julie.moreau@nails-bar.fr',
            '06 12 34 56 04',
            'Prothésiste Ongulaire',
            ARRAY['Manucure', 'Pédicure', 'Vernis semi-permanent'],
            NOW()
        FROM establishments e 
        WHERE e.name = 'Nails & Beauty Center'
        LIMIT 1;
        
        INSERT INTO staff_members (id, establishment_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            e.id,
            'Thomas',
            'Bernard',
            'thomas.bernard@salon-luxe.fr',
            '06 12 34 56 05',
            'Directeur Artistique',
            ARRAY['Coupe femme', 'Coupe homme', 'Coloration expert', 'Coiffage'],
            NOW()
        FROM establishments e 
        WHERE e.name = 'Salon de Coiffure Luxe'
        LIMIT 1;
    END IF;
END $$;

-- Afficher les staff members créés
SELECT id, first_name, last_name, title, email, establishment_id FROM staff_members ORDER BY created_at DESC LIMIT 5;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Staff members créés avec succès !';
    RAISE NOTICE 'Vérifiez que tous les establishment_id sont bien remplis';
END $$;
