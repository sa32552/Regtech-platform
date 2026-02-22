@echo off
echo Configuration de l'environnement pour le Service IA...
echo.

cd ai-service

echo [1/2] Création de l'environnement virtuel Python...
if not exist venv (
    python -m venv venv
    echo Environnement virtuel créé avec succès.
) else (
    echo L'environnement virtuel existe déjà.
)

echo.
echo [2/2] Installation des dépendances Python...
call venv\Scripts\activate
pip install -r requirements.txt

echo.
echo Configuration terminée avec succès!
echo Vous pouvez maintenant démarrer le service IA avec le script start-ai-service.bat
pause
