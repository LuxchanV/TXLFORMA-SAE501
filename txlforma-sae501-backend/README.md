# TXLFORMA SAE 501 - Backend (Spring Boot)

## Prérequis
- Java 17
- Maven
- MySQL (XAMPP) + base `txlforma`

## Setup
1) Modifie `src/main/resources/application.properties` (MySQL + JWT secret 64+ chars)
2) Lance :
```bash
mvn spring-boot:run
```

## Swagger
http://localhost:8080/swagger-ui/index.html

## Flux Postman (rapide)
### Register
POST /api/auth/register
Body:
{
  "nom":"Durand",
  "prenom":"Roger",
  "email":"roger@txlforma.fr",
  "motDePasse":"test1234"
}

### Login
POST /api/auth/login
Body:
{ "email":"roger@txlforma.fr", "motDePasse":"test1234" }

=> Mets le token dans Header:
Authorization: Bearer <TOKEN>

### Catalogue (public)
GET /api/catalogue/categories
GET /api/catalogue/formations

### Inscription
POST /api/inscriptions
{ "sessionId": 1 }

### Paiement (simulation)
POST /api/paiements/simuler
{ "inscriptionId": 1 }

### Evaluation (formateur/admin)
POST /api/formateur/evaluations
{ "inscriptionId": 1, "note": 14, "commentaire": "OK" }

### Attestation PDF
GET /api/attestations/1/pdf
