# Script PowerShell pour tester rapidement en local

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST RAPIDE EN LOCAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Demander le mode
Write-Host "Mode de test :" -ForegroundColor Yellow
Write-Host "  1. Development (rapide, logs verbeux)" -ForegroundColor Cyan
Write-Host "  2. Production (identique a Render)" -ForegroundColor Cyan
$mode = Read-Host "Choisir (1 ou 2)"

$useProdMode = $false
if ($mode -eq "2") {
    $useProdMode = $true
    Write-Host ""
    Write-Host "Mode PRODUCTION LOCAL active" -ForegroundColor Yellow
    Write-Host "Configuration identique a Render" -ForegroundColor Green
    
    # Sauvegarder le .env actuel
    if (Test-Path "mall-app\backend\.env") {
        Copy-Item "mall-app\backend\.env" "mall-app\backend\.env.backup" -Force
    }
    
    # Creer .env production
    $prodConfig = @"
PORT=3000
MONGODB_URI=mongodb+srv://faustresilient_db_user:RD3471h5QWuSxZtV@cluster0.ojuacgh.mongodb.net/mall_db?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=super_secret_jwt_key_for_mall_app_2024_production_render
NODE_ENV=production
"@
    Set-Content -Path "mall-app\backend\.env" -Value $prodConfig
    Write-Host "JWT_SECRET de production active" -ForegroundColor Green
}

Write-Host ""

# Verifier si le serveur local tourne
Write-Host "[1/3] Verification du serveur local..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "[OK] Serveur local pret" -ForegroundColor Green
} catch {
    Write-Host "[X] Serveur local non demarre" -ForegroundColor Red
    Write-Host ""
    Write-Host "Demarrage du serveur..." -ForegroundColor Yellow
    
    # Demarrer le serveur dans une nouvelle fenetre
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mall-app\backend; npm start"
    
    Write-Host "Attente de 15 secondes pour le demarrage..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Verifier a nouveau
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "[OK] Serveur demarre avec succes" -ForegroundColor Green
    } catch {
        Write-Host "[X] Impossible de demarrer le serveur" -ForegroundColor Red
        Write-Host "Verifiez que MongoDB est accessible" -ForegroundColor Yellow
        
        # Restaurer .env si mode prod
        if ($useProdMode -and (Test-Path "mall-app\backend\.env.backup")) {
            Copy-Item "mall-app\backend\.env.backup" "mall-app\backend\.env" -Force
            Remove-Item "mall-app\backend\.env.backup" -Force
        }
        exit 1
    }
}

Write-Host ""

# Lancer les tests
Write-Host "[2/3] Execution des tests..." -ForegroundColor Yellow
Write-Host ""

# Demander quel test lancer
Write-Host "Tests disponibles :" -ForegroundColor Cyan
Write-Host "  1. Test Notifications (rapide)" -ForegroundColor White
Write-Host "  2. Test Workflow Complet (CRUD)" -ForegroundColor White
Write-Host "  3. Les deux" -ForegroundColor White
$testChoice = Read-Host "Choisir (1, 2 ou 3)"

if ($testChoice -eq "1" -or $testChoice -eq "3") {
    Write-Host ""
    Write-Host "Test des notifications..." -ForegroundColor Cyan
    node tests-et-notes/TestJs/test-notifications-local.js
}

if ($testChoice -eq "2" -or $testChoice -eq "3") {
    Write-Host ""
    Write-Host "Test du workflow complet..." -ForegroundColor Cyan
    node tests-et-notes/TestJs/test-workflow-complet.js
}

Write-Host ""
Write-Host "[3/3] Tests termines !" -ForegroundColor Green
Write-Host ""

# Restaurer .env si mode production
if ($useProdMode) {
    Write-Host "Restauration de la configuration development..." -ForegroundColor Yellow
    if (Test-Path "mall-app\backend\.env.backup") {
        Copy-Item "mall-app\backend\.env.backup" "mall-app\backend\.env" -Force
        Remove-Item "mall-app\backend\.env.backup" -Force
        Write-Host "Configuration restauree" -ForegroundColor Green
    }
    Write-Host ""
}

# Demander si on veut deployer
$deploy = Read-Host "Voulez-vous deployer sur Render ? (o/n)"

if ($deploy -eq "o" -or $deploy -eq "O") {
    Write-Host ""
    Write-Host "Deploiement sur Render..." -ForegroundColor Yellow
    
    cd mall-app
    git add .
    
    $message = Read-Host "Message de commit"
    if ([string]::IsNullOrWhiteSpace($message)) {
        $message = "fix: corrections apres tests locaux"
    }
    
    git commit -m $message
    git push
    
    Write-Host ""
    Write-Host "Code pousse ! Render va deployer automatiquement." -ForegroundColor Green
    Write-Host "Attente de 2 minutes pour le deploiement..." -ForegroundColor Yellow
    Start-Sleep -Seconds 120
    
    Write-Host ""
    Write-Host "Test de la version en production..." -ForegroundColor Yellow
    cd ..
    node tests-et-notes/TestJs/test-notifications-count-readall.js
} else {
    Write-Host ""
    Write-Host "OK, pas de deploiement. Continuez a tester en local !" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Termine !" -ForegroundColor Green
