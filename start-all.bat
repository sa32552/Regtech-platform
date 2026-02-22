@echo off
echo Démarrage de tous les services RegTech...
echo.

echo [1/3] Démarrage du Backend...
start "RegTech Backend" cmd /k "cd backend && npm run start:dev"
timeout /t 5 /nobreak >nul

echo [2/3] Démarrage du Frontend...
start "RegTech Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo [3/3] Démarrage du Service IA...
start "RegTech AI Service" cmd /k "cd ai-service && venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo Tous les services sont en cours de démarrage...
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3001/api
echo AI Service: http://localhost:8000/docs
echo.
echo Appuyez sur n'importe quelle touche pour fermer cette fenêtre...
pause >nul
