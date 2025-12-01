-- Créer la table des transactions pour la caisse
-- Cette table stockera tous les paiements effectués

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'mobile')) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('paid', 'pending', 'refunded')) DEFAULT 'paid',
    payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_transactions_establishment_id ON transactions(establishment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_appointment_id ON transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);

-- Activer RLS (Row Level Security)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour la table transactions
-- Les professionnels peuvent voir leurs transactions
CREATE POLICY "Professionals can view their transactions"
    ON transactions FOR SELECT
    USING (
        establishment_id IN (
            SELECT id FROM establishments 
            WHERE owner_id = auth.uid()
        )
    );

-- Les professionnels peuvent créer des transactions
CREATE POLICY "Professionals can create transactions"
    ON transactions FOR INSERT
    WITH CHECK (
        establishment_id IN (
            SELECT id FROM establishments 
            WHERE owner_id = auth.uid()
        )
    );

-- Les professionnels peuvent mettre à jour leurs transactions
CREATE POLICY "Professionals can update their transactions"
    ON transactions FOR UPDATE
    USING (
        establishment_id IN (
            SELECT id FROM establishments 
            WHERE owner_id = auth.uid()
        )
    );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
