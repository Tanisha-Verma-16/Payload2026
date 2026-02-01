# 🚀 Deployment Guide - Vercel

## Quick Start (Recommended)

### Method 1: GitHub Integration (Easiest)

1. **Push code to GitHub**
```bash
cd quant-dashboard
git init
git add .
git commit -m "Initial commit: Quant Research Dashboard"
```

2. **Create GitHub repository**
- Go to github.com and create a new repository
- Copy the repository URL

3. **Link and push**
```bash
git remote add origin https://github.com/YOUR-USERNAME/quant-dashboard.git
git branch -M main
git push -u origin main
```

4. **Deploy on Vercel**
- Visit [vercel.com/new](https://vercel.com/new)
- Sign in with GitHub
- Click "Import Project"
- Select your `quant-dashboard` repository
- Vercel will auto-detect Next.js
- Click **"Deploy"**
- ✅ Done! Your app is live in ~2 minutes

### Method 2: Vercel CLI

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
cd quant-dashboard
vercel
```

4. **Follow prompts**
- Set up and deploy? **Y**
- Which scope? **[Select your account]**
- Link to existing project? **N**
- What's your project's name? **quant-dashboard**
- In which directory is your code? **./**
- Auto-detected settings? **Y**

5. **Production deployment**
```bash
vercel --prod
```

## Configuration

### Build Settings

Vercel auto-detects these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Environment Variables (Optional)

If you need custom configuration:

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add variables:
   - `NEXT_PUBLIC_API_URL` = `https://quant-research-api.onrender.com`

## Custom Domain (Optional)

1. **Go to Vercel Dashboard**
   - Select your project
   - Click "Settings" → "Domains"

2. **Add your domain**
   - Enter your domain name
   - Follow DNS configuration instructions

3. **Update DNS**
   - Add CNAME or A record as instructed
   - Wait for propagation (up to 48 hours)

## Performance Optimizations

Already included in this build:

✅ **Automatic Code Splitting** - Next.js handles this  
✅ **Image Optimization** - Next.js Image component  
✅ **Tree Shaking** - Removes unused code  
✅ **Minification** - Production builds are minified  
✅ **Gzip Compression** - Vercel handles this  

## Monitoring

### Analytics (Free on Vercel)

1. Go to your project dashboard
2. Click "Analytics"
3. View:
   - Page views
   - Unique visitors
   - Performance metrics
   - Geographic data

### Error Tracking

Vercel automatically captures:
- Build errors
- Runtime errors
- 404 pages
- Slow functions

## Troubleshooting

### Build Fails

**Error**: `Module not found`
```bash
# Clear cache locally
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**Error**: `Type errors`
- Check TypeScript errors in terminal
- Fix type issues before deploying

### Deployment is Slow

- First deployment takes longer (cold start)
- Subsequent deployments are faster
- Average deployment time: 1-2 minutes

### API Connection Issues

If the API doesn't connect:
1. Check if `https://quant-research-api.onrender.com` is accessible
2. The free tier may have cold starts (first request slow)
3. Check browser console for CORS errors

## Post-Deployment Checklist

✅ Test all ticker searches  
✅ Verify charts load correctly  
✅ Check mobile responsiveness  
✅ Test different tickers (AAPL, MSFT, GOOGL)  
✅ Verify animations work smoothly  
✅ Check loading states  
✅ Test error handling  

## Updating Your App

### Automatic Deployments

When using GitHub integration:
1. Make changes locally
2. Commit and push to GitHub
```bash
git add .
git commit -m "Update: [your changes]"
git push
```
3. Vercel automatically rebuilds and deploys!

### Manual Updates

Using Vercel CLI:
```bash
vercel --prod
```

## Cost

**Vercel Free Tier includes:**
- Unlimited personal projects
- 100GB bandwidth/month
- Unlimited builds
- Automatic HTTPS
- Custom domains
- Analytics

**This project fits entirely in free tier!** 🎉

## Support

If you encounter issues:
1. Check [Vercel Documentation](https://vercel.com/docs)
2. Visit [Vercel Community](https://github.com/vercel/vercel/discussions)
3. Review build logs in Vercel dashboard

---

**Your dashboard will be live at:**
`https://quant-dashboard-[random].vercel.app`

Or your custom domain if configured!
