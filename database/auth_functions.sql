-- =====================================================
-- FONCTIONS RPC POUR LE DIAGNOSTIC D'AUTHENTIFICATION
-- =====================================================

-- Fonction pour vérifier si un utilisateur existe dans auth.users
CREATE OR REPLACE FUNCTION public.check_user_exists(user_email TEXT)
RETURNS TABLE(
  user_exists BOOLEAN,
  user_id UUID,
  email TEXT,
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true,
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  WHERE u.email = user_email;
  
  -- Si aucun résultat trouvé, retourner une ligne avec user_exists = false
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL, NULL, NULL, NULL, NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour confirmer manuellement l'email d'un utilisateur
CREATE OR REPLACE FUNCTION public.confirm_user_email(user_email TEXT)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  user_id UUID,
  confirmed_at TIMESTAMPTZ
) AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Chercher l'utilisateur
  SELECT id, email INTO user_record
  FROM auth.users 
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Utilisateur non trouvé', NULL, NULL;
    RETURN;
  END IF;
  
  -- Confirmer l'email
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE id = user_record.id;
  
  -- Retourner le succès
  RETURN QUERY 
  SELECT true, 'Email confirmé avec succès', user_record.id, NOW();
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour lister tous les utilisateurs avec leur statut
CREATE OR REPLACE FUNCTION public.list_all_users()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  profile_exists BOOLEAN,
  user_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.last_sign_in_at,
    p.id IS NOT NULL as profile_exists,
    p.user_type
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un utilisateur de test
CREATE OR REPLACE FUNCTION public.create_test_user(test_email TEXT, test_password TEXT)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  user_id UUID,
  profile_id UUID
) AS $$
DECLARE
  new_user_id UUID;
  new_profile_id UUID;
BEGIN
  -- Insérer dans auth.users (simulation de signup)
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  ) VALUES (
    test_email,
    crypt(test_password, gen_salt('bf')),
    NOW(), -- Confirmer immédiatement
    NOW(),
    NOW(),
    jsonb_build_object('full_name', 'Test User')
  ) RETURNING id INTO new_user_id;
  
  -- Créer le profil
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    new_user_id,
    test_email,
    'Test User',
    'client'
  ) RETURNING id INTO new_profile_id;
  
  RETURN QUERY 
  SELECT true, 'Utilisateur de test créé avec succès', new_user_id, new_profile_id;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY 
  SELECT false, 'Erreur: ' || SQLERRM, NULL, NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION public.check_user_exists(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.confirm_user_email(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.list_all_users() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.create_test_user(TEXT, TEXT) TO authenticated, anon;

-- Confirmation
SELECT '=== Fonctions de diagnostic d''authentification creees ===' as status;
