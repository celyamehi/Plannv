-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Sécurité au niveau des lignes pour Supabase
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES: profiles
-- =====================================================

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Les professionnels peuvent créer des profils clients
CREATE POLICY "Professionals can create client profiles"
    ON profiles FOR INSERT
    WITH CHECK (
        user_type = 'client' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND user_type IN ('professional', 'admin')
        )
    );

-- =====================================================
-- POLICIES: establishments
-- =====================================================

-- Tout le monde peut voir les établissements actifs
CREATE POLICY "Anyone can view active establishments"
    ON establishments FOR SELECT
    USING (is_active = true);

-- Les propriétaires peuvent voir leurs établissements
CREATE POLICY "Owners can view own establishments"
    ON establishments FOR SELECT
    USING (owner_id = auth.uid());

-- Les propriétaires peuvent créer des établissements
CREATE POLICY "Owners can create establishments"
    ON establishments FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Les propriétaires peuvent mettre à jour leurs établissements
CREATE POLICY "Owners can update own establishments"
    ON establishments FOR UPDATE
    USING (owner_id = auth.uid());

-- Les propriétaires peuvent supprimer leurs établissements
CREATE POLICY "Owners can delete own establishments"
    ON establishments FOR DELETE
    USING (owner_id = auth.uid());

-- =====================================================
-- POLICIES: staff_members
-- =====================================================

-- Tout le monde peut voir les collaborateurs actifs
CREATE POLICY "Anyone can view active staff"
    ON staff_members FOR SELECT
    USING (
        is_active = true AND
        EXISTS (
            SELECT 1 FROM establishments
            WHERE id = staff_members.establishment_id AND is_active = true
        )
    );

-- Les propriétaires d'établissement peuvent gérer leurs collaborateurs
CREATE POLICY "Establishment owners can manage staff"
    ON staff_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM establishments
            WHERE id = staff_members.establishment_id AND owner_id = auth.uid()
        )
    );

-- =====================================================
-- POLICIES: services
-- =====================================================

-- Tout le monde peut voir les services actifs
CREATE POLICY "Anyone can view active services"
    ON services FOR SELECT
    USING (
        is_active = true AND
        EXISTS (
            SELECT 1 FROM establishments
            WHERE id = services.establishment_id AND is_active = true
        )
    );

-- Les propriétaires peuvent gérer leurs services
CREATE POLICY "Establishment owners can manage services"
    ON services FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM establishments
            WHERE id = services.establishment_id AND owner_id = auth.uid()
        )
    );

-- =====================================================
-- POLICIES: appointments
-- =====================================================

-- Les clients peuvent voir leurs propres rendez-vous
CREATE POLICY "Clients can view own appointments"
    ON appointments FOR SELECT
    USING (client_id = auth.uid());

-- Les propriétaires peuvent voir les RDV de leur établissement
CREATE POLICY "Establishment owners can view appointments"
    ON appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM establishments
            WHERE id = appointments.establishment_id AND owner_id = auth.uid()
        )
    );

-- Les clients peuvent créer des rendez-vous
CREATE POLICY "Clients can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (client_id = auth.uid());

-- Les clients peuvent annuler leurs rendez-vous
CREATE POLICY "Clients can cancel own appointments"
    ON appointments FOR UPDATE
    USING (client_id = auth.uid())
    WITH CHECK (client_id = auth.uid());

-- Les clients peuvent consulter les créneaux déjà réservés pour calculer les disponibilités
CREATE POLICY "Anyone can view staff busy slots"
    ON appointments FOR SELECT
    USING (
        status IN ('pending', 'confirmed') AND
        EXISTS (
            SELECT 1 FROM staff_members sm
            JOIN establishments e ON e.id = sm.establishment_id
            WHERE sm.id = appointments.staff_member_id
              AND sm.is_active = true
              AND e.is_active = true
        )
    );

-- Les propriétaires peuvent gérer les RDV de leur établissement
CREATE POLICY "Establishment owners can manage appointments"
    ON appointments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM establishments
            WHERE id = appointments.establishment_id AND owner_id = auth.uid()
        )
    );

-- =====================================================
-- POLICIES: availability_slots
-- =====================================================

-- Tout le monde peut voir les créneaux disponibles
CREATE POLICY "Anyone can view availability slots"
    ON availability_slots FOR SELECT
    USING (is_active = true);

-- Les propriétaires peuvent gérer les créneaux de leurs collaborateurs
CREATE POLICY "Establishment owners can manage availability"
    ON availability_slots FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM staff_members sm
            JOIN establishments e ON e.id = sm.establishment_id
            WHERE sm.id = availability_slots.staff_member_id AND e.owner_id = auth.uid()
        )
    );

-- =====================================================
-- POLICIES: time_off
-- =====================================================

