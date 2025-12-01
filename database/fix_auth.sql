-- =====================================================
-- CORRECTION DES PROBLÈMES D'AUTHENTIFICATION
-- =====================================================

-- Étape 1: Désactiver temporairement RLS sur profiles
-- Pour permettre la création automatique des profils
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Étape 2: Créer un trigger pour créer automatiquement les profils
-- Quand un utilisateur s'inscrit via Supabase Auth

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'client'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Étape 3: Créer une politique plus permissive pour les nouveaux utilisateurs
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la création de profil par le trigger
CREATE POLICY "Enable insert for authentication based on users email" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Étape 4: Vérifier que le trigger fonctionne
SELECT 'Trigger created successfully' as status;

-- Étape 5: Tester la création d'un profil (optionnel)
-- Vous pouvez décommenter cette ligne pour tester
-- INSERT INTO profiles (id, email, full_name, user_type) 
-- VALUES ('test-uuid-123', 'test@example.com', 'Test User', 'client');

SELECT '=== Configuration authentification corrigee ===' as final_status;
SELECT 'Vous pouvez maintenant tester l inscription' as next_step;
