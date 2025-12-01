-- =====================================================
-- DÉSACTIVER LA CONFIRMATION PAR EMAIL
-- Pour permettre une connexion immédiate après inscription
-- =====================================================

-- Étape 1: Activer la confirmation automatique
-- Cela permet aux utilisateurs de se connecter sans confirmer leur email
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Étape 2: Désactiver la nécessité de confirmation email
-- dans les paramètres du projet Supabase
-- (Note: Cette partie doit être faite manuellement dans le dashboard Supabase)

-- Étape 3: Créer une fonction pour confirmer automatiquement les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Confirmer automatiquement l'email du nouvel utilisateur
  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Étape 4: Créer le trigger pour confirmation automatique
DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;
CREATE TRIGGER on_auth_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();

-- Étape 5: Mettre à jour le trigger de création de profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Confirmer l'email
  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE id = NEW.id;
  
  -- Créer le profil
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Étape 6: Confirmer les changements
SELECT '=== Confirmation email desactivee ===' as status;
SELECT 'Les nouveaux utilisateurs peuvent se connecter immediatement' as info;
SELECT 'Les utilisateurs existants ont ete confirmes automatiquement' as info;
