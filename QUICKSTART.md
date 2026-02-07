# 🚀 Phase IV: Quick Start Guide

## 5-Minute Deployment on Windows

### Prerequisites (One-Time Setup)

```powershell
# 1. Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop
# Enable WSL2 integration in Docker Desktop settings

# 2. Install Minikube
# Using Chocolatey (if installed):
choco install minikube

# Or download from: https://minikube.sigs.k8s.io/docs/start/

# 3. Install kubectl
choco install kubernetes-cli

# 4. Install Helm
choco install kubernetes-helm

# 5. Verify all are installed
minikube version
kubectl version --client
helm version
docker version
```

---

## Deploy Phase IV

### Option A: Automated Deployment (Recommended)

```powershell
# Navigate to project directory
cd C:\Users\km\Downloads\Hackathon2-PhaseIV

# Run deploy script
.\deploy.ps1

# Wait for completion and follow prompts
```

### Option B: Manual Step-by-Step

```powershell
# 1. Start Minikube
minikube start --driver=docker --cpus=4 --memory=4096

# 2. Configure Docker
$env:DOCKER_HOST="unix:///c/Users/km/.minikube/machines/minikube/docker.sock"
# OR use WSL2:
minikube docker-env --shell powershell | Invoke-Expression

# 3. Build images
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# 4. Deploy with Helm
helm install todo-backend ./helm/todo-backend --set image.tag=latest --wait
helm install todo-frontend ./helm/todo-frontend --set image.tag=latest --wait

# 5. Monitor deployment
kubectl get pods -w
```

---

## Access the Application

### Method 1: Minikube Service (Easiest)

```powershell
minikube service todo-frontend
# Opens browser automatically
```

### Method 2: Port Forward

```powershell
# Terminal 1: Forward frontend
kubectl port-forward svc/todo-frontend 3001:3001

# Terminal 2: Forward backend
kubectl port-forward svc/todo-backend 3000:3000

# Open browser
Start-Process "http://localhost:3001"
```

### Method 3: Get IP

```powershell
minikube ip
# Then visit: http://<minikube-ip>:3001
```

---

## Using the Application

### 1. Add a Todo
- Type task title in the form
- Add description (optional)
- Click "Add Todo"

### 2. Manage Todos
- ✓ Mark as complete: Click checkbox
- ✏️ Edit: Click edit button
- 🗑️ Delete: Click delete button

### 3. Chat with Bot
- Ask questions about your todos
- Natural language commands work
- Try: "add a new task", "show my list", "delete completed items"

---

## Monitor & Scale

### View Deployment Status

```powershell
# Check pods
kubectl get pods

# Check services
kubectl get svc

# View logs
kubectl logs -f deployment/todo-backend
kubectl logs -f deployment/todo-frontend
```

### Scale Backend

```powershell
# Scale to 3 replicas
kubectl scale deployment/todo-backend --replicas=3

# View scaling progress
kubectl get pods -l app.kubernetes.io/name=todo-backend -w
```

### Get Metrics

```powershell
# CPU and memory usage
kubectl top pods
kubectl top nodes
```

---

## Cleanup

```powershell
# Uninstall from Kubernetes
helm uninstall todo-backend
helm uninstall todo-frontend

# Stop Minikube
minikube stop

# Delete Minikube (optional, to free disk space)
minikube delete

# Stop Docker Desktop if not needed
# Use Docker Desktop GUI
```

---

## API Examples

### Test Backend Directly

```powershell
# Health check
curl http://localhost:3000/health

# Get all todos (requires port-forward)
curl http://localhost:3000/api/todos

# Create todo
$body = @{
    title = "Buy groceries"
    description = "Milk, eggs, bread"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/todos" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Chat with bot
$chatBody = @{
    message = "add a new task about calling mom"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/chat" `
    -Method POST `
    -ContentType "application/json" `
    -Body $chatBody
```

---

## Troubleshooting

### Issue: "Image not found"

```powershell
# Make sure you're using Minikube Docker
eval $(minikube docker-env)

# Rebuild images
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend
```

### Issue: "Port already in use"

```powershell
# Kill existing port-forwards
Get-Process | Where-Object { $_.ProcessName -like "*kubectl*" } | Stop-Process

# Or use different port
kubectl port-forward svc/todo-frontend 8080:3001
# Visit http://localhost:8080
```

### Issue: "No space left on device"

```powershell
# Delete Minikube to free space
minikube delete

# Recreate with less resources
minikube start --driver=docker --cpus=2 --memory=2048
```

### Issue: Pod stuck in "Pending"

```powershell
# Describe pod to see why
kubectl describe pod <pod-name>

# Usually: reduce resource requests
helm upgrade todo-backend ./helm/todo-backend `
    --set resources.requests.memory=64Mi `
    --set resources.requests.cpu=50m
```

---

## Full Documentation

For detailed documentation, see:
- **README.md** - Complete setup & usage guide
- **TROUBLESHOOTING.md** - Error resolution procedures
- **helm/*** - Helm chart configurations

---

## Phase IV Specification Compliance

✅ **Spec-Driven Development (SDD)**
- ✓ AI-generated Dockerfiles (multi-stage, optimized)
- ✓ AI-generated Helm charts (with templates)  
- ✓ Kubernetes deployment (Minikube)
- ✓ Automated error handling & recovery
- ✓ Health checks & monitoring
- ✓ Scalability via HPA

✅ **Complete Application**
- ✓ React frontend with chat integration
- ✓ Node.js/Express backend API
- ✓ Todo CRUD operations
- ✓ Chatbot assistant with NLP
- ✓ In-memory data storage

---

**Ready to deploy? Run: `.\deploy.ps1`** 🚀
