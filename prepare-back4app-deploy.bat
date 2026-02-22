@echo off
echo ============================================
echo Préparation du déploiement sur Back4App
echo ============================================
echo.

echo Ce script va préparer votre projet pour le déploiement sur Back4App.
echo.

echo [1/4] Vérification des fichiers de configuration...
if not exist backend\.env.example (
    echo ERREUR: Le fichier backend\.env.example n'existe pas.
    pause
    exit /b 1
)

if not exist frontend\.env.local.example (
    echo ERREUR: Le fichier frontend\.env.local.example n'existe pas.
    pause
    exit /b 1
)

if not exist ai-service\.env.example (
    echo ERREUR: Le fichier ai-service\.env.example n'existe pas.
    pause
    exit /b 1
)

echo Tous les fichiers de configuration existent.
echo.

echo [2/4] Installation des dépendances...
call setup-all.bat

echo.
echo [3/4] Construction des applications...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo ERREUR: La construction du backend a échoué.
    pause
    exit /b 1
)

cd ..\frontend
call npm run build
if %errorlevel% neq 0 (
    echo ERREUR: La construction du frontend a échoué.
    pause
    exit /b 1
)

cd ..
echo Construction terminée avec succès.
echo.

echo [4/4] Préparation du déploiement Git...
if not exist .git (
    echo Initialisation du repository Git...
    git init
    git add .
    git commit -m "Initial commit: RegTech Platform"
    echo Repository Git initialisé.
) else (
    echo Repository Git existe déjà.
    echo Veuillez exécuter les commandes suivantes pour mettre à jour le dépôt:
    echo git add .
    echo git commit -m "Mise à jour pour déploiement Back4App"
    echo git push origin main
)

echo.
echo ============================================
echo Préparation terminée!
echo ============================================
echo.
echo Prochaines étapes:
echo 1. Créez un repository sur GitHub (https://github.com/new)
echo 2. Connectez votre repository local à GitHub:
echo    git remote add origin <GITHUB_REPO_URL>
echo    git branch -M main
echo    git push -u origin main
echo 3. Connectez-vous sur Back4App (https://back4app.com)
echo 4. Créez une nouvelle application
echo 5. Suivez les instructions dans docs/BACK4APP_DEPLOYMENT.md
echo.
pause
