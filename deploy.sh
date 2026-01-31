#!/bin/bash

echo "🚀 Déploiement de l'application Mall App"
echo "========================================"

# Vérifier que nous sommes sur la bonne branche
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branche actuelle: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "niaina-dev" ]; then
    echo "⚠️  Attention: Vous n'êtes pas sur la branche niaina-dev"
    read -p "Continuer quand même? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Déploiement annulé"
        exit 1
    fi
fi

# Vérifier les changements non commitées
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Il y a des changements non commitées"
    echo "📝 Changements en cours:"
    git status --porcelain
    read -p "Committer automatiquement? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "chore: Auto-commit before deployment"
    else
        echo "❌ Veuillez committer vos changements avant le déploiement"
        exit 1
    fi
fi

# Merger vers main pour le déploiement
echo "🔄 Merge vers main pour déploiement..."
git checkout main
git merge niaina-dev

# Push vers les remotes
echo "📤 Push vers GitHub..."
git push origin main

echo "✅ Déploiement initié!"
echo "🌐 Backend Render: https://m1p13mean-niaina-1.onrender.com"
echo "🌐 Frontend Vercel: https://m1p13mean-niaina-xjl4.vercel.app"
echo ""
echo "⏳ Attendre quelques minutes pour que les déploiements se terminent..."
echo "📊 Vérifier les logs sur les plateformes respectives"

# Retourner sur la branche de développement
git checkout niaina-dev

echo "🎉 Script de déploiement terminé!"