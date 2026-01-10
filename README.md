Voici le lien SwissTransfer pour la classe en 3D :

https://www.swisstransfer.com/d/ea07649e-d87f-485d-9a5f-28afc9b5099b

Nous n'avons pas eu le temps de le héberger à temps.
Merci de votre compréhension


# TXL FORMA — SAE501 (Plateforme de formation)
Plateforme web de gestion de formations (catalogue, inscriptions, paiements, sessions, émargement, évaluations) avec un **système complet d’attestations PDF** (upload ou génération automatique/professionnelle).

> Projet réalisé avec un **backend Spring Boot (Java 17)** + **frontend React (Vite)** + **MySQL** + **Stripe** + **OpenPDF**.

---

## Sommaire
- [1. Objectif du projet](#1-objectif-du-projet)
- [2. Fonctionnalités](#2-fonctionnalités)
  - [2.1 Rôles & accès](#21-rôles--accès)
  - [2.2 Formateur](#22-formateur)
  - [2.3 Utilisateur](#23-utilisateur)
  - [2.4 Admin](#24-admin)
- [3. Système d’attestations (PDF)](#3-système-dattestations-pdf)
  - [3.1 Règles métier (obligatoires)](#31-règles-métier-obligatoires)
  - [3.2 Modes disponibles](#32-modes-disponibles)
  - [3.3 Génération PDF “officielle”](#33-génération-pdf-officielle)
  - [3.4 Support d’un modèle PDF personnalisé (template)](#34-support-dun-modèle-pdf-personnalisé-template)
  - [3.5 Correction critique réalisée](#35-correction-critique-réalisée)
- [4. Stack technique](#4-stack-technique)
- [5. Installation & lancement (DEV)](#5-installation--lancement-dev)
  - [5.1 Prérequis](#51-prérequis)
  - [5.2 Base de données MySQL](#52-base-de-données-mysql)
  - [5.3 Backend](#53-backend)
  - [5.4 Frontend](#54-frontend)
- [6. Configuration](#6-configuration)
  - [6.1 `application.properties` (backend)](#61-applicationproperties-backend)
  - [6.2 Variables d’environnement (frontend)](#62-variables-denvironnement-frontend)
- [7. Endpoints API importants](#7-endpoints-api-importants)
  - [7.1 Évaluations](#71-évaluations)
  - [7.2 Attestations](#72-attestations)
  - [7.3 Émargement](#73-émargement)
  - [7.4 Heures (formateur)](#74-heures-formateur)
- [8. Déploiement (Vercel / production)](#8-déploiement-vercel--production)
- [9. Dépannage (FAQ)](#9-dépannage-faq)
- [10. Qualité & bonnes pratiques](#10-qualité--bonnes-pratiques)

---

## 1. Objectif du projet
L’objectif est d’obtenir une version :
- **corrigée**
- **stable**
- **professionnelle**
- **cohérente fonctionnellement**
- avec un système d’**attestations PDF complet**, sans valeurs codées en dur.

Le système d’attestation doit :
- inclure **nom/prénom**, **date**, **note**, **commentaire**, **logo TXL FORMA**, et les **infos officielles** de l’organisme,
- permettre **upload manuel** ou **génération automatique**,
- **générer automatiquement après validation d’évaluation** si les conditions sont respectées.

---

## 2. Fonctionnalités

### 2.1 Rôles & accès
- **ROLE_USER** : s’inscrire, payer, consulter ses informations, récupérer son attestation si disponible.
- **ROLE_FORMATEUR** : gestion des sessions assignées, émargement, évaluations, attestations, heures.
- **ROLE_ADMIN** : accès étendu (lecture / contrôle), même logique de sécurité.

La sécurité est assurée via **JWT** (token stocké côté frontend, intercepté via Axios).

---

### 2.2 Formateur
Dans l’espace Formateur (UI React) :
- **Mes sessions**
  - liste des sessions assignées
  - participants par session
- **Émargement**
  - marquer présent / absent par date
  - bloqué si session clôturée/annulée
- **Évaluations**
  - saisir note / commentaire
  - **autorisé uniquement si inscription PAYÉE**
  - après validation : **auto-génération attestation** (si règles ok)
- **Attestations**
  - lister les attestations par session
  - **Uploader une attestation PDF**
  - **Générer l’attestation** (PDF officiel)
  - Télécharger l’attestation existante
- **Heures réalisées**
  - saisir les heures par date
  - total session + total formateur

---

### 2.3 Utilisateur
Espace utilisateur :
- consulter ses sessions / inscriptions
- payer (Stripe)
- consulter ses évaluations (si publiées)
- télécharger son attestation si disponible (et autorisé)

---

### 2.4 Admin
Admin : accès plus large (selon implémentation), mais **les règles métier restent les mêmes** :
- pas d’attestation si non payée,
- pas de modification si session verrouillée.

---

## 3. Système d’attestations (PDF)

### 3.1 Règles métier (obligatoires)
Le système respecte ces contraintes :

1) **Inscription PAYÉE obligatoire**
- Upload attestation : interdit si non payée
- Génération attestation : interdite si non payée
- Évaluation : interdite si non payée (règle projet)

2) **Session non verrouillée**
- Si session **FERMÉE / ANNULÉE / CLOTURÉE** :
  - pas d’upload d’attestation
  - pas de génération
  - pas d’émargement
  - pas d’évaluation

3) **Auto-génération après évaluation**
- Après validation d’une évaluation, le système tente de générer l’attestation **automatiquement**
- **Ne remplace jamais** un PDF **MANUAL** déjà uploadé (protection importante)

---

### 3.2 Modes disponibles
Deux modes :

#### A) Upload manuel (PDF existant)
Le formateur peut uploader un PDF pour un apprenant.
- Stockage en base dans la table `attestations` (LONGBLOB)
- Métadonnées : filename, date upload, source = MANUAL

#### B) Génération automatique (PDF officiel)
Le formateur peut générer un PDF automatiquement.
- Utilise OpenPDF
- Layout “officiel” : header + séparateurs + tableau d’infos + signature + footer
- Source = AUTO

---

### 3.3 Génération PDF “officielle”
Le PDF généré contient :
- Référence d’attestation
- Date de délivrance
- Identité apprenant : prénom / nom
- Titre de formation
- Période (début → fin)
- Salle (si disponible)
- Résultat : note /20
- Appréciation : commentaire
- Infos organisme (nom, adresse, ville, email, téléphone, SIRET)
- Signature (nom + fonction)
- Logo TXL FORMA (si configuré)

---

### 3.4 Support d’un modèle PDF personnalisé (template)
✅ Oui, c’est possible.

Le générateur supporte un **template PDF AcroForm** :
- Si `template.enabled=true` et `template.path` valide :
  - le système charge le PDF
  - remplit les champs (ex: `prenom`, `nom`, `formation`, `note`, etc.)
  - aplati le formulaire (`flattening`) pour un rendu final propre

Sinon : fallback automatique vers la génération “from scratch”.

Champs typiques attendus (exemples) :
- `ref`, `date`, `prenom`, `nom`, `formation`, `dateDebut`, `dateFin`, `salle`, `note`, `commentaire`
- `organismeNom`, `organismeAdresse`, `organismeVille`, `organismeEmail`, `organismeTelephone`, `organismeSiret`
- `signataireNom`, `signataireFonction`

---

### 3.5 Correction critique réalisée
**Erreur rencontrée :**
- `Column 'data' cannot be null` lors d’un insert en base.

**Cause :**
- tentative de `save()` d’une attestation avant d’avoir généré le PDF (`data` NOT NULL).

**Correction :**
- on ne sauvegarde **jamais** une attestation “vide”
- la référence n’est plus basée sur l’`id_attestation` obtenu via insert préalable
- référence stable construite à partir de `(inscriptionId + date)` :
  - exemple : `ATTEST-2026-000123-20260110`

---

## 4. Stack technique
- **Backend** : Java 17, Spring Boot 3.3.4
- **DB** : MySQL
- **Auth** : Spring Security + JWT
- **Paiement** : Stripe
- **PDF** : OpenPDF (`com.github.librepdf:openpdf:1.3.39`)
- **Frontend** : React + Vite + Axios

---

## 5. Installation & lancement (DEV)

### 5.1 Prérequis
- Java **17**
- Maven (ou wrapper)
- Node.js **18+**
- MySQL 8+

---

### 5.2 Base de données MySQL
Créer une base :
```sql
CREATE DATABASE txlforma2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
