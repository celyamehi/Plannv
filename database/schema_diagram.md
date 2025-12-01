# Diagramme du Schéma de Base de Données

## 🗺️ Vue d'ensemble des relations

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AUTHENTIFICATION                              │
│                                                                      │
│  ┌──────────────┐                                                   │
│  │  auth.users  │ (Supabase Auth)                                   │
│  └──────┬───────┘                                                   │
│         │                                                            │
│         │ 1:1                                                        │
│         ▼                                                            │
│  ┌──────────────┐                                                   │
│  │   profiles   │ (Extension avec user_type)                        │
│  └──────┬───────┘                                                   │
└─────────┼────────────────────────────────────────────────────────────┘
          │
          │
┌─────────┴────────────────────────────────────────────────────────────┐
│                         ÉTABLISSEMENTS                                │
│                                                                       │
│  ┌──────────────────┐                                                │
│  │  establishments  │                                                │
│  │  ─────────────── │                                                │
│  │  - owner_id (FK) │◄──────── profiles                             │
│  │  - name          │                                                │
│  │  - category      │                                                │
│  │  - address       │                                                │
│  │  - lat/long      │                                                │
│  │  - opening_hours │                                                │
│  └────────┬─────────┘                                                │
│           │                                                           │
│           │ 1:N                                                       │
│           ├──────────────────┬──────────────────┬──────────────────┐ │
│           ▼                  ▼                  ▼                  ▼ │
│  ┌────────────────┐ ┌────────────────┐ ┌──────────────┐ ┌─────────┴┐
│  │ staff_members  │ │    services    │ │   reviews    │ │campaigns │
│  │ ────────────── │ │ ────────────── │ │ ──────────── │ └──────────┘
│  │ - first_name   │ │ - name         │ │ - rating     │              │
│  │ - title        │ │ - duration     │ │ - comment    │              │
│  │ - specialties  │ │ - price        │ │ - client_id  │              │
│  └────────┬───────┘ └────────┬───────┘ └──────────────┘              │
└───────────┼──────────────────┼──────────────────────────────────────┘
            │                  │
            │ 1:N              │ 1:N
            │                  │
┌───────────┴──────────────────┴──────────────────────────────────────┐
│                          RÉSERVATIONS                                │
│                                                                      │
│                    ┌──────────────────┐                             │
│                    │   appointments   │                             │
│                    │ ──────────────── │                             │
│                    │ - establishment  │◄──── establishments         │
│                    │ - client_id      │◄──── profiles               │
│                    │ - staff_member   │◄──── staff_members          │
│                    │ - service_id     │◄──── services               │
│                    │ - date/time      │                             │
│                    │ - status         │                             │
│                    │ - total_price    │                             │
│                    └────────┬─────────┘                             │
│                             │                                        │
│                             │ 1:1                                    │
│                             ▼                                        │
│                    ┌──────────────────┐                             │
│                    │  transactions    │                             │
│                    │ ──────────────── │                             │
│                    │ - amount         │                             │
│                    │ - payment_method │                             │
│                    │ - status         │                             │
│                    └──────────────────┘                             │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      DISPONIBILITÉS                                   │
│                                                                       │
│  ┌────────────────────┐         ┌──────────────┐                    │
│  │ availability_slots │         │  time_off    │                    │
│  │ ────────────────── │         │ ──────────── │                    │
│  │ - staff_member_id  │◄────┐   │ - staff_id   │◄────┐              │
│  │ - day_of_week      │     │   │ - start_date │     │              │
│  │ - start_time       │     │   │ - end_date   │     │              │
│  │ - end_time         │     │   └──────────────┘     │              │
│  └────────────────────┘     │                        │              │
│                              │                        │              │
│                              └────────────────────────┘              │
│                                   staff_members                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    LISTE D'ATTENTE & PRÉFÉRENCES                      │
│                                                                       │
│  ┌─────────────────┐              ┌──────────────────────┐          │
│  │  waiting_list   │              │ client_preferences   │          │
│  │ ─────────────── │              │ ──────────────────── │          │
│  │ - client_id     │◄──┐          │ - client_id          │◄──┐      │
│  │ - establishment │   │          │ - favorite_estabs    │   │      │
│  │ - service_id    │   │          │ - favorite_staff     │   │      │
│  │ - preferred_*   │   │          │ - notifications      │   │      │
│  │ - status        │   │          └──────────────────────┘   │      │
│  └─────────────────┘   │                                     │      │
│                         └─────────────────────────────────────┘      │
│                                    profiles                          │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATIONS & SUPPORT                            │
│                                                                       │
│  ┌──────────────────┐         ┌──────────────────┐                  │
│  │  notifications   │         │ support_tickets  │                  │
│  │ ──────────────── │         │ ──────────────── │                  │
│  │ - user_id        │◄──┐     │ - user_id        │◄──┐              │
│  │ - type           │   │     │ - subject        │   │              │
│  │ - message        │   │     │ - status         │   │              │
│  │ - is_read        │   │     │ - priority       │   │              │
│  └──────────────────┘   │     └────────┬─────────┘   │              │
│                          │              │             │              │
│                          │              │ 1:N         │              │
│                          │              ▼             │              │
│                          │     ┌──────────────────┐   │              │
│                          │     │ ticket_messages  │   │              │
│                          │     │ ──────────────── │   │              │
│                          │     │ - ticket_id      │   │              │
│                          │     │ - author_id      │   │              │
│                          │     │ - message        │   │              │
│                          │     └──────────────────┘   │              │
│                          │                            │              │
│                          └────────────────────────────┘              │
│                                    profiles                          │
└──────────────────────────────────────────────────────────────────────┘
```

## 📊 Cardinalités principales

### Relations 1:N (Un à Plusieurs)
- **profiles** → **establishments** (un propriétaire, plusieurs établissements)
- **establishments** → **staff_members** (un établissement, plusieurs collaborateurs)
- **establishments** → **services** (un établissement, plusieurs services)
- **establishments** → **appointments** (un établissement, plusieurs RDV)
- **staff_members** → **appointments** (un collaborateur, plusieurs RDV)
- **staff_members** → **availability_slots** (un collaborateur, plusieurs créneaux)
- **profiles** (client) → **appointments** (un client, plusieurs RDV)

### Relations 1:1
- **auth.users** ↔ **profiles** (un utilisateur, un profil)
- **appointments** ↔ **transactions** (un RDV, une transaction principale)

### Relations N:N (via tableaux)
- **services** ↔ **staff_members** (via `available_staff_ids[]`)
- **client_preferences** stocke des tableaux d'IDs pour favoris

## 🔑 Clés étrangères importantes

```sql
-- Établissements
establishments.owner_id → profiles.id

