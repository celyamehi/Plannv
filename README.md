# PlannV - Plateforme de Réservation Beauté & Bien-être

Une plateforme moderne de réservation en ligne pour salons de coiffure, instituts de beauté et spas, inspirée par Planity avec un design épuré style Apple et Calendly.

## 🚀 Technologies

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Paiements**: Stripe (à configurer)
- **Notifications**: SendGrid (Email), Twilio (SMS) - à configurer

## 📋 Fonctionnalités

### Pour les Clients
- ✅ Recherche d'établissements par localisation et catégorie
- ✅ Réservation en ligne avec calendrier interactif
- ✅ Gestion des rendez-vous
- ✅ Avis et notes
- ✅ Historique et préférences
- ✅ Notifications par email/SMS

### Pour les Professionnels
- ✅ Gestion d'établissement
- ✅ Gestion des collaborateurs
- ✅ Calendrier et disponibilités
- ✅ Gestion des services et tarifs
- ✅ CRM client simplifié
- ✅ Statistiques et rapports
- ✅ Module caisse
- ✅ Campagnes marketing

### Pour les Administrateurs
- ✅ Dashboard global
- ✅ Modération des avis
- ✅ Support client
- ✅ Gestion des tickets

## 🛠️ Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### Étapes

1. **Cloner le projet**
```bash
git clone <repository-url>
cd plannv
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://tnfnsgztpsuhymjxqifp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optionnel
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

4. **Configurer la base de données Supabase**

Exécuter les scripts SQL dans l'ordre :
- `database/01_schema.sql`
- `database/02_rls_policies.sql`
- `database/03_functions_triggers.sql`
- `database/04_seed_data.sql` (optionnel, données de test)

5. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
plannv/
├── app/                      # Pages Next.js (App Router)
│   ├── (auth)/              # Routes d'authentification
│   ├── (client)/            # Routes client
│   ├── (professional)/      # Routes professionnels
│   ├── (admin)/             # Routes admin
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Page d'accueil
├── components/              # Composants React réutilisables
│   ├── ui/                  # Composants shadcn/ui
│   ├── booking/             # Composants de réservation
│   ├── calendar/            # Composants calendrier
│   └── ...
├── lib/                     # Utilitaires et configurations
│   ├── supabase/            # Configuration Supabase
│   └── utils.ts             # Fonctions utilitaires
├── types/                   # Types TypeScript
│   └── database.types.ts    # Types générés depuis Supabase
├── database/                # Scripts SQL
│   ├── 01_schema.sql
│   ├── 02_rls_policies.sql
│   ├── 03_functions_triggers.sql
│   └── 04_seed_data.sql
└── public/                  # Assets statiques
```

## 🎨 Design System

Le projet utilise un design system inspiré d'Apple :
- **Couleurs**: Palette épurée avec dégradés subtils
- **Typographie**: Inter (système)
- **Espacements**: Système cohérent basé sur TailwindCSS
- **Composants**: shadcn/ui pour une base solide et personnalisable

## 🔐 Authentification

Supabase Auth supporte :
- Email/Password
- Google OAuth
- Facebook OAuth
- Magic Links

## 📱 Responsive

L'application est entièrement responsive :
- Mobile First
- Tablette optimisée
- Desktop avec sidebar

## 🧪 Tests

```bash
# Tests unitaires (à configurer)
npm run test

# Tests E2E (à configurer)
npm run test:e2e
```

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
vercel deploy
```

### Autres plateformes
- Netlify
- AWS Amplify
- Docker

## 📝 Scripts disponibles

```bash
npm run dev          # Développement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Linter
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 📞 Support

Pour toute question :
- Email: support@plannv.com
- Documentation: [docs.plannv.com](https://docs.plannv.com)

## 🗺️ Roadmap

- [ ] v1.0 - MVP avec fonctionnalités de base
- [ ] v1.1 - Intégration Stripe
- [ ] v1.2 - Notifications SMS/Email
- [ ] v1.3 - Application mobile (React Native)
- [ ] v2.0 - IA pour recommandations personnalisées
- [ ] v2.1 - Programme de fidélité
- [ ] v2.2 - Marketplace de produits beauté

## 🙏 Remerciements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
