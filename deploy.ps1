# Phase IV Deployment Script for Windows PowerShell
# Automates Minikube setup and Kubernetes deployment

param(
    [switch]$SkipMinikube = $false,
    [string]$ReplicaCount = "1"
)

$ErrorActionPreference = "Stop"

function Print-Status {
    param([string]$Message)
    Write-Host "► $Message" -ForegroundColor Blue
}

function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

Clear-Host
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 Phase IV: Todo Chatbot Kubernetes Deployment" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host ""
Print-Status "Checking prerequisites..."

$tools = @("docker", "kubectl", "helm", "minikube")
foreach ($tool in $tools) {
    try {
        $version = & $tool --version 2>&1
        Print-Success "$tool found: $($version[0])"
    }
    catch {
        Print-Error "$tool is not installed"
        exit 1
    }
}

# Start Minikube
if (-not $SkipMinikube) {
    Write-Host ""
    Print-Status "Starting Minikube cluster..."
    & minikube start --driver=docker --cpus=4 --memory=4096
    Print-Success "Minikube cluster is running"
}

# Configure Docker
Write-Host ""
Print-Status "Configuring Docker to use Minikube..."
$dockerEnv = & minikube docker-env --shell powershell
Invoke-Expression $dockerEnv
Print-Success "Docker configured for Minikube"

# Build Docker images
Write-Host ""
Print-Status "Building Docker images..."

Write-Host "  → Building backend image..."
docker build -t todo-backend:latest ./backend
Print-Success "Backend image built"

Write-Host "  → Building frontend image..."
docker build -t todo-frontend:latest ./frontend
Print-Success "Frontend image built"

# Verify images
Write-Host ""
Print-Status "Verifying images..."
docker images | Select-String "todo"

# Deploy with Helm
Write-Host ""
Print-Status "Deploying with Helm..."

Write-Host "  → Installing todo-backend..."
helm install todo-backend ./helm/todo-backend `
    --set image.tag=latest `
    --set replicaCount=$ReplicaCount `
    --wait

Print-Success "Backend deployed"

Write-Host "  → Installing todo-frontend..."
helm install todo-frontend ./helm/todo-frontend `
    --set image.tag=latest `
    --set replicaCount=$ReplicaCount `
    --wait

Print-Success "Frontend deployed"

# Wait for deployments
Write-Host ""
Print-Status "Waiting for deployments to be ready..."
kubectl rollout status deployment/todo-backend --timeout=5m
kubectl rollout status deployment/todo-frontend --timeout=5m
Print-Success "All deployments are ready"

Write-Host ""
Print-Status "Current deployments:"
kubectl get deployments

Write-Host ""
Print-Status "Current services:"
kubectl get services

Write-Host ""
Print-Status "Current pods:"
kubectl get pods

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "To access the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Get LoadBalancer IP:" -ForegroundColor White
Write-Host "     minikube service todo-frontend" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Or use port-forward:" -ForegroundColor White
Write-Host "     kubectl port-forward svc/todo-frontend 3001:3001" -ForegroundColor Cyan
Write-Host "     kubectl port-forward svc/todo-backend 3000:3000" -ForegroundColor Cyan
Write-Host "     then open: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Endpoints:" -ForegroundColor Yellow
Write-Host "  Health: http://localhost:3000/health" -ForegroundColor Cyan
Write-Host "  API:    http://localhost:3000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "To scale backend to 3 replicas:" -ForegroundColor Yellow
Write-Host "  kubectl scale deployment/todo-backend --replicas=3" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  kubectl logs -f deployment/todo-backend" -ForegroundColor Cyan
Write-Host "  kubectl logs -f deployment/todo-frontend" -ForegroundColor Cyan
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
