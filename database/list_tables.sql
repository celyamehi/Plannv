-- SCRIPT SIMPLE - AFFICHER TOUTES LES TABLES
-- Juste la liste des tables, rien d'autre

SELECT 
    table_name as "Nom de la table",
    table_type as "Type"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
