-- =====================================================
-- DONNÉES DE TEST (SEED DATA) - VERSION CORRIGÉE
-- Pour le développement et les tests
-- =====================================================

-- NOTE: Les IDs des utilisateurs doivent correspondre à ceux créés via Supabase Auth
-- Ces données sont des exemples pour le développement

-- =====================================================
-- Exemples de catégories d'établissements
-- =====================================================
-- 'coiffeur', 'barbier', 'esthetique', 'spa', 'onglerie', 'massage', 'tatouage'

-- =====================================================
-- Étape 1: Créer les profils utilisateurs d'abord
-- =====================================================
-- Note: Ces profils seront utilisés comme propriétaires des établissements

-- Profils de test pour les propriétaires d'établissements
INSERT INTO profiles (
    id,
    email,
    full_name,
    phone,
    user_type
) VALUES 
(
    '00000000-0000-0000-0000-000000000001'::UUID,
    'sophie.martin@salon-elegance.fr',
    'Sophie Martin',
    '+33 6 12 34 56 78',
    'professional'
),
(
    '00000000-0000-0000-0000-000000000002'::UUID,
    'marie.leclerc@beaute-divine.fr',
    'Marie Leclerc',
    '+33 6 34 56 78 90',
    'professional'
),
(
    '00000000-0000-0000-0000-000000000003'::UUID,
    'client.test@example.com',
    'Client Test',
    '+33 6 45 67 89 01',
    'client'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Étape 2: Insérer les établissements de test
-- =====================================================
-- Maintenant on peut créer les établissements avec des owner_id valides

-- Exemple 1: Salon de coiffure
INSERT INTO establishments (
    id,
    owner_id,
    name,
    slug,
    description,
    category,
    address,
    city,
    postal_code,
    latitude,
    longitude,
    phone,
    email,
    opening_hours,
    is_active,
    accepts_online_booking
) VALUES (
    '11111111-1111-1111-1111-111111111111'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID, -- À remplacer
    'Salon Élégance',
    'salon-elegance-paris',
    'Salon de coiffure haut de gamme au cœur de Paris. Spécialistes de la coloration et des coupes tendances.',
    'coiffeur',
    '123 Avenue des Champs-Élysées',
    'Paris',
    '75008',
    48.8698,
    2.3078,
    '+33 1 42 56 78 90',
    'contact@salon-elegance.fr',
    '{
        "lundi": {"open": "09:00", "close": "19:00"},
        "mardi": {"open": "09:00", "close": "19:00"},
        "mercredi": {"open": "09:00", "close": "19:00"},
        "jeudi": {"open": "09:00", "close": "20:00"},
        "vendredi": {"open": "09:00", "close": "20:00"},
        "samedi": {"open": "08:00", "close": "18:00"},
        "dimanche": {"closed": true}
    }'::JSONB,
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- Exemple 2: Institut de beauté
INSERT INTO establishments (
    id,
    owner_id,
    name,
    slug,
    description,
    category,
    address,
    city,
    postal_code,
    latitude,
    longitude,
    phone,
    email,
    opening_hours,
    is_active,
    accepts_online_booking
) VALUES (
    '22222222-2222-2222-2222-222222222222'::UUID,
    '00000000-0000-0000-0000-000000000002'::UUID, -- À remplacer
    'Institut Beauté Divine',
    'institut-beaute-divine-lyon',
    'Institut de beauté proposant soins du visage, épilation, manucure et pédicure.',
    'esthetique',
    '45 Rue de la République',
    'Lyon',
    '69002',
    45.7640,
    4.8357,
    '+33 4 78 90 12 34',
    'contact@beaute-divine.fr',
    '{
        "lundi": {"closed": true},
        "mardi": {"open": "10:00", "close": "19:00"},
        "mercredi": {"open": "10:00", "close": "19:00"},
        "jeudi": {"open": "10:00", "close": "20:00"},
        "vendredi": {"open": "10:00", "close": "20:00"},
        "samedi": {"open": "09:00", "close": "18:00"},
        "dimanche": {"closed": true}
    }'::JSONB,
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Exemple: Collaborateurs
-- =====================================================

-- Collaborateurs pour Salon Élégance
INSERT INTO staff_members (
    id,
    establishment_id,
    first_name,
    last_name,
    email,
    phone,
    title,
    bio,
    specialties,
    is_active,
    can_book_online
) VALUES 
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Sophie',
    'Martin',
    'sophie.martin@salon-elegance.fr',
    '+33 6 12 34 56 78',
    'Coiffeuse Senior',
    'Spécialiste des colorations complexes et des coupes femmes. 15 ans d''expérience.',
    ARRAY['coloration', 'coupe femme', 'balayage'],
    true,
    true
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Thomas',
    'Dubois',
    'thomas.dubois@salon-elegance.fr',
    '+33 6 23 45 67 89',
    'Coiffeur',
    'Expert en coupes hommes et barbier. Passionné par les styles modernes.',
    ARRAY['coupe homme', 'barbe', 'taille'],
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- Collaborateurs pour Institut Beauté Divine
INSERT INTO staff_members (
    id,
    establishment_id,
    first_name,
    last_name,
    email,
    phone,
    title,
    bio,
    specialties,
    is_active,
    can_book_online
) VALUES 
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID,
    '22222222-2222-2222-2222-222222222222'::UUID,
    'Marie',
    'Leclerc',
    'marie.leclerc@beaute-divine.fr',
    '+33 6 34 56 78 90',
    'Esthéticienne',
    'Spécialiste des soins du visage et de l''épilation. Diplômée CAP Esthétique.',
    ARRAY['soin visage', 'épilation', 'maquillage'],
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Exemple: Services
-- =====================================================

-- Services pour Salon Élégance
INSERT INTO services (
    id,
    establishment_id,
    name,
    description,
    category,
    duration,
    price,
    is_active,
    online_booking_enabled,
    available_staff_ids
) VALUES 
(
    '11111111-aaaa-aaaa-aaaa-111111111111'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Coupe Femme',
    'Coupe et brushing inclus',
    'coupe',
    60,
    45.00,
    true,
    true,
    ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID]
),
(
    '11111111-bbbb-bbbb-bbbb-111111111111'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Coupe Homme',
    'Coupe classique ou moderne',
    'coupe',
    30,
    25.00,
    true,
    true,
    ARRAY['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID]
),
(
    '11111111-cccc-cccc-cccc-111111111111'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Coloration Complète',
    'Coloration avec soin et brushing',
    'coloration',
    120,
    85.00,
    true,
    true,
    ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID]
),
(
    '11111111-dddd-dddd-dddd-111111111111'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Balayage',
    'Technique de coloration naturelle',
    'coloration',
    150,
    120.00,
    true,
    true,
    ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID]
) ON CONFLICT (id) DO NOTHING;

