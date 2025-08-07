# 🚀 FlowForge Development Startup Script (PowerShell)
# Starts both backend and frontend servers safely

param(
    [switch]$Help,
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

if ($Help) {
    Write-Host "🔥 FlowForge Development Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1              - Start both servers"
    Write-Host "  .\dev.ps1 -BackendOnly - Start only backend"
    Write-Host "  .\dev.ps1 -FrontendOnly- Start only frontend"
    Write-Host "  .\dev.ps1 -Help        - Show this help"
    exit 0
}

Write-Host "🔥 Starting FlowForge Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js or npm is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Function to start backend
function Start-Backend {
    Write-Host "🚀 Starting Backend Server..." -ForegroundColor Yellow
    
    Push-Location "backend"
    
    if (!(Test-Path "node_modules")) {
        Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
            Pop-Location
            return $false
        }
    }
    
    Write-Host "🟢 Starting backend on http://localhost:3001" -ForegroundColor Green
    
    # Start backend in new window
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "title FlowForge Backend && npm run dev && pause"
    
    Pop-Location
    return $true
}

# Function to start frontend
function Start-Frontend {
    Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
    
    Push-Location "frontend"
    
    if (!(Test-Path "node_modules")) {
        Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
            Pop-Location
            return $false
        }
    }
    
    Write-Host "🟢 Starting frontend on http://localhost:3000" -ForegroundColor Green
    
    # Start frontend in new window
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "title FlowForge Frontend && npm run dev && pause"
    
    Pop-Location
    return $true
}

# Main execution logic
try {
    if ($BackendOnly) {
        $backendResult = Start-Backend
        if (!$backendResult) { exit 1 }
    }
    elseif ($FrontendOnly) {
        $frontendResult = Start-Frontend
        if (!$frontendResult) { exit 1 }
    }
    else {
        # Start both servers
        $backendResult = Start-Backend
        if (!$backendResult) { exit 1 }
        
        Start-Sleep -Seconds 3
        
        $frontendResult = Start-Frontend
        if (!$frontendResult) { exit 1 }
    }
    
    Start-Sleep -Seconds 5
    
    Write-Host ""
    Write-Host "🎉 FlowForge is now running!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Blue
    Write-Host "🔧 Backend API: http://localhost:3001" -ForegroundColor Blue
    Write-Host "📡 WebSocket: ws://localhost:3001/ws" -ForegroundColor Blue
    Write-Host "💡 Health Check: http://localhost:3001/health" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Both servers are running in separate windows." -ForegroundColor Green
    Write-Host "Close the command windows to stop the servers." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit this script..." -ForegroundColor Gray
    Read-Host
    
} catch {
    Write-Host "❌ Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
