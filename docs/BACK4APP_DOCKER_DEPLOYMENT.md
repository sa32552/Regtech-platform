# Guide de Déploiement sur Back4App avec Docker

Ce guide vous explique comment déployer la plateforme RegTech sur Back4App en utilisant Docker.

## 📋 Prérequis

- Un compte Back4App (https://back4app.com)
- Un compte GitHub
- Git installé sur votre machine
- Docker installé localement (pour tester localement)

## 🐳 Étape 1: Tester localement avec Docker

Avant de déployer sur Back4App, testez votre application localement avec Docker :

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

## 🚀 Étape 2: Préparer le Repository

### 2.1 Initialiser Git (si pas déjà fait)

```bash
cd regtech-platform
git init
git add .
git commit -m "Initial commit: RegTech Platform"
```

### 2.2 Créer le repository sur GitHub

1. Allez sur https://github.com/new
2. Créez un nouveau repository (ex: regtech-platform)
3. Copiez l'URL du repository

### 2.3 Pousser le code sur GitHub

```bash
git remote add origin <GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

## 🚂 Étape 3: Créer le projet Back4App

### 3.1 Créer un compte Back4App

1. Allez sur https://back4app.com
2. Cliquez sur "Sign Up" pour créer un compte
3. Vérifiez votre adresse email

### 3.2 Créer une nouvelle application

1. Connectez-vous à votre compte Back4App
2. Cliquez sur "Create a new app"
3. Donnez un nom à votre application (ex: regtech-platform)
4. Sélectionnez "Server" comme type d'application
5. Choisissez la région la plus proche de vous
6. Cliquez sur "Create"

## 🐳 Étape 4: Déployer avec Docker sur Back4App

### 4.1 Connecter Back4App à GitHub

1. Dans votre application Back4App, cliquez sur "Server Settings" → "Cloud Code"
2. Cliquez sur "Connect GitHub"
3. Authorisez Back4App à accéder à votre compte GitHub
4. Sélectionnez le repository regtech-platform
5. Sélectionnez la branche "main"

### 4.2 Configurer le déploiement Docker

1. Dans les paramètres de déploiement, assurez-vous que Back4App détecte automatiquement le fichier docker-compose.yml
2. Si nécessaire, spécifiez le chemin vers le fichier docker-compose.yml
3. Configurez les variables d'environnement nécessaires pour remplacer celles dans docker-compose.yml

### 4.3 Adapter docker-compose.yml pour Back4App

Back4App peut nécessiter des modifications du fichier docker-compose.yml pour s'adapter à son environnement. Voici les points à vérifier :

1. Remplacer les volumes locaux par des volumes persistants Back4App
2. Adapter les ports si nécessaire
3. Configurer les variables d'environnement pour utiliser les services Back4App (PostgreSQL, Redis, etc.)
4. Supprimer les services qui sont déjà fournis par Back4App (PostgreSQL, Redis)

### 4.4 Déployer l'application

1. Cliquez sur "Deploy"
2. Attendez que le déploiement se termine
3. Vérifiez les logs pour vous assurer qu'il n'y a pas d'erreurs

## 📊 Étape 5: Configurer la base de données

### 5.1 Utiliser PostgreSQL de Back4App

Back4App fournit une base de données PostgreSQL intégrée. Pour l'utiliser :

1. Dans votre application Back4App, cliquez sur "Database" → "Settings"
2. Notez les informations de connexion:
   - Database URL
   - Host
   - Port
   - User
   - Password
   - Database Name

### 5.2 Mettre à jour docker-compose.yml

Modifiez le fichier docker-compose.yml pour utiliser PostgreSQL de Back4App au lieu du conteneur PostgreSQL local :

```yaml
services:
  # Supprimez ou commentez le service postgres local
  # postgres:
  #   image: postgres:14-alpine
  #   ...

  # Mettez à jour le service backend pour utiliser PostgreSQL de Back4App
  backend:
    # ...
    environment:
      # ...
      DATABASE_URL: ${DATABASE_URL}  # Utilisez la variable d'environnement Back4App
      # ...
```

### 5.3 Exécuter les migrations

1. Ouvrez le terminal du service Backend dans Back4App
2. Exécutez:

```bash
npm run migration:run
```

### 5.4 Créer l'utilisateur admin

```bash
npm run seed:admin
```

## 🔗 Étape 6: Configurer les connexions entre services

### 6.1 Mettre à jour les variables d'environnement

1. Pour le Backend, ajoutez:
   - `DATABASE_URL` (URL de la base de données Back4App)
   - `REDIS_URL` (URL du service Redis Back4App)
   - `AI_SERVICE_URL` (URL du service IA)

2. Pour le Frontend, ajoutez:
   - `NEXT_PUBLIC_API_URL` (URL du Backend)
   - `NEXT_PUBLIC_AI_SERVICE_URL` (URL du Service IA)

3. Pour le Service IA, ajoutez:
   - `REDIS_URL` (URL du service Redis Back4App)
   - `BACKEND_URL` (URL du Backend)

### 6.2 Redéployer les services

1. Cliquez sur "Redeploy" pour chaque service
2. Attendez que les redéploiements se terminent

## ✅ Étape 7: Vérifier le déploiement

### 7.1 Vérifier les services

1. Vérifiez que tous les services sont en statut "Running"
2. Cliquez sur "View Logs" pour voir les logs de chaque service

### 7.2 Tester les endpoints

1. Backend: `https://votre-application.back4app.io/api/health`
2. Frontend: `https://votre-application.back4app.io`
3. AI Service: `https://votre-application.back4app.io/ai/health`

### 7.3 Accéder à l'application

1. Ouvrez l'URL de votre application Back4App dans votre navigateur
2. Connectez-vous avec les identifiants admin créés
3. Testez les différentes fonctionnalités

## 🔄 Étape 8: Mises à jour continues

### 8.1 Déployer les mises à jour

```bash
git add .
git commit -m "Description des changements"
git push origin main
```

Back4App détectera automatiquement les changements et redéployera les services.

### 8.2 Monitoring

1. Utilisez les métriques Back4App pour surveiller les services
2. Configurez des alertes pour les erreurs
3. Surveillez l'utilisation des ressources

## 🐛 Dépannage

### Problème: Conteneur ne démarre pas

1. Vérifiez les logs dans Back4App
2. Vérifiez les variables d'environnement
3. Vérifiez que le Dockerfile est correct
4. Testez localement avec `docker-compose build` et `docker-compose up`

### Problème: Connexion base de données échoue

1. Vérifiez que PostgreSQL est en cours d'exécution sur Back4App
2. Vérifiez les variables d'environnement DATABASE_*
3. Vérifiez que les migrations ont été exécutées
4. Vérifiez que les règles de pare-feu Back4App permettent la connexion

### Problème: Erreur CORS

1. Vérifiez la variable CORS_ORIGINS
2. Assurez-vous que l'URL de l'application Back4App est incluse

### Problème: Service IA lent

1. Vérifiez l'utilisation des ressources
2. Augmentez les ressources du service AI Service
3. Optimisez les modèles IA si nécessaire

## 📚 Ressources supplémentaires

- Documentation Back4App: https://www.back4app.com/docs
- Documentation Docker: https://docs.docker.com
- Support Back4App: https://www.back4app.com/support

## 🎉 Félicitations !

Votre plateforme RegTech est maintenant déployée et opérationnelle sur Back4App avec Docker !
