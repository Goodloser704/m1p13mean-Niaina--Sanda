@echo off
echo ========================================
echo TEST ROUTES ESPACES ET ETAGES
echo ========================================
echo.

echo [1/2] Creation des donnees de test...
cd mall-app\backend
call node scripts/seed-espaces-etages-test.js
cd ..\..
echo.

echo [2/2] Lancement des tests...
echo Le serveur doit etre deja lance sur le port 5000
echo.
node tests-et-notes\TestJs\test-espaces-etages-complet.js

echo.
echo ========================================
echo Tests termines!
echo ========================================
pause
