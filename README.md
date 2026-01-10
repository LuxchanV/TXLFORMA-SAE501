Voici le lien SwissTransfer pour la classe en 3D :

https://www.swisstransfer.com/d/ea07649e-d87f-485d-9a5f-28afc9b5099b

Nous n'avons pas eu le temps de le héberger à temps.
Merci de votre compréhension

Voici le lien Google doc (maquette, organisation 3d , modèle)

https://docs.google.com/document/d/1LYjw50FqmC32_Ou5eARolTS4ZhFzk2F40uvc0t6-5b8/edit?usp=sharing

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

---


5.3 Backend

Dans txlforma-sae501-backend/ :

Vérifier application.properties

Lancer :

mvn clean install
mvn spring-boot:run


Le backend démarre sur :

http://localhost:8080

5.4 Frontend

Dans txlforma-sae501-frontend/ :

npm install
npm run dev


Frontend :

http://localhost:5173

6. Configuration
6.1 application.properties (backend)

Exemple (à adapter) :

server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/txlforma2?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

app.jwt.secret=CHANGE_ME_very_long_secret_key_at_least_64_characters_1234567890
app.jwt.expirationMinutes=240
app.cors.allowedOrigins=http://localhost:5173,http://localhost:3000

# Stripe
stripe.secretKey=sk_test_xxx
stripe.publicKey=pk_test_xxx
stripe.currency=eur
stripe.webhookSecret=whsec_xxx

# Attestations / PDF
app.storage.attestations-dir=uploads/attestations

# Logo (ex: classpath)
attestation.logoPath=classpath:static/txl-logo.png

# Organisme
attestation.organismeNom=TXL FORMA
attestation.organismeAdresse=...
attestation.organismeVille=...
attestation.organismeEmail=contact@txlforma.fr
attestation.organismeTelephone=...
attestation.organismeSiret=...

# Signature
attestation.signataireNom=...
attestation.signataireFonction=...

# Template PDF optionnel (AcroForm)
attestation.template.enabled=false
attestation.template.path=classpath:templates/attestation-template.pdf


⚠️ Les clés exactes dépendent de AttestationProperties. L’idée : aucune info n’est codée en dur dans le PDF, tout vient de la config.

6.2 Variables d’environnement (frontend)

Dans .env :

VITE_API_URL=http://localhost:8080


En prod (Vercel), configurer la variable VITE_API_URL vers l’URL du backend.

7. Endpoints API importants
7.1 Évaluations

Créer une évaluation (formateur/admin)
POST /api/formateur/evaluations
Body :

{
  "inscriptionId": 123,
  "note": 15.5,
  "commentaire": "Bon travail."
}


✅ Déclenche auto-génération d’attestation si autorisé.

Lire une évaluation (owner/admin/formateur session)
GET /api/evaluations/inscription/{inscriptionId}

7.2 Attestations
Formateur

Lister attestations d’une session
GET /api/formateur/sessions/{sessionId}/attestations

Upload PDF
POST /api/formateur/attestations/upload (multipart/form-data)
Fields :

inscriptionId

file (PDF)

Générer PDF
POST /api/formateur/attestations/{inscriptionId}/generate

Télécharger PDF (formateur)
GET /api/formateur/attestations/{inscriptionId}/download

Utilisateur / Admin (download sécurisé)

Télécharger (si autorisé)
GET /api/attestations/inscription/{inscriptionId}

7.3 Émargement

Marquer présence
POST /api/formateur/emargement
Body :

{
  "inscriptionId": 123,
  "dateJour": "2026-01-10",
  "present": true
}

7.4 Heures (formateur)

Heures session
GET /api/formateur/sessions/{sessionId}/heures

Déclarer heures
POST /api/formateur/heures

Total formateur
GET /api/formateur/heures/total

8. Déploiement (Vercel / production)

Déployer le frontend sur Vercel

Ajouter la variable :

VITE_API_URL=https://<ton-backend-domain>

Le backend doit être déployé séparément (Render, Railway, VPS, etc.)

En prod, configurer :

CORS (app.cors.allowedOrigins)

Stripe keys (prod)

DB (prod)

JWT secret fort

9. Dépannage (FAQ)
“Column 'data' cannot be null”

✅ Corrigé : ne plus save() une attestation avant d’avoir généré data.

“cannot find symbol LineSeparator / Color”

Solution :

LineSeparator → com.lowagie.text.pdf.draw.LineSeparator

Color → java.awt.Color

Le bouton “Valider évaluation” échoue

Vérifier :

inscription en statut PAYÉE

session non verrouillée

token JWT valide (401 sinon)

DB ok

Le PDF n’affiche pas le logo

vérifier attestation.logoPath

vérifier que le fichier existe (ex: classpath:static/txl-logo.png)

sinon fallback : affichage du nom organisme

Auto-génération ne remplace pas un PDF uploadé

✅ C’est voulu : MANUAL ne doit jamais être écrasé automatiquement.

10. Qualité & bonnes pratiques

Règles métier centralisées côté backend (impossible de contourner via UI)

Sécurité : owner/admin/formateur session pour les accès sensibles

PDF crédible et “officiel”

Configurable via properties (organisme, logo, template)

UI formateur claire (sessions / évaluations / attestations / heures)

Aucun PDF “hardcodé” : le contenu vient des données + config
