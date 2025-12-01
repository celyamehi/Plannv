# 🚀 Guide d'Installation Simplifié - PlannV

## ⚡ Installation en 2 étapes

### Étape 1 : Nettoyer la base de données (5 secondes)

1. Ouvrez **Supabase Dashboard** : https://app.supabase.com
2. Allez dans **SQL Editor**
3. Copiez TOUT le contenu de `database/00_reset_all.sql`
4. Collez dans SQL Editor
5. Cliquez sur **Run** (ou Ctrl+Enter)
6. ✅ Attendez "Base de données nettoyée avec succès !"

### Étape 2 : Installer tout (30 secondes)

1. Toujours dans **SQL Editor**
2. Copiez TOUT le contenu de `database/05_install_all.sql`
3. Collez dans SQL Editor
4. Cliquez sur **Run** (ou Ctrl+Enter)
5. ✅ Attendez "Installation complète terminée avec succès !"

## 🎉 C'est tout !

Votre base de données est maintenant complète avec :
- ✅ 15 tables créées
- ✅ 3 fonctions SQL
- ✅ 8 triggers automatiques
- ✅ Politiques RLS activées
- ✅ Index de performance

## 🧪 Vérification

Pour vérifier que tout fonctionne :

```sql
-- Voir toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Devrait afficher 15 tables
```

## 📝 Prochaines étapes

1. **Créer un compte utilisateur**
   - Allez sur http://localhost:3000/signup
   - Créez votre compte

2. **Tester la connexion**
   - Allez sur http://localhost:3000/login
   - Connectez-vous

3. **Voir le dashboard**
   - Vous serez redirigé vers http://localhost:3000/dashboard

## ❓ En cas de problème

### Si l'étape 1 échoue
- C'est normal si c'est la première fois
- Passez directement à l'étape 2

### Si l'étape 2 échoue
- Vérifiez que vous avez bien copié TOUT le contenu
- Réessayez l'étape 1 puis l'étape 2

### Si vous voulez recommencer
- Exécutez l'étape 1 (nettoyage)
- Puis l'étape 2 (installation)

## 🎯 Résumé

```
1. database/00_reset_all.sql    → Nettoie tout
2. database/05_install_all.sql  → Installe tout
3. Créer un compte              → http://localhost:3000/signup
4. Se connecter                 → http://localhost:3000/login
5. Profiter !                   → http://localhost:3000/dashboard
```

**C'est simple et rapide !** 🚀
