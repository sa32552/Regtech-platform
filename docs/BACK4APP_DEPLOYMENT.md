# Guide de Déploiement sur Back4App

Ce guide vous explique comment déployer la plateforme RegTech sur Back4App.

## 📋 Prérequis

- Un compte Back4App (https://back4app.com)
- Un compte GitHub
- Git installé sur votre machine
- Node.js (version 18 ou supérieure) installé localement

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

## 🚂 Étape 2: Créer le projet Back4App

### 2.1 Créer un compte Back4App

1. Allez sur https://back4app.com
2. Cliquez sur "Sign Up" pour créer un compte
3. Vérifiez votre adresse email

### 2.2 Créer une nouvelle application

1. Connectez-vous à votre compte Back4App
2. Cliquez sur "Create a new app"
3. Donnez un nom à votre application (ex: regtech-platform)
4. Sélectionnez "Server" comme type d'application
5. Choisissez la région la plus proche de vous
6. Cliquez sur "Create"

## 🔧 Étape 3: Déployer le Backend sur Back4App

### 3.1 Connecter Back4App à GitHub

1. Dans votre application Back4App, cliquez sur "Server Settings" → "Cloud Code"
2. Cliquez sur "Connect GitHub"
3. Authorisez Back4App à accéder à votre compte GitHub
4. Sélectionnez le repository regtech-platform
5. Sélectionnez la branche "main"

### 3.2 Configurer le déploiement du Backend

1. Dans les paramètres de déploiement, spécifiez le dossier "backend" comme racine
2. Configurez les variables d'environnement:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=<URL_DE_LA_BASE_DE_DONNEES_BACK4APP>
REDIS_URL=<URL_DU_SERVICE_REDIS>
JWT_SECRET=<GENERER_UNE_CLE_SECRETE>
JWT_EXPIRATION=24h
REFRESH_TOKEN_SECRET=<GENERER_UNE_CLE_SECRETE>
REFRESH_TOKEN_EXPIRATION=7d
CORS_ORIGINS=https://votre-application.back4app.io
```

### 3.3 Déployer le Backend

1. Cliquez sur "Deploy"
2. Attendez que le déploiement se termine
3. Vérifiez les logs pour vous assurer qu'il n'y a pas d'erreurs

## 🌐 Étape 4: Déployer le Frontend sur Back4App

### 4.1 Configurer le déploiement du Frontend

1. Dans votre application Back4App, cliquez sur "Server Settings" → "Cloud Code"
2. Ajoutez une nouvelle configuration de déploiement pour le frontend
3. Spécifiez le dossier "frontend" comme racine
4. Configurez les variables d'environnement:

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=<URL_DU_BACKEND_BACK4APP>
```

### 4.2 Déployer le Frontend

1. Cliquez sur "Deploy"
2. Attendez que le déploiement se termine
3. Vérifiez les logs pour vous assurer qu'il n'y a pas d'erreurs

## 🤖 Étape 5: Déployer le Service IA sur Back4App

### 5.1 Configurer le déploiement du Service IA

1. Dans votre application Back4App, cliquez sur "Server Settings" → "Cloud Code"
2. Ajoutez une nouvelle configuration de déploiement pour le service IA
3. Spécifiez le dossier "ai-service" comme racine
4. Configurez les variables d'environnement:

```env
PYTHONUNBUFFERED=1
PORT=8000
REDIS_URL=<URL_DU_SERVICE_REDIS>
BACKEND_URL=<URL_DU_BACKEND_BACK4APP>
BACKEND_API_KEY=<GENERER_UNE_CLE_API>
CORS_ORIGINS=https://votre-application.back4app.io
SPACY_MODEL=fr_core_news_lg
LOG_LEVEL=INFO
```

### 5.2 Déployer le Service IA

1. Cliquez sur "Deploy"
2. Attendez que le déploiement se termine
3. Vérifiez les logs pour vous assurer qu'il n'y a pas d'erreurs

## 📊 Étape 6: Configurer la base de données

### 6.1 Configurer PostgreSQL

1. Dans votre application Back4App, cliquez sur "Database" → "Settings"
2. Notez les informations de connexion:
   - Database URL
   - Host
   - Port
   - User
   - Password
   - Database Name

### 6.2 Exécuter les migrations

1. Ouvrez le terminal du service Backend dans Back4App
2. Exécutez:

```bash
npm run migration:run
```

### 6.3 Créer l'utilisateur admin

```bash
npm run seed:admin
```

## 🔗 Étape 7: Configurer les connexions entre services

### 7.1 Mettre à jour les variables d'environnement

1. Pour le Backend, ajoutez:
   - `DATABASE_URL` (URL de la base de données Back4App)
   - `REDIS_URL` (URL du service Redis)
   - `AI_SERVICE_URL` (URL du service IA)

2. Pour le Frontend, ajoutez:
   - `NEXT_PUBLIC_API_URL` (URL du Backend)
   - `NEXT_PUBLIC_AI_SERVICE_URL` (URL du Service IA)

3. Pour le Service IA, ajoutez:
   - `REDIS_URL` (URL du service Redis)
   - `BACKEND_URL` (URL du Backend)

### 7.2 Redéployer les services

1. Cliquez sur "Redeploy" pour chaque service
2. Attendez que les redéploiements se terminent

## ✅ Étape 8: Vérifier le déploiement

### 8.1 Vérifier les services

1. Vérifiez que tous les services sont en statut "Running"
2. Cliquez sur "View Logs" pour voir les logs de chaque service

### 8.2 Tester les endpoints

1. Backend: `https://votre-backend.back4app.io/health`
2. Frontend: `https://votre-frontend.back4app.io`
3. AI Service: `https://votre-ai-service.back4app.io/health`

### 8.3 Accéder à l'application

1. Ouvrez l'URL du frontend dans votre navigateur
2. Connectez-vous avec les identifiants admin créés
3. Testez les différentes fonctionnalités

## 🔄 Étape 9: Mises à jour continues

### 9.1 Déployer les mises à jour

```bash
git add .
git commit -m "Description des changements"
git push origin main
```

Back4App détectera automatiquement les changements et redéployera les services.

### 9.2 Monitoring

1. Utilisez les métriques Back4App pour surveiller les services
2. Configurez des alertes pour les erreurs
3. Surveillez l'utilisation des ressources

## 🐛 Dépannage

### Problème: Service ne démarre pas

1. Vérifiez les logs dans Back4App
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

- Documentation Back4App: https://www.back4app.com/docs
- Support Back4App: https://www.back4app.com/support
- Guide GitHub Actions: https://docs.github.com/actions

## 🎉 Félicitations !

Votre plateforme RegTech est maintenant déployée et opérationnelle sur Back4App !
