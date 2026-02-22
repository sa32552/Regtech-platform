# Déploiement sur Back4App avec Docker - Guide Rapide

Ce guide vous explique comment déployer rapidement la plateforme RegTech sur Back4App en utilisant Docker.

## Prérequis

- Un compte Back4App (https://back4app.com)
- Un compte GitHub
- Git installé sur votre machine
- Docker installé localement (pour tester localement)

## Étapes de déploiement

### 1. Tester localement avec Docker

```bash
# Construire les images Docker
docker-compose build

# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### 2. Préparer et pousser le code sur GitHub

```bash
# Initialiser Git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit: RegTech Platform"

# Créer un repository sur GitHub (https://github.com/new)
# Connecter votre repository local à GitHub
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

### 4. Déployer avec Docker sur Back4App

1. Dans votre application Back4App, cliquez sur "Server Settings" → "Cloud Code"
2. Cliquez sur "Connect GitHub"
3. Authorisez Back4App à accéder à votre compte GitHub
4. Sélectionnez le repository regtech-platform
5. Sélectionnez la branche "main"
6. Assurez-vous que Back4App détecte automatiquement le fichier docker-compose.yml
7. Configurez les variables d'environnement nécessaires
8. Cliquez sur "Deploy"

### 5. Configurer la base de données

1. Dans votre application Back4App, cliquez sur "Database" → "Settings"
2. Notez les informations de connexion (Database URL, Host, Port, User, Password, Database Name)
3. Mettez à jour les variables d'environnement pour utiliser PostgreSQL de Back4App
4. Exécutez les migrations via le terminal du service Backend :

```bash
npm run migration:run
```

5. Créez l'utilisateur admin :

```bash
npm run seed:admin
```

### 6. Configurer les connexions entre services

1. Mettez à jour les variables d'environnement pour chaque service
2. Redéployez les services pour appliquer les modifications

### 7. Vérifier le déploiement

1. Vérifiez que tous les services sont en statut "Running"
2. Testez les endpoints :
   - Backend: `https://votre-application.back4app.io/api/health`
   - Frontend: `https://votre-application.back4app.io`
   - AI Service: `https://votre-application.back4app.io/ai/health`

### 8. Mises à jour futures

Pour déployer des mises à jour :

```bash
git add .
git commit -m "Description des changements"
git push origin main
```

Back4App détectera automatiquement les changements et redéployera les services.

## Documentation détaillée

Pour plus d'informations, consultez le guide détaillé dans `docs/BACK4APP_DOCKER_DEPLOYMENT.md`.

## Dépannage

### Problème: Conteneur ne démarre pas

1. Vérifiez les logs dans Back4App
2. Vérifiez les variables d'environnement
3. Vérifiez que le Dockerfile est correct
4. Testez localement avec `docker-compose build` et `docker-compose up`

### Problème: Connexion base de données échoue

1. Vérifiez que PostgreSQL est en cours d'exécution sur Back4App
2. Vérifiez les variables d'environnement DATABASE_*
3. Vérifiez que les migrations ont été exécutées

### Problème: Erreur CORS

1. Vérifiez la variable CORS_ORIGINS
2. Assurez-vous que l'URL de l'application Back4App est incluse

## Ressources supplémentaires

- Documentation Back4App: https://www.back4app.com/docs
- Documentation Docker: https://docs.docker.com
- Support Back4App: https://www.back4app.com/support
