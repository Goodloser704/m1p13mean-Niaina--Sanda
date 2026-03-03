# Script pour déployer et vérifier que Render = Local

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOIEMENT ET VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Tests en local
Write-Host "[1/5] Tests en LOCAL..." -ForegroundColor Yellow
Write-Host ""

# Vérifier si le serveur tourne
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "Serveur local OK" -ForegroundColor Green
} catch {
    Write-Host "Demarrage du serveur local..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mall-app\backend; npm start"
    Start-Sleep -Seconds 15
}

Write-Host ""
Write-Host "Lancement des tests locaux..." -ForegroundColor Cyan
node tests-et-notes/TestJs/test-workflow-complet.js

Write-Host ""
$continuer = Read-Host "Tests locaux OK ? Continuer le deploiement ? (o/n)"

if ($continuer -ne "o" -and $continuer -ne "O") {
    Write-Host "Deploiement annule" -ForegroundColor Yellow
    exit 0
}

# Étape 2: Git commit et push
Write-Host ""
Write-Host "[2/5] Git commit et push..." -ForegroundColor Yellow

cd mall-app

Write-Host "Fichiers modifies :" -ForegroundColor Cyan
git status --short

Write-Host ""
$message = Read-Host "Message de commit"
if ([string]::IsNullOrWhiteSpace($message)) {
    $message = "feat: ajout modele TestItem et tests"
}

git add .
git commit -m $message
git push

cd ..

Write-Host ""
Write-Host "Code pousse sur GitHub !" -ForegroundColor Green

# Étape 3: Attendre le déploiement Render
Write-Host ""
Write-Host "[3/5] Attente du deploiement Render..." -ForegroundColor Yellow
Write-Host "Render va automatiquement deployer le nouveau code" -ForegroundColor Cyan
Write-Host ""

$duree = 120
Write-Host "Attente de $duree secondes..." -ForegroundColor Yellow

for ($i = 0; $i -lt $duree; $i += 10) {
    $reste = $duree - $i
    Write-Host "  $reste secondes restantes..." -ForegroundColor Cyan
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "Deploiement normalement termine !" -ForegroundColor Green

# Étape 4: Vérifier que Render est accessible
Write-Host ""
Write-Host "[4/5] Verification de Render..." -ForegroundColor Yellow

$renderOk = $false
$tentatives = 0
$maxTentatives = 5

while (-not $renderOk -and $tentatives -lt $maxTentatives) {
    $tentatives++
    Write-Host "Tentative $tentatives/$maxTentatives..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri "https://m1p13mean-niaina-1.onrender.com/health" -TimeoutSec 10 -ErrorAction Stop
        Write-Host "Render est accessible !" -ForegroundColor Green
        $renderOk = $true
    } catch {
        Write-Host "Render pas encore pret, nouvelle tentative dans 10s..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
}

if (-not $renderOk) {
    Write-Host "Impossible de joindre Render apres $maxTentatives tentatives" -ForegroundColor Red
    Write-Host "Verifiez manuellement : https://dashboard.render.com" -ForegroundColor Yellow
    exit 1
}

# Étape 5: Comparer Local vs Render
Write-Host ""
Write-Host "[5/5] Comparaison Local vs Render..." -ForegroundColor Yellow
Write-Host ""

node tests-et-notes/TestJs/test-local-vs-render.js

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   VERIFICATION TERMINEE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Prochaines etapes :" -ForegroundColor Yellow
Write-Host "1. Verifier les resultats ci-dessus" -ForegroundColor White
Write-Host "2. Si tout est identique -> Deploiement reussi !" -ForegroundColor Green
Write-Host "3. Si differences -> Verifier les logs Render" -ForegroundColor Yellow
Write-Host ""
Write-Host "Dashboard Render : https://dashboard.render.com" -ForegroundColor Cyan
