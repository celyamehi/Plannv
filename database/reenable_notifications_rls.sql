-- =====================================================
-- RÉACTIVER RLS SUR NOTIFICATIONS AVEC POLITIQUES SÉCURISÉES
-- =====================================================
-- Ce script réactive RLS sur notifications et crée des politiques
-- qui permettent aux triggers de fonctionner tout en protégeant l'accès
-- =====================================================

-- Réactiver RLS sur notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Politique SELECT : Les utilisateurs peuvent voir leurs propres notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND related_type = 'establishment' AND related_id IN (
            SELECT id FROM establishments WHERE owner_id = auth.uid()
        ))
    );

-- Politique UPDATE : Les utilisateurs peuvent marquer leurs notifications comme lues
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND related_type = 'establishment' AND related_id IN (
            SELECT id FROM establishments WHERE owner_id = auth.uid()
        ))
    );

-- Politique INSERT : Permettre l'insertion via triggers (SECURITY DEFINER)
-- et pour les utilisateurs authentifiés
CREATE POLICY "Users can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (
        user_id = auth.uid() OR 
        (user_id IS NULL AND related_type = 'establishment' AND related_id IN (
            SELECT id FROM establishments WHERE owner_id = auth.uid()
        ))
    );

-- Politique DELETE : Les utilisateurs peuvent supprimer leurs propres notifications
CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND related_type = 'establishment' AND related_id IN (
            SELECT id FROM establishments WHERE owner_id = auth.uid()
        ))
    );

-- Vérifier les politiques actuelles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY policyname;
