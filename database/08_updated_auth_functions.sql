-- =====================================================
-- FONCTIONS D'AUTHENTIFICATION POUR LA NOUVELLE STRUCTURE
-- Fonctions pour gérer l'authentification avec rôles et tables séparées
-- =====================================================

-- =====================================================
-- Fonction pour créer un nouvel utilisateur avec profil approprié
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_user_with_profile(
    user_email TEXT,
    user_password TEXT,
    user_role TEXT,
    first_name TEXT DEFAULT NULL,
    last_name TEXT DEFAULT NULL,
    phone TEXT DEFAULT NULL,
    business_name TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    user_id UUID,
    role TEXT
) AS $$
DECLARE
    new_user_id UUID;
    profile_created BOOLEAN := FALSE;
BEGIN
    -- Validation du rôle
    IF user_role NOT IN ('client', 'professional') THEN
        RETURN QUERY SELECT false, 'Rôle invalide', NULL::UUID, NULL;
        RETURN;
    END IF;

    -- Créer l'utilisateur dans auth.users (via Supabase)
    -- Note: Cette partie sera gérée par Supabase Auth, on crée juste l'entrée dans notre table users
    
    -- Insérer dans la table users
    INSERT INTO users (email, role)
    VALUES (user_email, user_role)
    RETURNING id INTO new_user_id;

    -- Créer le profil approprié
    IF user_role = 'client' THEN
        INSERT INTO clients (id, first_name, last_name, phone)
        VALUES (new_user_id, first_name, last_name, phone);
        profile_created := TRUE;
        
    ELSIF user_role = 'professional' THEN
        INSERT INTO professionals (id, business_name, contact_first_name, contact_last_name, phone)
        VALUES (new_user_id, 
                COALESCE(business_name, first_name || ' ' || last_name), 
                first_name, 
                last_name, 
                phone);
        profile_created := TRUE;
    END IF;

    IF profile_created THEN
        RETURN QUERY SELECT true, 'Utilisateur et profil créés avec succès', new_user_id, user_role;
    ELSE
        RETURN QUERY SELECT false, 'Erreur lors de la création du profil', new_user_id, user_role;
    END IF;
    
EXCEPTION
    WHEN unique_violation THEN
        RETURN QUERY SELECT false, 'Email déjà utilisé', NULL::UUID, NULL;
    WHEN OTHERS THEN
        RETURN QUERY SELECT false, 'Erreur: ' || SQLERRM, NULL::UUID, NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Fonction pour obtenir les détails complets d'un utilisateur
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_details(user_id UUID)
RETURNS TABLE(
    id UUID,
    email TEXT,
    role TEXT,
    is_active BOOLEAN,
    email_verified BOOLEAN,
    created_at TIMESTAMPTZ,
    -- Champs client
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    loyalty_points INTEGER,
    -- Champs professionnel
    business_name TEXT,
    business_email TEXT,
    is_verified BOOLEAN,
    specialties TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.role,
        u.is_active,
        u.email_verified,
        u.created_at,
        c.first_name,
        c.last_name,
        c.full_name,
        c.phone,
        c.avatar_url,
        c.loyalty_points,
        p.business_name,
        p.business_email,
        p.is_verified,
        p.specialties
    FROM users u
    LEFT JOIN clients c ON u.id = c.id AND u.role = 'client'
    LEFT JOIN professionals p ON u.id = p.id AND u.role = 'professional'
    WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Fonction pour mettre à jour le profil utilisateur
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_user_profile(
    user_id UUID,
    first_name TEXT DEFAULT NULL,
    last_name TEXT DEFAULT NULL,
    phone TEXT DEFAULT NULL,
    avatar_url TEXT DEFAULT NULL,
    business_name TEXT DEFAULT NULL,
    business_description TEXT DEFAULT NULL,
    specialties TEXT[] DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Récupérer le rôle de l'utilisateur
    SELECT role INTO user_role FROM users WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Utilisateur non trouvé';
        RETURN;
    END IF;

    -- Mettre à jour selon le rôle
    IF user_role = 'client' THEN
        UPDATE clients SET
            first_name = COALESCE(first_name, first_name),
            last_name = COALESCE(last_name, last_name),
            phone = COALESCE(phone, phone),
            avatar_url = COALESCE(avatar_url, avatar_url),
            updated_at = NOW()
        WHERE id = user_id;
        
        RETURN QUERY SELECT true, 'Profil client mis à jour';
        
    ELSIF user_role = 'professional' THEN
        UPDATE professionals SET
            contact_first_name = COALESCE(first_name, contact_first_name),
            contact_last_name = COALESCE(last_name, contact_last_name),
            phone = COALESCE(phone, phone),
            avatar_url = COALESCE(avatar_url, avatar_url),
            business_name = COALESCE(business_name, business_name),
            business_description = COALESCE(business_description, business_description),
            specialties = COALESCE(specialties, specialties),
            updated_at = NOW()
        WHERE id = user_id;
        
        RETURN QUERY SELECT true, 'Profil professionnel mis à jour';
    ELSE
        RETURN QUERY SELECT false, 'Rôle utilisateur non valide';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT false, 'Erreur: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Fonction pour vérifier si un email existe et son rôle
CREATE OR REPLACE FUNCTION public.check_email_and_role(user_email TEXT)
RETURNS TABLE(
    email_exists BOOLEAN,
    user_id UUID,
    role TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        true,
        u.id,
        u.role,
        u.is_active
    FROM users u
    WHERE u.email = user_email;
    
    -- Si aucun résultat trouvé
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL, false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Fonction pour obtenir les statistiques par rôle
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_statistics()
RETURNS TABLE(
    role TEXT,
    total_count INTEGER,
    active_count INTEGER,
    verified_count INTEGER,
    created_today INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.role,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE u.is_active = true) as active_count,
        COUNT(*) FILTER (WHERE p.is_verified = true) as verified_count,
        COUNT(*) FILTER (WHERE DATE(u.created_at) = CURRENT_DATE) as created_today
    FROM users u
    LEFT JOIN professionals p ON u.id = p.id AND u.role = 'professional'
    GROUP BY u.role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Trigger pour créer automatiquement le profil lors de l'inscription
-- =====================================================

-- Fonction trigger pour créer le profil lors de la création d'un utilisateur
CREATE OR REPLACE FUNCTION public.create_profile_on_user_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer le profil approprié selon le rôle
    IF NEW.role = 'client' THEN
        INSERT INTO clients (id)
        VALUES (NEW.id);
    ELSIF NEW.role = 'professional' THEN
        INSERT INTO professionals (id, business_name)
        VALUES (NEW.id, 'Nouveau Professionnel');
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, loguer mais ne pas bloquer la création
        RAISE WARNING 'Erreur création profil pour utilisateur %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
CREATE TRIGGER trigger_create_profile_on_user_creation
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_profile_on_user_creation();

-- =====================================================
-- Politiques RLS pour la nouvelle structure
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table users
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour la table clients
CREATE POLICY "Clients can view their own profile" ON clients
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Clients can update their own profile" ON clients
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour la table professionals
CREATE POLICY "Professionals can view their own profile" ON professionals
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Professionals can update their own profile" ON professionals
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour les établissements (professionnels)
CREATE POLICY "Professionals can view their establishments" ON establishments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM professionals 
            WHERE id = professional_id AND auth.uid() = id
        )
    );

CREATE POLICY "Professionals can manage their establishments" ON establishments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM professionals 
            WHERE id = professional_id AND auth.uid() = id
        )
    );

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
