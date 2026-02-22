# Guide de déploiement Docker

Ce guide explique comment déployer votre plateforme RegTech localement avec Docker.

## Prérequis

1. Docker Desktop installé sur votre machine
2. Git installé
3. Un terminal (PowerShell sur Windows)

## ÉTAPE 1: Cloner le projet (si ce n'est pas déjà fait)

```bash
git clone <votre-repo-url>
cd regtech-platform
```

## ÉTAPE 2: Vérifier les fichiers de configuration

Assurez-vous que les fichiers suivants existent :
- `.env` (fichier de variables d'environnement)
- `docker-compose.yml` (fichier de configuration Docker)
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `ai-service/Dockerfile`

## ÉTAPE 3: Lancer Docker Desktop

1. Ouvrez Docker Desktop
2. Attendez que l'icône Docker soit verte (indique que Docker est en cours d'exécution)

## ÉTAPE 4: Lancer l'application

```bash
# Construire et démarrer tous les services
docker-compose up --build

# Ou en mode détaché (en arrière-plan)
docker-compose up --build -d
```

## ÉTAPE 5: Vérifier que tous les services sont en cours d'exécution

```bash
# Voir l'état de tous les conteneurs
docker-compose ps

# Voir les logs d'un service spécifique
docker-compose logs backend
docker-compose logs frontend
docker-compose logs ai-service
```

## ÉTAPE 6: Accéder à l'application

Une fois tous les services démarrés, vous pouvez accéder à :

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Service IA**: http://localhost:8000
- **MinIO Console**: http://localhost:9001 (utilisateur: minioadmin, mot de passe: minioadmin)
- **Bull Board**: http://localhost:3002
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3003 (utilisateur: admin, mot de passe: admin)

## ÉTAPE 7: Initialiser la base de données

```bash
# Exécuter les migrations
docker-compose exec backend npm run migration:run

# Créer l'utilisateur admin
docker-compose exec backend npm run seed:admin
```

## Commandes utiles

### Arrêter l'application

```bash
# Arrêter tous les services
docker-compose stop

# Arrêter et supprimer les conteneurs
docker-compose down

# Arrêter et supprimer les conteneurs et les volumes
docker-compose down -v
```

### Redémarrer un service

```bash
# Redémarrer un service spécifique
docker-compose restart backend

# Redémarrer tous les services
docker-compose restart
```

### Voir les logs

```bash
# Voir les logs de tous les services
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
```

### Exécuter des commandes dans un conteneur

```bash
# Ouvrir un shell dans le backend
docker-compose exec backend bash

# Ouvrir un shell dans le frontend
docker-compose exec frontend bash

# Ouvrir un shell dans le service IA
docker-compose exec ai-service bash
```

### Mettre à jour un service

```bash
# Reconstruire et redémarrer un service
docker-compose up -d --build backend

# Reconstruire et redémarrer tous les services
docker-compose up -d --build
```

## Dépannage

### Les conteneurs ne démarrent pas

```bash
# Voir les logs pour identifier le problème
docker-compose logs

# Vérifier l'état des conteneurs
docker-compose ps
```

### Problèmes de port

Si vous avez des conflits de port, modifiez les ports dans le fichier `docker-compose.yml` :

```yaml
services:
  backend:
    ports:
      - "3001:3001"  # Changez le premier port si nécessaire
```

### Problèmes de base de données

```bash
# Supprimer les volumes et redémarrer
docker-compose down -v
docker-compose up --build
```

### Problèmes de cache

```bash
# Reconstruire sans cache
docker-compose build --no-cache
docker-compose up
```

## Ressources utiles

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
