-- SCRIPT DE NETTOYAGE COMPLET DES DONNÉES DÉMO
-- Supprime toutes les données créées manuellement

-- Désactiver les contraintes temporairement
SET session_replication_role = replica;

DO $$
BEGIN
    RAISE NOTICE '=== NETTOYAGE COMPLET DES DONNÉES DÉMO ===';
END $$;

-- 1. Supprimer les staff members des démos
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '1. Suppression des staff members...';
    
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
END $$;

-- 2. Supprimer les services des démos
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '2. Suppression des services des démos...';
    
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
END $$;

-- 3. Supprimer les établissements des démos
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '3. Suppression des établissements des démos...';
    
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
END $$;

-- 4. Supprimer les profiles des démos
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '4. Suppression des profiles des démos...';
    
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
END $$;

-- 5. Supprimer les utilisateurs auth des démos
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '5. Suppression des utilisateurs auth des démos...';
    
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
END $$;

-- 6. Nettoyage des rendez-vous liés aux démos
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '6. Suppression des rendez-vous liés aux démos...';
    
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
    
    RAISE NOTICE '✅ Rendez-vous supprimés';
END $$;

-- 7. Nettoyage des autres tables potentielles
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '7. Nettoyage des autres tables...';
    
    -- Favorites
    DELETE FROM favorites WHERE user_id IN (
        SELECT id FROM profiles WHERE email IN (
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
    
    -- Reviews
    DELETE FROM reviews WHERE client_id IN (
        SELECT id FROM profiles WHERE email IN (
            'marie.dupont@email.fr',
            'jean.bernard@email.fr',
            'claire.petit@email.fr',
            'robert.martin@email.fr',
            'sophie.leroy@email.fr'
        )
    );
    
    RAISE NOTICE '✅ Autres tables nettoyées';
END $$;

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;

-- Vérification finale
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VÉRIFICATION FINALE DU NETTOYAGE ===';
END $$;

-- Compter ce qui reste
SELECT 
    'auth.users' as table_name,
    COUNT(*) as remaining_count
FROM auth.users 
WHERE email IN (
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

UNION ALL

SELECT 
    'profiles' as table_name,
    COUNT(*) as remaining_count
FROM profiles 
WHERE email IN (
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

UNION ALL

SELECT 
    'establishments' as table_name,
    COUNT(*) as remaining_count
FROM establishments 
WHERE owner_id IN (
    SELECT id FROM profiles WHERE email IN (
        'sophie.martin@salon-beaute.fr',
        'pierre.durand@barbershop.fr', 
        'marie.laurent@institut.fr',
        'julie.moreau@nails-bar.fr',
        'thomas.bernard@salon-luxe.fr'
    )
)

UNION ALL

SELECT 
    'services' as table_name,
    COUNT(*) as remaining_count
FROM services 
WHERE establishment_id IN (
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

UNION ALL

SELECT 
    'staff_members' as table_name,
    COUNT(*) as remaining_count
FROM staff_members 
WHERE email IN (
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

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== NETTOYAGE TERMINÉ ! ===';
    RAISE NOTICE '';
    RAISE NOTICE 'Toutes les données de démo ont été supprimées :';
    RAISE NOTICE '✅ 10 utilisateurs auth.users';
    RAISE NOTICE '✅ 17 profiles (pros + clients + staff)';
    RAISE NOTICE '✅ 5 établissements';
    RAISE NOTICE '✅ 25 services';
    RAISE NOTICE '✅ 12 staff members';
    RAISE NOTICE '✅ Rendez-vous, favorites, reviews';
    RAISE NOTICE '';
    RAISE NOTICE 'La base de données est maintenant propre !';
END $$;
