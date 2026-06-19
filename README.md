# Squire Agri-Hub — Digital Brain

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Vercel ready"
git remote add origin https://github.com/YOUR_USERNAME/squire-app.git
git push -u origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework: **Vite** (auto-detected)
4. Build Command: `npm run build`
5. Output Directory: `dist`

### 3. Add Environment Variable (CRITICAL)
In Vercel Dashboard → Your Project → **Settings → Environment Variables**:

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | your-gemini-api-key-here |

Set for: ✅ Production ✅ Preview ✅ Development

### 4. Redeploy
After adding the env variable, go to **Deployments → Redeploy**.

## Local Development
```bash
npm install
# Create a .env.local file:
echo "GEMINI_API_KEY=your-key-here" > .env.local
npm run dev
```

> ⚠️ Never commit your `.env` file. It's in `.gitignore`.
