# Guide de déploiement sur Heroku

Ce guide explique comment déployer votre plateforme RegTech sur Heroku.

## Prérequis

1. Un compte Heroku (gratuit)
2. L'interface en ligne de commande Heroku (CLI) installée
3. Un compte GitHub avec votre projet déjà poussé

## Étape 1: Créer une application Heroku

```bash
# Créer une nouvelle application
heroku create regtech-platform

# Ou spécifier un nom personnalisé
heroku create votre-nom-d-application
```

## Étape 2: Configurer les add-ons Heroku

```bash
# Ajouter PostgreSQL
heroku addons:create heroku-postgresql:mini

# Ajouter Redis
heroku addons:create heroku-redis:mini
```

## Étape 3: Configurer les variables d'environnement

```bash
# Configurer les variables pour le backend
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=votre-cle-secrete
heroku config:set REFRESH_TOKEN_SECRET=votre-cle-secrete

# Configurer les variables pour le frontend
heroku config:set NEXT_PUBLIC_API_URL=https://votre-app.herokuapp.com
```

## Étape 4: Déployer l'application

```bash
# Pousser le code sur Heroku
git push heroku main

# Vérifier les logs
heroku logs --tail
```

## Étape 5: Initialiser la base de données

```bash
# Exécuter les migrations
heroku run npm run migration:run

# Créer l'utilisateur admin
heroku run npm run seed:admin
```

## Étape 6: Vérifier le déploiement

```bash
# Ouvrir l'application dans le navigateur
heroku open

# Vérifier l'état de l'application
heroku ps
```

## Gestion des services multiples

Pour déployer les services multiples (backend, frontend, ai-service), vous pouvez soit :

1. **Créer des applications Heroku séparées** pour chaque service
2. **Utiliser Heroku Pipelines** pour gérer les environnements
3. **Utiliser Docker** avec Heroku Container Registry

### Option 1: Applications séparées

```bash
# Backend
heroku create regtech-backend
git remote add heroku-backend https://git.heroku.com/regtech-backend.git
git subtree push --prefix backend heroku-backend main

# Frontend
heroku create regtech-frontend
git remote add heroku-frontend https://git.heroku.com/regtech-frontend.git
git subtree push --prefix frontend heroku-frontend main

# AI Service
heroku create regtech-ai
git remote add heroku-ai https://git.heroku.com/regtech-ai.git
git subtree push --prefix ai-service heroku-ai main
```

### Option 2: Docker avec Heroku Container Registry

```bash
# Se connecter au Container Registry
heroku container:login

# Construire et pousser les images
heroku container:push web -a regtech-backend
heroku container:push web -a regtech-frontend
heroku container:push web -a regtech-ai

# Déployer les images
heroku container:release web -a regtech-backend
heroku container:release web -a regtech-frontend
heroku container:release web -a regtech-ai
```

## Variables d'environnement par service

### Backend
```
NODE_ENV=production
DATABASE_URL=<fourni par Heroku PostgreSQL>
REDIS_URL=<fourni par Heroku Redis>
JWT_SECRET=<générer une clé secrète>
REFRESH_TOKEN_SECRET=<générer une clé secrète>
AI_SERVICE_URL=<URL du service AI>
CORS_ORIGINS=https://votre-app.herokuapp.com
```

### Frontend
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=<URL du backend>
NEXT_PUBLIC_AI_SERVICE_URL=<URL du service AI>
```

### AI Service
```
API_HOST=0.0.0.0
PORT=$PORT
REDIS_URL=<fourni par Heroku Redis>
BACKEND_URL=<URL du backend>
BACKEND_API_KEY=<générer une clé API>
CORS_ORIGINS=https://votre-app.herokuapp.com
SPACY_MODEL=fr_core_news_lg
LOG_LEVEL=INFO
```

## Dépannage

### Voir les logs
```bash
heroku logs --tail
```

### Redémarrer l'application
```bash
heroku restart
```

### Exécuter une commande dans le dyno
```bash
heroku run bash
```

### Mettre à jour les variables d'environnement
```bash
heroku config:set NOM_VARIABLE=valeur
```

### Voir toutes les variables d'environnement
```bash
heroku config
```

## Ressources utiles

- [Documentation Heroku](https://devcenter.heroku.com/)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- [Heroku Postgres](https://devcenter.heroku.com/articles/heroku-postgresql)
- [Heroku Redis](https://devcenter.heroku.com/articles/heroku-redis)
