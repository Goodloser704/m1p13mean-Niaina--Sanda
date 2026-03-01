#!/usr/bin/env pwsh
# Script de test automatisé pour les demandes de location

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTS DEMANDES DE LOCATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
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
Write-Host "[1/2] Test Demandes Location - Simple" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
node tests-et-notes/TestJs/reussi/test-demandes-location.js

Write-Host ""
Write-Host "[2/2] Test Demandes Location - Complet" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
node tests-et-notes/TestJs/reussi/test-demandes-location-complet.js

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests terminés!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Consultez RESULTATS-TESTS-DEMANDES.md pour le rapport détaillé" -ForegroundColor Yellow
