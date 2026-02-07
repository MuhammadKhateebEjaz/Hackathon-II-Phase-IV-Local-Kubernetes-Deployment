#!/bin/bash

# Phase IV Deployment Script
# Automates Minikube setup and Kubernetes deployment

set -e

echo "═══════════════════════════════════════════════════════════"
echo "🚀 Phase IV: Todo Chatbot Kubernetes Deployment"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function: Print status
status() {
  echo -e "${BLUE}▶${NC} $1"
}

success() {
  echo -e "${GREEN}✓${NC} $1"
}

error() {
  echo -e "${RED}✗${NC} $1"
}

warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
echo ""
status "Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
  error "Docker is not installed"
  exit 1
fi
success "Docker found: $(docker --version)"

# Check kubectl
if ! command -v kubectl &> /dev/null; then
  error "kubectl is not installed"
  exit 1
fi
success "kubectl found: $(kubectl version --client --short)"

# Check Helm
if ! command -v helm &> /dev/null; then
  error "Helm is not installed"
  exit 1
fi
success "Helm found: $(helm version --short)"

# Check Minikube
if ! command -v minikube &> /dev/null; then
  warning "Minikube is not installed. Please install it from https://minikube.sigs.k8s.io/"
  exit 1
fi
success "Minikube found: $(minikube version)"

echo ""
status "Starting Minikube cluster..."
minikube start --driver=docker --cpus=4 --memory=4096

echo ""
success "Minikube cluster is running"

# Configure Docker to use Minikube
echo ""
status "Configuring Docker to use Minikube..."
eval $(minikube docker-env)
success "Docker configured for Minikube"

# Build Docker images
echo ""
status "Building Docker images..."
echo "  → Building backend image..."
docker build -t todo-backend:latest ./backend
success "Backend image built"

echo "  → Building frontend image..."
docker build -t todo-frontend:latest ./frontend
success "Frontend image built"

# Verify images
echo ""
status "Verifying images..."
docker images | grep todo

# Deploy with Helm
echo ""
status "Deploying with Helm..."

echo "  → Installing todo-backend..."
helm install todo-backend ./helm/todo-backend \
  --set image.tag=latest \
  --set replicaCount=1 \
  --wait
success "Backend deployed"

echo "  → Installing todo-frontend..."
helm install todo-frontend ./helm/todo-frontend \
  --set image.tag=latest \
  --set replicaCount=1 \
  --wait
success "Frontend deployed"

# Wait for deployments
echo ""
status "Waiting for deployments to be ready..."
kubectl rollout status deployment/todo-backend --timeout=5m
kubectl rollout status deployment/todo-frontend --timeout=5m
success "All deployments are ready"

echo ""
status "Current deployments:"
kubectl get deployments

echo ""
status "Current services:"
kubectl get services

echo ""
status "Current pods:"
kubectl get pods

# Get service info
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 Deployment Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "To access the application:"
echo ""
echo "  1. Get LoadBalancer IP:"
echo "     ${YELLOW}minikube service todo-frontend${NC}"
echo ""
echo "  2. Or use port-forward:"
echo "     ${YELLOW}kubectl port-forward svc/todo-frontend 3001:3001${NC}"
echo "     ${YELLOW}kubectl port-forward svc/todo-backend 3000:3000${NC}"
echo ""
echo "    then open: http://localhost:3001"
echo ""
echo "API Endpoints:"
echo "  Health: http://localhost:3000/health"
echo "  API:    http://localhost:3000/api"
echo ""
echo "To scale backend to 3 replicas:"
echo "  ${YELLOW}kubectl scale deployment/todo-backend --replicas=3${NC}"
echo ""
echo "To view logs:"
echo "  ${YELLOW}kubectl logs -f deployment/todo-backend${NC}"
echo "  ${YELLOW}kubectl logs -f deployment/todo-frontend${NC}"
echo ""
echo "═══════════════════════════════════════════════════════════"
