# Script de desarrollo para FlowGenio
# Frontend: http://localhost:3050
# Backend: http://localhost:3003

Write-Host "🚀 Iniciando entorno de desarrollo FlowGenio..." -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3050" -ForegroundColor Cyan
Write-Host "⚙️  Backend:  http://localhost:3003" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
$currentDir = Get-Location
Write-Host "📂 Directorio actual: $currentDir" -ForegroundColor Yellow

# Verificar que los puertos estén libres
$frontendPort = 3050
$backendPort = 3003

Write-Host "🔍 Verificando puertos..." -ForegroundColor Blue
$frontendInUse = Get-NetTCPConnection -LocalPort $frontendPort -ErrorAction SilentlyContinue
$backendInUse = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue

if ($frontendInUse) {
    Write-Host "⚠️  Puerto $frontendPort ya está en uso" -ForegroundColor Yellow
}

if ($backendInUse) {
    Write-Host "⚠️  Puerto $backendPort ya está en uso" -ForegroundColor Yellow
}

# Iniciar backend en el puerto 3003
Write-Host "🔧 Iniciando backend en puerto $backendPort..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'D:\FlowRed\flowforge\backend'; node server.js"

# Esperar un momento para que el backend inicie
Start-Sleep -Seconds 3

# Iniciar frontend en el puerto 3050
Write-Host "🎨 Iniciando frontend en puerto $frontendPort..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'D:\FlowRed\flowforge\frontend'; npm run dev"

Write-Host ""
Write-Host "✅ Servicios iniciándose..." -ForegroundColor Green
Write-Host "   Frontend: http://localhost:$frontendPort" -ForegroundColor White
Write-Host "   Backend:  http://localhost:$backendPort" -ForegroundColor White
Write-Host "   Health:   http://localhost:$backendPort/health" -ForegroundColor White
