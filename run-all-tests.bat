@echo off
echo ========================================
echo LANCEMENT DE TOUS LES TESTS
echo ========================================
echo.

echo Le serveur doit etre deja lance sur le port 5000
echo.
echo IMPORTANT: Executez d'abord le script de seed pour les notifications:
echo cd mall-app\backend
echo node scripts\seed-notifications-orders-test.js
echo cd ..\..
echo.
pause

echo.
echo ========================================
echo [1/4] TESTS DEMANDES DE LOCATION
echo ========================================
node tests-et-notes\TestJs\reussi\test-demandes-location-complet.js
echo.
pause

echo.
echo ========================================
echo [2/4] TESTS ESPACES ET ETAGES
echo ========================================
node tests-et-notes\TestJs\test-espaces-etages-complet.js
echo.
pause

echo.
echo ========================================
echo [3/4] TESTS LOYERS ET FACTURES
echo ========================================
node tests-et-notes\TestJs\test-loyers-factures-complet.js
echo.
pause

echo.
echo ========================================
echo [4/6] TESTS COMMERCANT ET DEMANDES
echo ========================================
node tests-et-notes\TestJs\test-commercant-demandes-complet.js
echo.
pause

echo.
echo ========================================
echo [5/6] TESTS NOTIFICATIONS ET ORDERS (AVEC DONNEES)
echo ========================================
node tests-et-notes\TestJs\test-notifications-orders-avec-donnees.js
echo.
pause

echo.
echo ========================================
echo [6/6] TESTS NOTIFICATIONS ET ORDERS (SANS DONNEES)
echo ========================================
node tests-et-notes\TestJs\test-notifications-orders-sans-donnees.js
echo.

echo.
echo ========================================
echo TOUS LES TESTS TERMINES!
echo ========================================
echo.
echo Consultez les rapports:
echo - RESULTATS-TESTS-DEMANDES.md
echo - RESULTATS-TESTS-ESPACES-ETAGES.md
echo - RESULTATS-TESTS-LOYERS-FACTURES.md
echo - RESULTATS-TESTS-NOTIFICATIONS-ORDERS.md
echo - RAPPORT-GLOBAL-TESTS.md
echo.
pause
