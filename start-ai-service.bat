@echo off
echo Démarrage du Service IA RegTech...
echo.
cd ai-service
call venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
