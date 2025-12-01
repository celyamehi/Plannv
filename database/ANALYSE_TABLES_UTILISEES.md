# ANALYSE COMPLÈTE DES TABLES UTILISÉES DANS TON APPLICATION

## 📊 TABLES ACTIVEMENT UTILISÉES (À GARDER)

### ✅ **Tables essentielles - trouvées dans le code**

#### 1. **profiles** 
- Utilisé dans: auth, setup-profile, test-*, professional/*
- Rôle: Profils utilisateurs principaux (auth + métadonnées)

#### 2. **establishments**
- Utilisé dans: search, professional/*, booking, favorites
- Rôle: Salons/instituts avec services, rating, localisation

#### 3. **services** 
- Utilisé dans: professional/pro-services, booking, search
- Rôle: Prestations proposées (prix, durée, catégorie)

#### 4. **staff_members**
- Utilisé dans: professional/pro-staff, booking, appointments
- Rôle: Employés des établissements (spécialités, disponibilités)

#### 5. **appointments**
- Utilisé dans: appointments, professional/appointments, booking
- Rôle: Rendez-vous (date, statut, client, staff, service)

#### 6. **favorites**
- Utilisé dans: favorites/ (page complète)
- Rôle: Favoris des clients (client_id + establishment_id)

#### 7. **reviews**
- Utilisé dans: search, establishments/[slug]
- Rôle: Avis et notations des établissements

#### 8. **users**
- Utilisé dans: search, login, signup, professional/*
- Rôle: Rôles utilisateurs (client/professional/admin)

#### 9. **clients**
- Utilisé dans: search, login
- Rôle: Détails spécifiques clients (points fidélité, téléphone)

#### 10. **professionals**
- Utilisé dans: professional/signup, setup
- Rôle: Détails spécifiques pros (SIRET, vérifié, business)

---

## ❌ **TABLES NON UTILISÉES (À SUPPRIMER)**

### 🗑️ **Tables inutilisées - aucune référence dans le code**

#### 1. **availability_slots**
- Aucune utilisation trouvée
- Système de créneaux complexes non implémenté

#### 2. **client_preferences** 
- Aucune utilisation trouvée
- Préférences personnalisées non utilisées

#### 3. **marketing_campaigns**
- Aucune utilisation trouvée
- Système marketing non implémenté

#### 4. **notifications**
- Aucune utilisation trouvée
- Notifications push/email non utilisées

#### 5. **spatial_ref_sys**
- Table système PostGIS non utilisée
- Données géographiques complexes non implémentées

#### 6. **support_tickets**
- Aucune utilisation trouvée
- Support technique non implémenté

#### 7. **ticket_messages**
- Aucune utilisation trouvée
- Messages de support non utilisés

#### 8. **time_off**
- Aucune utilisation trouvée
- Gestion congés employés non utilisée

#### 9. **transactions**
- Aucune utilisation trouvée
- Paiements/transactions non implémentés

#### 10. **waiting_list**
- Aucune utilisation trouvée
- Liste d'attente non utilisée

---

## 🎯 **RECOMMANDATION FINALE**

### **GARDER (10 tables):**
```
profiles, establishments, services, staff_members, appointments, 
favorites, reviews, users, clients, professionals
```

### **SUPPRIMER (10 tables):**
```
availability_slots, client_preferences, marketing_campaigns, 
notifications, spatial_ref_sys, support_tickets, ticket_messages, 
time_off, transactions, waiting_list
```

### **Résultat:** 20 tables → 10 tables (50% de réduction)

---

## 📝 **Script de nettoyage recommandé**

```sql
SET session_replication_role = replica;

DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS client_preferences CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS spatial_ref_sys CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS ticket_messages CASCADE;
DROP TABLE IF EXISTS time_off CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS waiting_list CASCADE;

SET session_replication_role = DEFAULT;
```

Cette analyse est basée sur l'exploration complète de ton code source !
