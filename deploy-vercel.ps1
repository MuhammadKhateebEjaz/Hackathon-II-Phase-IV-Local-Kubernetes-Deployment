#!/usr/bin/env pwsh

# Vercel Deployment Script for Windows PowerShell
# One-command deployment to Vercel

param(
    [switch]$Frontend = $false,
    [switch]$FullStack = $false,
    [switch]$Prod = $false
)

$ErrorActionPreference = "Stop"

function Print-Header {
    Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  Phase IV → Vercel Deployment        ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Yellow
}

Print-Header

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Blue
Write-Host ""

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Print-Error "Vercel CLI not installed"
    Write-Host ""
    Write-Host "Install with: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Print-Success "Vercel CLI found: $(vercel --version)"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Print-Error "Git not installed"
    exit 1
}

Print-Success "Git found: $(git --version)"

# Detect deployment type
Write-Host ""
Write-Host "Deployment options:" -ForegroundColor Cyan
Write-Host "  1. Frontend only (React on Vercel)" -ForegroundColor White
Write-Host "  2. Full-stack (Frontend + Serverless Backend)" -ForegroundColor White
Write-Host ""

if (-not $Frontend -and -not $FullStack) {
    $choice = Read-Host "Choose deployment type (1 or 2)"
    
    if ($choice -eq "1") {
        $Frontend = $true
    }
    elseif ($choice -eq "2") {
        $FullStack = $true
    }
    else {
        Print-Error "Invalid choice"
        exit 1
    }
}

# Check GitHub
Write-Host ""
Write-Host "Checking GitHub repository..." -ForegroundColor Blue

$gitStatus = git status 2>&1
if ($LASTEXITCODE -ne 0) {
    Print-Error "Not a git repository"
    Write-Host ""
    Write-Host "Initialize git:" -ForegroundColor Yellow
    Write-Host "  git init" -ForegroundColor Cyan
    Write-Host "  git add ." -ForegroundColor Cyan
    Write-Host "  git commit -m 'Phase IV: Todo Chatbot'" -ForegroundColor Cyan
    Write-Host "  git remote add origin <your-repo-url>" -ForegroundColor Cyan
    Write-Host "  git push -u origin main" -ForegroundColor Cyan
    exit 1
}

Print-Success "Git repository found"

# Check if pushed to GitHub
$remoteUrl = (git config --get remote.origin.url)
if ($remoteUrl) {
    Print-Success "GitHub remote: $remoteUrl"
}
else {
    Print-Error "No GitHub remote configured"
    Write-Host "Add with: git remote add origin <repo-url>" -ForegroundColor Yellow
    exit 1
}

# Vercel login
Write-Host ""
Write-Host "Checking Vercel authentication..." -ForegroundColor Blue

vercel whoami 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Not authenticated with Vercel" -ForegroundColor Yellow
    Write-Host "Run: vercel login" -ForegroundColor Cyan
    &vercel login
}

Print-Success "Authenticated with Vercel"

# Deploy
Write-Host ""
Write-Host "Starting deployment..." -ForegroundColor Blue
Write-Host ""

if ($Frontend) {
    Write-Host "Deploying frontend to Vercel..." -ForegroundColor Cyan
    
    if ($Prod) {
        &vercel --cwd frontend --prod
    }
    else {
        &vercel --cwd frontend
    }
}
elseif ($FullStack) {
    Write-Host "Deploying full-stack to Vercel..." -ForegroundColor Cyan
    
    if ($Prod) {
        &vercel --prod
    }
    else {
        &vercel
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║   ✓ Deployment Successful!           ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    if ($Frontend) {
        Write-Host "View your app:" -ForegroundColor Cyan
        Write-Host "  vercel open" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "⚠️  Note: Backend is still local" -ForegroundColor Yellow
        Write-Host "  Update REACT_APP_API_URL in Vercel dashboard" -ForegroundColor Gray
    }
    else {
        Write-Host "View your app:" -ForegroundColor Cyan
        Write-Host "  vercel open" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "✓ Frontend + Backend deployed!" -ForegroundColor Green
        Write-Host "  Test API: curl <your-vercel-url>/api/health" -ForegroundColor Gray
    }
}
else {
    Write-Host ""
    Print-Error "Deployment failed"
    exit 1
}
