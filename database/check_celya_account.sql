-- SCRIPT POUR VÉRIFIER LE COMPTE CELYA ET LES DOUBLONS

DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION COMPTE CELYA ===';
END $$;

-- Vérifier tous les profils avec l'email celya@gmail.com
SELECT 
    id,
    email,
    full_name,
    user_type,
    created_at,
    updated_at
FROM profiles 
WHERE email = 'celya@gmail.com'
ORDER BY created_at DESC;

-- Vérifier s'il y a des doublons dans auth.users
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'celya@gmail.com'
ORDER BY created_at DESC;

-- Compter les profils par email pour voir les doublons
SELECT 
    email,
    COUNT(*) as "nombre_profils",
    STRING_AGG(user_type, ', ' ORDER BY created_at) as "types"
FROM profiles 
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY email;
