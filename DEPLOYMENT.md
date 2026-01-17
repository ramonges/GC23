# Deployment Guide - Commodities Earth

This guide covers deploying your Commodities Earth platform to production.

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest option for Next.js applications and offers excellent performance.

#### Steps:

1. **Prepare Your Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Commodities Earth platform"
   ```

2. **Push to GitHub**
   - Create a new repository on GitHub
   - Follow GitHub's instructions to push your code

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

4. **Custom Domain (Optional)**
   - In Vercel dashboard, go to Settings > Domains
   - Add your custom domain (e.g., commoditiesearth.com)
   - Follow DNS configuration instructions

#### Vercel Benefits:
- ✅ Automatic deployments on git push
- ✅ Free SSL certificates
- ✅ Global CDN
- ✅ Excellent Next.js performance
- ✅ Preview deployments for PRs
- ✅ Free tier available

### Option 2: Netlify

Another excellent option for Next.js applications.

#### Steps:

1. **Build Configuration**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**
   - Add in Netlify dashboard under Site Settings > Environment Variables
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Deploy**
   - Connect your Git repository
   - Netlify will automatically deploy on push

### Option 3: Self-Hosted (VPS/Cloud)

For full control, deploy to your own server.

#### Requirements:
- Ubuntu 20.04+ or similar
- Node.js 18+
- Nginx or Apache
- SSL certificate (Let's Encrypt)

#### Steps:

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Set Up Environment**
   ```bash
   # On your server
   export NEXT_PUBLIC_SUPABASE_URL=your_url
   export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

3. **Start the Server**
   ```bash
   npm start
   # Or use PM2 for production
   npm install -g pm2
   pm2 start npm --name "commodities-earth" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Set Up SSL**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Pre-Deployment Checklist

### Code Review
- [ ] All environment variables configured
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Loading states for all async operations
- [ ] Form validation working

### Security
- [ ] Supabase Row Level Security enabled
- [ ] Environment variables not in code
- [ ] HTTPS configured
- [ ] Rate limiting considered
- [ ] Input sanitization implemented

### Performance
- [ ] Images optimized
- [ ] Unnecessary dependencies removed
- [ ] Code splitting implemented (automatic with Next.js)
- [ ] CSS purged (automatic with Tailwind)
- [ ] Lighthouse score checked

### Testing
- [ ] All pages load correctly
- [ ] Authentication flow works
- [ ] Demo request submits successfully
- [ ] Map loads and filters work
- [ ] Mobile responsive design verified
- [ ] Cross-browser testing done

### SEO
- [ ] Meta tags configured
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Analytics added (Google Analytics, etc.)
- [ ] Open Graph tags for social sharing

## Environment Variables

Make sure these are set in your deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Never commit `.env.local` to Git!

## Post-Deployment

### 1. Verify Functionality
- [ ] Visit your deployed URL
- [ ] Test login functionality
- [ ] Submit a test demo request
- [ ] Check Supabase for test data
- [ ] Test map functionality
- [ ] Verify mobile responsiveness

### 2. Set Up Monitoring
- Add error tracking (e.g., Sentry)
- Set up uptime monitoring (e.g., UptimeRobot)
- Configure analytics (e.g., Google Analytics)
- Monitor Supabase usage

### 3. Performance Optimization
- Check Lighthouse scores
- Optimize images if needed
- Enable caching headers
- Consider CDN for static assets

## Scaling Considerations

### Database (Supabase)
- **Free Tier**: Up to 500MB, 2GB bandwidth
- **Pro Tier**: Recommended for production ($25/month)
- **Team/Enterprise**: For high traffic

### Hosting
- Start with free tier
- Monitor usage and scale as needed
- Consider edge functions for complex operations

## Backup Strategy

### Database Backups
1. Supabase automatic backups (Pro plan)
2. Manual exports via dashboard
3. Scheduled SQL dumps

### Code Backups
- Keep code in Git (GitHub/GitLab)
- Tag releases for version control

## Update Procedure

1. **Test Locally**
   ```bash
   npm run dev
   # Test all functionality
   ```

2. **Build and Test**
   ```bash
   npm run build
   npm start
   # Verify production build
   ```

3. **Deploy**
   - Push to main branch (automatic deployment)
   - Or manually deploy via platform dashboard

4. **Verify Deployment**
   - Check production site
   - Test critical features
   - Monitor error logs

## Rollback Procedure

### Vercel/Netlify
1. Go to deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Self-Hosted
```bash
git revert HEAD
git push origin main
pm2 restart commodities-earth
```

## Domain Configuration

### DNS Settings (for custom domain)

```
Type    Name    Value                           TTL
A       @       your-server-ip                  3600
CNAME   www     your-deployment.vercel.app      3600
```

### SSL Certificate
- Automatically provided by Vercel/Netlify
- For self-hosted, use Let's Encrypt (free)

## Performance Targets

- **Lighthouse Score**: 90+ for all metrics
- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.8s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## Security Headers

Add these headers in your deployment (Vercel example):

Create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Troubleshooting Deployment Issues

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check for TypeScript errors
- Review build logs for specific errors

### Environment Variables Not Working
- Ensure they're prefixed with `NEXT_PUBLIC_`
- Restart/redeploy after adding variables
- Check for typos in variable names

### 404 Errors
- Verify file structure matches Next.js conventions
- Check routing configuration
- Ensure all pages are in `app/` directory

### Slow Performance
- Enable caching
- Optimize images
- Use CDN for static assets
- Consider upgrading hosting plan

## Support

For deployment issues:
- Check deployment platform documentation
- Review build logs
- Contact platform support

For Commodities Earth specific issues:
- Email: ram2315@columbia.edu

## Cost Estimates

### Free Tier (Development/Testing)
- Vercel: Free
- Supabase: Free
- **Total: $0/month**

### Production (Small Scale)
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Domain: $12/year
- **Total: ~$46/month**

### Production (Medium Scale)
- Vercel Pro: $20/month
- Supabase Team: $599/month (for higher limits)
- CDN: $20-50/month
- **Total: ~$650/month**

Scale costs based on your actual usage and requirements.

## Maintenance Schedule

### Daily
- Monitor uptime
- Check error logs

### Weekly
- Review user feedback
- Check performance metrics
- Update dependencies if needed

### Monthly
- Database backup verification
- Security updates
- Performance optimization review

### Quarterly
- Full security audit
- Major feature updates
- Cost optimization review

---

**Ready to deploy?** Start with Vercel for the easiest deployment experience!
