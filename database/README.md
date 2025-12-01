# Base de Données - Plateforme de Réservation Beauté

## 📋 Vue d'ensemble

Cette base de données PostgreSQL est conçue pour Supabase et supporte une plateforme complète de réservation pour les établissements de beauté et bien-être (type Planity).

## 🔗 Configuration Supabase

**URL du projet:** `https://tnfnsgztpsuhymjxqifp.supabase.co`  
**Clé API (anon):** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZm5zZ3p0cHN1aHltanhxaWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTY4NjYsImV4cCI6MjA3Nzk5Mjg2Nn0.RDpBZRYks-xWkhTvLrtsKUGix3ydQwZRHeNQLcA0qSs`

## 📁 Structure des fichiers

```
database/
├── 01_schema.sql              # Schéma complet des tables
├── 02_rls_policies.sql        # Politiques de sécurité RLS
├── 03_functions_triggers.sql  # Fonctions et triggers
├── 04_seed_data.sql          # Données de test
└── README.md                 # Ce fichier
```

## 🚀 Installation

### Méthode 1: Via l'interface Supabase (Recommandé)

1. Connectez-vous à [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Exécutez les fichiers dans l'ordre:
   - `01_schema.sql`
   - `02_rls_policies.sql`
   - `03_functions_triggers.sql`
   - `04_seed_data.sql` (optionnel, pour les tests)

### Méthode 2: Via CLI Supabase

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref tnfnsgztpsuhymjxqifp

# Exécuter les migrations
supabase db push
```

## 📊 Schéma de la base de données

### Tables principales

#### 👤 Utilisateurs et Profils
- **profiles** - Profils utilisateurs (extension de auth.users)
- **client_preferences** - Préférences des clients

#### 🏢 Établissements
- **establishments** - Salons, instituts, spas
- **staff_members** - Collaborateurs/employés
- **services** - Prestations proposées

#### 📅 Réservations
- **appointments** - Rendez-vous
- **availability_slots** - Créneaux de disponibilité
- **time_off** - Absences et congés
- **waiting_list** - Liste d'attente

#### 💰 Paiements
- **transactions** - Historique des paiements

#### ⭐ Avis et Communication
- **reviews** - Avis clients
- **notifications** - Notifications système
- **marketing_campaigns** - Campagnes marketing

#### 🎫 Support
- **support_tickets** - Tickets de support
- **ticket_messages** - Messages des tickets

## 🔐 Sécurité (RLS)

Toutes les tables sont protégées par Row Level Security (RLS):

- **Clients**: Accès à leurs propres données (RDV, avis, préférences)
- **Professionnels**: Gestion complète de leur établissement
- **Admins**: Accès global pour la modération

## ⚡ Fonctions principales

### Recherche géographique
```sql
SELECT * FROM search_establishments_nearby(
    48.8566,  -- latitude
    2.3522,   -- longitude
    10,       -- rayon en km
    'coiffeur', -- catégorie (optionnel)
    20        -- limite de résultats
);
```

### Créneaux disponibles
```sql
SELECT * FROM get_available_slots(
    'staff-member-uuid',
    '2024-01-15',  -- date
    60             -- durée du service en minutes
);
```

### Statistiques établissement
```sql
SELECT * FROM get_establishment_stats(
    'establishment-uuid',
    '2024-01-01',  -- date début
    '2024-01-31'   -- date fin
);
```

## 🔔 Triggers automatiques

- **Mise à jour automatique** de `updated_at`
- **Création automatique** du profil lors de l'inscription
- **Calcul automatique** de la note moyenne des établissements
- **Vérification** des conflits de rendez-vous
- **Notifications automatiques** pour:
  - Nouveaux rendez-vous
  - Annulations
  - Disponibilités en liste d'attente
- **Vérification** des avis (liés à des RDV réels)

## 📝 Types de données

### Statuts des rendez-vous
- `pending` - En attente
- `confirmed` - Confirmé
- `cancelled` - Annulé
- `completed` - Complété
- `no_show` - Absence

### Types d'utilisateurs
- `client` - Client
- `professional` - Professionnel
- `admin` - Administrateur

### Catégories d'établissements
- `coiffeur`
- `barbier`
- `esthetique`
- `spa`
- `onglerie`
- `massage`
- `tatouage`

## 🧪 Données de test

Le fichier `04_seed_data.sql` contient des exemples:
- 2 établissements (Paris et Lyon)
- 3 collaborateurs
- 7 services
- Créneaux de disponibilité

⚠️ **Note**: Les UUID des propriétaires doivent être remplacés par des IDs réels après création des comptes via Supabase Auth.

## 🔧 Configuration recommandée

### Variables d'environnement (.env)

```env
SUPABASE_URL=https://tnfnsgztpsuhymjxqifp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Extensions PostgreSQL requises

- `uuid-ossp` - Génération d'UUID (déjà inclus)
- `postgis` - Pour recherche géographique avancée (optionnel)

## 📈 Optimisations

### Index créés
- Recherche géographique (latitude/longitude)
- Recherche par ville et catégorie
- Recherche de rendez-vous par date
- Recherche de collaborateurs par établissement

### Performance
- Utilisation de JSONB pour les horaires flexibles
- Index sur les colonnes fréquemment recherchées
- Triggers optimisés pour les notifications

## 🔄 Migrations futures

Pour ajouter de nouvelles fonctionnalités:

1. Créer un nouveau fichier `05_nouvelle_feature.sql`
2. Tester en environnement de développement
3. Appliquer en production via Supabase Dashboard

## 📞 Support

Pour toute question sur la structure de la base de données:
- Consulter la documentation Supabase: https://supabase.com/docs
- Vérifier les logs dans le Dashboard Supabase

## ✅ Checklist de déploiement

- [ ] Exécuter `01_schema.sql`
- [ ] Exécuter `02_rls_policies.sql`
- [ ] Exécuter `03_functions_triggers.sql`
- [ ] Vérifier que RLS est activé sur toutes les tables
- [ ] Tester les politiques de sécurité
- [ ] Configurer les webhooks (optionnel)
- [ ] Configurer les sauvegardes automatiques
- [ ] Documenter les variables d'environnement

## 🎯 Prochaines étapes

1. **Frontend**: Créer l'interface React avec les composants de réservation
2. **API**: Développer les endpoints REST/GraphQL
3. **Authentification**: Configurer OAuth (Google, Facebook)
4. **Paiements**: Intégrer Stripe
5. **Notifications**: Configurer Twilio (SMS) et SendGrid (Email)
