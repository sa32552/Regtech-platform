# Guide de déploiement local sans Docker

Ce guide explique comment déployer la plateforme RegTech localement sans utiliser Docker.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les logiciels suivants sur votre machine :

- Node.js (version 18 ou supérieure) : [Télécharger ici](https://nodejs.org/)
- Python (version 3.9 ou supérieure) : [Télécharger ici](https://www.python.org/downloads/)
- PostgreSQL (version 14 ou supérieure) : [Télécharger ici](https://www.postgresql.org/download/)
- Redis (version 7 ou supérieure) : [Télécharger ici](https://redis.io/download)
- Git : [Télécharger ici](https://git-scm.com/downloads)

## Installation des dépendances

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-organisation/regtech-platform.git
cd regtech-platform
```

### 2. Installation de PostgreSQL

#### Windows
1. Téléchargez et installez PostgreSQL depuis le site officiel
2. Pendant l'installation, définissez le mot de passe pour l'utilisateur postgres
3. Créez une base de données pour le projet :

```bash
# Ouvrez SQL Shell (psql) depuis le menu Démarrer
# Connectez-vous avec votre mot de passe postgres
CREATE DATABASE regtech_db;
CREATE USER regtech WITH PASSWORD 'regtech_password';
GRANT ALL PRIVILEGES ON DATABASE regtech_db TO regtech;
\q
```

### 3. Installation de Redis

#### Windows
Redis n'est pas officiellement supporté sur Windows, mais vous pouvez utiliser WSL2 ou une version portée :

Option 1: Via WSL2
```bash
# Ouvrez WSL2
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start
```

Option 2: Version portée pour Windows
1. Téléchargez Redis pour Windows depuis [Memurai](https://www.memurai.com/get-memurai) ou [Redis pour Windows](https://github.com/microsoftarchive/redis/releases)
2. Installez et démarrez le service Redis

### 4. Installation de MinIO (optionnel pour le test)

MinIO est utilisé pour le stockage de fichiers. Pour un test simple, vous pouvez utiliser le stockage local à la place.

Si vous souhaitez installer MinIO :
1. Téléchargez MinIO Server depuis [https://min.io/download](https://min.io/download)
2. Créez un dossier pour stocker les données
3. Lancez MinIO avec la commande :
```bash
minio server C:\minio-data --console-address ":9001"
```

## Configuration de l'environnement

### Backend

1. Naviguez vers le dossier backend :
```bash
cd backend
```

2. Créez un fichier `.env` à la racine du dossier backend avec le contenu suivant :
```env
NODE_ENV=development
PORT=3001
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=regtech
DATABASE_PASSWORD=regtech_password
DATABASE_NAME=regtech_db
REDIS_HOST=localhost
REDIS_PORT=6379
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
JWT_SECRET=your_jwt_secret_key_here
AI_SERVICE_URL=http://localhost:8000
```

3. Installez les dépendances :
```bash
npm install
```

4. Exécutez les migrations de base de données :
```bash
npm run migration:run
```

5. Lancez le serveur de développement :
```bash
npm run start:dev
```

Le backend sera accessible à l'adresse http://localhost:3001

### Frontend

1. Naviguez vers le dossier frontend :
```bash
cd frontend
```

2. Créez un fichier `.env.local` à la racine du dossier frontend avec le contenu suivant :
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Installez les dépendances :
```bash
npm install
```

4. Lancez le serveur de développement :
```bash
npm run dev
```

Le frontend sera accessible à l'adresse http://localhost:3000

### Service IA (AI Service)

1. Naviguez vers le dossier ai-service :
```bash
cd ai-service
```

2. Créez un environnement virtuel Python :
```bash
python -m venv venv
```

3. Activez l'environnement virtuel :

#### Windows
```bash
venv\Scripts\activate
```

#### Linux/Mac
```bash
source venv/bin/activate
```

4. Installez les dépendances :
```bash
pip install -r requirements.txt
```

5. Créez un fichier `.env` à la racine du dossier ai-service avec le contenu suivant :
```env
PYTHONUNBUFFERED=1
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
REDIS_HOST=localhost
REDIS_PORT=6379
```

6. Lancez le serveur :
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Le service IA sera accessible à l'adresse http://localhost:8000

## Lancement de tous les services

Pour lancer tous les services en même temps, vous pouvez ouvrir plusieurs terminaux et exécuter les commandes suivantes :

Terminal 1 (Backend) :
```bash
cd backend
npm run start:dev
```

Terminal 2 (Frontend) :
```bash
cd frontend
npm run dev
```

Terminal 3 (AI Service) :
```bash
cd ai-service
venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Vérification de l'installation

Une fois tous les services lancés, vous pouvez vérifier qu'ils fonctionnent correctement en accédant aux URLs suivantes :

- Frontend : http://localhost:3000
- Backend API : http://localhost:3001/api
- AI Service : http://localhost:8000/docs (documentation FastAPI)

## Dépannage

### Problèmes de connexion à la base de données

Vérifiez que PostgreSQL est en cours d'exécution et que les informations de connexion dans le fichier `.env` du backend sont correctes.

### Problèmes de connexion à Redis

Vérifiez que Redis est en cours d'exécution :
```bash
redis-cli ping
```
Devrait retourner `PONG`.

### Problèmes de dépendances Python

Si vous rencontrez des problèmes lors de l'installation des dépendances Python, assurez-vous d'avoir les outils de compilation nécessaires installés sur votre système.

### Erreurs de port

Si un port est déjà utilisé, vous pouvez modifier les ports dans les fichiers de configuration `.env` des différents services.

## Ressources supplémentaires

- [Documentation NestJS](https://docs.nestjs.com/)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation FastAPI](https://fastapi.tiangolo.com/)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
