# Version simplifiee du script de test

Write-Host "TEST RAPIDE EN LOCAL" -ForegroundColor Cyan
Write-Host ""

# Verifier le serveur
Write-Host "Verification du serveur..." -ForegroundColor Yellow

try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "Serveur OK" -ForegroundColor Green
} catch {
    Write-Host "Serveur non demarre. Demarrage..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mall-app\backend; npm start"
    Start-Sleep -Seconds 15
}

Write-Host ""

# Choisir le test
Write-Host "Tests disponibles :" -ForegroundColor Cyan
Write-Host "1. Notifications"
Write-Host "2. Workflow Complet"
Write-Host "3. Les deux"
$choice = Read-Host "Choisir"

Write-Host ""

if ($choice -eq "1" -or $choice -eq "3") {
    Write-Host "Test notifications..." -ForegroundColor Cyan
    node tests-et-notes/TestJs/test-notifications-local.js
}

if ($choice -eq "2" -or $choice -eq "3") {
    Write-Host "Test workflow..." -ForegroundColor Cyan
    node tests-et-notes/TestJs/test-workflow-complet.js
}

Write-Host ""
Write-Host "Termine !" -ForegroundColor Green
