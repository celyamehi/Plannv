-- Script pour créer les staff members en utilisant les établissements existants
-- Ce script utilise tes établissements déjà créés manuellement

-- D'abord, afficher les établissements existants pour voir ce qu'on a
DO $$
BEGIN
    RAISE NOTICE '=== ÉTABLISSEMENTS EXISTANTS ===';
END $$;

SELECT id, name, category, owner_id FROM establishments ORDER BY created_at;

-- Créer les staff members en utilisant le premier établissement disponible pour chaque professionnel
-- On va associer chaque professionnel à son propre établissement (s'il existe)

DO $$
BEGIN
    RAISE NOTICE 'Création des staff members avec les établissements existants...';
    
    -- Vérifier si la colonne profile_id existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'staff_members' 
        AND column_name = 'profile_id'
    ) THEN
        RAISE NOTICE 'Utilisation de la structure avec profile_id';
        
        -- Créer Sophie Martin avec son établissement (si exists)
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
        FROM profiles p
        LEFT JOIN establishments e ON e.owner_id = p.id OR e.name LIKE '%Sophie%' OR e.name LIKE '%Prestige%'
        WHERE p.email = 'sophie.martin@salon-beaute.fr'
        LIMIT 1;
        
        -- Créer Pierre Durand avec son établissement
        INSERT INTO staff_members (id, establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            COALESCE(e.id, (SELECT id FROM establishments LIMIT 1)), -- Utiliser le premier établissement si le sien n'existe pas
            p.id,
            'Pierre',
            'Durand',
            'pierre.durand@barbershop.fr',
            '06 12 34 56 02',
            'Barbier',
            ARRAY['Coupe homme', 'Barbe', 'Shampoing'],
            NOW()
        FROM profiles p
        LEFT JOIN establishments e ON e.owner_id = p.id OR e.name LIKE '%Pierre%' OR e.name LIKE '%Barber%'
        WHERE p.email = 'pierre.durand@barbershop.fr'
        LIMIT 1;
        
        -- Créer Marie Laurent avec son établissement
        INSERT INTO staff_members (id, establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            COALESCE(e.id, (SELECT id FROM establishments LIMIT 1)),
            p.id,
            'Marie',
            'Laurent',
            'marie.laurent@institut.fr',
            '06 12 34 56 03',
            'Esthéticienne',
            ARRAY['Soin visage', 'Soin cheveux', 'Massage'],
            NOW()
        FROM profiles p
        LEFT JOIN establishments e ON e.owner_id = p.id OR e.name LIKE '%Marie%' OR e.name LIKE '%Institut%'
        WHERE p.email = 'marie.laurent@institut.fr'
        LIMIT 1;
        
        -- Créer Julie Moreau avec son établissement
        INSERT INTO staff_members (id, establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            COALESCE(e.id, (SELECT id FROM establishments LIMIT 1)),
            p.id,
            'Julie',
            'Moreau',
            'julie.moreau@nails-bar.fr',
            '06 12 34 56 04',
            'Prothésiste Ongulaire',
            ARRAY['Manucure', 'Pédicure', 'Vernis semi-permanent'],
            NOW()
        FROM profiles p
        LEFT JOIN establishments e ON e.owner_id = p.id OR e.name LIKE '%Julie%' OR e.name LIKE '%Nails%'
        WHERE p.email = 'julie.moreau@nails-bar.fr'
        LIMIT 1;
        
        -- Créer Thomas Bernard avec son établissement
        INSERT INTO staff_members (id, establishment_id, profile_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            COALESCE(e.id, (SELECT id FROM establishments LIMIT 1)),
            p.id,
            'Thomas',
            'Bernard',
            'thomas.bernard@salon-luxe.fr',
            '06 12 34 56 05',
            'Directeur Artistique',
            ARRAY['Coupe femme', 'Coupe homme', 'Coloration expert', 'Coiffage'],
            NOW()
        FROM profiles p
        LEFT JOIN establishments e ON e.owner_id = p.id OR e.name LIKE '%Thomas%' OR e.name LIKE '%Luxe%'
        WHERE p.email = 'thomas.bernard@salon-luxe.fr'
        LIMIT 1;
        
    ELSE
        RAISE NOTICE 'Utilisation de la structure sans profile_id';
        
        -- Version sans profile_id
        INSERT INTO staff_members (id, establishment_id, first_name, last_name, email, phone, title, specialties, created_at)
        SELECT 
            gen_random_uuid(),
            COALESCE(e.id, (SELECT id FROM establishments LIMIT 1)),
            'Sophie',
            'Martin',
            'sophie.martin@salon-beaute.fr',
            '06 12 34 56 01',
            'Coiffeuse Senior',
            ARRAY['Coupe femme', 'Coloration', 'Mèches', 'Balayage', 'Brushing'],
            NOW()
        FROM establishments e
        WHERE e.name LIKE '%Sophie%' OR e.name LIKE '%Prestige%'
        LIMIT 1;
        
        -- Similaire pour les autres...
        INSERT INTO staff_members (id, establishment_id, first_name, last_name, email, phone, title, specialties, created_at)
        VALUES (
            gen_random_uuid(),
            (SELECT id FROM establishments LIMIT 1),
            'Pierre',
            'Durand',
            'pierre.durand@barbershop.fr',
            '06 12 34 56 02',
            'Barbier',
            ARRAY['Coupe homme', 'Barbe', 'Shampoing'],
            NOW()
        );
        
        INSERT INTO staff_members (id, establishment_id, first_name, last_name, email, phone, title, specialties, created_at)
        VALUES (
            gen_random_uuid(),
            (SELECT id FROM establishments LIMIT 1),
            'Marie',
            'Laurent',
            'marie.laurent@institut.fr',
            '06 12 34 56 03',
            'Esthéticienne',
            ARRAY['Soin visage', 'Soin cheveux', 'Massage'],
            NOW()
        );
        
        INSERT INTO staff_members (id, establishment_id, first_name, last_name, email, phone, title, specialties, created_at)
        VALUES (
            gen_random_uuid(),
            (SELECT id FROM establishments LIMIT 1),
            'Julie',
            'Moreau',
            'julie.moreau@nails-bar.fr',
            '06 12 34 56 04',
            'Prothésiste Ongulaire',
            ARRAY['Manucure', 'Pédicure', 'Vernis semi-permanent'],
            NOW()
        );
        
        INSERT INTO staff_members (id, establishment_id, first_name, last_name, email, phone, title, specialties, created_at)
        VALUES (
            gen_random_uuid(),
            (SELECT id FROM establishments LIMIT 1),
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
SELECT id, first_name, last_name, title, email, establishment_id FROM staff_members ORDER BY created_at DESC LIMIT 10;

-- Message final
DO $$
BEGIN
    RAISE NOTICE 'Staff members créés avec succès en utilisant les établissements existants !';
    RAISE NOTICE 'Vérifiez ci-dessus que les establishment_id sont bien assignés';
END $$;
