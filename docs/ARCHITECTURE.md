# 🏗️ Architecture Technique - PlannV

## Vue d'Ensemble

PlannV est une application web moderne construite avec une architecture JAMstack, utilisant Next.js 14 pour le frontend et Supabase pour le backend.

## Stack Technique

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: TailwindCSS + shadcn/ui
- **Icons**: Lucide React
- **State Management**: Zustand (à implémenter)
- **Forms**: React Hook Form (à implémenter)
- **Validation**: Zod (à implémenter)

### Backend
- **BaaS**: Supabase
- **Database**: PostgreSQL 15
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### Services Externes (à configurer)
- **Paiements**: Stripe
- **Email**: SendGrid
- **SMS**: Twilio
- **Maps**: Google Maps API

## Architecture des Dossiers

```
plannv/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Groupe de routes authentification
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (client)/                 # Groupe de routes client
│   │   ├── dashboard/
│   │   ├── appointments/
│   │   ├── search/
│   │   └── profile/
│   ├── (professional)/           # Groupe de routes professionnel
│   │   ├── dashboard/
│   │   ├── establishment/
│   │   ├── staff/
│   │   ├── services/
│   │   ├── calendar/
│   │   └── analytics/
│   ├── (admin)/                  # Groupe de routes admin
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── establishments/
│   │   └── support/
│   ├── api/                      # API Routes
│   │   ├── appointments/
│   │   ├── payments/
│   │   └── webhooks/
│   ├── layout.tsx                # Layout racine
│   ├── page.tsx                  # Page d'accueil
│   └── globals.css               # Styles globaux
│
├── components/                   # Composants React
│   ├── ui/                       # Composants shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── booking/                  # Composants de réservation
│   │   ├── calendar.tsx
│   │   ├── time-picker.tsx
│   │   └── booking-form.tsx
│   ├── establishment/            # Composants établissement
│   │   ├── card.tsx
│   │   ├── details.tsx
│   │   └── reviews.tsx
│   ├── layout/                   # Composants de layout
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── sidebar.tsx
│   └── shared/                   # Composants partagés
│       ├── loading.tsx
│       ├── error.tsx
│       └── empty-state.tsx
│
├── lib/                          # Bibliothèques et utilitaires
│   ├── supabase/                 # Configuration Supabase
│   │   ├── client.ts             # Client côté client
│   │   ├── server.ts             # Client côté serveur
│   │   └── middleware.ts         # Middleware auth
│   ├── stripe/                   # Configuration Stripe
│   │   └── client.ts
│   ├── utils.ts                  # Fonctions utilitaires
│   └── constants.ts              # Constantes
│
├── types/                        # Types TypeScript
│   ├── database.types.ts         # Types Supabase
│   ├── api.types.ts              # Types API
│   └── index.ts                  # Exports
│
├── hooks/                        # Custom React Hooks
│   ├── use-auth.ts               # Hook authentification
│   ├── use-appointments.ts       # Hook rendez-vous
│   └── use-establishments.ts     # Hook établissements
│
├── store/                        # State management (Zustand)
│   ├── auth-store.ts
│   ├── booking-store.ts
│   └── ui-store.ts
│
├── database/                     # Scripts SQL
│   ├── 01_schema.sql
│   ├── 02_rls_policies.sql
│   ├── 03_functions_triggers.sql
│   └── 04_seed_data.sql
│
└── public/                       # Assets statiques
    ├── images/
    └── icons/
```

## Flux de Données

### Authentification
```
User → Login Form → Supabase Auth → JWT Token → Cookies → Protected Routes
```

### Réservation
```
Client → Search → Establishment → Service Selection → 
Calendar → Time Slot → Booking Form → Supabase → 
Confirmation → Notifications
```

### Gestion Professionnelle
```
Professional → Dashboard → Manage (Staff/Services/Calendar) → 
Supabase → Real-time Updates → Client View
```

## Sécurité

### Row Level Security (RLS)
Toutes les tables Supabase utilisent RLS pour garantir que :
- Les clients ne voient que leurs propres données
- Les professionnels ne gèrent que leur établissement
- Les admins ont un accès global contrôlé

