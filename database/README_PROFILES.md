# Profils de Démo - Salon de Beauté

Ce dossier contient les profils de démonstration pour tester l'application.

## 📋 Fichiers créés

### 1. `12_create_profiles.sql` - Profils Utilisateurs
**5 Profils Professionnels :**
- **Sophie Martin** - sophie.martin@salon-beaute.fr
  - Spécialisation : Coloration et coupe femme
  - Téléphone : 06 12 34 56 01

- **Pierre Durand** - pierre.durand@barbershop.fr
  - Spécialisation : Coupe homme et barbe
  - Téléphone : 06 12 34 56 02

- **Marie Laurent** - marie.laurent@institut.fr
  - Spécialisation : Soins visage et bien-être
  - Téléphone : 06 12 34 56 03

- **Julie Moreau** - julie.moreau@nails-bar.fr
  - Spécialisation : Manucure et beauté des ongles
  - Téléphone : 06 12 34 56 04

- **Thomas Bernard** - thomas.bernard@salon-luxe.fr
  - Spécialisation : Coiffure expert et coloration avancée
  - Téléphone : 06 12 34 56 05

**5 Profils Clients :**
- **Marie Dupont** - marie.dupont@email.fr
  - Préférences : Coupe femme, Coloration
  - Téléphone : 06 23 45 67 01

- **Jean Bernard** - jean.bernard@email.fr
  - Préférences : Coupe homme, Barbe
  - Téléphone : 06 23 45 67 02

- **Claire Petit** - claire.petit@email.fr
  - Préférences : Soins visage, Manucure
  - Téléphone : 06 23 45 67 03

- **Robert Martin** - robert.martin@email.fr
  - Préférences : Barbe, Shampoing
  - Téléphone : 06 23 45 67 04

- **Sophie Leroy** - sophie.leroy@email.fr
  - Préférences : Manucure, Pédicure
  - Téléphone : 06 23 45 67 05

### 2. `13_establishments_staff.sql` - Établissements et Staff
**5 Établissements :**
- **Salon de Beauté Prestige** - Avenue des Champs-Élysées
- **BarberShop Homme** - Rue de la Victoire
- **Institut Marie Laurent** - Avenue Montaigne
- **Nails & Beauty Center** - Rue Rivoli
- **Salon de Coiffure Luxe** - Boulevard Saint-Germain

### 3. `14_appointments_samples.sql` - Rendez-vous exemples
**5 Rendez-vous de démonstration :**
- Marie Dupont → Sophie Martin (Coupe femme)
- Jean Bernard → Pierre Durand (Barbe)
- Claire Petit → Marie Laurent (Soin visage)
- Robert Martin → Pierre Durand (Coupe homme)
- Sophie Leroy → Julie Moreau (Manucure)

## 🚀 Installation

### Étape 1 : Exécuter les scripts SQL
```bash
# Dans Supabase Dashboard ou psql
\i database/12_create_profiles.sql
\i database/13_establishments_staff.sql
\i database/14_appointments_samples.sql
```

### Étape 2 : Tester les connexions
**Comptes Professionnels :**
- Email : `sophie.martin@salon-beaute.fr`
- Mot de passe : `demo123` (à configurer dans Supabase Auth)

**Comptes Clients :**
- Email : `marie.dupont@email.fr`
- Mot de passe : `demo123` (à configurer dans Supabase Auth)

## 🎯 Scénarios de Test

### 1. Vue Professionnelle
- Connectez-vous avec `sophie.martin@salon-beaute.fr`
- Accédez au dashboard professionnel
- Testez la vue planning avec les rendez-vous existants
- Créez de nouveaux rendez-vous

### 2. Vue Client
- Connectez-vous avec `marie.dupont@email.fr`
- Accédez à l'interface client
- Testez la prise de rendez-vous
- Vérifiez l'affichage des services disponibles

### 3. Fonctionnalités à tester
- ✅ Création de rendez-vous
- ✅ Vue planning par employé
- ✅ Filtrage des services par employé
- ✅ Gestion des disponibilités
- ✅ Modale de détails des rendez-vous

## 📊 Données de Test

### Services par catégorie
- **✂️ Coupe** : Coupe femme/homme, Barbe
- **💇 Coloration** : Coloration, Mèches, Balayage
- **🧴 Soin** : Soin visage, Soin cheveux, Massage
- **💅 Beauté** : Manucure, Pédicure, Vernis
- **🧼 Shampoing** : Brushing, Shampoing/coiffage

### Tarifs exemples
- Coupe femme : 45€ - 65€
- Coupe homme : 35€ - 50€
- Coloration : 80€ - 120€
- Soin visage : 60€
- Manucure : 40€

## 🔧 Configuration

Pour activer ces comptes :
1. Exécutez les scripts SQL dans Supabase
2. Configurez les mots de passe dans Supabase Auth
3. Testez les connexions avec les emails fournis
4. Vérifiez que les rôles sont correctement assignés

## 📈 Utilisation

Ces profils permettent de tester :
- L'authentification professionnelle vs client
- La gestion des établissements
- La planification des rendez-vous
- Les interactions entre professionnels et clients
- L'affichage des services et disponibilités
