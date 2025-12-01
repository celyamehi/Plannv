-- SCRIPT POUR VÉRIFIER LES TRIGGERS ET FONCTIONS SUR auth.users

-- Vérifier les triggers sur auth.users
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

-- Vérifier les fonctions qui créent des profils
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (
    routine_name LIKE '%profile%' 
    OR routine_name LIKE '%user%'
    OR routine_definition LIKE '%profiles%'
)
ORDER BY routine_name;

-- Vérifier s'il y a un trigger sur profiles
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table = 'profiles';
