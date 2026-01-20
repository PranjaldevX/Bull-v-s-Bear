# 🚀 Deploy Bull vs Bear Server on Render

## 📋 Prerequisites

- GitHub account with your repository
- Render account (free): https://render.com/
- Your repository: https://github.com/PranjaldevX/Bull-v-s-Bear

## 🎯 Step-by-Step Deployment Guide

### Step 1: Sign Up / Log In to Render

1. Go to https://render.com/
2. Click **"Get Started"** or **"Sign In"**
3. Sign in with your **GitHub account**
4. Authorize Render to access your repositories

### Step 2: Create New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - If not connected, click **"Connect GitHub"**
   - Search for: `Bull-v-s-Bear`
   - Click **"Connect"** next to your repository

### Step 3: Configure Web Service

Fill in the following settings:

#### Basic Settings

| Field | Value |
|-------|-------|
| **Name** | `bull-vs-bear-server` (or any name you prefer) |
| **Region** | Choose closest to you (e.g., Oregon, Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

#### Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render default (auto-set) |
| `GEMINI_API_KEY` | `your_api_key_here` | Optional - for AI analysis |

**To get Gemini API Key** (optional):
1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Copy and paste into Render

#### Instance Type

- Select **"Free"** plan (or paid if you prefer)
- Free plan limitations:
  - Spins down after 15 minutes of inactivity
  - Takes ~30 seconds to wake up
  - 750 hours/month free

### Step 4: Deploy

1. Click **"Create Web Service"** button
2. Render will start building your app
3. Wait for deployment (usually 2-5 minutes)

### Step 5: Monitor Deployment

Watch the logs in real-time:

```
==> Cloning from https://github.com/PranjaldevX/Bull-v-s-Bear...
==> Checking out commit...
==> Running build command 'npm install && npm run build'...
==> Installing dependencies...
==> Building TypeScript...
==> Build successful!
==> Starting service with 'npm start'...
==> Server running on port 10000
==> Your service is live! 🎉
```

### Step 6: Get Your Server URL

Once deployed, you'll see:

```
https://bull-vs-bear-server.onrender.com
```

**Test your server:**
- Health check: `https://your-app.onrender.com/health`
- Root: `https://your-app.onrender.com/`

## 🔧 Configuration Files

### render.yaml (Already Created)

This file automates deployment configuration:

```yaml
services:
  - type: web
    name: bull-vs-bear-server
    env: node
    region: oregon
    plan: free
    rootDir: server
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: GEMINI_API_KEY
        sync: false
```

### server/package.json (Already Configured)

Scripts are ready:
- `npm run build` - Compiles TypeScript
- `npm start` - Runs compiled code

## 🌐 Update Client to Use Render URL

After deployment, update your client to connect to Render:

### Option 1: Environment Variable (Recommended)

Create/update `client/.env`:

```env
VITE_API_URL=https://your-app.onrender.com
VITE_WS_URL=https://your-app.onrender.com
```

### Option 2: Direct Update

Update `client/src/store/gameStore.ts`:

```typescript
const SOCKET_URL = import.meta.env.VITE_WS_URL || 'https://your-app.onrender.com';
```

## 🔍 Testing Your Deployment

### 1. Test Health Endpoint

```bash
curl https://your-app.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-21T12:00:00.000Z"
}
```

### 2. Test Root Endpoint

```bash
curl https://your-app.onrender.com/
```

Expected response:
```json
{
  "status": "Bull vs Bear Server Running",
  "version": "1.0.0",
  "endpoints": ["/health", "/start", "/reset"]
}
```

### 3. Test WebSocket Connection

Open browser console on your client and check:
```javascript
// Should see connection logs
Socket connected to: https://your-app.onrender.com
```

## 🐛 Troubleshooting

### Build Fails

**Error**: `Cannot find module`
- **Solution**: Check `server/package.json` has all dependencies
- Run locally: `cd server && npm install && npm run build`

**Error**: `TypeScript compilation failed`
- **Solution**: Check `server/tsconfig.json` is correct
- Fix TypeScript errors locally first

### Server Won't Start

**Error**: `Port already in use`
- **Solution**: Render sets PORT automatically, don't hardcode it
- Use: `const PORT = parseInt(process.env.PORT || '3000', 10);`

**Error**: `Module not found`
- **Solution**: Ensure build command includes `npm install`
- Check `buildCommand` in render.yaml

### WebSocket Connection Issues

**Error**: `WebSocket connection failed`
- **Solution**: Ensure CORS is configured for all origins
- Check `server/src/index.ts` has:
  ```typescript
  cors({ origin: '*' })
  ```

**Error**: `Connection timeout`
- **Solution**: Free tier spins down after inactivity
- First request takes ~30 seconds to wake up
- Consider upgrading to paid tier for always-on

### Environment Variables Not Working

**Error**: `GEMINI_API_KEY is undefined`
- **Solution**: Add in Render dashboard
- Go to: Environment → Add Environment Variable
- Redeploy after adding

## 📊 Monitoring

### View Logs

1. Go to Render dashboard
2. Click your service
3. Click **"Logs"** tab
4. See real-time logs

### Check Metrics

1. Click **"Metrics"** tab
2. View:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### Set Up Alerts

1. Click **"Settings"**
2. Scroll to **"Notifications"**
3. Add email for deployment notifications

## 🔄 Continuous Deployment

Render automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update server"
git push origin main

# Render automatically:
# 1. Detects push
# 2. Pulls latest code
# 3. Runs build
# 4. Deploys new version
```

## 💰 Pricing

### Free Tier
- ✅ 750 hours/month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 512 MB RAM
- ⚠️ Shared CPU

### Starter ($7/month)
- ✅ Always on (no spin down)
- ✅ 512 MB RAM
- ✅ Shared CPU
- ✅ Better for production

### Standard ($25/month)
- ✅ Always on
- ✅ 2 GB RAM
- ✅ Dedicated CPU
- ✅ Best for high traffic

## 🎯 Quick Commands

```bash
# Test health endpoint
curl https://your-app.onrender.com/health

# Test root endpoint
curl https://your-app.onrender.com/

# View logs (from Render CLI)
render logs -s bull-vs-bear-server

# Trigger manual deploy
# (Go to Render dashboard → Manual Deploy)
```

## 📝 Checklist

Before deploying:

- [ ] GitHub repository is up to date
- [ ] `render.yaml` is in root directory
- [ ] `server/package.json` has correct scripts
- [ ] Environment variables are ready
- [ ] `.gitignore` excludes `.env` files
- [ ] Server uses `process.env.PORT`
- [ ] CORS is configured for production

After deploying:

- [ ] Health endpoint returns 200
- [ ] Root endpoint returns JSON
- [ ] WebSocket connects successfully
- [ ] Client can connect to server
- [ ] Game works end-to-end
- [ ] Logs show no errors

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com/
- **Render Docs**: https://render.com/docs
- **Your Repository**: https://github.com/PranjaldevX/Bull-v-s-Bear
- **Render Status**: https://status.render.com/

## 🆘 Need Help?

1. **Check Render Docs**: https://render.com/docs/deploy-node-express-app
2. **View Logs**: Render Dashboard → Your Service → Logs
3. **Render Community**: https://community.render.com/
4. **GitHub Issues**: Create issue in your repository

---

## 🎉 Success!

Once deployed, your server URL will be:
```
https://bull-vs-bear-server.onrender.com
```

Update your client to use this URL and you're ready to play! 🚀

**Next Steps:**
1. Deploy client on Netlify/Vercel
2. Update client environment variables
3. Test full game flow
4. Share with friends!
