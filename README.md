# TXL FORMA — SAE501 (Plateforme de formation)

Plateforme web de gestion de formations : **catalogue**, **inscriptions**, **paiements (Stripe)**, **sessions**, **émargement**, **évaluations** et **attestations PDF** (upload ou génération automatique).

**Stack :** Spring Boot (Java 17) · React (Vite) · MySQL · JWT · Stripe · OpenPDF

---

## Identifiants (DEV / test)

> ⚠️ Comptes de test uniquement (à ne pas utiliser en production).

### Admin
- **Email** : `admin@txlforma.fr`  
- **Mot de passe** : `Admin123!`

### Formateur
- **Email** : `Laroussi.Reda@gmail.com` — **MDP** : `Laroussi.Reda`  
- **Email** : `dupont.leo@gmail.com` — **MDP** : `DupontLeo`  
- **Email** : `formateur@txlforma.fr` — **MDP** : `Formateur123!`

### User / Élève
- **Email** : `Luxchan@gmail.com` — **MDP** : `Luxchan`  
- **Email** : `Abeeschan@gmail.com` — **MDP** : `Abeeschan123`  
- **Email** : `Enzo@gmail.com` — **MDP** : `Enzo.Antunes`  
- **Email** : `Nicolas@gmail.com` — **MDP** : `Nicolas.Rannou`

---

## Fonctionnalités

- **Authentification & rôles** : USER / FORMATEUR / ADMIN (JWT)
- **Sessions & inscriptions** : suivi des participants, accès sécurisés
- **Paiement Stripe** : paiement côté utilisateur
- **Espace formateur**
  - émargement (présent/absent)
  - évaluations (note + commentaire)
  - attestations : **upload PDF** ou **génération PDF “officielle”**
  - déclaration des heures
- **Attestations PDF**
  - **auto-génération** après validation d’une évaluation (si conditions OK)
  - **ne remplace jamais** une attestation uploadée (source `MANUAL` protégée)

---

## Règles métier (attestations / évaluations)

1. **Inscription PAYÉE obligatoire**
   - pas d’évaluation, pas d’upload, pas de génération si non payée
2. **Session non verrouillée**
   - si session **fermée / annulée / clôturée** : pas d’émargement, pas d’évaluation, pas d’attestation
3. **Auto-génération**
   - tentative de génération après validation d’évaluation, sans écraser un PDF `MANUAL`

---

## Prérequis

- Java **17**
- Maven
- Node.js **18+**
- MySQL **8+**

---

## Installation & lancement (DEV)

### 1) Base MySQL
```sql
CREATE DATABASE txlforma2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2) Backend (Spring Boot)
Dans `txlforma-sae501-backend/` :

```bash
mvn clean install
mvn spring-boot:run
```

Backend : `http://localhost:8080`

### 3) Frontend (React / Vite)
Dans `txlforma-sae501-frontend/` :

```bash
npm install
npm run dev
```

Frontend : `http://localhost:5173`

---

## Configuration

### Backend — `application.properties`
⚠️ **Important : pour lancer le backend correctement, renseigner les clés Stripe dans `application.properties`.**  
Ne committez jamais vos clés Stripe/JWT : utilisez des valeurs locales + variables d’environnement.

```properties
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/txlforma2?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update

app.jwt.secret=CHANGE_ME_very_long_secret_key_at_least_64_characters
app.jwt.expirationMinutes=240
app.cors.allowedOrigins=http://localhost:5173,http://localhost:3000

# Stripe (OBLIGATOIRE pour tester les paiements et lancer le backend)
stripe.secretKey=sk_test_xxx
stripe.publicKey=pk_test_xxx
stripe.currency=eur
stripe.webhookSecret=${STRIPE_WEBHOOK_SECRET:}

# Attestations / PDF
app.storage.attestations-dir=uploads/attestations
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
```

### Frontend — `.env`
Dans `txlforma-sae501-frontend/.env` :

```env
VITE_API_URL=http://localhost:8080
```

---

## Endpoints utiles (résumé)

### Évaluations
- `POST /api/formateur/evaluations` → crée une évaluation (**peut déclencher l’auto-attestation**)
- `GET /api/evaluations/inscription/{inscriptionId}` → lecture

Exemple body :
```json
{
  "inscriptionId": 123,
  "note": 15.5,
  "commentaire": "Bon travail."
}
```

### Attestations
- `GET  /api/formateur/sessions/{sessionId}/attestations` → liste (formateur)
- `POST /api/formateur/attestations/upload` → upload PDF (multipart)
  - fields : `inscriptionId`, `file` (PDF)
- `POST /api/formateur/attestations/{inscriptionId}/generate` → génération PDF
- `GET  /api/formateur/attestations/{inscriptionId}/download` → téléchargement (formateur)
- `GET  /api/attestations/inscription/{inscriptionId}` → téléchargement sécurisé (user/admin)

### Émargement
- `POST /api/formateur/emargement`

Exemple body :
```json
{
  "inscriptionId": 123,
  "dateJour": "2026-01-10",
  "present": true
}
```

### Heures
- `GET  /api/formateur/sessions/{sessionId}/heures`
- `POST /api/formateur/heures`
- `GET  /api/formateur/heures/total`

---

## Ressources (maquette / 3D)

- Maquette & organisation : https://docs.google.com/document/d/1LYjw50FqmC32_Ou5eARolTS4ZhFzk2F40uvc0t6-5b8/edit?usp=sharing  
- Classe 3D (hébergée) : https://txlforma-classe3d.vercel.app/

---

## Structure du repo (indicatif)

- `txlforma-sae501-backend/` — API Spring Boot (JWT, Stripe, OpenPDF)
- `txlforma-sae501-frontend/` — UI React (Vite, Axios)

---

## Dépannage rapide

- **Paiements / backend ne démarre pas** → vérifier les clés Stripe dans `application.properties`
- **401 / actions refusées** → token JWT manquant/expiré
- **Évaluation impossible** → inscription non payée ou session verrouillée
- **Logo absent dans PDF** → vérifier `attestation.logoPath` et la présence du fichier côté backend
