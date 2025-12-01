-- SCRIPT DE VÉRIFICATION DE LA STRUCTURE DE auth.users
-- Pour connaître les colonnes exactes existantes

DO $$
BEGIN
    RAISE NOTICE '=== VÉRIFICATION STRUCTURE auth.users ===';
END $$;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;
