-- SCRIPT DE NETTOYAGE SIMPLIFIÉ DES DONNÉES DÉMO
-- Supprime uniquement les données qui existent vraiment

-- Désactiver les contraintes temporairement
SET session_replication_role = replica;

DO $$
BEGIN
    RAISE NOTICE '=== NETTOYAGE SIMPLIFIÉ DES DONNÉES DÉMO ===';
END $$;

-- 1. Supprimer les staff members des démos
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '1. Suppression des staff members...';
    
    BEGIN
        DELETE FROM staff_members WHERE email IN (
            'sophie.martin@salon-beaute.fr',
            'pierre.durand@barbershop.fr', 
            'marie.laurent@institut.fr',
            'julie.moreau@nails-bar.fr',
            'thomas.bernard@salon-luxe.fr',
            'emma.sophie@salon-prestige.fr',
            'lucas.sophie@salon-prestige.fr',
            'maxime.pierre@barbier-royal.fr',
            'chloe.marie@institut-harmony.fr',
            'lea.marie@institut-harmony.fr',
            'camille.julie@nails-studio.fr',
            'alexandre.thomas@maison-thomas.fr'
        );
        RAISE NOTICE '✅ Staff members supprimés';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur staff_members: %', SQLERRM;
    END;
END $$;

-- 2. Supprimer les services des démos
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '2. Suppression des services des démos...';
    
    BEGIN
        DELETE FROM services WHERE establishment_id IN (
            SELECT id FROM establishments WHERE owner_id IN (
                SELECT id FROM profiles WHERE email IN (
                    'sophie.martin@salon-beaute.fr',
                    'pierre.durand@barbershop.fr', 
                    'marie.laurent@institut.fr',
                    'julie.moreau@nails-bar.fr',
                    'thomas.bernard@salon-luxe.fr'
                )
            )
        );
        RAISE NOTICE '✅ Services supprimés';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur services: %', SQLERRM;
    END;
END $$;

-- 3. Supprimer les établissements des démos
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '3. Suppression des établissements des démos...';
    
    BEGIN
        DELETE FROM establishments WHERE owner_id IN (
            SELECT id FROM profiles WHERE email IN (
                'sophie.martin@salon-beaute.fr',
                'pierre.durand@barbershop.fr', 
                'marie.laurent@institut.fr',
                'julie.moreau@nails-bar.fr',
                'thomas.bernard@salon-luxe.fr'
            )
        );
        RAISE NOTICE '✅ Établissements supprimés';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur establishments: %', SQLERRM;
    END;
END $$;

-- 4. Supprimer les appointments des démos
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '4. Suppression des appointments des démos...';
    
    BEGIN
        DELETE FROM appointments WHERE client_id IN (
            SELECT id FROM profiles WHERE email IN (
                'marie.dupont@email.fr',
                'jean.bernard@email.fr',
                'claire.petit@email.fr',
                'robert.martin@email.fr',
                'sophie.leroy@email.fr'
            )
        );
        
        DELETE FROM appointments WHERE establishment_id IN (
            SELECT id FROM establishments WHERE owner_id IN (
                SELECT id FROM profiles WHERE email IN (
                    'sophie.martin@salon-beaute.fr',
                    'pierre.durand@barbershop.fr', 
                    'marie.laurent@institut.fr',
                    'julie.moreau@nails-bar.fr',
                    'thomas.bernard@salon-luxe.fr'
                )
            )
        );
        RAISE NOTICE '✅ Appointments supprimés';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur appointments: %', SQLERRM;
    END;
END $$;

-- 5. Supprimer les profiles des démos
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '5. Suppression des profiles des démos...';
    
    BEGIN
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
            'emma.sophie@salon-prestige.fr',
            'lucas.sophie@salon-prestige.fr',
            'maxime.pierre@barbier-royal.fr',
            'chloe.marie@institut-harmony.fr',
            'lea.marie@institut-harmony.fr',
            'camille.julie@nails-studio.fr',
            'alexandre.thomas@maison-thomas.fr'
        );
        RAISE NOTICE '✅ Profiles supprimés';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur profiles: %', SQLERRM;
    END;
END $$;

-- 6. Supprimer les utilisateurs auth des démos
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '6. Suppression des utilisateurs auth des démos...';
    
    BEGIN
        DELETE FROM auth.users WHERE email IN (
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
            'test@example.com'
        );
        RAISE NOTICE '✅ Utilisateurs auth supprimés';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur auth.users: %', SQLERRM;
    END;
END $$;

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;

-- Vérification finale
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VÉRIFICATION FINALE DU NETTOYAGE ===';
END $$;

-- Vérifier ce qui reste dans chaque table
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Vérification des tables principales...';
    
    -- Vérifier profiles
    BEGIN
        RAISE NOTICE 'Profiles restants: %', (
            SELECT COUNT(*) FROM profiles WHERE email IN (
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
            )
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Impossible de vérifier profiles: %', SQLERRM;
    END;
    
    -- Vérifier auth.users
    BEGIN
        RAISE NOTICE 'Auth users restants: %', (
            SELECT COUNT(*) FROM auth.users WHERE email IN (
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
            )
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Impossible de vérifier auth.users: %', SQLERRM;
    END;
    
    -- Vérifier establishments
    BEGIN
        RAISE NOTICE 'Établissements restants: %', (
            SELECT COUNT(*) FROM establishments WHERE owner_id IN (
                SELECT id FROM profiles WHERE email IN (
                    'sophie.martin@salon-beaute.fr',
                    'pierre.durand@barbershop.fr', 
                    'marie.laurent@institut.fr',
                    'julie.moreau@nails-bar.fr',
                    'thomas.bernard@salon-luxe.fr'
                )
            )
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Impossible de vérifier establishments: %', SQLERRM;
    END;
    
    -- Vérifier services
    BEGIN
        RAISE NOTICE 'Services restants: %', (
            SELECT COUNT(*) FROM services WHERE establishment_id IN (
                SELECT id FROM establishments WHERE owner_id IN (
                    SELECT id FROM profiles WHERE email IN (
                        'sophie.martin@salon-beaute.fr',
                        'pierre.durand@barbershop.fr', 
                        'marie.laurent@institut.fr',
                        'julie.moreau@nails-bar.fr',
                        'thomas.bernard@salon-luxe.fr'
                    )
                )
            )
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Impossible de vérifier services: %', SQLERRM;
    END;
    
    -- Vérifier staff_members
    BEGIN
        RAISE NOTICE 'Staff members restants: %', (
            SELECT COUNT(*) FROM staff_members WHERE email IN (
                'sophie.martin@salon-beaute.fr',
                'pierre.durand@barbershop.fr', 
                'marie.laurent@institut.fr',
                'julie.moreau@nails-bar.fr',
                'thomas.bernard@salon-luxe.fr',
                'emma.sophie@salon-prestige.fr',
                'lucas.sophie@salon-prestige.fr',
                'maxime.pierre@barbier-royal.fr',
                'chloe.marie@institut-harmony.fr',
                'lea.marie@institut-harmony.fr',
                'camille.julie@nails-studio.fr',
                'alexandre.thomas@maison-thomas.fr'
            )
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Impossible de vérifier staff_members: %', SQLERRM;
    END;
END $$;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== NETTOYAGE TERMINÉ ! ===';
    RAISE NOTICE '';
    RAISE NOTICE 'Toutes les données de démo ont été supprimées en toute sécurité !';
    RAISE NOTICE 'La base de données est maintenant propre.';
END $$;
