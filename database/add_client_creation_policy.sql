-- Ajouter une politique pour permettre aux professionnels de créer des profils clients
-- Cette politique permet aux professionnels d'ajouter des clients lors de la création de rendez-vous

-- Supprimer la politique si elle existe déjà
DROP POLICY IF EXISTS "Professionals can create client profiles" ON profiles;

-- Créer la nouvelle politique
CREATE POLICY "Professionals can create client profiles"
    ON profiles FOR INSERT
    WITH CHECK (
        user_type = 'client' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND user_type IN ('professional', 'admin')
        )
    );
