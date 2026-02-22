# Dockerfile pour le déploiement sur Back4App
# Ce Dockerfile construit et déploie tous les services de la plateforme RegTech

# Étape 1: Construire le backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend/tsconfig.json ./
COPY backend/src ./src

RUN npm run build

# Étape 2: Construire le frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/tsconfig.json ./
COPY frontend/next.config.js ./
COPY frontend/src ./src
COPY frontend/public ./public

RUN npm run build

# Étape 3: Préparer l'image de production pour le backend
FROM node:18-alpine AS backend

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY --from=backend-builder /app/dist ./dist

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main.js"]

# Étape 4: Préparer l'image de production pour le frontend
FROM node:18-alpine AS frontend

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install --production

COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/next.config.js ./

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]

# Étape 5: Préparer l'image de production pour le service IA
FROM python:3.11-slim AS ai-service

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY ai-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download fr_core_news_lg

RUN useradd -m -u 1000 appuser

COPY ai-service/ ./ai-service/
RUN mkdir -p /app/models && chown appuser:appuser /app/models

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "ai-service.main:app", "--host", "0.0.0.0", "--port", "8000"]
