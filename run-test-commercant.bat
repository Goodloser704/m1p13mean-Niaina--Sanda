@echo off
echo ========================================
echo TEST ROUTES COMMERCANT ET DEMANDES
echo ========================================
echo.

echo [1/4] Nettoyage des donnees de test...
cd mall-app\backend
call node scripts/clean-test-data.js
echo.

echo [2/4] Creation des comptes de test...
call node scripts/create-local-accounts.js
echo.

echo [3/4] Creation des espaces pour tests...
call node scripts/create-espaces-for-tests.js
echo.

echo [4/4] Demarrage du serveur...
echo Le serveur va demarrer. Appuyez sur Ctrl+C pour arreter.
echo.
start "Backend Server" cmd /k "cd mall-app\backend && node server.js"

echo.
echo Attente du demarrage du serveur (10 secondes)...
timeout /t 10 /nobreak > nul

echo.
echo [5/5] Lancement des tests...
cd ..\..
node tests-et-notes\TestJs\test-commercant-demandes-complet.js

echo.
echo ========================================
echo Tests termines!
echo ========================================
pause
