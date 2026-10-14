-- =========================================================================
-- FIX COMPLET : DROITS ADMIN (RLS) ET TABLES D'ABONNEMENT POUR SUPABASE
-- À exécuter dans l'éditeur SQL de Supabase (SQL Editor)
-- =========================================================================

-- 1. Donner les droits aux admins de modifier tous les profils (résout le statut qui ne change pas)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin'
    OR auth.uid() = id
  )
  WITH CHECK (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin'
    OR auth.uid() = id
  );

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin'
    OR auth.uid() = id
  );

-- 2. Donner les droits aux admins d'activer/désactiver tous les établissements
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can update all establishments" ON establishments;
CREATE POLICY "Admins can update all establishments" ON establishments
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin'
    OR owner_id = auth.uid()
  )
  WITH CHECK (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin'
    OR owner_id = auth.uid()
  );

-- 3. Créer la table subscriptions (résout l'erreur 404 sur rest/v1/subscriptions)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'DZD',
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage subscriptions" ON subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- 4. Créer la table admin_logs (résout l'erreur 404 sur rest/v1/admin_logs)
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES profiles(id),
  target_type TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage admin_logs" ON admin_logs;
CREATE POLICY "Admins can manage admin_logs" ON admin_logs
  FOR ALL
  TO authenticated
  USING (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 5. Confirmation
SELECT 'Succès : Politiques RLS et tables admin créées avec succès !' as resultat;
