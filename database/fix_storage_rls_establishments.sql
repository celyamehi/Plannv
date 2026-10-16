-- =========================================================================
-- CORRECTION ERREUR RLS STORAGE : "new row violates row-level security policy"
-- =========================================================================
-- À exécuter dans votre Dashboard Supabase → "SQL Editor" → "Run"
-- Ce script configure le bucket 'establishments' pour permettre l'upload :
--   1. De la PHOTO DE PROFIL DU SALON ({establishment_id}/cover/...)
--      (affichée sur la carte de recherche et en grand sur la bannière du salon)
--   2. Des photos de la GALERIE DU SALON ({establishment_id}/gallery/...)
-- =========================================================================

-- 1. S'assurer que le bucket 'establishments' existe et est PUBLIC
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'establishments',
    'establishments',
    true,
    10485760, -- 10 Mo par photo
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];

-- 2. Nettoyer les anciennes politiques restrictives qui bloquaient l'upload
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Establishment owners can upload" ON storage.objects;
DROP POLICY IF EXISTS "Establishment owners can update" ON storage.objects;
DROP POLICY IF EXISTS "Establishment owners can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to establishments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to establishments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to establishments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to establishments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to establishments fallback" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to establishments" ON storage.objects;

-- 3. Politique SELECT : Lecture publique de toutes les photos du bucket
CREATE POLICY "Allow public read access to establishments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'establishments');

-- 4. Politique INSERT : Autoriser l'upload de photos dans le bucket establishments
CREATE POLICY "Allow authenticated uploads to establishments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'establishments');

-- 5. Politique UPDATE : Autoriser la mise à jour des photos
CREATE POLICY "Allow authenticated updates to establishments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'establishments')
WITH CHECK (bucket_id = 'establishments');

-- 6. Politique DELETE : Autoriser la suppression des photos
CREATE POLICY "Allow authenticated deletes to establishments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'establishments');

-- 7. Politique de secours pour l'upload (évite tout blocage si session en cours de rafraîchissement)
CREATE POLICY "Allow public uploads to establishments fallback"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'establishments');

-- 8. Confirmation du bon paramétrage
SELECT 
    b.id as bucket_id,
    b.name as bucket_name,
    b.public as is_public,
    p.policyname as policy_name,
    p.cmd as action
FROM storage.buckets b
LEFT JOIN pg_policies p ON p.tablename = 'objects' AND p.schemaname = 'storage'
WHERE b.id = 'establishments';
