-- Ajouter des champs pour les clients invités (non-inscrits)
-- Cela permet de créer des RDV sans créer de compte utilisateur

-- 1. Rendre client_id nullable pour permettre les clients invités
ALTER TABLE appointments 
ALTER COLUMN client_id DROP NOT NULL;

-- 2. Ajouter des colonnes pour stocker les infos du client invité
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT,
ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- 3. Ajouter une contrainte pour s'assurer qu'on a soit un client_id, soit un guest_name
ALTER TABLE appointments
ADD CONSTRAINT check_client_info 
CHECK (
  (client_id IS NOT NULL) OR 
  (guest_name IS NOT NULL AND guest_phone IS NOT NULL)
);

-- 4. Créer un index pour rechercher par téléphone
CREATE INDEX IF NOT EXISTS idx_appointments_guest_phone ON appointments(guest_phone);
