-- SCRIPT DE VÉRIFICATION DES COMPTES CRÉÉS
-- Affiche tous les comptes par type

DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES COMPTES DANS LA BASE DE DONNÉES ===';
END $$;

-- Compter les comptes par type
SELECT 
    user_type,
    COUNT(*) as nombre_comptes,
    STRING_AGG(full_name, ', ' ORDER BY full_name) as utilisateurs
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
GROUP BY user_type
ORDER BY user_type;

-- Afficher tous les profils créés
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== DÉTAIL DE TOUS LES PROFILS CRÉÉS ===';
END $$;

SELECT 
    email,
    full_name,
    user_type,
    CASE 
        WHEN user_type = 'professional' THEN '👩‍💼 PROFESSIONNEL'
        WHEN user_type = 'client' THEN '👩 CLIENT'
        ELSE '❓ INCONNU'
    END as type_affiche,
    created_at as "créé le"
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
ORDER BY user_type, full_name;

-- Vérifier aussi dans auth.users
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VÉRIFICATION DANS auth.users ===';
END $$;

SELECT 
    u.email,
    u.created_at as "créé dans auth",
    p.user_type,
    p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN (
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
ORDER BY p.user_type, u.email;
