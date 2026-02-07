# 🚀 Deploying Phase IV to Vercel

Vercel is the easiest way to deploy your Phase IV Todo Chatbot. This guide covers both options:
1. **Frontend only** (easiest)
2. **Full-stack** (frontend + serverless backend)

---

## Option 1: Deploy Frontend Only to Vercel

The simplest approach - use Vercel for the frontend, keep backend on Minikube/Docker.

### Prerequisites
- Vercel account (free at https://vercel.com)
- GitHub account with the project repository

### Steps

#### 1. Push Code to GitHub

```bash
# Initialize git (if not already done)
cd c:\Users\km\Downloads\Hackathon2-PhaseIV
git init
git add .
git commit -m "Phase IV: Todo Chatbot"
git remote add origin https://github.com/MuhammadKhateebEjaz/Hackathon-II-Phase-IV-Local-Kubernetes-Deployment.git
git push -u origin main
```

#### 2. Create Vercel Project

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Paste GitHub repo URL: `https://github.com/MuhammadKhateebEjaz/Hackathon-II-Phase-IV-Local-Kubernetes-Deployment.git`
4. Vercel will auto-detect it's a React project

#### 3. Configure Build Settings

- **Framework Preset**: React
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

#### 4. Environment Variables

Add to Vercel dashboard:
```
REACT_APP_API_URL = http://your-backend-url:3000/api
```

For local backend (using port-forward):
```
REACT_APP_API_URL = http://localhost:3000/api
```

#### 5. Deploy

Click "Deploy" - Vercel will build and deploy your frontend.

**Your frontend will be live at:** `https://your-project.vercel.app`

---

## Option 2: Deploy Full-Stack to Vercel (Frontend + Backend)

Deploy everything including backend as serverless functions.

### Prerequisites
Same as Option 1, plus:
- Node.js 18+ installed locally

### Step 1: Configure for Vercel

The `vercel.json` is already configured. Verify it exists:

```bash
# Check vercel.json exists
ls vercel.json
```

### Step 2: Update Frontend Environment

```bash
# Development
export REACT_APP_API_URL=http://localhost:3000/api

# Production (Vercel)
# Will use: /api (relative path)
```

The frontend already has `.env.production` configured.

### Step 3: Install Vercel CLI

```powershell
# Windows PowerShell
npm install -g vercel

# Verify installation
vercel --version
```

### Step 4: Login to Vercel

```bash
vercel login
```

Follow the browser prompt to authenticate.

### Step 5: Deploy

```bash
# Deploy to Vercel
vercel

# Or deploy to production
vercel --prod
```

**Output will show:**
```
✓ Project linked to your-project
✓ Built in 45s
✓ Ready → https://your-project.vercel.app
```

### Step 6: Test Backend

Once deployed, test the serverless API:

```bash
# Health check
curl https://your-project.vercel.app/api/health

# Get todos
curl https://your-project.vercel.app/api/todos

# Create todo
curl -X POST https://your-project.vercel.app/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Task from Vercel"}'
```

---

## Important Notes for Phase IV + Vercel

### In-Memory Storage Limitation

⚠️ **Current setup uses in-memory storage**, which means:
- Data is **NOT persisted** across deployments
- Each serverless function invocation may have **different state**
- Todos will be lost if you refresh

### Solution: Add Persistent Database

For production, use one of these:

#### Option A: Vercel PostgreSQL (Recommended)

```javascript
// Install Vercel Postgres SDK
npm install @vercel/postgres

// Update backend to use the database
const { sql } = require('@vercel/postgres');

app.get('/api/todos', async (req, res) => {
  const result = await sql`SELECT * FROM todos ORDER BY created_at DESC`;
  res.json({ success: true, data: result.rows });
});
```

#### Option B: MongoDB Atlas (Free)

```javascript
// Install MongoDB client
npm install mongodb

const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

app.get('/api/todos', async (req, res) => {
  const db = client.db('todo_chatbot');
  const todos = await db.collection('todos').find({}).toArray();
  res.json({ success: true, data: todos });
});
```

#### Option C: Supabase (PostgreSQL)

```javascript
// Install Supabase client
npm install @supabase/supabase-js

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(URL, API_KEY);

app.get('/api/todos', async (req, res) => {
  const { data } = await supabase.from('todos').select('*');
  res.json({ success: true, data });
});
```

---

## Vercel Deployment Commands

### Development

```bash
# Run locally (simulates Vercel)
vercel dev

# Or with hot reload
npm run dev
```

### Production

```bash
# Deploy to production
vercel --prod

# View deployments
vercel list

# Roll back to previous version
vercel rollback

# View logs
vercel logs <project-name>
```

### Environment Variables

```bash
# Add environment variable
vercel env add REACT_APP_API_URL

# Remove environment variable
vercel env rm REACT_APP_API_URL

# List all environment variables
vercel env ls
```

---

## Vercel Pricing & Limits

### Free Tier (Hobby)
✓ Unlimited deployments  
✓ First 100 serverless function invocations/day  
✓ 100GB bandwidth/month  
✓ 1GB at-rest data storage  

### Pro Tier ($20/month)
✓ Faster builds  
✓ Priority support  
✓ More serverless invocations  
✓ Custom domains  

---

## Troubleshooting Vercel Deployment

### Problem: "Build Failed"

```bash
# Check build logs
vercel logs <project-name> --follow

# Common causes:
# 1. Missing dependencies
npm install

# 2. Syntax errors in code
npm run build

# 3. Environment variables not set
vercel env ls
```

### Problem: "API returns 404"

```bash
# Check API routes are being called correctly
vercel logs <project-name> --filter="api"

# Verify vercel.json rewrites
cat vercel.json
```

### Problem: "Frontend can't connect to backend"

```bash
# Frontend should use relative paths:
REACT_APP_API_URL=/api

# NOT absolute URLs:
# REACT_APP_API_URL=https://your-project.vercel.app/api
```

### Problem: "Data not persisting"

This is expected with in-memory storage. Add a database:

```bash
# Add Vercel PostgreSQL
vercel postgres create

# Or use MongoDB Atlas
# Get connection string from: https://www.mongodb.com/cloud/atlas
vercel env add MONGODB_URI
```

---

## Full-Stack Architecture on Vercel

```
User Browser
     ↓
https://your-project.vercel.app
     ↓
┌─────────────────────────┐
│  Frontend (Static)      │
│  Built React App        │
└──────────────┬──────────┘
               ↓
         /api requests
               ↓
┌─────────────────────────┐
│  Serverless Functions   │
│  (Node.js Backend)      │
│  - /api/todos           │
│  - /api/chat            │
│  - /api/health          │
└──────────────┬──────────┘
               ↓
      (Serverless compute)
               ↓
         [Database]
        (Optional: Postgres,
         MongoDB, Supabase)
```

---

## Migration from Minikube to Vercel

### Step 1: Export Data (Optional)

```bash
# Export todos from Minikube backend
kubectl port-forward svc/todo-backend 3000:3000 &
curl http://localhost:3000/api/todos > todos-backup.json
kill %1
```

### Step 2: Deploy Frontend to Vercel

```bash
# Using Vercel CLI
vercel --prod
```

### Step 3: Update Backend (if using database)

```bash
# Add database connection to api routes
# Update .env with database credentials
vercel env add DATABASE_URL
```

### Step 4: Reimport Data (if using database)

```javascript
// Create migration script
// database/migrate.js
const data = require('../todos-backup.json');
// Insert into database
```

---

## Comparison: Minikube vs Vercel

| Feature | Minikube | Vercel |
|---------|----------|--------|
| **Cost** | Free (local) | Free - $20+/mo |
| **Setup** | 10 minutes | 2 minutes |
| **Scalability** | Manual | Auto |
| **Uptime** | Depends on PC | 99.9% SLA |
| **Data Persistence** | In-memory | Need database |
| **Cold Start** | None | 0.5-2s |
| **Best For** | Development | Production |

---

## What's Next?

### After Deploying to Vercel:

1. **Add a Database**
   - Choose: PostgreSQL, MongoDB, or Supabase
   - Update backend to use database
   - Redeploy: `vercel --prod`

2. **Custom Domain**
   - Go to Vercel dashboard
   - Settings → Domains
   - Add your domain: `example.com`

3. **Monitor & Debug**
   - Vercel Analytics dashboard
   - Real-time logs: `vercel logs --follow`
   - Error tracking integration

4. **CI/CD Pipeline**
   - Connect GitHub repo
   - Auto-deploy on push
   - Automatic rollback on failure

---

## Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Deploy Now**: https://vercel.com/new
- **Documentation**: https://vercel.com/docs
- **Support**: https://vercel.com/support

---

## Example: Complete Deployment

```bash
# 1. Push to GitHub
git push origin main

# 2. Deploy to Vercel
vercel --prod

# 3. Test
curl https://your-project.vercel.app/api/health

# 4. Add database
vercel postgres create

# 5. Update environment
vercel env add DATABASE_URL

# 6. Redeploy
vercel --prod
```

---

**Your Phase IV app is now ready for the world!** 🌍

