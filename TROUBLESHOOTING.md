# Phase IV: Troubleshooting & Error Recovery Guide

This guide implements **SP-5: Error Handling (MANDATORY IN SDD)** for Phase IV deployment.

## Error Classification & Resolution

### Category A: Build Errors

#### A1: Docker Image Build Failure

**Symptom:**
```
error: failed to solve with frontend dockerfile.v0
```

**Diagnosis (AI-executed):**
```bash
docker build -t todo-backend:latest ./backend 2>&1 | tee build-error.log
```

**Resolution (AI-suggested):**

1. **Missing Dependencies**
   ```bash
   # Update package.json dependencies
   cd backend
   npm install
   npm ci --only=production
   ```

2. **Invalid Node Version**
   ```bash
   # Check Dockerfile base image
   # Edit Dockerfile: FROM node:18-alpine (should match your Node version)
   docker build --build-arg NODE_VERSION=18 -t todo-backend:latest ./backend
   ```

3. **Permission Denied**
   ```bash
   # Run Docker with sudo or add user to docker group
   sudo usermod -aG docker $USER
   newgrp docker
   ```

---

### Category B: Pod Runtime Errors

#### B1: CrashLoopBackOff Status

**Symptom:**
```bash
kubectl get pods
# Output: pod/todo-backend-xxx CrashLoopBackOff
```

**Diagnosis (AI-executed):**
```bash
# Get last 100 lines of logs
kubectl logs --tail=100 <pod-name>

# Describe pod for last events
kubectl describe pod <pod-name>

# Check resource limits
kubectl top pods
```

**Common Causes & Fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| `npm ERR! code ENOENT` | Missing server.js | Verify file exists: `docker run --rm todo-backend:latest ls -la` |
| `Cannot find module 'express'` | Dependencies not installed | Rebuild: `docker build --no-cache -t todo-backend:latest ./backend` |
| `listen EADDRINUSE` | Port already in use | Check pod PORT env: `kubectl get pod <name> -o yaml` |
| `ENOMEM` | Out of memory | Increase resource limits in values.yaml |

**Recovery Steps:**
```bash
# 1. Check logs
kubectl logs deployment/todo-backend

# 2. Delete pod to force restart
kubectl delete pod -l app.kubernetes.io/name=todo-backend

# 3. Verify new pod is healthy
kubectl get pods -l app.kubernetes.io/name=todo-backend

# 4. If still failing, check image
kubectl describe pod <pod-name> | grep -A 20 "Image:"
```

---

#### B2: ImagePullBackOff

**Symptom:**
```bash
kubectl get pods
# Output: todo-backend-xxx ImagePullBackOff
```

**Diagnosis (AI-executed):**
```bash
kubectl describe pod <pod-name>
# Look for: "Failed to pull image... not found"
```

**Causes & Fixes:**

1. **Image not in Minikube Docker daemon**
   ```bash
   # Verify Minikube docker env is set
   eval $(minikube docker-env)
   
   # Rebuild image in Minikube
   docker build -t todo-backend:latest ./backend
   
   # Verify image exists
   docker images | grep todo-backend
   ```

2. **Wrong image name or tag**
   ```bash
   # Check helm values
   cat helm/todo-backend/values.yaml | grep -A 3 "image:"
   
   # Update if needed
   helm upgrade todo-backend ./helm/todo-backend --set image.tag=latest
   ```

---

#### B3: Pending Pod

**Symptom:**
```bash
kubectl get pods
# Output: todo-backend-xxx Pending
```

**Diagnosis (AI-executed):**
```bash
kubectl describe pod <pod-name>
# Check "Events:" section for resource warnings
```

**Causes & Fixes:**

1. **Insufficient resources**
   ```bash
   # Check node resources
   kubectl describe nodes
   
   # Reduce resource requests in values
   helm upgrade todo-backend ./helm/todo-backend \
     --set resources.requests.memory=64Mi \
     --set resources.requests.cpu=50m
   ```

2. **Pod affinity/node selector issues**
   ```bash
   # Check available nodes
   kubectl get nodes
   
   # For single-node Minikube, remove node selectors
   ```

---

### Category C: Service Connectivity Issues

#### C1: Service Not Accessible

**Symptom:**
```bash
curl: (7) Failed to connect to localhost port 3001
```

**Diagnosis (AI-executed):**
```bash
# 1. Check service exists
kubectl get svc todo-frontend

# 2. Check endpoints
kubectl get endpoints todo-frontend

# 3. Test connectivity from pod
kubectl exec -it <frontend-pod> -- wget http://todo-backend:3000/health

# 4. Check service type
kubectl get svc todo-frontend -o wide
```

**Fixes:**

1. **LoadBalancer pending (IP not assigned)**
   ```bash
   # For Minikube, use NodePort instead
   helm upgrade todo-frontend ./helm/todo-frontend \
     --set service.type=NodePort
   
   # Get the port
   kubectl get svc todo-frontend
   # Access via: minikube service todo-frontend
   ```

