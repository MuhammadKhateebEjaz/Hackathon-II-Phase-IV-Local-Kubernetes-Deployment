# 🏢 Production Deployment Considerations

This document outlines the transition from Phase IV (Minikube) to production-ready Kubernetes deployment.

## Overview

Phase IV delivers a **Spec-Driven Cloud-Native architecture** suitable for:
- ✅ Development environments
- ✅ Testing & CI/CD pipelines
- ✅ Prototype demonstrations
- ⚠️ Small-scale production (with enhancements)

---

## Phase IV → Production Transition

### Infrastructure Enhancements

#### Current (Phase IV - Minikube)
```
Single-node Kubernetes cluster
├─ All pods on one machine
├─ No redundancy
├─ In-memory data storage
├─ Self-signed certificates (if any)
└─ Basic monitoring
```

#### Production Requirements
```
Multi-node Kubernetes cluster
├─ Load-balanced frontend
├─ Multiple backend replicas
├─ Persistent volume storage
├─ TLS/SSL certificates (Let's Encrypt)
├─ Comprehensive monitoring (Prometheus/Grafana)
├─ Log aggregation (ELK stack)
└─ CI/CD pipeline integration
```

---

## Recommended Production Setup

### Option 1: Cloud Kubernetes (Recommended)

**AWS (EKS)**
```bash
# Create EKS cluster
aws eks create-cluster \
  --name todo-chatbot-prod \
  --region us-east-1 \
  --kubernetes-network-config serviceIpv4Cidr=10.100.0.0/16

# Deploy with Helm
helm install todo-backend ./helm/todo-backend \
  --values values-production.yaml

helm install todo-frontend ./helm/todo-frontend \
  --values values-production.yaml
```

**Google Cloud (GKE)**
```bash
gcloud container clusters create todo-chatbot-prod \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-2

helm install todo-backend ./helm/todo-backend \
  --values values-production.yaml
```

**Azure (AKS)**
```bash
az aks create \
  --resource-group todo-prod \
  --name todo-chatbot-prod \
  --node-count 3 \
  --vm-set-type VirtualMachineScaleSets

helm install todo-backend ./helm/todo-backend \
  --values values-production.yaml
```

### Option 2: Self-Hosted Kubernetes

```yaml
# On-premise cluster with:
- kubeadm for cluster management
- 3+ master nodes (HA)
- Multiple worker nodes
- Persistent storage (NFS/Ceph)
- Container registry (Harbor)
- Ingress controller (NGINX/Istio)
```

---

## Production Helm Values

Create `values-production.yaml`:

```yaml
# todo-backend production values

replicaCount: 3  # Min 3 for HA

image:
  repository: registry.example.com/todo-backend
  tag: "1.2.0"  # Use versioned tags, not latest
  pullPolicy: IfNotPresent
  pullSecrets:
    - name: registry-credentials

service:
  type: ClusterIP  # Use Ingress instead of LoadBalancer
  port: 3000

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
  hosts:
    - host: api.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: todo-backend-tls
      hosts:
        - api.example.com

resources:
  limits:
    cpu: 1000m
    memory: 512Mi
  requests:
    cpu: 500m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

persistence:
  enabled: true
  storageClass: "fast-ssd"
  size: 10Gi
  mountPath: /app/data

# Add database
database:
  enabled: true
  type: postgresql
  host: postgres.default.svc.cluster.local
  port: 5432
  name: todo_chatbot

# Environment variables
env:
  NODE_ENV: production
  LOG_LEVEL: info
  DATABASE_URL: "postgresql://user:pass@postgres:5432/todo_chatbot"

# Security
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsReadOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL

# Pod security policy
podSecurityPolicy:
  enabled: true
  name: restricted

# Network policy
networkPolicy:
  enabled: true
  policyTypes:
    - Ingress
    - Egress

# Service account
serviceAccount:
  create: true
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT:role/todo-backend-role

# Monitoring
prometheus:
  enabled: true
  scrapeInterval: 30s

# Logging
logging:
  enabled: true
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

---

## Database Migration

### Phase IV (In-Memory)
```javascript
// Current: todos stored in memory
let todos = [];
```

### Production (PostgreSQL)

```javascript
// Using connection pool
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.post('/api/todos', async (req, res) => {
  const { title, description } = req.body;
  const result = await pool.query(
    'INSERT INTO todos (title, description) VALUES ($1, $2) RETURNING *',
    [title, description]
  );
  res.json(result.rows[0]);
});
```

### Schema Setup

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX idx_todos_completed ON todos(completed);
```

