-- =====================================================
-- SYSTÈME D'ABONNEMENTS ET ADMINISTRATION
-- =====================================================

-- 1. Ajouter les champs d'abonnement dans profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'pending' 
  CHECK (subscription_status IN ('pending', 'trial', 'active', 'suspended', 'expired'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_notes TEXT;

-- 2. Créer la table des abonnements/paiements
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', '1_month', '3_months', '6_months', '12_months')),
  amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'DZD',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  payment_method TEXT, -- 'cash', 'ccp', 'baridimob', 'bank_transfer'
  payment_reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id), -- Admin qui a créé l'abonnement
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Créer la table des logs admin
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'activate_subscription', 'suspend_user', 'delete_user', etc.
  target_user_id UUID REFERENCES profiles(id),
  target_type TEXT, -- 'user', 'establishment', 'subscription'
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_ends_at ON subscriptions(ends_at);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- 5. Fonction pour activer l'essai gratuit (1 mois)
CREATE OR REPLACE FUNCTION activate_trial(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET 
    subscription_status = 'trial',
    trial_ends_at = NOW() + INTERVAL '30 days',
    subscription_ends_at = NOW() + INTERVAL '30 days',
    updated_at = NOW()
  WHERE id = p_user_id AND user_type = 'professional';
  
  INSERT INTO subscriptions (user_id, plan_type, amount, starts_at, ends_at, notes)
  VALUES (p_user_id, 'trial', 0, NOW(), NOW() + INTERVAL '30 days', 'Essai gratuit 30 jours');
END;
$$ LANGUAGE plpgsql;

-- 6. Fonction pour activer un abonnement payant
CREATE OR REPLACE FUNCTION activate_subscription(
  p_user_id UUID,
  p_plan_type TEXT,
  p_amount DECIMAL,
  p_payment_method TEXT,
  p_payment_reference TEXT,
  p_admin_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_duration INTERVAL;
  v_subscription_id UUID;
BEGIN
  -- Déterminer la durée selon le plan
  v_duration := CASE p_plan_type
    WHEN '1_month' THEN INTERVAL '30 days'
    WHEN '3_months' THEN INTERVAL '90 days'
    WHEN '6_months' THEN INTERVAL '180 days'
    WHEN '12_months' THEN INTERVAL '365 days'
    ELSE INTERVAL '30 days'
  END;
  
  -- Mettre à jour le profil
  UPDATE profiles 
  SET 
    subscription_status = 'active',
    subscription_ends_at = NOW() + v_duration,
    subscription_notes = p_notes,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Créer l'abonnement
  INSERT INTO subscriptions (
    user_id, plan_type, amount, starts_at, ends_at, 
    payment_method, payment_reference, notes, created_by
  )
  VALUES (
    p_user_id, p_plan_type, p_amount, NOW(), NOW() + v_duration,
    p_payment_method, p_payment_reference, p_notes, p_admin_id
  )
  RETURNING id INTO v_subscription_id;
  
  -- Logger l'action
  INSERT INTO admin_logs (admin_id, action, target_user_id, target_type, details)
  VALUES (
    p_admin_id, 
    'activate_subscription', 
    p_user_id, 
    'subscription',
    jsonb_build_object(
      'plan_type', p_plan_type,
      'amount', p_amount,
      'payment_method', p_payment_method,
      'duration', v_duration::TEXT
    )
  );
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Fonction pour suspendre un utilisateur
CREATE OR REPLACE FUNCTION suspend_user(p_user_id UUID, p_admin_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET 
    subscription_status = 'suspended',
    subscription_notes = p_reason,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Désactiver l'établissement
  UPDATE establishments 
  SET is_active = false 
  WHERE owner_id = p_user_id;
  
  -- Logger l'action
  INSERT INTO admin_logs (admin_id, action, target_user_id, target_type, details)
  VALUES (p_admin_id, 'suspend_user', p_user_id, 'user', jsonb_build_object('reason', p_reason));
END;
$$ LANGUAGE plpgsql;

-- 8. Fonction pour réactiver un utilisateur
CREATE OR REPLACE FUNCTION reactivate_user(p_user_id UUID, p_admin_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET 
    subscription_status = 'active',
    subscription_notes = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Réactiver l'établissement
  UPDATE establishments 
  SET is_active = true 
  WHERE owner_id = p_user_id;
  
  -- Logger l'action
  INSERT INTO admin_logs (admin_id, action, target_user_id, target_type, details)
  VALUES (p_admin_id, 'reactivate_user', p_user_id, 'user', NULL);
END;
$$ LANGUAGE plpgsql;

-- 9. Vue pour les statistiques admin
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'client') as total_clients,
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'professional') as total_professionals,
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'professional' AND subscription_status = 'pending') as pending_pros,
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'professional' AND subscription_status = 'trial') as trial_pros,
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'professional' AND subscription_status = 'active') as active_pros,
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'professional' AND subscription_status = 'suspended') as suspended_pros,
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'professional' AND subscription_status = 'expired') as expired_pros,
  (SELECT COUNT(*) FROM establishments) as total_establishments,
  (SELECT COUNT(*) FROM establishments WHERE is_active = true) as active_establishments,
  (SELECT COUNT(*) FROM appointments WHERE created_at >= NOW() - INTERVAL '30 days') as appointments_last_30_days,
  (SELECT COALESCE(SUM(amount), 0) FROM subscriptions WHERE status = 'active') as total_revenue;

-- 10. RLS pour les tables admin
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Politique: seuls les admins peuvent voir les abonnements
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
    OR user_id = auth.uid()
  );

CREATE POLICY "Admins can manage subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- Politique: seuls les admins peuvent voir les logs
CREATE POLICY "Admins can view logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

CREATE POLICY "Admins can create logs" ON admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- 11. Mettre à jour les pros existants en "pending"
UPDATE profiles 
SET subscription_status = 'pending' 
WHERE user_type = 'professional' AND subscription_status IS NULL;

-- 12. Mettre les clients en "active" par défaut (pas besoin d'abonnement)
UPDATE profiles 
SET subscription_status = 'active' 
WHERE user_type = 'client';

COMMENT ON TABLE subscriptions IS 'Historique des abonnements des professionnels';
COMMENT ON TABLE admin_logs IS 'Logs des actions administratives';