-- Tout le monde peut voir les absences pour éviter les réservations lors des journées bloquées
CREATE POLICY "Anyone can view staff time off"
    ON time_off FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM staff_members sm
            JOIN establishments e ON e.id = sm.establishment_id
            WHERE sm.id = time_off.staff_member_id
              AND sm.is_active = true
              AND e.is_active = true
        )
    );

-- Les propriétaires peuvent gérer les absences
CREATE POLICY "Establishment owners can manage time off"
    ON time_off FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM staff_members sm
            JOIN establishments e ON e.id = sm.establishment_id
            WHERE sm.id = time_off.staff_member_id AND e.owner_id = auth.uid()
        )
    );

-- =====================================================
-- POLICIES: reviews
-- =====================================================

-- Tout le monde peut voir les avis visibles et modérés
CREATE POLICY "Anyone can view visible reviews"
    ON reviews FOR SELECT
    USING (is_visible = true AND is_moderated = true);

-- Les clients peuvent créer des avis
CREATE POLICY "Clients can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (client_id = auth.uid());

-- Les clients peuvent voir leurs propres avis
CREATE POLICY "Clients can view own reviews"
    ON reviews FOR SELECT
    USING (client_id = auth.uid());

-- Les propriétaires peuvent voir et répondre aux avis de leur établissement
CREATE POLICY "Establishment owners can manage reviews"
    ON reviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM establishments
            WHERE id = reviews.establishment_id AND owner_id = auth.uid()
        )
    );

-- =====================================================
-- POLICIES: waiting_list
-- =====================================================

-- Les clients peuvent voir leur liste d'attente
CREATE POLICY "Clients can view own waiting list"
    ON waiting_list FOR SELECT
    USING (client_id = auth.uid());

-- Les clients peuvent s'inscrire sur liste d'attente
CREATE POLICY "Clients can join waiting list"
    ON waiting_list FOR INSERT
    WITH CHECK (client_id = auth.uid());

-- Les propriétaires peuvent gérer la liste d'attente
CREATE POLICY "Establishment owners can manage waiting list"
    ON waiting_list FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM establishments
            WHERE id = waiting_list.establishment_id AND owner_id = auth.uid()
        )
    );

-- =====================================================
-- POLICIES: client_preferences
-- =====================================================

-- Les clients peuvent gérer leurs préférences
CREATE POLICY "Clients can manage own preferences"
    ON client_preferences FOR ALL
    USING (client_id = auth.uid());

-- =====================================================
-- POLICIES: transactions
-- =====================================================

-- Les clients peuvent voir leurs transactions
CREATE POLICY "Clients can view own transactions"
    ON transactions FOR SELECT
    USING (client_id = auth.uid());

-- Les propriétaires peuvent voir les transactions de leur établissement
CREATE POLICY "Establishment owners can view transactions"
    ON transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM establishments
            WHERE id = transactions.establishment_id AND owner_id = auth.uid()
        )
    );

-- Les propriétaires peuvent créer des transactions
CREATE POLICY "Establishment owners can create transactions"
    ON transactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM establishments
            WHERE id = establishment_id AND owner_id = auth.uid()
        )
    );

-- =====================================================
-- POLICIES: marketing_campaigns
-- =====================================================

-- Les propriétaires peuvent gérer leurs campagnes
CREATE POLICY "Establishment owners can manage campaigns"
    ON marketing_campaigns FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM establishments
            WHERE id = marketing_campaigns.establishment_id AND owner_id = auth.uid()
        )
    );

-- =====================================================
-- POLICIES: notifications
-- =====================================================

-- Les utilisateurs peuvent voir leurs notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

-- Les utilisateurs peuvent marquer leurs notifications comme lues
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

-- =====================================================
-- POLICIES: support_tickets
-- =====================================================

-- Les utilisateurs peuvent voir leurs tickets
CREATE POLICY "Users can view own tickets"
    ON support_tickets FOR SELECT
    USING (user_id = auth.uid());

-- Les utilisateurs peuvent créer des tickets
CREATE POLICY "Users can create tickets"
    ON support_tickets FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Les admins peuvent voir tous les tickets
CREATE POLICY "Admins can view all tickets"
    ON support_tickets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Les admins peuvent gérer tous les tickets
CREATE POLICY "Admins can manage tickets"
    ON support_tickets FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- =====================================================
-- POLICIES: ticket_messages
-- =====================================================

-- Les utilisateurs peuvent voir les messages de leurs tickets
CREATE POLICY "Users can view own ticket messages"
    ON ticket_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE id = ticket_messages.ticket_id AND user_id = auth.uid()
        )
    );

-- Les utilisateurs peuvent créer des messages sur leurs tickets
CREATE POLICY "Users can create ticket messages"
    ON ticket_messages FOR INSERT
    WITH CHECK (
        author_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE id = ticket_id AND user_id = auth.uid()
        )
    );

-- Les admins peuvent voir et créer tous les messages
CREATE POLICY "Admins can manage all ticket messages"
    ON ticket_messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );
