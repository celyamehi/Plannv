-- Script pour créer un établissement pour l'utilisateur professionnel
-- Remplacer 'VOTRE_USER_ID' par le vrai UUID de l'utilisateur

INSERT INTO establishments (
  owner_id,
  name,
  slug,
  category,
  address,
  city,
  postal_code,
  phone,
  description,
  is_active,
  created_at,
  updated_at
) VALUES (
  'VOTRE_USER_ID',  -- À remplacer par le vrai user_id
  'Mon Salon Professionnel',
  'mon-salon-professionnel',
  'coiffeur',
  '123 Rue de la République',
  'Paris',
  '75001',
  '0142567890',
  'Salon de coiffure professionnel',
  true,
  NOW(),
  NOW()
) ON CONFLICT (owner_id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  category = EXCLUDED.category,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  postal_code = EXCLUDED.postal_code,
  phone = EXCLUDED.phone,
  description = EXCLUDED.description,
  is_active = true,
  updated_at = NOW();
