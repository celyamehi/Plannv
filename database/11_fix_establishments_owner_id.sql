-- =====================================================
-- Migration: Corriger la contrainte owner_id dans establishments
-- =====================================================

-- ÉTAPE 1: Supprimer la contrainte NOT NULL sur owner_id (ignore l'erreur si n'existe pas)
-- Cette commande permet de rendre owner_id nullable pour éviter les erreurs
DO $$
BEGIN
    -- Vérifier si la colonne owner_id existe et a une contrainte NOT NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'establishments' 
        AND column_name = 'owner_id'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE establishments ALTER COLUMN owner_id DROP NOT NULL;
        RAISE NOTICE 'Contrainte NOT NULL sur owner_id supprimée';
    ELSE
        RAISE NOTICE 'owner_id est déjà nullable ou n''existe pas';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Impossible de supprimer NOT NULL sur owner_id (déjà fait?)';
END $$;

-- ÉTAPE 2: Ajouter la colonne professional_id si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'establishments' 
        AND column_name = 'professional_id'
    ) THEN
        ALTER TABLE establishments ADD COLUMN professional_id UUID;
        RAISE NOTICE 'Colonne professional_id ajoutée';
    ELSE
        RAISE NOTICE 'Colonne professional_id existe déjà';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de l''ajout de professional_id: %', SQLERRM;
END $$;

-- ÉTAPE 3: Mettre à jour les établissements qui ont owner_id mais pas professional_id
DO $$
BEGIN
    UPDATE establishments 
    SET professional_id = owner_id 
    WHERE owner_id IS NOT NULL 
    AND professional_id IS NULL;
    
    RAISE NOTICE 'Migration des données owner_id vers professional_id effectuée';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de la migration des données: %', SQLERRM;
END $$;

-- ÉTAPE 4: Afficher l'état actuel pour vérification
SELECT 
    'ETAT ACTUEL DE LA TABLE ESTABLISHMENTS' as info,
    COUNT(*) as total_establishments,
    COUNT(owner_id) as with_owner_id,
    COUNT(professional_id) as with_professional_id,
    COUNT(CASE WHEN owner_id IS NULL AND professional_id IS NOT NULL THEN 1 END) as professional_only,
    COUNT(CASE WHEN owner_id IS NOT NULL AND professional_id IS NULL THEN 1 END) as owner_only,
    COUNT(CASE WHEN owner_id IS NOT NULL AND professional_id IS NOT NULL THEN 1 END) as both_fields
FROM establishments;
