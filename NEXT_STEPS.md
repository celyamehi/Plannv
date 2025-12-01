# 🎯 Prochaines Étapes - PlannV

## 🚨 ACTION IMMÉDIATE REQUISE

### 1️⃣ Configurer la Base de Données Supabase (15 min)

**C'est la seule étape manquante pour que l'application soit fonctionnelle !**

#### Étapes Détaillées

1. **Ouvrir Supabase Dashboard**
   ```
   https://app.supabase.com
   ```

2. **Sélectionner votre projet**
   - Project: `tnfnsgztpsuhymjxqifp`

3. **Aller dans SQL Editor**
   - Menu gauche → SQL Editor
   - Cliquer sur "+ New query"

4. **Exécuter les scripts (dans l'ordre !)**

   **Script 1 : Schéma** ⏱️ 2 min
   ```
   Ouvrir: database/01_schema.sql
   Copier tout le contenu
   Coller dans SQL Editor
   Cliquer "Run" (ou Ctrl+Enter)
   ✅ Attendre "Success"
   ```

   **Script 2 : Sécurité** ⏱️ 1 min
   ```
   Ouvrir: database/02_rls_policies.sql
   Copier tout le contenu
   Coller dans SQL Editor
   Cliquer "Run"
   ✅ Attendre "Success"
   ```

   **Script 3 : Fonctions** ⏱️ 2 min
   ```
   Ouvrir: database/03_functions_triggers.sql
   Copier tout le contenu
   Coller dans SQL Editor
   Cliquer "Run"
   ✅ Attendre "Success"
   ```

   **Script 4 : Données de test** (OPTIONNEL) ⏱️ 1 min
   ```
   Ouvrir: database/04_seed_data.sql
   Copier tout le contenu
   Coller dans SQL Editor
   Cliquer "Run"
   ✅ Attendre "Success"
   ```

5. **Vérifier que tout fonctionne**
   ```sql
   -- Copier-coller cette requête dans SQL Editor
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```
   
   **Vous devriez voir ces tables :**
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

## 2️⃣ Tester l'Application (5 min)

### A. Créer un Compte Test

**Option 1 : Via Supabase Dashboard**
```
1. Supabase Dashboard → Authentication → Users
2. Cliquer "Add user"
3. Email: test@plannv.com
4. Password: Test123456!
5. Cliquer "Create user"
```

**Option 2 : Via l'application**
```
1. Aller sur http://localhost:3000/signup
2. Remplir le formulaire
3. Créer le compte
```

### B. Tester la Connexion

```
1. Aller sur http://localhost:3000/login
2. Se connecter avec test@plannv.com
3. Vérifier la redirection vers /dashboard
4. ✅ Succès si vous voyez le dashboard !
```

---

## 3️⃣ Développement des Fonctionnalités (Semaine 1)

### Jour 1-2 : Page de Recherche

**Fichier à créer** : `app/search/page.tsx`

**Fonctionnalités** :
- [ ] Barre de recherche avancée
- [ ] Filtres (catégorie, ville, note)
- [ ] Carte interactive (Google Maps)
- [ ] Liste des résultats avec cartes
- [ ] Pagination
- [ ] Utilisation de `search_establishments_nearby()`

**Exemple de requête** :
```typescript
const { data: establishments } = await supabase
  .rpc('search_establishments_nearby', {
    p_latitude: 48.8566,
    p_longitude: 2.3522,
    p_radius_km: 10,
    p_category: 'coiffeur',
    p_limit: 20
  })
```

### Jour 3-4 : Fiche Établissement

**Fichier à créer** : `app/establishments/[slug]/page.tsx`

**Fonctionnalités** :
- [ ] Détails complets (nom, adresse, horaires)
- [ ] Galerie photos
- [ ] Liste des services avec prix
- [ ] Liste des collaborateurs
- [ ] Avis clients avec notes
- [ ] Bouton "Réserver"

### Jour 5-7 : Calendrier de Réservation

**Fichier à créer** : `components/booking/calendar.tsx`

**Fonctionnalités** :
- [ ] Sélection de la date (react-day-picker)
- [ ] Affichage des créneaux disponibles
- [ ] Utilisation de `get_available_slots()`
- [ ] Sélection du créneau
- [ ] Style Calendly (épuré, fluide)
- [ ] Confirmation de réservation

**Exemple de requête** :
```typescript
const { data: slots } = await supabase
  .rpc('get_available_slots', {
    p_staff_member_id: staffId,
    p_date: '2024-11-10',
    p_service_duration: 60
  })
```

---

## 4️⃣ Développement Interface Professionnelle (Semaine 2)

### Dashboard Professionnel

**Fichier à créer** : `app/(professional)/dashboard/page.tsx`

**Fonctionnalités** :
- [ ] Vue d'ensemble du jour
- [ ] Rendez-vous du jour
- [ ] Statistiques rapides (CA, nb RDV)
- [ ] Notifications
- [ ] Accès rapide aux fonctionnalités

### Gestion Établissement

**Fichier à créer** : `app/(professional)/establishment/page.tsx`

**Fonctionnalités** :
- [ ] Formulaire d'édition
- [ ] Upload de photos (Supabase Storage)
- [ ] Gestion des horaires
- [ ] Paramètres de réservation

### Gestion Collaborateurs

**Fichier à créer** : `app/(professional)/staff/page.tsx`

**Fonctionnalités** :
- [ ] Liste des collaborateurs
- [ ] Ajout/édition
- [ ] Gestion des disponibilités
- [ ] Assignation aux services

### Gestion Services

**Fichier à créer** : `app/(professional)/services/page.tsx`

**Fonctionnalités** :
- [ ] Liste des services
- [ ] Ajout/édition
- [ ] Tarifs et durées
- [ ] Activation/désactivation

---

## 5️⃣ Intégrations Externes (Semaine 3-4)

### Stripe (Paiements)

```bash
npm install stripe @stripe/stripe-js
```

**Fichiers à créer** :
- `lib/stripe/client.ts`
- `app/api/create-payment-intent/route.ts`
- `app/api/webhooks/stripe/route.ts`

### SendGrid (Email)

```bash
npm install @sendgrid/mail
```

**Fichiers à créer** :
- `lib/email/sendgrid.ts`
- Templates d'emails

### Twilio (SMS)

```bash
npm install twilio
```

**Fichiers à créer** :
- `lib/sms/twilio.ts`
- Templates SMS

---

## 📊 Progression Recommandée

```
Semaine 1
├── Jour 1-2: Configuration DB + Page de recherche
├── Jour 3-4: Fiche établissement
└── Jour 5-7: Calendrier de réservation

Semaine 2
├── Jour 1-2: Dashboard professionnel
├── Jour 3-4: Gestion établissement + collaborateurs
└── Jour 5-7: Gestion services + calendrier pro

Semaine 3
├── Jour 1-3: Intégration Stripe
├── Jour 4-5: Notifications email
└── Jour 6-7: Notifications SMS

Semaine 4
├── Jour 1-2: Système d'avis
├── Jour 3-4: Liste d'attente
├── Jour 5-6: Analytics
└── Jour 7: Tests et corrections
```

---

## 🎯 Objectifs par Semaine

### Semaine 1 : Interface Client ✅
- ✅ Recherche d'établissements
- ✅ Fiche établissement
- ✅ Réservation complète

### Semaine 2 : Interface Professionnelle ✅
- ✅ Dashboard complet
- ✅ Gestion établissement
- ✅ Gestion collaborateurs/services

### Semaine 3 : Paiements & Notifications ✅
- ✅ Stripe intégré
- ✅ Emails automatiques
- ✅ SMS de rappel

### Semaine 4 : Finitions ✅
- ✅ Avis et notes
- ✅ Liste d'attente
- ✅ Analytics
- ✅ Tests complets

---

## 🚀 Commandes Utiles

```bash
# Développement (déjà en cours)
npm run dev

# Installer une dépendance
npm install <package-name>

# Générer les types DB
npx supabase gen types typescript --project-id tnfnsgztpsuhymjxqifp > types/database.types.ts

# Build production
npm run build

# Lancer en production
npm run start
```

---

## 📝 Checklist Quotidienne

### Chaque matin
- [ ] Vérifier que le serveur tourne
- [ ] Pull les dernières modifications (si équipe)
- [ ] Consulter le TODO.md
- [ ] Prioriser les tâches du jour

### Chaque soir
- [ ] Commit et push le code
- [ ] Mettre à jour le TODO.md
- [ ] Tester les nouvelles fonctionnalités
- [ ] Documenter les changements

---

## 🎯 Métriques de Succès

### Semaine 1
- [ ] 3 pages créées (recherche, fiche, réservation)
- [ ] Réservation fonctionnelle de bout en bout
- [ ] Tests utilisateurs positifs

### Semaine 2
- [ ] Dashboard professionnel complet
- [ ] Gestion complète de l'établissement
- [ ] Calendrier professionnel fonctionnel

### Semaine 3
- [ ] Paiements Stripe opérationnels
- [ ] Emails automatiques envoyés
- [ ] SMS de rappel fonctionnels

### Semaine 4
- [ ] MVP complet et testé
- [ ] Prêt pour les premiers utilisateurs
- [ ] Documentation à jour

---

## 🎉 Vous Êtes Prêt !

### Ce qui est fait ✅
- ✅ Infrastructure complète
- ✅ Base de données conçue
- ✅ Authentification fonctionnelle
- ✅ Dashboard client
- ✅ Documentation exhaustive
- ✅ Serveur en cours d'exécution

### Ce qu'il reste à faire ⏳
- ⏳ Configurer la DB Supabase (15 min)
- ⏳ Développer les fonctionnalités (4 semaines)

---

**Prochaine action** : Configurer la base de données Supabase ! 🚀

Bon développement ! 💪
