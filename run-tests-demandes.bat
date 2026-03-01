@echo off
echo ========================================
echo TESTS DEMANDES DE LOCATION
echo ========================================
echo.

echo Le serveur doit etre deja lance sur le port 5000
echo.

echo [1/2] Test Demandes Location - Simple
echo ========================================
node tests-et-notes\TestJs\reussi\test-demandes-location.js
echo.

echo [2/2] Test Demandes Location - Complet
echo ========================================
node tests-et-notes\TestJs\reussi\test-demandes-location-complet.js
echo.

echo ========================================
echo Tests termines!
echo ========================================
pause
