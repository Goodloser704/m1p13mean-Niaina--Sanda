@echo off
echo ========================================
echo TEST PRODUITS ET TYPES-PRODUITS
echo ========================================
echo.

echo Le serveur doit etre deja lance sur le port 5000
echo.
pause

echo.
echo Lancement du test...
node tests-et-notes\TestJs\test-produits-types-complet.js > test-produits-types-output.txt 2>&1
type test-produits-types-output.txt
echo.

echo ========================================
echo TEST TERMINE
echo ========================================
echo.
echo Resultats sauvegardes dans: test-produits-types-output.txt
echo.
pause
