# PowerShell script to set up the development environment on Windows

Write-Host "🔧 Setting up Medication Management System on Windows..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python from https://python.org" -ForegroundColor Red
    exit 1
}

# Clean existing installation
Write-Host "🧹 Cleaning existing installation..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Test the installation
Write-Host "🧪 Testing installation..." -ForegroundColor Yellow
try {
    node -e "console.log('✅ Node.js working')"
    node -e "const db = require('./config/database'); console.log('✅ Database module loaded')"
    Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Setup failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}
