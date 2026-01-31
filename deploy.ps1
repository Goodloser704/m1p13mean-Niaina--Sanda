#!/usr/bin/env pwsh

Write-Host "🚀 Déploiement de l'application Mall App" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Vérifier que nous sommes sur la bonne branche
$currentBranch = git branch --show-current
Write-Host "📍 Branche actuelle: $currentBranch" -ForegroundColor Yellow

if ($currentBranch -ne "niaina-dev") {
    Write-Host "⚠️  Attention: Vous n'êtes pas sur la branche niaina-dev" -ForegroundColor Yellow
    $continue = Read-Host "Continuer quand même? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "❌ Déploiement annulé" -ForegroundColor Red
        exit 1
    }
}

# Vérifier les changements non commitées
$changes = git status --porcelain
if ($changes) {
    Write-Host "⚠️  Il y a des changements non commitées" -ForegroundColor Yellow
    Write-Host "📝 Changements en cours:" -ForegroundColor Yellow
    git status --porcelain
    $commit = Read-Host "Committer automatiquement? (y/N)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        git add .
        git commit -m "chore: Auto-commit before deployment"
    } else {
        Write-Host "❌ Veuillez committer vos changements avant le déploiement" -ForegroundColor Red
        exit 1
    }
}

# Merger vers main pour le déploiement
Write-Host "🔄 Merge vers main pour déploiement..." -ForegroundColor Blue
git checkout main
git merge niaina-dev

# Push vers les remotes
Write-Host "📤 Push vers GitHub..." -ForegroundColor Blue
git push origin main

Write-Host "✅ Déploiement initié!" -ForegroundColor Green
Write-Host "🌐 Backend Render: https://m1p13mean-niaina-1.onrender.com" -ForegroundColor Cyan
Write-Host "🌐 Frontend Vercel: https://m1p13mean-niaina-xjl4.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Attendre quelques minutes pour que les déploiements se terminent..." -ForegroundColor Yellow
Write-Host "📊 Vérifier les logs sur les plateformes respectives" -ForegroundColor Yellow

# Retourner sur la branche de développement
git checkout niaina-dev

Write-Host "🎉 Script de déploiement terminé!" -ForegroundColor Green