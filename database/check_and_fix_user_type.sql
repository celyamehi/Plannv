-- SCRIPT DE VÉRIFICATION ET CORRECTION DU USER_TYPE

DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES PROFILS CRÉÉS ===';
END $$;

-- Afficher tous les profils récents
SELECT 
    id,
    email,
    full_name,
    user_type,
    created_at,
    CASE 
        WHEN user_type = 'client' THEN '👤 CLIENT'
        WHEN user_type = 'professional' THEN '💼 PROFESSIONNEL'
        ELSE '❓ AUTRE'
    END as "type_affiche"
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Compter par type
SELECT 
    user_type,
    COUNT(*) as "nombre"
FROM profiles
GROUP BY user_type;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CORRECTION SI NÉCESSAIRE ===';
    RAISE NOTICE 'Si un profil a le mauvais type, utilise:';
    RAISE NOTICE '';
    RAISE NOTICE 'UPDATE profiles SET user_type = ''professional'' WHERE email = ''ton-email@example.com'';';
    RAISE NOTICE '';
    RAISE NOTICE 'Exemple pour corriger le dernier profil créé:';
END $$;

-- Afficher la commande pour corriger le dernier profil créé
SELECT 
    'UPDATE profiles SET user_type = ''professional'' WHERE email = ''' || email || ''';' as "commande_correction"
FROM profiles
WHERE user_type = 'client'
ORDER BY created_at DESC
LIMIT 1;