-- Services pour Institut Beauté Divine
INSERT INTO services (
    id,
    establishment_id,
    name,
    description,
    category,
    duration,
    price,
    is_active,
    online_booking_enabled,
    available_staff_ids
) VALUES 
(
    '22222222-aaaa-aaaa-aaaa-222222222222'::UUID,
    '22222222-2222-2222-2222-222222222222'::UUID,
    'Soin du Visage Hydratant',
    'Nettoyage, gommage, masque et massage',
    'soin',
    60,
    65.00,
    true,
    true,
    ARRAY['cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID]
),
(
    '22222222-bbbb-bbbb-bbbb-222222222222'::UUID,
    '22222222-2222-2222-2222-222222222222'::UUID,
    'Épilation Jambes Complètes',
    'Épilation à la cire',
    'epilation',
    45,
    35.00,
    true,
    true,
    ARRAY['cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID]
),
(
    '22222222-cccc-cccc-cccc-222222222222'::UUID,
    '22222222-2222-2222-2222-222222222222'::UUID,
    'Manucure',
    'Soin des mains et pose de vernis',
    'manucure',
    30,
    25.00,
    true,
    true,
    ARRAY['cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID]
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Exemple: Créneaux de disponibilité
-- =====================================================

-- Disponibilités pour Sophie Martin (Mardi à Samedi)
INSERT INTO availability_slots (staff_member_id, day_of_week, start_time, end_time, is_active)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 2, '09:00', '12:00', true), -- Mardi matin
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 2, '14:00', '19:00', true), -- Mardi après-midi
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 3, '09:00', '12:00', true), -- Mercredi
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 3, '14:00', '19:00', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 4, '09:00', '12:00', true), -- Jeudi
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 4, '14:00', '20:00', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 5, '09:00', '12:00', true), -- Vendredi
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 5, '14:00', '20:00', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 6, '08:00', '12:00', true), -- Samedi
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 6, '14:00', '18:00', true)
ON CONFLICT (staff_member_id, day_of_week, start_time, end_time) DO NOTHING;

-- Disponibilités pour Thomas Dubois
INSERT INTO availability_slots (staff_member_id, day_of_week, start_time, end_time, is_active)
VALUES 
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID, 2, '09:00', '19:00', true), -- Mardi
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID, 3, '09:00', '19:00', true), -- Mercredi
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID, 4, '09:00', '20:00', true), -- Jeudi
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID, 5, '09:00', '20:00', true), -- Vendredi
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID, 6, '08:00', '18:00', true) -- Samedi
ON CONFLICT (staff_member_id, day_of_week, start_time, end_time) DO NOTHING;

-- Disponibilités pour Marie Leclerc
INSERT INTO availability_slots (staff_member_id, day_of_week, start_time, end_time, is_active)
VALUES 
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID, 2, '10:00', '19:00', true), -- Mardi
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID, 3, '10:00', '19:00', true), -- Mercredi
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID, 4, '10:00', '20:00', true), -- Jeudi
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID, 5, '10:00', '20:00', true), -- Vendredi
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID, 6, '09:00', '18:00', true) -- Samedi
ON CONFLICT (staff_member_id, day_of_week, start_time, end_time) DO NOTHING;

-- =====================================================
-- Vérification des données insérées
-- =====================================================

-- Vérifier les établissements
SELECT 'Établissements créés:' as info, COUNT(*) as count FROM establishments;

-- Vérifier les collaborateurs
SELECT 'Collaborateurs créés:' as info, COUNT(*) as count FROM staff_members;

-- Vérifier les services
SELECT 'Services créés:' as info, COUNT(*) as count FROM services;

-- Vérifier les créneaux de disponibilité
SELECT 'Créneaux créés:' as info, COUNT(*) as count FROM availability_slots;

-- Afficher les détails
SELECT 
    e.name as etablissement,
    COUNT(sm.id) as nb_collaborateurs,
    COUNT(s.id) as nb_services,
    COUNT(av.id) as nb_creneaux
FROM establishments e
LEFT JOIN staff_members sm ON e.id = sm.establishment_id
LEFT JOIN services s ON e.id = s.establishment_id
LEFT JOIN availability_slots av ON sm.id = av.staff_member_id
GROUP BY e.id, e.name
ORDER BY e.name;