### Authentification
- JWT tokens stockés dans des cookies HTTP-only
- Refresh tokens automatiques
- OAuth2 pour Google/Facebook
- Rate limiting sur les endpoints sensibles

### Validation
- Validation côté client (React Hook Form + Zod)
- Validation côté serveur (PostgreSQL constraints)
- Sanitization des inputs

## Performance

### Optimisations Frontend
- **Code Splitting**: Chargement lazy des composants
- **Image Optimization**: Next.js Image component
- **Caching**: SWR pour le cache des données
- **SSR/SSG**: Rendu côté serveur pour le SEO

### Optimisations Backend
- **Index Database**: Index sur les colonnes fréquemment recherchées
- **Connection Pooling**: Supabase gère automatiquement
- **CDN**: Assets statiques via Vercel Edge Network
- **Caching**: Cache des requêtes fréquentes

### Optimisations Réseau
- **Compression**: Gzip/Brotli
- **HTTP/2**: Support natif
- **Prefetching**: Next.js Link prefetching
- **Lazy Loading**: Images et composants

## Scalabilité

### Horizontal Scaling
- **Frontend**: Déployé sur Vercel Edge Network
- **Backend**: Supabase auto-scale
- **Database**: PostgreSQL avec read replicas

### Vertical Scaling
- **Database**: Upgrade du plan Supabase
- **Storage**: Supabase Storage illimité
- **Bandwidth**: CDN global

## Monitoring & Logging

### Frontend
- **Analytics**: Google Analytics / Plausible
- **Error Tracking**: Sentry
- **Performance**: Vercel Analytics

### Backend
- **Logs**: Supabase Logs
- **Metrics**: Supabase Dashboard
- **Alerts**: Email/Slack notifications

## CI/CD

### Pipeline
```
Git Push → GitHub Actions → Tests → Build → Deploy (Vercel)
```

### Environnements
- **Development**: Local (localhost:3000)
- **Staging**: Vercel Preview (auto-deploy sur PR)
- **Production**: Vercel Production (auto-deploy sur main)

## API Design

### REST Endpoints
```
GET    /api/establishments          # Liste des établissements
GET    /api/establishments/:id      # Détails établissement
POST   /api/appointments            # Créer un rendez-vous
GET    /api/appointments/:id        # Détails rendez-vous
PATCH  /api/appointments/:id        # Modifier rendez-vous
DELETE /api/appointments/:id        # Annuler rendez-vous
```

### Webhooks
```
POST   /api/webhooks/stripe         # Stripe events
POST   /api/webhooks/supabase       # Supabase events
```

## Database Schema

Voir `database/schema_diagram.md` pour le diagramme complet.

### Tables Principales
- **profiles**: Utilisateurs
- **establishments**: Établissements
- **staff_members**: Collaborateurs
- **services**: Prestations
- **appointments**: Rendez-vous
- **reviews**: Avis
- **transactions**: Paiements

## Patterns & Best Practices

### React Patterns
- **Composition**: Composants réutilisables
- **Hooks**: Custom hooks pour la logique métier
- **Context**: Pour l'état global (auth, theme)
- **Error Boundaries**: Gestion des erreurs

### TypeScript
- **Strict Mode**: Activé
- **Type Safety**: Types pour toutes les données
- **Generics**: Pour les composants réutilisables

### CSS
- **Utility-First**: TailwindCSS
- **Component Variants**: CVA (class-variance-authority)
- **Responsive**: Mobile-first approach

## Roadmap Technique

### Q1 2024
- [x] Setup initial
- [x] Base de données
- [x] Authentification
- [ ] Interface client
- [ ] Interface professionnelle

### Q2 2024
- [ ] Paiements Stripe
- [ ] Notifications
- [ ] Recherche avancée
- [ ] Analytics

### Q3 2024
- [ ] Application mobile (React Native)
- [ ] API publique
- [ ] Webhooks avancés

### Q4 2024
- [ ] IA pour recommandations
- [ ] Programme de fidélité
- [ ] Marketplace
