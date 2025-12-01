-- =====================================================
-- CORRECTION DE LA TABLE ESTABLISHMENTS
-- Script pour migrer la table establishments existante
-- =====================================================

-- ÉTAPE 1: Vérifier la structure actuelle de la table establishments
-- \d establishments

-- ÉTAPE 2: Ajouter la colonne professional_id si elle n'existe pas
DO $$
BEGIN
    -- Vérifier si la colonne professional_id existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'establishments' 
        AND column_name = 'professional_id'
    ) THEN
        -- Ajouter la colonne professional_id
        ALTER TABLE establishments 
        ADD COLUMN professional_id UUID;
        
        RAISE NOTICE 'Colonne professional_id ajoutée à la table establishments';
    ELSE
        RAISE NOTICE 'La colonne professional_id existe déjà';
    END IF;
END $$;

-- ÉTAPE 3: Migrer les données de owner_id vers professional_id
UPDATE establishments 
SET professional_id = owner_id 
WHERE owner_id IS NOT NULL 
AND professional_id IS NULL;

-- ÉTAPE 4: Créer la contrainte foreign key pour professional_id
DO $$
BEGIN
    -- Vérifier si la contrainte existe déjà
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'establishments_professional_id_fkey'
        AND table_name = 'establishments'
    ) THEN
        -- Ajouter la contrainte foreign key
        ALTER TABLE establishments 
        ADD CONSTRAINT establishments_professional_id_fkey 
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Contrainte foreign key ajoutée pour professional_id';
    ELSE
        RAISE NOTICE 'La contrainte foreign key existe déjà pour professional_id';
    END IF;
END $$;

-- ÉTAPE 5: Supprimer l'ancienne colonne owner_id si elle existe et que la migration est réussie
DO $$
BEGIN
    -- Vérifier si la colonne owner_id existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'establishments' 
        AND column_name = 'owner_id'
    ) THEN
        -- Vérifier que toutes les données ont été migrées
        IF EXISTS (
            SELECT 1 FROM establishments 
            WHERE owner_id IS NOT NULL 
            AND professional_id IS NULL
            LIMIT 1
        ) THEN
            RAISE WARNING 'Impossible de supprimer owner_id: certaines données non migrées';
        ELSE
            -- Supprimer l'ancienne colonne
            ALTER TABLE establishments DROP COLUMN owner_id;
            RAISE NOTICE 'Ancienne colonne owner_id supprimée';
        END IF;
    END IF;
END $$;

-- ÉTAPE 6: Vérifier le résultat
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'establishments' 
AND column_name IN ('professional_id', 'owner_id')
ORDER BY column_name;

-- ÉTAPE 7: Afficher le nombre d'établissements avec professional_id
SELECT 
    COUNT(*) as total_establishments,
    COUNT(professional_id) as with_professional_id,
    COUNT(owner_id) as with_owner_id
FROM establishments;
