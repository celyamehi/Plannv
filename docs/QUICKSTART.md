# ⚡ Démarrage Rapide - PlannV

## 🎯 En 5 Minutes

### Étape 1 : Vérifier que le serveur tourne ✅
Le serveur Next.js est **déjà en cours d'exécution** !
👉 Ouvrez http://localhost:3000 dans votre navigateur

### Étape 2 : Configurer la Base de Données (CRITIQUE)

#### Option A : Via l'Interface Supabase (Recommandé)

1. **Ouvrir Supabase**
   ```
   https://app.supabase.com
   ```

2. **Sélectionner votre projet**
   - Project ID: `tnfnsgztpsuhymjxqifp`

3. **Aller dans SQL Editor**
   - Menu de gauche → SQL Editor
   - Cliquer sur "New query"

4. **Exécuter les scripts dans l'ordre**

   **Script 1 : Schéma** (Copier tout le contenu de `database/01_schema.sql`)
   ```sql
   -- Copier-coller tout le contenu du fichier
   -- Cliquer sur "Run" ou Ctrl+Enter
   ```

   **Script 2 : Sécurité** (Copier tout le contenu de `database/02_rls_policies.sql`)
   ```sql
   -- Copier-coller tout le contenu du fichier
   -- Cliquer sur "Run"
   ```

   **Script 3 : Fonctions** (Copier tout le contenu de `database/03_functions_triggers.sql`)
   ```sql
   -- Copier-coller tout le contenu du fichier
   -- Cliquer sur "Run"
   ```

   **Script 4 : Données de test** (OPTIONNEL - `database/04_seed_data.sql`)
   ```sql
   -- Copier-coller tout le contenu du fichier
   -- Cliquer sur "Run"
   ```

5. **Vérifier que tout fonctionne**
   ```sql
   -- Exécuter cette requête pour voir les tables
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public'
   ORDER BY table_name;
   
   -- Vous devriez voir : appointments, establishments, profiles, etc.
   ```

#### Option B : Via CLI Supabase

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

### Étape 3 : Créer un Utilisateur Test

1. **Via Supabase Dashboard**
   - Aller dans Authentication → Users
   - Cliquer sur "Add user"
   - Email: `test@plannv.com`
   - Password: `Test123456!`
   - Cliquer sur "Create user"

2. **Ou via l'application**
   - Une fois la page d'inscription créée, vous pourrez vous inscrire directement

### Étape 4 : Tester l'Application

1. **Page d'accueil**
   ```
   http://localhost:3000
   ```
   - Design épuré ✅
   - Barre de recherche ✅
   - Navigation ✅

2. **Page de connexion**
   ```
   http://localhost:3000/login
   ```
   - Formulaire de connexion ✅
   - OAuth Google ✅
   - Se connecter avec `test@plannv.com`

3. **Vérifier la connexion**
   - Après connexion, vous serez redirigé vers `/dashboard`
   - (Page à créer dans les prochaines étapes)

---

## 🚀 Prochaines Actions

### 1. Créer la Page d'Inscription
```bash
# Créer le fichier
# app/signup/page.tsx
```

### 2. Créer le Dashboard Client
```bash
# Créer le dossier et le fichier
# app/(client)/dashboard/page.tsx
```

### 3. Créer la Page de Recherche
```bash
# app/search/page.tsx
```

---

## 🛠️ Commandes Utiles

```bash
# Le serveur est déjà lancé, mais si besoin :
npm run dev              # Lancer le serveur

# Build pour production
npm run build

# Vérifier le code
npm run lint

# Installer une nouvelle dépendance
npm install <package-name>
```

---

## 📊 Vérifier que Tout Fonctionne

### Checklist
- [ ] ✅ Serveur Next.js en cours (http://localhost:3000)
- [ ] ⏳ Base de données configurée (4 scripts SQL exécutés)
- [ ] ⏳ Tables créées (vérifier dans Supabase)
- [ ] ⏳ RLS activé (vérifier dans Supabase)
- [ ] ⏳ Utilisateur test créé
- [ ] ⏳ Connexion testée

---

## 🐛 Problèmes Courants

### Le serveur ne démarre pas
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erreur de connexion à Supabase
1. Vérifier `.env.local`
2. Vérifier que les clés sont correctes
3. Vérifier que la base de données est configurée

### Page blanche
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs
3. Vérifier les logs du serveur

---

## 📚 Documentation

- **Guide complet** : `GETTING_STARTED.md`
- **Architecture** : `ARCHITECTURE.md`
- **TODO List** : `TODO.md`
- **État du projet** : `PROJECT_STATUS.md`

---

## 🎉 C'est Parti !

Vous êtes maintenant prêt à développer PlannV ! 🚀

**Prochaine étape recommandée** : Configurer la base de données Supabase (Étape 2)
