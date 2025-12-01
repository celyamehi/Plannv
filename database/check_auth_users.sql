-- SCRIPT DE VÉRIFICATION ET CORRECTION DES UTILISATEURS AUTH
-- Problème: "Database error querying schema" dans auth.users

DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES UTILISATEURS DANS auth.users ===';
END $$;

-- Vérifier si les utilisateurs existent dans auth.users
SELECT 
    email,
    id,
    created_at,
    email_confirmed_at,
    last_sign_in_at
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
ORDER BY email;

-- Vérifier la correspondance avec profiles
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VÉRIFICATION CORRESPONDANCE auth.users ↔ profiles ===';
END $$;

SELECT 
    u.email as "auth.email",
    u.id as "auth.id",
    p.email as "profile.email", 
    p.id as "profile.id",
    p.user_type,
    CASE 
        WHEN u.id = p.id THEN '✅ OK'
        ELSE '❌ DIFFÉRENT'
    END as "correspondance"
FROM auth.users u
FULL OUTER JOIN profiles p ON u.id = p.id
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
) OR p.email IN (
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
ORDER BY u.email, p.email;
