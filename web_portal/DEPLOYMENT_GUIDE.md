# HM nexora - Deployment Guide

## Project Information
- **Project Name**: HM nexora
- **Version**: 1.0.0
- **Framework**: Next.js 16.1.6
- **Node Version**: 16.x or higher recommended
- **Language**: TypeScript

## Pre-Deployment Checklist

### ✅ Environment Variables
Create a `.env.local` file with the following variables:

```bash
# SUPABASE
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# GOOGLE OAUTH
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# FIREBASE
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# EMAIL CONFIGURATION
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# BASE URL (Optional, for email links)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### ✅ Install Dependencies
```bash
npm install
```

### ✅ Build Verification
```bash
npm run build
```

### ✅ Type Checking
```bash
npx tsc --noEmit
```

### ✅ Linting
```bash
npm run lint
```

## Deployment Instructions

### Option 1: Deploy to Vercel

1. **Connect Repository**
   - Sign in to [Vercel](https://vercel.com)
   - Import your repository

2. **Configure Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.example`
   - Make sure Production, Preview, and Development have the correct values

3. **Deploy**
   - Vercel will automatically deploy when you push to your main branch
   - View deployments at: `https://<project-name>.vercel.app`

4. **Custom Domain (Optional)**
   - In Vercel Settings > Domains
   - Add your custom domain
   - Follow DNS configuration steps

### Option 2: Deploy to Netlify

1. **Connect Repository**
   - Sign in to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Select your repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 16 (or higher)

3. **Configure Environment Variables**
   - Go to Site settings > Build & deploy > Environment
   - Add all variables from `.env.example`

4. **Deploy**
   - Netlify will automatically deploy on push
   - View site at: `https://<site-name>.netlify.app`

5. **Custom Domain (Optional)**
   - In Netlify Settings > Domain management
   - Add your domain and follow DNS setup

### Option 3: Deploy to Other Platforms

#### Self-Hosted (Ubuntu/Debian VPS)
```bash
# 1. SSH into your server
ssh user@your-server.com

# 2. Clone repository
git clone <repository-url>
cd web

# 3. Install dependencies
npm install

# 4. Create .env.local with your variables
nano .env.local

# 5. Build the project
npm run build

# 6. Start with PM2 (process manager)
npm install -g pm2
pm2 start "npm start" --name "hm-nexora"
pm2 save
pm2 startup

# 7. Configure Nginx as reverse proxy
sudo nano /etc/nginx/sites-available/default
# Add:
# server {
#     listen 80;
#     server_name your-domain.com;
#     location / {
#         proxy_pass http://localhost:3000;
#     }
# }

sudo nginx -t
sudo systemctl restart nginx
```

#### Docker Deployment
```bash
# 1. Create Dockerfile
# Build: docker build -t hm-nexora .
# Run: docker run -p 3000:3000 --env-file .env.local hm-nexora
```

## Post-Deployment

### ✅ Testing
- [ ] Check homepage loads correctly
- [ ] Test user authentication (login/register)
- [ ] Verify email sending functionality
- [ ] Test file uploads
- [ ] Check database connectivity
- [ ] Verify API endpoints
- [ ] Test responsive design on mobile

### ✅ Monitoring
- Enable error tracking (Vercel/Netlify native or Sentry)
- Set up uptime monitoring
- Configure analytics (Google Analytics, etc.)
- Monitor database performance
- Check API rate limits

### ✅ Performance
- Enable caching headers
- Compress images in `/public`
- Minimize bundle size
- Use CDN for static assets
- Monitor Core Web Vitals

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading
- Verify `.env.local` file is not in `.gitignore` for local testing
- For deployed version, ensure all variables are set in platform dashboard
- Prefix with `NEXT_PUBLIC_` for client-side variables only

### Database Connection Issues
- Verify connection strings in environment variables
- Check IP whitelist if using managed database
- Ensure services are running and accessible

### Email Not Sending
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- Enable "Less secure apps" or use App Password for Gmail
- Check email logs in admin dashboard
- Verify SMTP settings if not using Gmail

## Production Optimizations

1. **Enable Image Optimization**
   - Keep `images: { unoptimized: true }` only if necessary
   - Use Next.js Image component for better performance

2. **Database Optimization**
   - Add indexes to frequently queried fields
   - Archive old logs and analytics data
   - Regular backups

3. **Security**
   - Enable HTTPS (automatic on Vercel/Netlify)
   - Set secure headers
   - Validate all user inputs
   - Keep dependencies updated

4. **Monitoring**
   - Set up error tracking
   - Monitor error logs daily
   - Check performance metrics weekly

## Support & Resources

- Next.js Documentation: https://nextjs.org/docs
- Vercel Deployment: https://vercel.com/docs
- Netlify Deployment: https://docs.netlify.com
- TypeScript Guide: https://www.typescriptlang.org/docs

## Version History

### v1.0.0 (Initial Release)
- Rebranded to HM nexora
- Fixed TypeScript compilation errors
- Comprehensive deployment setup
- Environment variable configuration
