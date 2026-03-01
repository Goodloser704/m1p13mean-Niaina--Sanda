@echo off
echo ========================================
echo TEST ROUTES LOYERS ET FACTURES
echo ========================================
echo.

echo [1/2] Creation des donnees de test...
cd mall-app\backend
call node scripts/seed-loyers-factures-test.js
cd ..\..
echo.

echo [2/2] Lancement des tests...
echo Le serveur doit etre deja lance sur le port 5000
echo.
node tests-et-notes\TestJs\test-loyers-factures-complet.js

echo.
echo ========================================
echo Tests termines!
echo ========================================
pause