2. **Pods not ready**
   ```bash
   # Check pod status and wait
   kubectl get pods
   kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=todo-frontend
   
   # Check readiness probe
   kubectl describe pod <pod-name> | grep -A 5 "Readiness probe"
   ```

3. **Network policy issues** (if applicable)
   ```bash
   # Verify no network policies blocking traffic
   kubectl get networkpolicies
   ```

---

#### C2: Backend API Not Reachable from Frontend

**Symptom:**
```
Frontend shows error: "Failed to fetch todos"
Browser console: "CORS error" or "Connection refused"
```

**Diagnosis (AI-executed):**
```bash
# 1. Check if backend is running
kubectl get deployment todo-backend
kubectl logs deployment/todo-backend

# 2. Test backend directly
kubectl port-forward svc/todo-backend 3000:3000
curl http://localhost:3000/api/todos

# 3. Check CORS headers
curl -H "Origin: http://localhost:3001" http://localhost:3000/api/todos -v
```

**Fixes:**

1. **Backend service name wrong in frontend**
   ```bash
   # In Kubernetes, backend service is accessible as:
   # http://todo-backend:3000 (within cluster)
   # Update frontend Dockerfile nginx config or env
   
   helm upgrade todo-frontend ./helm/todo-frontend \
     --set env.REACT_APP_API_URL="http://todo-backend:3000/api"
   ```

2. **CORS not enabled**
   ```bash
   # Verify server.js has cors middleware
   grep -n "cors" backend/server.js
   
   # If missing, add:
   const cors = require('cors');
   app.use(cors());
   ```

3. **Firewall/Network issues**
   ```bash
   # Test network connectivity between pods
   kubectl exec -it <frontend-pod> -- \
     wget -O- http://todo-backend:3000/health
   ```

---

### Category D: Data & Persistence Issues

#### D1: Data Lost After Pod Restart

**Note:** Phase IV uses in-memory storage. For persistent data:

```yaml
# Add to helm deployment template
volumes:
- name: data
  emptyDir: {}

volumeMounts:
- name: data
  mountPath: /app/data
```

---

## 🔄 Recovery Procedures

### Procedure 1: Full Deployment Reset

```bash
# 1. Delete all pods (force restart)
kubectl delete pods --all

# 2. Scale deployments
kubectl scale deployment/todo-backend --replicas=1
kubectl scale deployment/todo-frontend --replicas=1

# 3. Monitor recovery
kubectl get pods -w
```

### Procedure 2: Redeploy Everything

```bash
# 1. Uninstall releases
helm uninstall todo-backend todo-frontend

# 2. Rebuild images
eval $(minikube docker-env)
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# 3. Reinstall
helm install todo-backend ./helm/todo-backend --set image.tag=latest
helm install todo-frontend ./helm/todo-frontend --set image.tag=latest
```

### Procedure 3: Debug with Port-Forward

```bash
# Test backend in isolation
kubectl port-forward svc/todo-backend 3000:3000 &
curl http://localhost:3000/health

# Test frontend in isolation
kubectl port-forward svc/todo-frontend 3001:3001 &
open http://localhost:3001

# Kill port-forwards
kill %1 %2
```

---

## 📊 Monitoring Commands

```bash
# Watch all pods
kubectl get pods -w

# Monitor resources
kubectl top pods
kubectl top nodes

# View cluster events
kubectl get events --sort-by='.lastTimestamp'

# Check persistent issues
kubectl get pods --all-namespaces | grep -i error

# View deployment history
helm history todo-backend
helm get values todo-backend
```

---

## 🚨 Emergency Procedures

### Full Cluster Reset

```bash
# Stop and delete Minikube
minikube stop
minikube delete

# Recreate from scratch
minikube start --driver=docker --cpus=4 --memory=4096
./deploy.ps1  # Redeploy everything
```

### Force Error Recovery (AI-Only)

This is governed by AI agents in Phase IV:

```yaml
Error Detection:
├─ kubectl get pods → CrashLoopBackOff detected
├─ kubectl logs → Parse error messages
├─ kubectl describe pod → Identify root cause
└─ Expert system:
   ├─ If "Out of memory" → helm upgrade with higher limits
   ├─ If "Image not found" → rebuild image
   ├─ If "Service unreachable" → fix service config
   └─ Redeploy automatically
```

---

## ✅ Health Check Validation

Run these checks after deployment:

```bash
#!/bin/bash

echo "Checking backend..."
kubectl exec -it deployment/todo-backend -- \
  node -e "require('http').get('http://localhost:3000/health', (r) => console.log('✓ Status:', r.statusCode))"

echo "Checking frontend..."
kubectl exec -it deployment/todo-frontend -- \
  wget -q -O- http://localhost:3001/ | head -20

echo "Checking pod-to-pod connectivity..."
kubectl exec -it deployment/todo-frontend -- \
  wget -O- http://todo-backend:3000/api/todos

echo "✓ All systems healthy"
```

---

**Last Updated:** Phase IV Implementation  
**Specification:** SP-5: Error Handling & Recovery  
**Automated:** Yes (AI-governed)  
