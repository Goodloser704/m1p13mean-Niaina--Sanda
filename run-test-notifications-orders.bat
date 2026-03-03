@echo off
echo ========================================
echo TEST NOTIFICATIONS ET ORDERS/ACHATS
echo ========================================
echo.

echo [1/3] Creation des donnees de test...
cd mall-app\backend
node scripts\seed-notifications-orders-test.js
if %errorlevel% neq 0 (
    echo ERREUR: Echec creation donnees
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo.

echo [2/3] Test AVEC donnees...
node tests-et-notes\TestJs\test-notifications-orders-avec-donnees.js > test-notifications-orders-avec-donnees-output.txt 2>&1
type test-notifications-orders-avec-donnees-output.txt
echo.

echo [3/3] Test SANS donnees...
node tests-et-notes\TestJs\test-notifications-orders-sans-donnees.js > test-notifications-orders-sans-donnees-output.txt 2>&1
type test-notifications-orders-sans-donnees-output.txt
echo.

echo ========================================
echo TESTS TERMINES
echo ========================================
echo.
echo Resultats sauvegardes dans:
echo - test-notifications-orders-avec-donnees-output.txt
echo - test-notifications-orders-sans-donnees-output.txt
echo.
pause
