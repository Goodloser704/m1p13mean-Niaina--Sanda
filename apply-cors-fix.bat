@echo off
REM 🔧 Script Windows pour appliquer le fix CORS sur la branche de déploiement

echo 🔧 Application du fix CORS...

REM Vérifier la branche actuelle
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo 📍 Branche actuelle: %CURRENT_BRANCH%

REM Vérifier qu'on est sur niaina-dev
if not "%CURRENT_BRANCH%"=="niaina-dev" (
    echo ⚠️  Vous n'êtes pas sur niaina-dev
    echo 💡 Ce script doit être exécuté depuis niaina-dev
    pause
    exit /b 1
)

REM Demander la branche cible
echo 🎯 Sur quelle branche voulez-vous appliquer le fix CORS ?
echo 1) main
echo 2) dev
set /p choice="Choisissez (1 ou 2): "

if "%choice%"=="1" (
    set TARGET_BRANCH=main
) else if "%choice%"=="2" (
    set TARGET_BRANCH=dev
) else (
    echo ❌ Choix invalide
    pause
    exit /b 1
)

echo 🎯 Application du fix sur la branche: %TARGET_BRANCH%

REM Basculer sur la branche cible
echo 🔄 Basculement vers %TARGET_BRANCH%...
git checkout %TARGET_BRANCH%

REM Copier le fichier server.js corrigé depuis niaina-dev
echo 📋 Copie du fichier server.js corrigé...
git show niaina-dev:backend/server.js > backend/server.js

REM Commit des changements
echo ✅ Fichier server.js modifié avec succès
git add backend/server.js
git commit -m "🔧 Fix CORS: Add regex patterns for Vercel deployments"

echo ✅ Changements committés sur %TARGET_BRANCH%

REM Demander si on veut pusher
set /p push_choice="🚀 Voulez-vous pusher vers origin/%TARGET_BRANCH% ? (y/n): "
if /i "%push_choice%"=="y" (
    git push origin %TARGET_BRANCH%
    echo 🚀 Changements pushés vers origin/%TARGET_BRANCH%
    echo ⏳ Le redéploiement devrait commencer automatiquement
) else (
    echo ⏸️  Push annulé. N'oubliez pas de pusher manuellement :
    echo    git push origin %TARGET_BRANCH%
)

REM Retourner sur niaina-dev
echo 🔄 Retour sur niaina-dev...
git checkout niaina-dev

echo ✅ Script terminé !
echo 💡 Vérifiez les logs du backend après redéploiement pour confirmer le fix
pause