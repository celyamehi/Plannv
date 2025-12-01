-- SCRIPT DE VÉRIFICATION ET CORRECTION DES TYPES UTILISATEURS
-- Pour vérifier et corriger les user_type des comptes créés

DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION TYPES UTILISATEURS ===';
END $$;

-- Afficher tous les utilisateurs avec leur type
SELECT 
    email,
    full_name,
    user_type,
    created_at,
    CASE 
        WHEN user_type = 'professional' THEN '👩‍💼 PROFESSIONNEL'
        WHEN user_type = 'client' THEN '👩 CLIENT'
        WHEN user_type = 'admin' THEN '👑 ADMIN'
        ELSE '❓ INCONNU'
    END as "type_affiche"
FROM profiles 
ORDER BY user_type, email;

-- Compter par type
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== STATISTIQUES PAR TYPE ===';
END $$;

SELECT 
    user_type,
    COUNT(*) as "nombre",
    STRING_AGG(email, ', ' ORDER BY email) as "emails"
FROM profiles 
GROUP BY user_type
ORDER BY user_type;

-- Vérifier les établissements existants
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VÉRIFICATION ÉTABLISSEMENTS ===';
END $$;

SELECT 
    p.email as "email_proprietaire",
    p.full_name as "nom_proprietaire",
    p.user_type as "type_proprietaire",
    e.id as "establishment_id",
    e.name as "nom_etablissement",
    CASE 
        WHEN e.id IS NOT NULL THEN '✅ A un établissement'
        ELSE '❌ Pas d''établissement'
    END as "statut_etablissement"
FROM profiles p
LEFT JOIN establishments e ON p.id = e.owner_id
WHERE p.user_type = 'professional' OR e.id IS NOT NULL
ORDER BY p.email;

-- Script pour corriger un utilisateur spécifique si besoin
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CORRECTION DISPONIBLE ===';
    RAISE NOTICE 'Si un utilisateur a le mauvais type, utilisez:';
    RAISE NOTICE 'UPDATE profiles SET user_type = ''professional'' WHERE email = ''email@example.com'';';
END $$;
