# Déploiement sur Railway - Guide Rapide

Ce guide vous explique comment déployer rapidement la plateforme RegTech sur Railway.

## Prérequis

- Un compte Railway (https://railway.app)
- Un compte GitHub
- Git installé sur votre machine

## Étapes de déploiement

### 1. Préparer le projet

Exécutez le script de préparation :

```bash
prepare-railway-deploy.bat
```

Ce script va :
- Vérifier les fichiers de configuration
- Installer toutes les dépendances
- Construire les applications
- Initialiser le repository Git (si nécessaire)

### 2. Créer le repository GitHub

1. Allez sur https://github.com/new
2. Créez un nouveau repository (ex: regtech-platform)
3. Connectez votre repository local à GitHub :

```bash
git remote add origin <GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

### 3. Créer le projet Railway

1. Connectez-vous sur https://railway.app
2. Cliquez sur "New Project"
3. Sélectionnez "Deploy from GitHub repo"
4. Authorisez Railway à accéder à votre compte GitHub
5. Sélectionnez le repository regtech-platform

### 4. Configurer les services

#### Service 1: PostgreSQL
1. Cliquez sur "New Service" → "Database" → "PostgreSQL"
2. Copiez les variables d'environnement fournies par Railway

#### Service 2: Redis
1. Cliquez sur "New Service" → "Database" → "Redis"
2. Copiez les variables d'environnement fournies par Railway

#### Service 3: Backend (NestJS)
1. Cliquez sur "New Service" → "Deploy from GitHub repo"
2. Sélectionnez le dossier `backend`
3. Configurez les variables d'environnement en vous basant sur `backend/.env.example`

#### Service 4: Frontend (Next.js)
1. Cliquez sur "New Service" → "Deploy from GitHub repo"
2. Sélectionnez le dossier `frontend`
3. Configurez les variables d'environnement en vous basant sur `frontend/.env.local.example`

#### Service 5: AI Service (Python)
1. Cliquez sur "New Service" → "Deploy from GitHub repo"
2. Sélectionnez le dossier `ai-service`
3. Configurez les variables d'environnement en vous basant sur `ai-service/.env.example`

### 5. Configurer les connexions entre services

1. Liez les services entre eux en ajoutant les variables d'environnement appropriées
2. Configurez les domaines personnalisés si nécessaire

### 6. Initialiser la base de données

1. Ouvrez le terminal du service Backend dans Railway
2. Exécutez les migrations :

```bash
npm run migration:run
```

3. Créez l'utilisateur admin :

```bash
npm run seed:admin
```

### 7. Vérifier le déploiement

1. Vérifiez que tous les services sont en statut "Running"
2. Testez les endpoints :
   - Backend: `https://votre-backend.railway.app/health`
   - Frontend: `https://votre-frontend.railway.app`
   - AI Service: `https://votre-ai-service.railway.app/health`

### 8. Mises à jour continues

Pour déployer des mises à jour :

```bash
git add .
git commit -m "Description des changements"
git push origin main
```

Railway détectera automatiquement les changements et redéployera les services.

## Documentation détaillée

Pour plus d'informations, consultez le guide détaillé dans `RAILWAY_DEPLOYMENT_GUIDE.md`.

## Dépannage

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

## Ressources supplémentaires

- Documentation Railway: https://docs.railway.app
- Support Railway: https://railway.app/support
