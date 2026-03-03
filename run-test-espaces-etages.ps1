#!/usr/bin/env pwsh
# Script de test automatisé pour les espaces et étages

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "TEST ROUTES ESPACES ET ÉTAGES" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le serveur est lancé
Write-Host "Vérification du serveur..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body (@{email="test@test.com";mdp="test"} | ConvertTo-Json) -ContentType "application/json" -ErrorAction SilentlyContinue
    Write-Host "✓ Serveur actif sur le port 5000" -ForegroundColor Green
} catch {
    Write-Host "✗ Serveur non accessible sur le port 5000" -ForegroundColor Red
    Write-Host "  Lancez d'abord le serveur avec: cd mall-app/backend && node server.js" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[1/2] Création des données de test..." -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Set-Location mall-app/backend
node scripts/seed-espaces-etages-test.js
Set-Location ../..

Write-Host ""
Write-Host "[2/2] Lancement des tests..." -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
node tests-et-notes/TestJs/test-espaces-etages-complet.js

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Tests terminés!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Consultez RESULTATS-TESTS-ESPACES-ETAGES.md pour le rapport détaillé" -ForegroundColor Yellow
