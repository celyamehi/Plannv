# 🚀 Guide de Démarrage Rapide - PlannV

**Version** : 0.2.0  
**Date** : 7 novembre 2024

---

## ✅ Ce qui est déjà fait

- ✅ Projet Next.js configuré
- ✅ Dépendances installées
- ✅ Pages client créées (recherche, établissement, réservation)
- ✅ Pages professionnelles créées (dashboard, services, équipe)
- ✅ Composants UI (shadcn/ui)
- ✅ Configuration Supabase
- ✅ Design system moderne

---

## 🎯 Étapes pour Démarrer

### 1️⃣ Vérifier le Serveur de Développement

Le serveur devrait déjà être en cours d'exécution. Sinon :

```bash
npm run dev
```

Ouvrir : http://localhost:3000

---

### 2️⃣ Configurer la Base de Données Supabase ⚠️ IMPORTANT

**C'est l'étape cruciale pour que l'application fonctionne !**

#### A. Se connecter à Supabase
1. Aller sur https://app.supabase.com
2. Se connecter avec votre compte
3. Sélectionner votre projet : `tnfnsgztpsuhymjxqifp`

#### B. Exécuter les Scripts SQL (dans l'ordre)

**Script 1 : Schéma de base de données** (2 min)
```
1. Menu gauche → SQL Editor
2. Cliquer "+ New query"
3. Ouvrir le fichier : database/01_schema.sql
4. Copier TOUT le contenu
5. Coller dans SQL Editor
6. Cliquer "Run" (ou Ctrl+Enter)
7. ✅ Attendre "Success. No rows returned"
```

**Script 2 : Politiques de sécurité RLS** (1 min)
```
1. Nouvelle requête
2. Ouvrir : database/02_rls_policies.sql
3. Copier et coller
4. Run
5. ✅ Attendre "Success"
```

**Script 3 : Fonctions et triggers** (2 min)
```
1. Nouvelle requête
2. Ouvrir : database/03_functions_triggers.sql
3. Copier et coller
4. Run
5. ✅ Attendre "Success"
```

**Script 4 : Données de test** (OPTIONNEL - 1 min)
```
1. Nouvelle requête
2. Ouvrir : database/04_seed_data.sql
3. Copier et coller
4. Run
5. ✅ Attendre "Success"
```

#### C. Vérifier que tout fonctionne

Dans SQL Editor, exécuter :
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Vous devriez voir **15 tables** :
- appointments
- availability_slots
- client_preferences
- establishments
- marketing_campaigns
- notifications
- profiles
- reviews
- services
- staff_members
- support_tickets
- ticket_messages
- time_off
- transactions
- waiting_list

---

### 3️⃣ Créer un Utilisateur Test

#### Option A : Via Supabase Dashboard (Recommandé)
```
1. Supabase Dashboard → Authentication → Users
2. Cliquer "Add user" → "Create new user"
3. Email: test@plannv.com
4. Password: Test123456!
5. Auto Confirm User: ✅ OUI (cocher)
6. Cliquer "Create user"
```

#### Option B : Via l'application
```
1. Aller sur http://localhost:3000/signup
2. Remplir le formulaire
3. S'inscrire
```

---

### 4️⃣ Tester l'Application

#### A. Tester l'Interface Client

**Page d'accueil**
```
URL: http://localhost:3000
✅ Vérifier l'affichage
✅ Cliquer sur "Rechercher"
```

**Page de recherche**
```
URL: http://localhost:3000/search
✅ Voir la liste des établissements (si données de test)
✅ Tester les filtres par catégorie
✅ Cliquer sur un établissement
```

**Page établissement**
```
URL: http://localhost:3000/establishments/[slug]
✅ Voir les détails
✅ Voir les services
✅ Cliquer "Réserver" sur un service
```

**Réservation**
```
URL: http://localhost:3000/booking/[slug]
✅ Sélectionner un service
✅ Choisir un collaborateur
✅ Sélectionner date et créneau
✅ Confirmer la réservation
```

**Dashboard client**
```
URL: http://localhost:3000/dashboard
✅ Se connecter si nécessaire
✅ Voir les rendez-vous à venir
```

#### B. Tester l'Interface Professionnelle

**Créer un utilisateur professionnel**
```sql
-- Dans Supabase SQL Editor
UPDATE profiles 
SET user_type = 'professional' 
WHERE email = 'test@plannv.com';
```

**Dashboard professionnel**
```
URL: http://localhost:3000/professional/dashboard
✅ Voir les statistiques
✅ Voir les rendez-vous du jour
```

**Gestion des services**
```
URL: http://localhost:3000/professional/services
✅ Créer un nouveau service
✅ Modifier un service
✅ Activer/désactiver
```

