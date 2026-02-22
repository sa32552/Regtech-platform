# Guide de démarrage rapide sans Docker

Ce guide vous explique comment configurer et lancer la plateforme RegTech localement sans utiliser Docker.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les logiciels suivants sur votre machine :

- Node.js (version 18 ou supérieure) : [Télécharger ici](https://nodejs.org/)
- Python (version 3.9 ou supérieure) : [Télécharger ici](https://www.python.org/downloads/)
- PostgreSQL (version 14 ou supérieure) : [Télécharger ici](https://www.postgresql.org/download/)
- Redis (version 7 ou supérieure) : [Télécharger ici](https://redis.io/download)

## Configuration de l'environnement

### 1. Configuration de la base de données PostgreSQL

Créez une base de données pour le projet :

```bash
# Ouvrez SQL Shell (psql) depuis le menu Démarrer
# Connectez-vous avec votre mot de passe postgres
CREATE DATABASE regtech_db;
CREATE USER regtech WITH PASSWORD 'regtech_password';
GRANT ALL PRIVILEGES ON DATABASE regtech_db TO regtech;
\q
```

### 2. Démarrage de Redis

Assurez-vous que Redis est en cours d'exécution sur votre machine.

### 3. Configuration des fichiers d'environnement

Créez les fichiers de configuration pour chaque service en vous basant sur les fichiers d'exemple :

- Backend : Copiez `backend/.env.example` vers `backend/.env` et modifiez les valeurs si nécessaire
- Frontend : Copiez `frontend/.env.local.example` vers `frontend/.env.local` et modifiez les valeurs si nécessaire
- Service IA : Copiez `ai-service/.env.example` vers `ai-service/.env` et modifiez les valeurs si nécessaire

### 4. Installation des dépendances

Exécutez le script de configuration global pour installer toutes les dépendances :

```bash
setup-all.bat
```

Ce script va :
- Installer les dépendances Node.js pour le backend et le frontend
- Créer un environnement virtuel Python pour le service IA
- Installer les dépendances Python pour le service IA

## Démarrage des services

### Démarrage de tous les services

Pour démarrer tous les services en même temps, exécutez :

```bash
start-all.bat
```

Cela ouvrira trois fenêtres de terminal distinctes pour :
- Le backend (NestJS) sur http://localhost:3001
- Le frontend (Next.js) sur http://localhost:3000
- Le service IA (FastAPI) sur http://localhost:8000

### Démarrage individuel des services

Si vous préférez démarrer les services individuellement, vous pouvez utiliser les scripts suivants :

- Backend : `start-backend.bat`
- Frontend : `start-frontend.bat`
- Service IA : `start-ai-service.bat`

## Vérification de l'installation

Une fois tous les services lancés, vous pouvez vérifier qu'ils fonctionnent correctement en accédant aux URLs suivantes :

- Frontend : http://localhost:3000
- Backend API : http://localhost:3001/api
- AI Service : http://localhost:8000/docs (documentation FastAPI)

## Dépannage

### Problèmes de connexion à la base de données

Vérifiez que PostgreSQL est en cours d'exécution et que les informations de connexion dans le fichier `backend/.env` sont correctes.

### Problèmes de connexion à Redis

Vérifiez que Redis est en cours d'exécution :
```bash
redis-cli ping
```
Devrait retourner `PONG`.

### Erreurs de port

Si un port est déjà utilisé, vous pouvez modifier les ports dans les fichiers de configuration `.env` des différents services.

## Documentation détaillée

Pour plus d'informations sur la configuration et l'utilisation de la plateforme, consultez le guide détaillé dans `docs/LOCAL_DEPLOYMENT.md`.
