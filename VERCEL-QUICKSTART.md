# 🚀 Vercel Quick Start (5 Minutes)

## Fastest Path to Deploy

### Option A: Just the Frontend (Easiest)

**Time: 2 minutes**

```powershell
# 1. Push code to GitHub
git push origin main

# 2. Go to Vercel and click "New Project"
# https://vercel.com/new

# 3. Select your GitHub repo

# 4. Click Deploy
```

**That's it!** Your frontend is live at `https://your-project.vercel.app`

**Note:** To access your backend:
- Local: Update `.env` to use `http://localhost:3000/api`
- Cloud: Add backend URL in Vercel environment variables

---

### Option B: Full-Stack with Serverless (Recommended)

**Time: 5 minutes**

#### 1. Install Vercel CLI

```powershell
npm install -g vercel
```

#### 2. Login to Vercel

```powershell
vercel login
```

Follow browser prompt.

#### 3. Deploy

```powershell
# From project root
cd c:\Users\km\Downloads\Hackathon2-PhaseIV
vercel --prod
```

That's it! Your full-stack app is live.

**Test it:**
```powershell
curl https://your-project.vercel.app/api/health
```

---

## What Gets Deployed

✅ **Frontend** - React app  
✅ **Backend API** - Serverless functions at `/api`  
⚠️ **Data** - In-memory (see below to add database)

---

## Add Persistent Database (5 min)

### Option 1: MongoDB (Free)

```powershell
# 1. Create account at https://www.mongodb.com/cloud/atlas

# 2. Get connection string

# 3. Add to Vercel
vercel env add MONGODB_URI <your-connection-string>

# 4. Redeploy
vercel --prod
```

### Option 2: PostgreSQL (Free with Vercel)

```powershell
# 1. Add Vercel PostgreSQL
vercel postgres create

# 2. It auto-adds DATABASE_URL env variable

# 3. Redeploy
vercel --prod
```

### Option 3: Supabase (Free)

```powershell
# 1. Create account at https://supabase.com

# 2. Create project & get URL

# 3. Add to Vercel
vercel env add SUPABASE_URL <url>
vercel env add SUPABASE_KEY <key>

# 4. Redeploy
vercel --prod
```

---

## Common Commands

### Useful Commands

```powershell
# View your deployment
vercel open

# View logs in real-time
vercel logs --follow

# List all deployments
vercel list

# View environment variables
vercel env ls

# Add new environment variable
vercel env add API_KEY <value>

# Rollback to previous version
vercel rollback

# Delete project
vercel remove --prod
```

---

## Troubleshooting

### Issue: Frontend can't reach backend

**Fix:** In Vercel dashboard, add environment variable:
```
REACT_APP_API_URL = /api
```

### Issue: "Build failed"

```powershell
# Check what went wrong
vercel logs --follow

# Common fixes:
npm install  # install missing packages
npm run build  # test build locally
```

### Issue: Data not saving

**Cause:** In-memory storage is temporary

**Solution:** Add a database (see above)

### Issue: "Permission denied"

```powershell
# Run PowerShell as Administrator, or:
npm install -g vercel --force
```

---

## What You Get

| Feature | Free | Pro |
|---------|------|-----|
| Deployments | ♾️ Unlimited | ♾️ Unlimited |
| Serverless Functions | 100/day | ♾️ |
| Bandwidth | 100 GB/month | 1 TB/month |
| Domains | Custom | Custom |
| Support | Community | Priority |
| Cost | $0 | $20/month |

---

## Your Live App

After deployment:

**Frontend:** `https://your-project.vercel.app`  
**API:** `https://your-project.vercel.app/api`  
**Health:** `https://your-project.vercel.app/api/health`

---

## Next Steps

1. ✅ Deploy to Vercel (you're here)
2. 📊 Add analytics (Vercel dashboard)
3. 🔐 Set up custom domain
4. 💾 Add database for persistence
5. 🔔 Enable notifications
6. 📈 Monitor performance

---

## Need Help?

### Quick Answers
- **Docs:** https://vercel.com/docs
- **Support:** https://vercel.com/support
- **Status:** https://www.vercelstatus.com

### Deployment Issues
```powershell
# Get detailed logs
vercel logs <project-name> --errors

# Check function logs
vercel logs <project-name> --filter="api"
```

---

## Deploy Now!

```powershell
cd c:\Users\km\Downloads\Hackathon2-PhaseIV
vercel --prod
```

**Your app will be live in 30 seconds!** 🎉

---

See [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md) for complete documentation.
