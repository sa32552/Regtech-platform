@echo off
echo ============================================
echo Configuration de l'environnement RegTech
echo ============================================
echo.

echo Ce script va configurer tous les environnements nécessaires pour exécuter la plateforme RegTech localement.
echo.

echo [1/3] Configuration des services Node.js (Backend et Frontend)...
call setup-node-services.bat

echo.
echo [2/3] Configuration du Service IA...
call setup-ai-service.bat

echo.
echo [3/3] Vérification des fichiers de configuration...
if not exist backend\.env (
    echo.
    echo ATTENTION: Le fichier backend\.env n'existe pas.
    echo Veuillez créer ce fichier en vous basant sur backend\.env.example
    echo.
)

if not exist frontend\.env.local (
    echo.
    echo ATTENTION: Le fichier frontend\.env.local n'existe pas.
    echo Veuillez créer ce fichier en vous basant sur frontend\.env.local.example
    echo.
)

if not exist ai-service\.env (
    echo.
    echo ATTENTION: Le fichier ai-service\.env n'existe pas.
    echo Veuillez créer ce fichier en vous basant sur ai-service\.env.example
    echo.
)

echo.
echo ============================================
echo Configuration terminée!
echo ============================================
echo.
echo Avant de démarrer les services, assurez-vous d'avoir:
echo 1. PostgreSQL installé et en cours d'exécution
echo 2. Redis installé et en cours d'exécution
echo 3. Créé les fichiers de configuration .env pour chaque service
echo.
echo Vous pouvez maintenant démarrer tous les services avec le script start-all.bat
echo.
pause
