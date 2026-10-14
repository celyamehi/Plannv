-- =========================================================================
-- RÉPARATION IMMÉDIATE : CONNEXION ADMIN ET ACTIVATION D'ABONNEMENT
-- Résout l'erreur de récursion infinie RLS et rétablit l'accès admin
-- =========================================================================

-- 1. Supprimer toutes les politiques conflictuelles sur profiles qui bloquent la connexion
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users and admins can update profiles" ON profiles;

-- 2. Fonction SECURITY DEFINER pour vérifier le rôle admin (sans AUCUNE récursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  );
$$;

-- 3. Politiques RLS propres et sans récursion sur profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Lecture : tous les utilisateurs connectés peuvent lire les profils (connexion, booking, admin)
CREATE POLICY "Enable read access for all authenticated users" ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Modification : chaque utilisateur peut modifier son profil, et l'admin peut modifier tous les profils
CREATE POLICY "Users and admins can update profiles" ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = id OR public.is_admin()
  );

-- Insertion : pour les nouvelles inscriptions
DROP POLICY IF EXISTS "Enable insert for authentication based on users email" ON profiles;
CREATE POLICY "Enable insert for authentication based on users email" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 4. Politiques RLS sur establishments (permettre à l'admin d'activer les salons)
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can update all establishments" ON establishments;
DROP POLICY IF EXISTS "Owners and admins can update establishments" ON establishments;

CREATE POLICY "Owners and admins can update establishments" ON establishments
  FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid() OR public.is_admin()
  )
  WITH CHECK (
    owner_id = auth.uid() OR public.is_admin()
  );

-- 5. Créer la table subscriptions (évite les erreurs 404)
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
  USING (public.is_admin() OR user_id = auth.uid());

-- 6. Créer la table admin_logs (évite les erreurs 404)
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_type TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage admin_logs" ON admin_logs;
CREATE POLICY "Admins can manage admin_logs" ON admin_logs
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 7. Vérifier votre compte admin actuel (remplacez l'email si besoin)
UPDATE profiles 
SET user_type = 'admin' 
WHERE email = 'admin@kalendo.dz' OR email ILIKE '%admin%';

SELECT id, email, user_type FROM profiles WHERE user_type = 'admin';