-- Collaborateurs
staff_members.establishment_id → establishments.id
staff_members.profile_id → profiles.id (optionnel)

-- Services
services.establishment_id → establishments.id

-- Rendez-vous
appointments.establishment_id → establishments.id
appointments.client_id → profiles.id
appointments.staff_member_id → staff_members.id
appointments.service_id → services.id

-- Avis
reviews.establishment_id → establishments.id
reviews.client_id → profiles.id
reviews.appointment_id → appointments.id (optionnel)

-- Transactions
transactions.appointment_id → appointments.id
transactions.establishment_id → establishments.id
transactions.client_id → profiles.id
```

## 🎯 Index de performance

### Recherche géographique
```sql
CREATE INDEX idx_establishments_location 
ON establishments(latitude, longitude);
```

### Recherche de rendez-vous
```sql
CREATE INDEX idx_appointments_date 
ON appointments(appointment_date, start_time);

CREATE INDEX idx_appointments_staff 
ON appointments(staff_member_id);
```

### Recherche d'établissements
```sql
CREATE INDEX idx_establishments_city 
ON establishments(city);

CREATE INDEX idx_establishments_category 
ON establishments(category);
```

## 📈 Flux de données typiques

### 1. Création d'un rendez-vous
```
Client → appointments (INSERT)
  ↓
Trigger: check_appointment_conflict()
  ↓
Trigger: notify_new_appointment()
  ↓
notifications (INSERT pour client et pro)
```

### 2. Annulation d'un rendez-vous
```
appointments.status = 'cancelled' (UPDATE)
  ↓
Trigger: notify_appointment_cancellation()
  ↓
notifications (INSERT)
  ↓
Trigger: notify_waiting_list_on_cancellation()
  ↓
waiting_list (UPDATE status = 'notified')
```

### 3. Ajout d'un avis
```
reviews (INSERT)
  ↓
Trigger: verify_review()
  ↓
Trigger: update_establishment_rating()
  ↓
establishments.average_rating (UPDATE)
```

## 🔒 Sécurité RLS

Chaque table a des politiques RLS spécifiques:

- **Clients**: Accès limité à leurs propres données
- **Professionnels**: Accès complet à leur établissement
- **Admins**: Accès global

Exemple:
```sql
-- Les clients voient uniquement leurs RDV
CREATE POLICY "Clients can view own appointments"
ON appointments FOR SELECT
USING (client_id = auth.uid());

-- Les pros voient tous les RDV de leur établissement
CREATE POLICY "Establishment owners can view appointments"
ON appointments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM establishments
        WHERE id = appointments.establishment_id 
        AND owner_id = auth.uid()
    )
);
```
