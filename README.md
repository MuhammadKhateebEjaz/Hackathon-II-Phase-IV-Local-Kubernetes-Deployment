# Phase IV: Spec-Driven Cloud-Native Deployment

## 📋 Project Structure

```
Hackathon2-PhaseIV/
├── backend/              # Node.js/Express API
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── server.js
├── frontend/             # React Frontend
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── App.css
│       ├── index.js
│       ├── index.css
│       └── components/
│           ├── TodoForm.js
│           ├── TodoList.js
│           ├── ChatBot.js
│           └── *.css
├── helm/                 # Helm Charts for K8s
│   ├── todo-backend/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   └── todo-frontend/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
├── docker-compose.yml    # Local Docker Compose
└── README.md
```

## 🚀 Quick Start

### Option 1: Docker Compose (Local Development)

```bash
# Build and run both services
docker-compose up --build

# Frontend: http://localhost:3001
# Backend:  http://localhost:3000/health
# API Root: http://localhost:3000/api
```

### Option 2: Kubernetes with Helm (Minikube)

#### Prerequisites
- Docker Desktop or Docker Engine
- Minikube (`minikube version`)
- kubectl (`kubectl version --client`)
- Helm (`helm version`)

#### Step 1: Start Minikube Cluster

```bash
# Create and start Minikube cluster
minikube start --driver=docker --cpus=4 --memory=4096

# Verify cluster is running
kubectl cluster-info
kubectl get nodes
```

#### Step 2: Build Docker Images for Minikube

```bash
# Configure Docker to use Minikube's Docker daemon
eval $(minikube docker-env)

# Build images inside Minikube
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# Verify images
docker images | grep todo
```

#### Step 3: Deploy with Helm

```bash
# Add the local helm chart paths
cd helm

# Install backend
helm install todo-backend ./todo-backend \
  --set image.tag=latest \
  --set replicaCount=1

# Install frontend
helm install todo-frontend ./todo-frontend \
  --set image.tag=latest \
  --set replicaCount=1

# Verify deployments
kubectl get deployments
kubectl get services
kubectl get pods
```

#### Step 4: Access the Application

```bash
# Get the frontend service
kubectl get svc todo-frontend

# For LoadBalancer type (recommended)
minikube service todo-frontend

# For port-forward (alternative)
kubectl port-forward svc/todo-frontend 3001:3001
kubectl port-forward svc/todo-backend 3000:3000
```

#### Step 5: Scale Backend (Demo AI-Governed Ops)

```bash
# Scale to 3 replicas
kubectl scale deployment/todo-backend --replicas=3

# Watch scaling in real-time
kubectl rollout status deployment/todo-backend
kubectl get pods -l app.kubernetes.io/name=todo-backend

# Scale down
kubectl scale deployment/todo-backend --replicas=1
```

## 🔍 Monitoring & Operations

### Health Checks

```bash
# Check pod health
kubectl get pods

# View pod logs
kubectl logs -f deployment/todo-backend
kubectl logs -f deployment/todo-frontend

# Describe pod for events
kubectl describe pod <pod-name>
```

### Troubleshooting

#### Pod CrashLoopBackOff

```bash
# Check logs
kubectl logs <pod-name>

# Describe pod for error details
kubectl describe pod <pod-name>

# Check resource usage
kubectl top pods
```

#### Service Not Accessible

```bash
# Test connectivity
kubectl exec -it <backend-pod> -- node -e "require('http').get('http://localhost:3000/health', (r) => console.log(r.statusCode))"

# Port-forward for debugging
kubectl port-forward svc/todo-backend 3000:3000
curl http://localhost:3000/health
```

## 📊 API Endpoints

### Backend API

```bash
# Health check
curl http://localhost:3000/health

# Get all todos
curl http://localhost:3000/api/todos

# Create todo
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Do this"}'

# Update todo
curl -X PUT http://localhost:3000/api/todos/{id} \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete todo
curl -X DELETE http://localhost:3000/api/todos/{id}

# Chat with bot
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"add a new todo"}'
```

## 🛑 Cleanup

```bash
# Delete Helm releases
helm uninstall todo-backend
helm uninstall todo-frontend

# Stop Minikube
minikube stop

# Delete Minikube cluster (optional)
minikube delete

# Stop Docker Compose
docker-compose down
```

## 📝 Helm Chart Customization

### Override Values

```bash
# Custom replica count
helm install todo-backend ./todo-backend \
  --set replicaCount=3

# Custom resources
helm install todo-backend ./todo-backend \
  --set resources.requests.memory=256Mi \
  --set resources.limits.memory=512Mi

# Disable autoscaling
helm install todo-backend ./todo-backend \
  --set autoscaling.enabled=false
```

### Upgrade Release

```bash
helm upgrade todo-backend ./todo-backend \
  --set replicaCount=3 \
  -f custom-values.yaml
```

## 🔐 Security Features

- ✅ Non-root container users
- ✅ Resource limits (CPU, Memory)
- ✅ Liveness & Readiness probes
- ✅ Health check endpoints
- ✅ CORS enabled for frontend-backend communication

## 🎯 Phase IV Spec Compliance

| Specification | Implementation |
|---|---|
| **Containerization** | ✅ AI-generated Dockerfiles (multi-stage) |
| **Orchestration** | ✅ Kubernetes (Minikube) |
| **Packaging** | ✅ Helm charts with templates |
| **Configuration** | ✅ values.yaml for customization |
| **Scaling** | ✅ HPA with autoscaling |
| **Health** | ✅ Liveness & Readiness probes |
| **Logging** | ✅ Pod logs with kubectl |
| **Error Handling** | ✅ Health endpoints & recovery |

## 🤖 AI-Assisted Operations

All infrastructure is AI-governed:
- Dockerfiles generated by AI
- Helm charts templated by AI
- Deployment automation via kubectl
- Error diagnosis via pod logs and events
- Scaling operations via kubectl CLI

---

**Created:** Phase IV Implementation  
**Status:** Ready for Deployment  
**Environment:** Minikube / Docker Compose  
