# RegTech Platform - KYC/AML/Compliance

## Description
Plateforme 100% automatisée de conformité réglementaire (RegTech), capable de réaliser automatiquement :
- KYC / KYB
- AML (Anti-Money Laundering)
- Analyse documentaire IA
- Détection d'anomalies
- Mise à jour automatique des règles selon les lois
- Automatisation des workflows de conformité 24/7
- Monitoring, alertes et scoring de risque

## Architecture

### Frontend
- Framework: React + Next.js
- UI: TailwindCSS + ShadCN

### Backend API
- Framework: Node.js + NestJS
- Authentification: JWT + MFA + RBAC

### Automation Engine
- Technologie: BullMQ (Redis)
- Tâches automatiques: vérification continue des dossiers, scoring de risque, etc.

### IA / Machine Learning
- Micro-service Python avec FastAPI
- Modules: OCR (Tesseract + LayoutLM), NLP, NER, détection d'anomalies

### Base de données
- PostgreSQL pour les données relationnelles
- MinIO (compatible S3) pour le stockage de fichiers
- Redis pour la queue et le cache

## Installation

### Prérequis
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 7+

### Installation locale

1. Cloner le repository
```bash
git clone https://github.com/your-org/regtech-platform.git
cd regtech-platform
```

2. Installer les dépendances backend
```bash
cd backend
npm install
```

3. Installer les dépendances frontend
```bash
cd frontend
npm install
```

4. Installer les dépendances du service IA
```bash
cd ai-service
pip install -r requirements.txt
```

5. Configurer les variables d'environnement
```bash
# Copier les fichiers d'exemple
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-service/.env.example ai-service/.env
```

### Déploiement sur Back4App

Pour déployer sur Back4App, consultez le guide détaillé dans `BACK4APP_README.md`.

```bash
# Préparer le déploiement
prepare-back4app-deploy.bat
```

6. Initialiser la base de données
```bash
cd backend
npm run migration:run
npm run seed
```

7. Lancer les services
```bash
# Backend
cd backend
npm run start:dev

# Frontend (dans un autre terminal)
cd frontend
npm run dev

# Service IA (dans un autre terminal)
cd ai-service
uvicorn main:app --reload
```

### Installation avec Docker

1. Lancer tous les services
```bash
docker-compose up -d
```

2. Vérifier les services
```bash
docker-compose ps
```

## Tests

### Backend
```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend
```bash
cd frontend
npm run test
```

### Service IA
```bash
cd ai-service
pytest
```

## Documentation

La documentation complète de l'API est disponible à l'adresse suivante :
- Backend: http://localhost:3001/api/docs
- Service IA: http://localhost:8000/docs

## Développement

### Phase 1 - MVP (0-3 mois)
- Backend NestJS (auth + users)
- Frontend Next.js (login + dashboard)
- Module documents + upload + OCR
- Module KYC de base
- Automation Engine (BullMQ)
- Base PostgreSQL + MinIO + Redis
- Tests unitaires backend & frontend

### Phase 2 - Version avancée (3-6 mois)
- Analyse IA PDF + NER
- Détection anomalies AML
- Règles KYC dynamiques
- Monitoring + alertes
- API Analytics

### Phase 3 - Plateforme complète (6-12 mois)
- Legal watcher (veille IA)
- Règles auto-adaptatives
- Pipeline de réentraînement IA
- Kubernetes et auto-scaling
- Optimisations IA (GPU)
- Dashboard complet entreprise

## Licence

MIT
