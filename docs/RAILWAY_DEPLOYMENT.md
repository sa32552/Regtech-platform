# Guide de Déploiement sur Railway

Ce guide vous explique comment déployer la plateforme RegTech sur Railway.

## 📋 Prérequis

- Un compte Railway (https://railway.app)
- Un compte GitHub
- Git installé sur votre machine

## 🚀 Étape 1: Préparer le Repository

### 1.1 Initialiser Git (si pas déjà fait)

```bash
cd regtech-platform
git init
git add .
git commit -m "Initial commit: RegTech Platform"
```

### 1.2 Créer le repository sur GitHub

1. Allez sur https://github.com/new
2. Créez un nouveau repository (ex: regtech-platform)
3. Copiez l'URL du repository

### 1.3 Pousser le code sur GitHub

```bash
git remote add origin <GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

## 🚂 Étape 2: Créer le projet Railway

### 2.1 Connecter Railway à GitHub

1. Connectez-vous sur https://railway.app
2. Cliquez sur "New Project"
3. Sélectionnez "Deploy from GitHub repo"
4. Authorisez Railway à accéder à votre compte GitHub
5. Sélectionnez le repository regtech-platform

### 2.2 Configurer les services

Vous devez créer les services suivants dans Railway:

#### Service 1: PostgreSQL
1. Cliquez sur "New Service" → "Database" → "PostgreSQL"
2. Railway va créer automatiquement l'instance PostgreSQL
3. Copiez les variables d'environnement:
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

#### Service 2: Redis
1. Cliquez sur "New Service" → "Database" → "Redis"
2. Railway va créer automatiquement l'instance Redis
3. Copiez les variables d'environnement:
   - `REDIS_URL`
   - `REDISHOST`
   - `REDISPORT`

#### Service 3: MinIO (Alternative)
Railway ne supporte pas nativement MinIO. Utilisez une alternative:
- Option 1: AWS S3 (recommandé)
- Option 2: Cloudflare R2
- Option 3: Backblaze B2

Pour ce guide, nous utiliserons AWS S3 comme exemple.

#### Service 4: Backend (NestJS)
1. Cliquez sur "New Service" → "Deploy from GitHub repo"
2. Sélectionnez le dossier `backend`
3. Configurez les variables d'environnement:

```env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=<COPIER_DEPUIS_SERVICE_POSTGRESQL>
DATABASE_HOST=<PGHOST>
DATABASE_PORT=<PGPORT>
DATABASE_USER=<PGUSER>
DATABASE_PASSWORD=<PGPASSWORD>
DATABASE_NAME=<PGDATABASE>

# Redis
REDIS_URL=<COPIER_DEPUIS_SERVICE_REDIS>
REDIS_HOST=<REDISHOST>
REDIS_PORT=<REDISPORT>

# Storage (AWS S3)
AWS_ACCESS_KEY_ID=<VOTRE_CLE_AWS>
AWS_SECRET_ACCESS_KEY=<VOTRE_SECRET_AWS>
AWS_REGION=us-east-1
AWS_S3_BUCKET=regtech-documents

# AI Service
AI_SERVICE_URL=<URL_DU_SERVICE_AI>

# JWT
JWT_SECRET=<GENERER_UNE_CLE_SECRETE>
JWT_EXPIRATION=24h
REFRESH_TOKEN_SECRET=<GENERER_UNE_CLE_SECRETE>
REFRESH_TOKEN_EXPIRATION=7d

# CORS
CORS_ORIGINS=https://votre-domaine.railway.app
```

#### Service 5: Frontend (Next.js)
1. Cliquez sur "New Service" → "Deploy from GitHub repo"
2. Sélectionnez le dossier `frontend`
3. Configurez les variables d'environnement:

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=<URL_DU_BACKEND>
NEXT_PUBLIC_AI_SERVICE_URL=<URL_DU_SERVICE_IA>
```

#### Service 6: AI Service (Python)
1. Cliquez sur "New Service" → "Deploy from GitHub repo"
2. Sélectionnez le dossier `ai-service`
3. Configurez les variables d'environnement:

```env
API_HOST=0.0.0.0
PORT=8000

# Redis
REDIS_URL=<COPIER_DEPUIS_SERVICE_REDIS>
REDIS_HOST=<REDISHOST>
REDIS_PORT=<REDISPORT>

# Backend
BACKEND_URL=<URL_DU_BACKEND>
BACKEND_API_KEY=<GENERER_UNE_CLE_API>

# CORS
CORS_ORIGINS=https://votre-domaine.railway.app

# Spacy
SPACY_MODEL=fr_core_news_lg

# Logging
LOG_LEVEL=INFO
```

## 🔧 Étape 3: Configurer les connexions entre services

### 3.1 Lier les services

1. Pour le Backend, cliquez sur "Settings" → "Networking"
2. Ajoutez les variables d'environnement pour les connexions:
   - `DATABASE_URL` (depuis PostgreSQL)
   - `REDIS_URL` (depuis Redis)
   - `AI_SERVICE_URL` (depuis AI Service)

3. Pour le Frontend, ajoutez:
   - `NEXT_PUBLIC_API_URL` (URL du Backend)
   - `NEXT_PUBLIC_AI_SERVICE_URL` (URL du AI Service)

4. Pour le AI Service, ajoutez:
   - `REDIS_URL` (depuis Redis)
   - `BACKEND_URL` (URL du Backend)

### 3.2 Configurer les domaines

1. Pour chaque service, allez dans "Settings" → "Domains"
2. Ajoutez un domaine personnalisé ou utilisez le domaine Railway par défaut
3. Notez les URLs générées

## 📊 Étape 4: Initialiser la base de données

### 4.1 Exécuter les migrations

1. Ouvrez le terminal du service Backend dans Railway
2. Exécutez:

```bash
npm run migration:run
```

### 4.2 Créer l'utilisateur admin

```bash
npm run seed:admin
```

## ✅ Étape 5: Vérifier le déploiement

### 5.1 Vérifier les services

1. Vérifiez que tous les services sont en statut "Running"
2. Cliquez sur "View Logs" pour voir les logs de chaque service

### 5.2 Tester les endpoints

1. Backend: `https://votre-backend.railway.app/health`
2. Frontend: `https://votre-frontend.railway.app`
3. AI Service: `https://votre-ai-service.railway.app/health`

### 5.3 Accéder à l'application

1. Ouvrez l'URL du frontend dans votre navigateur
2. Connectez-vous avec les identifiants admin créés
3. Testez les différentes fonctionnalités

## 🔄 Étape 6: Mises à jour continues

### 6.1 Déployer les mises à jour

```bash
git add .
git commit -m "Description des changements"
git push origin main
```

Railway détectera automatiquement les changements et redéployera les services.

### 6.2 Monitoring

1. Utilisez les métriques Railway pour surveiller les services
2. Configurez des alertes pour les erreurs
3. Surveillez l'utilisation des ressources

## 🐛 Dépannage

### Problème: Service ne démarre pas

1. Vérifiez les logs dans Railway
2. Vérifiez les variables d'environnement
3. Vérifiez les dépendances dans package.json/requirements.txt

### Problème: Connexion base de données échoue

1. Vérifiez que PostgreSQL est en cours d'exécution
2. Vérifiez les variables d'environnement DATABASE_*
3. Vérifiez que les migrations ont été exécutées

### Problème: Erreur CORS

1. Vérifiez la variable CORS_ORIGINS
2. Assurez-vous que l'URL du frontend est incluse

### Problème: Service IA lent

1. Vérifiez l'utilisation des ressources
2. Augmentez les ressources du service AI Service
3. Optimisez les modèles IA si nécessaire

## 📚 Ressources supplémentaires

- Documentation Railway: https://docs.railway.app
- Support Railway: https://railway.app/support
- Guide GitHub Actions: https://docs.github.com/actions

## 🎉 Félicitations !

Votre plateforme RegTech est maintenant déployée et opérationnelle sur Railway !
