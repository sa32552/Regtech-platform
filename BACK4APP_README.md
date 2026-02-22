# Déploiement sur Back4App - Guide Rapide

Ce guide vous explique comment déployer rapidement la plateforme RegTech sur Back4App.

## Prérequis

- Un compte Back4App (https://back4app.com)
- Un compte GitHub
- Git installé sur votre machine
- Node.js (version 18 ou supérieure) installé localement

## Étapes de déploiement

### 1. Préparer le projet

Exécutez le script de préparation :

```bash
prepare-back4app-deploy.bat
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

### 3. Créer une application Back4App

1. Connectez-vous sur https://back4app.com
2. Cliquez sur "Create a new app"
3. Donnez un nom à votre application (ex: regtech-platform)
4. Sélectionnez "Server" comme type d'application
5. Choisissez la région la plus proche de vous
6. Cliquez sur "Create"

### 4. Déployer le Backend

1. Dans votre application Back4App, cliquez sur "Server Settings" → "Cloud Code"
2. Cliquez sur "Connect GitHub"
3. Authorisez Back4App à accéder à votre compte GitHub
4. Sélectionnez le repository regtech-platform
5. Sélectionnez la branche "main"
6. Spécifiez le dossier "backend" comme racine
7. Configurez les variables d'environnement en vous basant sur `backend/.env.example`
8. Cliquez sur "Deploy"

### 5. Déployer le Frontend

1. Dans votre application Back4App, cliquez sur "Server Settings" → "Cloud Code"
2. Ajoutez une nouvelle configuration de déploiement pour le frontend
3. Spécifiez le dossier "frontend" comme racine
4. Configurez les variables d'environnement en vous basant sur `frontend/.env.local.example`
5. Cliquez sur "Deploy"

### 6. Déployer le Service IA

1. Dans votre application Back4App, cliquez sur "Server Settings" → "Cloud Code"
2. Ajoutez une nouvelle configuration de déploiement pour le service IA
3. Spécifiez le dossier "ai-service" comme racine
4. Configurez les variables d'environnement en vous basant sur `ai-service/.env.example`
5. Cliquez sur "Deploy"

### 7. Configurer la base de données

1. Dans votre application Back4App, cliquez sur "Database" → "Settings"
2. Notez les informations de connexion (Database URL, Host, Port, User, Password, Database Name)
3. Ouvrez le terminal du service Backend dans Back4App
4. Exécutez les migrations :

```bash
npm run migration:run
```

5. Créez l'utilisateur admin :

```bash
npm run seed:admin
```

### 8. Configurer les connexions entre services

1. Mettez à jour les variables d'environnement pour chaque service
2. Redéployez les services pour appliquer les modifications

### 9. Vérifier le déploiement

1. Vérifiez que tous les services sont en statut "Running"
2. Testez les endpoints :
   - Backend: `https://votre-backend.back4app.io/health`
   - Frontend: `https://votre-frontend.back4app.io`
   - AI Service: `https://votre-ai-service.back4app.io/health`

### 10. Mises à jour futures

Pour déployer des mises à jour :

```bash
git add .
git commit -m "Description des changements"
git push origin main
```

Back4App détectera automatiquement les changements et redéployera les services.

## Documentation détaillée

Pour plus d'informations, consultez le guide détaillé dans `docs/BACK4APP_DEPLOYMENT.md`.

## Dépannage

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

## Ressources supplémentaires

- Documentation Back4App: https://www.back4app.com/docs
- Support Back4App: https://www.back4app.com/support
