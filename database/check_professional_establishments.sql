-- SCRIPT DE VÉRIFICATION DES ÉTABLISSEMENTS PROFESSIONNELS
-- Pour vérifier si les pros ont bien leurs établissements

DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION ÉTABLISSEMENTS PROFESSIONNELS ===';
END $$;

-- Vérifier les profiles professionnels et leurs établissements
SELECT 
    p.email as "email_pro",
    p.full_name as "nom_pro",
    p.id as "profile_id",
    e.id as "establishment_id",
    e.name as "nom_etablissement",
    CASE 
        WHEN e.id IS NOT NULL THEN '✅ A un établissement'
        ELSE '❌ Pas d''établissement'
    END as "statut_etablissement"
FROM profiles p
LEFT JOIN establishments e ON p.id = e.owner_id
WHERE p.user_type = 'professional'
ORDER BY p.email;

-- Compter les pros avec et sans établissement
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== STATISTIQUES ===';
END $$;

SELECT 
    COUNT(*) as "total_professionnels",
    COUNT(e.id) as "pros_avec_etablissement",
    COUNT(*) - COUNT(e.id) as "pros_sans_etablissement"
FROM profiles p
LEFT JOIN establishments e ON p.id = e.owner_id
WHERE p.user_type = 'professional';

-- Afficher les établissements existants
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== DÉTAIL DES ÉTABLISSEMENTS EXISTANTS ===';
END $$;

SELECT 
    e.id,
    e.name,
    e.owner_id,
    p.email as "email_proprietaire",
    p.full_name as "nom_proprietaire",
    e.created_at
FROM establishments e
JOIN profiles p ON e.owner_id = p.id
ORDER BY e.created_at;
