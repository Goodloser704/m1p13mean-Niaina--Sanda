@echo off
echo ========================================
echo   TEST RAPIDE EN LOCAL
echo ========================================
echo.

REM Vérifier si le serveur tourne
echo [1/3] Verification du serveur local...
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Serveur local non demarre
    echo.
    echo Demarrage du serveur...
    start "Backend Server" cmd /k "cd mall-app\backend && npm start"
    echo Attente de 10 secondes...
    timeout /t 10 /nobreak >nul
)

echo [OK] Serveur local pret
echo.

REM Lancer les tests
echo [2/3] Execution des tests...
node tests-et-notes/TestJs/test-notifications-local.js
echo.

echo [3/3] Tests termines !
echo.
pause
