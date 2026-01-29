#!/bin/bash

# 🔧 Script pour appliquer le fix CORS sur la branche de déploiement

echo "🔧 Application du fix CORS..."

# Vérifier la branche actuelle
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branche actuelle: $CURRENT_BRANCH"

# Si on n'est pas sur niaina-dev, basculer temporairement
if [ "$CURRENT_BRANCH" != "niaina-dev" ]; then
    echo "⚠️  Vous n'êtes pas sur niaina-dev"
    echo "💡 Ce script doit être exécuté depuis niaina-dev"
    exit 1
fi

# Demander sur quelle branche appliquer le fix
echo "🎯 Sur quelle branche voulez-vous appliquer le fix CORS ?"
echo "1) main"
echo "2) dev"
read -p "Choisissez (1 ou 2): " choice

case $choice in
    1)
        TARGET_BRANCH="main"
        ;;
    2)
        TARGET_BRANCH="dev"
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo "🎯 Application du fix sur la branche: $TARGET_BRANCH"

# Sauvegarder les changements actuels si nécessaire
if [ -n "$(git status --porcelain)" ]; then
    echo "💾 Sauvegarde des changements en cours..."
    git stash push -m "Temporary stash before CORS fix"
    STASHED=true
else
    STASHED=false
fi

# Basculer sur la branche cible
echo "🔄 Basculement vers $TARGET_BRANCH..."
git checkout $TARGET_BRANCH

# Copier le fichier server.js corrigé depuis niaina-dev
echo "📋 Copie du fichier server.js corrigé..."
git show niaina-dev:backend/server.js > backend/server.js

# Vérifier que le fichier a été modifié
if [ -n "$(git status --porcelain backend/server.js)" ]; then
    echo "✅ Fichier server.js modifié avec succès"
    
    # Commit des changements
    git add backend/server.js
    git commit -m "🔧 Fix CORS: Add regex patterns for Vercel deployments

✅ Corrections appliquées:
- Patterns regex pour toutes les branches Vercel
- Support automatique des déploiements
- Logs détaillés pour debugging

🎯 Résout:
- Erreurs CORS pour les branches de déploiement
- URLs Vercel dynamiques non autorisées"

    echo "✅ Changements committés sur $TARGET_BRANCH"
    
    # Demander si on veut pusher
    read -p "🚀 Voulez-vous pusher vers origin/$TARGET_BRANCH ? (y/n): " push_choice
    if [ "$push_choice" = "y" ] || [ "$push_choice" = "Y" ]; then
        git push origin $TARGET_BRANCH
        echo "🚀 Changements pushés vers origin/$TARGET_BRANCH"
        echo "⏳ Le redéploiement devrait commencer automatiquement"
    else
        echo "⏸️  Push annulé. N'oubliez pas de pusher manuellement :"
        echo "   git push origin $TARGET_BRANCH"
    fi
else
    echo "ℹ️  Aucune modification détectée (le fix est peut-être déjà appliqué)"
fi

# Retourner sur niaina-dev
echo "🔄 Retour sur niaina-dev..."
git checkout niaina-dev

# Restaurer les changements si nécessaire
if [ "$STASHED" = true ]; then
    echo "🔄 Restauration des changements..."
    git stash pop
fi

echo "✅ Script terminé !"
echo "💡 Vérifiez les logs du backend après redéploiement pour confirmer le fix"