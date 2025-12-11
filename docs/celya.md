# Cahier des charges – Plateforme de réservation beauté / bien-être (Type Planity)

## 1. Objectif
Créer une plateforme web/mobile pour la gestion de rendez-vous et d'activité destinée aux établissements beauté (coiffure, esthétique, spa…) avec design épuré inspiré Apple et calendrier de réservation style Calendly.

---

## 2. Modules Fonctionnels

### 2.1. Espace Client
- Système d'inscription/connexion (email, Google, Facebook)
- Recherche avancée :
    - Par secteur géographique (carte, ville…)
    - Par type/prestation (coiffeur, institut…)
- Fiches établissement détaillées :
    - Prestations & tarifs
    - Horaires, adresse, photos
    - Avis et notes clients authentifiés
- Prise de rendez-vous :
    - Sélection service, créneau, collaborateur
    - Calendrier style Calendly (UX fluide, visuel Apple)
    - Confirmation instantanée, notifications email/SMS
    - Option prépaiement/acompte
    - Gestion liste d’attente automatique
- Espace personnel :
    - Historique RDV et avis laissés
    - Préférences sauvegardées

---

### 2.2. Espace Professionnel (Salon/Institut)
- Création/édition fiche établissement
- Gestion multi-collaborateurs
- Agenda collaborateur (jour/semaine/mois, drag & drop)
- Paramétrage créneaux dispo, absences, fermetures
- Gestion automatique/manuelle des RDV
- Rappels auto client (mail/SMS)
- Gestion annulations/no-shows
- CRM simplifié :
    - Historique client, préférences
    - Statistiques activité (CA, RDV, clients…)
- Module caisse basique :
    - Enregistrement paiement (CB, espèces, etc.)
    - Génération reçus
- Campagnes marketing (mail/SMS promotionnels, relance anniversaire/inactifs)
- Export données (CSV/Excel, stats, RDV)

---

### 2.3. Administration
- Tableau de bord global (comptes salons, clients, transactions)
- Modération avis, gestion SAV et support
- FAQ / aide en ligne
- Suivi tickets

---

## 3. Design / UX

- Interface épurée, inspiration lignes Apple (fonds clairs, typographie simple, icônes minimalistes)
- Réservation calendrier style Calendly (visuel agenda glissant, sélection créneau en 1 clic)
- Responsive mobile/desktop
- Navigation ultra simplifiée (max 3 clics jusqu’à la réservation)

---

## 4. Architecture technique

- Frontend : React (ou équivalent), UI minimaliste
- Backend : Node, ou API REST/GraphQL
- Authentification : OAuth, email, Google/Facebook
- Paiement : Stripe/PayPal (API intégrée, sécurité)
- SMS/Notifications : Twilio ou équivalent
- Email transactionnel : Sendinblue/Mailgun
- Hébergement cloud : scalable (options Supabase/Firestore…)
- RGPD : protection et droit à l’oubli

---

## 5. SEO / Réseaux sociaux

- Optimisation SEO pour chaque fiche salon
- Partage rapide sur Facebook/Instagram
- Badges Google Maps et avis Google intégrables

---

## 6. Déploiement

- Documentation utilisateur et technique
- Environnement staging + production
- Formation équipe support

---

## 7. Besoins UX spécifiques

- Maquettes épurées en priorité (inspiration Apple Design Guidelines)
- Calendrier de réservation type Calendly
- Fiches salons et clients facilement accessibles
- Dashboard analytique simple mais complet pour les pros

---

## 8. Priorités

1. Design UI/UX premium (Apple, Calendly)
2. Expérience client fluide
3. Gestion salons (agenda, CRM, stats, caisse)
4. Notifications et prépaiement
5. Facilité d’évolution et scalabilité (API, modules réutilisables)

---

> *Livrable demandé :*
> - Architecture technique, schéma DB simplifié
> - Maquettes filaires UI (Apple/Calendly style)
> - Découpage modules, APIs principales
> - User stories structurant le MVP