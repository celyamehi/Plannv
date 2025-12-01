# 🚀 Guide de Démarrage Rapide - PlannV

## ✅ Étape 1 : Configuration de la Base de Données

### 1.1 Accéder à Supabase
1. Ouvrez votre navigateur et allez sur https://app.supabase.com
2. Connectez-vous à votre compte
3. Sélectionnez votre projet ou créez-en un nouveau

### 1.2 Exécuter les Scripts SQL
Dans l'ordre suivant, allez dans **SQL Editor** et exécutez :

1. **Schéma des tables** (`database/01_schema.sql`)
   - Crée toutes les tables nécessaires
   - Établit les relations entre les tables
   - Configure les index pour les performances

2. **Politiques de sécurité** (`database/02_rls_policies.sql`)
   - Active Row Level Security (RLS)
   - Définit les permissions par type d'utilisateur
   - Protège les données sensibles

3. **Fonctions et triggers** (`database/03_functions_triggers.sql`)
   - Automatise les mises à jour
   - Gère les notifications
   - Calcule les statistiques

4. **Données de test** (optionnel) (`database/04_seed_data.sql`)
   - Ajoute 2 établissements exemples
   - Crée des collaborateurs et services
   - Permet de tester immédiatement

### 1.3 Vérification
```sql
-- Vérifier que les tables sont créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Devrait afficher : profiles, establishments, staff_members, services, etc.
```

## ✅ Étape 2 : Configuration du Projet

### 2.1 Installer les Dépendances
```bash
cd plannv
npm install
```

### 2.2 Configurer les Variables d'Environnement
Le fichier `.env.local` est déjà créé avec vos identifiants Supabase :
```env
NEXT_PUBLIC_SUPABASE_URL=https://tnfnsgztpsuhymjxqifp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

### 2.3 Lancer le Serveur de Développement
```bash
npm run dev
```

Ouvrez http://localhost:3000 dans votre navigateur.

## ✅ Étape 3 : Tester l'Application

### 3.1 Page d'Accueil
- Visitez http://localhost:3000
- Vous devriez voir la page d'accueil avec le design épuré
- Testez la barre de recherche (UI uniquement pour l'instant)

### 3.2 Créer un Compte
1. Cliquez sur "S'inscrire"
2. Créez un compte avec email/mot de passe
3. Vérifiez votre email (si configuré dans Supabase)

### 3.3 Se Connecter
1. Allez sur http://localhost:3000/login
2. Connectez-vous avec vos identifiants
3. Vous serez redirigé vers le dashboard

## 📋 Prochaines Étapes

### Phase 1 : Authentification (✅ En cours)
- [x] Page de connexion
- [ ] Page d'inscription
- [ ] Récupération de mot de passe
- [ ] OAuth Google/Facebook

### Phase 2 : Interface Client
- [ ] Page de recherche d'établissements
- [ ] Fiche détaillée d'établissement
- [ ] Calendrier de réservation
- [ ] Gestion des rendez-vous
- [ ] Profil utilisateur

### Phase 3 : Interface Professionnelle
- [ ] Dashboard professionnel
- [ ] Gestion d'établissement
- [ ] Gestion des collaborateurs
- [ ] Gestion des services
- [ ] Calendrier et disponibilités
- [ ] Statistiques

### Phase 4 : Fonctionnalités Avancées
- [ ] Système de paiement (Stripe)
- [ ] Notifications email/SMS
- [ ] Avis et notes
- [ ] Liste d'attente
- [ ] Campagnes marketing

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Lancer en production
npm run start

# Linter
npm run lint

# Générer les types TypeScript depuis Supabase
npx supabase gen types typescript --project-id tnfnsgztpsuhymjxqifp > types/database.types.ts
```

## 🐛 Résolution de Problèmes

### Erreur : "Cannot find module"
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur : "Supabase connection failed"
- Vérifiez que les variables d'environnement sont correctes
- Vérifiez que la base de données est bien configurée
- Vérifiez que RLS est activé sur les tables

### Erreur : "Authentication failed"
- Vérifiez que l'utilisateur existe dans Supabase Auth
- Vérifiez les politiques RLS
- Consultez les logs dans Supabase Dashboard

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation TailwindCSS](https://tailwindcss.com/docs)
- [Documentation shadcn/ui](https://ui.shadcn.com)

## 💡 Conseils

1. **Développement Incrémental** : Testez chaque fonctionnalité avant de passer à la suivante
2. **Vérification des Logs** : Consultez régulièrement les logs Supabase
3. **Tests Utilisateurs** : Testez avec différents types d'utilisateurs (client, pro, admin)
4. **Performance** : Utilisez les outils de développement Chrome pour surveiller les performances

## 🎯 Objectifs Immédiats

1. ✅ Base de données configurée
2. ✅ Projet initialisé
3. ✅ Page d'accueil créée
4. ✅ Page de connexion créée
5. ⏳ Page d'inscription à créer
6. ⏳ Dashboard client à créer
7. ⏳ Page de recherche à créer

Bon développement ! 🚀
