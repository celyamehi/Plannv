-- =====================================================
-- RESTREINDRE LES POLITIQUES STORAGE PAR ÉTABLISSEMENT
-- =====================================================
-- Ce script remplace les politiques permissives par des politiques
-- qui restreignent l'accès aux fichiers par établissement
-- =====================================================

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Politique SELECT : Lecture publique pour tous les fichiers du bucket establishments
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'establishments');

-- Politique INSERT : Upload uniquement pour les propriétaires d'établissements
CREATE POLICY "Establishment owners can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'establishments' AND
    -- L'utilisateur doit être le propriétaire de l'établissement correspondant au dossier
    auth.uid() IN (
        SELECT owner_id FROM establishments 
        WHERE id::text = (storage.foldername(name))[1]
    )
);

-- Politique UPDATE : Modification uniquement pour les propriétaires
CREATE POLICY "Establishment owners can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'establishments' AND
    auth.uid() IN (
        SELECT owner_id FROM establishments 
        WHERE id::text = (storage.foldername(name))[1]
    )
);

-- Politique DELETE : Suppression uniquement pour les propriétaires
CREATE POLICY "Establishment owners can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'establishments' AND
    auth.uid() IN (
        SELECT owner_id FROM establishments 
        WHERE id::text = (storage.foldername(name))[1]
    )
);