---

## Security Hardening

### 1. Network Security

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: todo-backend-policy
spec:
  podSelector:
    matchLabels:
      app: todo-backend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: todo-frontend
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: TCP
          port: 5432  # PostgreSQL
```

### 2. TLS/SSL Certificates

```bash
# Install cert-manager
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager

# Create ClusterIssuer for Let's Encrypt
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
EOF
```

### 3. Secret Management

```bash
# Store sensitive data in Kubernetes Secrets
kubectl create secret generic db-credentials \
  --from-literal=username=dbuser \
  --from-literal=password=securepass

# Or use external secret manager
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets
```

---

## Monitoring & Observability

### Prometheus + Grafana

```yaml
# values-monitoring.yaml
prometheus:
  retention: 15d
  scrapeInterval: 30s
  
grafana:
  adminPassword: securepassword
  dashboards:
    - todo-backend-metrics
    - todo-frontend-performance
    - kubernetes-cluster-health
    
alertmanager:
  rules:
    - alert: HighErrorRate
      expr: rate(http_requests_total{status="5xx"}[5m]) > 0.05
```

### Log Aggregation (ELK Stack)

```yaml
# Elasticsearch + Logstash + Kibana
elasticsearch:
  replicas: 3
  storage: 100Gi

kibana:
  enabled: true
  host: logs.example.com
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and Push Docker Images
        run: |
          docker build -t $REGISTRY/todo-backend:${{ github.ref_name }} ./backend
          docker build -t $REGISTRY/todo-frontend:${{ github.ref_name }} ./frontend
          docker push $REGISTRY/todo-backend:${{ github.ref_name }}
          docker push $REGISTRY/todo-frontend:${{ github.ref_name }}
      
      - name: Deploy with Helm
        run: |
          helm upgrade --install todo-backend ./helm/todo-backend \
            --set image.tag=${{ github.ref_name }} \
            --values values-production.yaml
          helm upgrade --install todo-frontend ./helm/todo-frontend \
            --set image.tag=${{ github.ref_name }} \
            --values values-production.yaml
```

---

## Backup & Disaster Recovery

### Automated Backups

```bash
# Backup Helm releases
helm get values todo-backend > backup-values-backend.yaml
helm get values todo-frontend > backup-values-frontend.yaml

# Backup persistent volumes
kubectl get pv -A -o yaml > pv-backup.yaml

# Use tools like Velero
velero install
velero backup create todo-backup
```

### Recovery Procedure

```bash
# Restore from Velero backup
velero restore create --from-backup todo-backup

# Or manual restore
helm rollback todo-backend 1
kubectl restore -f pv-backup.yaml
```

---

## Cost Optimization

### Recommendations

1. **Use Reserved Instances** (AWS/Azure)
2. **Spot Instances** for non-critical workloads
3. **Auto-scaling** based on metrics
4. **Resource quotas** to prevent runaway costs
5. **Clean up unused resources** regularly

```bash
# Find unused resources
kubectl get nodes --sort-by=.metadata.creationTimestamp
kubectl get pv -o json | jq '.items[] | select(.status.phase == "Available")'
```

---

## Compliance & Audit

### RBAC (Role-Based Access Control)

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: todo-backend

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: todo-backend
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: todo-backend
subjects:
  - kind: ServiceAccount
    name: todo-backend
roleRef:
  kind: ClusterRole
  name: todo-backend
  apiGroup: rbac.authorization.k8s.io
```

---

## Conclusion

Phase IV provides the **foundation** for production. To move to production, implement:

1. ✅ Multi-node Kubernetes cluster
2. ✅ Persistent database (PostgreSQL)
3. ✅ SSL/TLS encryption
4. ✅ Comprehensive monitoring
5. ✅ Security hardening
6. ✅ Backup & disaster recovery
7. ✅ CI/CD automation

All guided by **Spec-Driven Development** principles - specifications first, AI implementation, then human review.

---

**For questions about production deployment, consult the Phase IV SDD specification.**
