-- SCRIPT DE DIAGNOSTIC COMPLET SUPABASE AUTH
-- Pour identifier la cause exacte de "Database error querying schema"

DO $$
BEGIN
    RAISE NOTICE '=== DIAGNOSTIC COMPLET SUPABASE AUTH ===';
END $$;

-- 1. Vérifier si on peut accéder à auth.users
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '1. Test accès à auth.users...';
    
    BEGIN
        PERFORM 1 FROM auth.users LIMIT 1;
        RAISE NOTICE '✅ auth.users accessible';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur accès auth.users: %', SQLERRM;
    END;
END $$;

-- 2. Vérifier les tables d'auth
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '2. Tables dans le schéma auth...';
    
    SELECT 
        table_name,
        table_type
    FROM information_schema.tables 
    WHERE table_schema = 'auth'
    ORDER BY table_name;
END $$;

-- 3. Vérifier la structure de auth.users
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '3. Structure de auth.users...';
    
    SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
    FROM information_schema.columns 
    WHERE table_schema = 'auth' 
    AND table_name = 'users'
    ORDER BY ordinal_position;
END $$;

-- 4. Vérifier les utilisateurs existants
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '4. Utilisateurs existants dans auth.users...';
    
    SELECT 
        email,
        id,
        created_at,
        email_confirmed_at,
        last_sign_in_at
    FROM auth.users 
    ORDER BY created_at DESC
    LIMIT 10;
END $$;

-- 5. Vérifier les correspondances avec profiles
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '5. Correspondance auth.users ↔ profiles...';
    
    SELECT 
        u.email as "auth_email",
        u.id as "auth_id",
        p.email as "profile_email", 
        p.id as "profile_id",
        p.user_type,
        CASE 
            WHEN u.id = p.id THEN '✅ OK'
            WHEN p.id IS NULL THEN '❌ Pas de profile'
            ELSE '❌ IDs différents'
        END as "correspondance"
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE u.email IN (
        'sophie.martin@salon-beaute.fr',
        'pierre.durand@barbershop.fr', 
        'marie.laurent@institut.fr',
        'julie.moreau@nails-bar.fr',
        'thomas.bernard@salon-luxe.fr',
        'marie.dupont@email.fr',
        'jean.bernard@email.fr',
        'claire.petit@email.fr',
        'robert.martin@email.fr',
        'sophie.leroy@email.fr'
    )
    ORDER BY u.email;
END $$;

-- 6. Vérifier les RLS policies
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '6. RLS policies sur auth.users...';
    
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
    WHERE tablename = 'users' 
    AND schemaname = 'auth';
END $$;

-- 7. Vérifier les triggers sur auth.users
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '7. Triggers sur auth.users...';
    
    SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_timing,
        action_condition,
        action_statement
    FROM information_schema.triggers
    WHERE event_object_table = 'users'
    AND event_object_schema = 'auth';
END $$;

-- 8. Test simple de création d'utilisateur
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '8. Test création utilisateur simple...';
    
    BEGIN
        -- Créer un utilisateur de test
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'test@example.com',
            crypt('test123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            false
        );
        
        RAISE NOTICE '✅ Utilisateur de test créé avec succès';
        
        -- Supprimer le test
        DELETE FROM auth.users WHERE email = 'test@example.com';
        RAISE NOTICE '✅ Utilisateur de test supprimé';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur création utilisateur: %', SQLERRM;
    END;
END $$;