**Gestion de l'équipe**
```
URL: http://localhost:3000/professional/staff
✅ Ajouter un collaborateur
✅ Modifier les informations
✅ Activer/désactiver
```

---

## 🎨 Pages Disponibles

### Pages Publiques
- `/` - Page d'accueil
- `/search` - Recherche d'établissements
- `/establishments/[slug]` - Détails établissement
- `/login` - Connexion
- `/signup` - Inscription

### Pages Client (authentification requise)
- `/dashboard` - Dashboard client
- `/booking/[slug]` - Réservation
- `/booking/confirmation/[id]` - Confirmation

### Pages Professionnelles (user_type = 'professional')
- `/professional/dashboard` - Dashboard pro
- `/professional/services` - Gestion services
- `/professional/staff` - Gestion équipe

---

## 🐛 Dépannage

### Problème : "No rows returned" lors de la recherche

**Solution** : Exécuter le script de données de test
```bash
database/04_seed_data.sql
```

### Problème : "Unauthorized" sur les pages professionnelles

**Solution** : Vérifier le user_type
```sql
SELECT id, email, user_type 
FROM profiles 
WHERE email = 'votre@email.com';

-- Si user_type est NULL ou 'client', le changer :
UPDATE profiles 
SET user_type = 'professional' 
WHERE email = 'votre@email.com';
```

### Problème : Erreur "establishment not found"

**Solution** : Créer un établissement pour l'utilisateur professionnel
```sql
INSERT INTO establishments (
  owner_id,
  name,
  slug,
  category,
  address,
  city,
  postal_code,
  phone
) VALUES (
  'votre-user-id',
  'Mon Salon',
  'mon-salon',
  'coiffeur',
  '123 Rue Example',
  'Paris',
  '75001',
  '0123456789'
);
```

### Problème : Erreur de connexion Supabase

**Solution** : Vérifier `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://tnfnsgztpsuhymjxqifp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

---

## 📊 Données de Test Recommandées

Si vous avez exécuté `04_seed_data.sql`, vous avez déjà :
- 3 établissements
- 9 services
- 6 collaborateurs
- Quelques rendez-vous

Sinon, créez manuellement :

### Créer un établissement
```sql
INSERT INTO establishments (owner_id, name, slug, category, address, city, postal_code, phone)
VALUES (
  'votre-user-id',
  'Salon Beauté Paris',
  'salon-beaute-paris',
  'coiffeur',
  '10 Rue de la Paix',
  'Paris',
  '75002',
  '0145678901'
);
```

### Créer un service
```sql
INSERT INTO services (establishment_id, name, duration, price)
VALUES (
  'establishment-id',
  'Coupe Homme',
  30,
  25.00
);
```

### Créer un collaborateur
```sql
INSERT INTO staff_members (establishment_id, first_name, last_name, email)
VALUES (
  'establishment-id',
  'Marie',
  'Dupont',
  'marie@salon.com'
);
```

---

## 🎯 Prochaines Étapes

Une fois que tout fonctionne :

1. **Personnaliser les données**
   - Créer vos propres établissements
   - Ajouter vos services
   - Configurer votre équipe

2. **Améliorer le calendrier**
   - Intégrer `get_available_slots()` SQL
   - Gérer les indisponibilités réelles

3. **Ajouter des fonctionnalités**
   - Profil utilisateur
   - Historique des rendez-vous
   - Notifications email/SMS

4. **Déployer**
   - Vercel (recommandé)
   - Netlify
   - Autre plateforme

---

## 📞 Besoin d'Aide ?

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

### Fichiers Utiles
- `README.md` - Documentation générale
- `ARCHITECTURE.md` - Architecture du projet
- `TODO.md` - Liste des tâches
- `NOUVELLES_FONCTIONNALITES.md` - Fonctionnalités ajoutées
- `database/README.md` - Documentation base de données

---

## ✅ Checklist de Démarrage

- [ ] Serveur de développement lancé (npm run dev)
- [ ] Base de données configurée (4 scripts SQL)
- [ ] Tables vérifiées (15 tables)
- [ ] Utilisateur test créé
- [ ] Page d'accueil testée
- [ ] Page de recherche testée
- [ ] Réservation testée
- [ ] Dashboard client testé
- [ ] Utilisateur professionnel créé
- [ ] Dashboard professionnel testé
- [ ] Services créés/testés
- [ ] Équipe créée/testée

---

## 🎉 Félicitations !

Votre application PlannV est maintenant opérationnelle ! 🚀

**Bon développement !** 💪

---

**Dernière mise à jour** : 7 novembre 2024
