@echo off
echo Configuration de l'environnement pour les services Node.js (Backend et Frontend)...
echo.

echo [1/2] Installation des dépendances du Backend...
cd backend
if not exist node_modules (
    npm install
    echo Dépendances du backend installées avec succès.
) else (
    echo Les dépendances du backend sont déjà installées.
)

echo.
echo [2/2] Installation des dépendances du Frontend...
cd ..\frontend
if not exist node_modules (
    npm install
    echo Dépendances du frontend installées avec succès.
) else (
    echo Les dépendances du frontend sont déjà installées.
)

echo.
echo Configuration terminée avec succès!
echo Vous pouvez maintenant démarrer les services avec le script start-all.bat
pause
