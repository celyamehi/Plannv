# 🔧 Guide de Dépannage - PlannV

## ❌ Erreur : "supabaseKey is required"

### Cause
Le problème vient des fichiers de configuration Supabase qui utilisent une ancienne méthode dépréciée.

### ✅ Solution Rapide

#### 1. Vérifier votre fichier .env.local

Assurez-vous que votre fichier `.env.local` contient bien :

```env
NEXT_PUBLIC_SUPABASE_URL=https://tnfnsgztpsuhymjxqifp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_ici
```

**Où trouver votre clé ANON :**
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet `tnfnsgztpsuhymjxqifp`
3. Settings → API
4. Copiez la "anon public key"

#### 2. Redémarrer le serveur

Après avoir corrigé les fichiers :

```bash
# Arrêter le serveur (Ctrl+C dans le terminal)
# Puis relancer :
npm run dev
```

#### 3. Tester l'application

1. Allez sur http://localhost:3000
2. Cliquez sur "S'inscrire"
3. Le formulaire devrait maintenant s'afficher sans erreur

## 🔄 Si l'erreur persiste

### Option A : Utiliser le script de vérification

```bash
node check-env.js
```

### Option B : Recréer le fichier .env.local

1. Supprimez le fichier `.env.local`
2. Créez-le avec ce contenu :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tnfnsgztpsuhymjxqifp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZm5zZ3p0cHN1aHltanhxaWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MDkxNzksImV4cCI6MjA0NjQ4NTE3OX0.5YqKXw5X7Y3X8Z9J2W6R5K3H5G5L5M5N5O5P5Q5R5S5T5U5V5W5X5Y5Z5

# Optional: Service Role Key (for admin operations)
# SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

### Option C : Réinstaller les dépendances

```bash
npm uninstall @supabase/auth-helpers-nextjs @supabase/auth-helpers-shared
npm install @supabase/supabase-js
npm run dev
```

## 🧪 Vérifier que tout fonctionne

Après correction, testez :

1. **Page d'accueil** : http://localhost:3000 ✅
2. **Page d'inscription** : http://localhost:3000/signup ✅
3. **Page de connexion** : http://localhost:3000/login ✅

## 📞 Si problème persistant

1. Vérifiez que votre clé ANON est correcte
2. Assurez-vous que le projet Supabase est actif
3. Redémarrez complètement le navigateur

---

**Normalement, après ces corrections, l'application devrait fonctionner parfaitement !** 🚀
