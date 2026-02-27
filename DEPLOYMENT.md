# Deployment Guide - Trader Nidhi Admin Panel

This guide will help you deploy the Trader Nidhi Admin Panel to production.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Firebase project set up with Realtime Database
- [ ] Firebase Authentication enabled (Email/Password)
- [ ] Service account key downloaded from Firebase
- [ ] All environment variables configured
- [ ] Admin user created in Firebase Authentication
- [ ] Database security rules configured
- [ ] Code tested locally
- [ ] `.env` file NOT committed to Git

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest and fastest way to deploy Next.js applications.

#### Steps:

1. **Push code to GitHub** (if not already done):
   ```bash
   # Run the setup script
   ./git-setup.bat  # Windows
   # or
   ./git-setup.sh   # Linux/Mac
   ```

2. **Sign up/Login to Vercel**:
   - Go to https://vercel.com
   - Sign up with your GitHub account

3. **Import Project**:
   - Click "Add New Project"
   - Select your GitHub repository: `TraderNidhi`
   - Click "Import"

4. **Configure Environment Variables**:
   - In the project settings, go to "Environment Variables"
   - Add all variables from your `.env` file:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=...
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
     NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
     NEXT_PUBLIC_FIREBASE_APP_ID=...
     FIREBASE_DATABASE_URL=...
     FIREBASE_PROJECT_ID=...
     FIREBASE_PRIVATE_KEY_ID=...
     FIREBASE_PRIVATE_KEY=...
     FIREBASE_CLIENT_EMAIL=...
     FIREBASE_CLIENT_ID=...
     JWT_SECRET=...
     ADMIN_USERNAME=...
     ADMIN_PASSWORD=...
     NODE_ENV=production
     ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-project.vercel.app`

6. **Custom Domain (Optional)**:
   - Go to Project Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

#### Vercel Configuration File

The project includes `vercel.json` for optimal configuration:
```json
{
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["bom1"]
}
```

### Option 2: Manual Deployment (VPS/Cloud Server)

For deploying to your own server (DigitalOcean, AWS, etc.):

#### Prerequisites:
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx or Apache for reverse proxy
- SSL certificate (Let's Encrypt recommended)

#### Steps:

1. **Clone repository on server**:
   ```bash
   git clone https://github.com/Rishabhpkashyap/TraderNidhi.git
   cd TraderNidhi
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file**:
   ```bash
   nano .env
   # Copy contents from .env.example and fill in values
   ```

4. **Build the application**:
   ```bash
   npm run build
   ```

5. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

6. **Start application with PM2**:
   ```bash
   pm2 start npm --name "tradernidhi" -- start
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx** (example):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

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

8. **Set up SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

### Option 3: Docker Deployment

#### Create Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Build and run:
```bash
docker build -t tradernidhi-admin .
docker run -p 3000:3000 --env-file .env tradernidhi-admin
```

## 🔐 Security Considerations

### Production Environment Variables

1. **Generate Strong Secrets**:
   ```bash
   # Generate JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use Strong Admin Password**:
   - Minimum 12 characters
   - Include uppercase, lowercase, numbers, and special characters
   - Don't use common passwords

3. **Firebase Security Rules**:
   ```json
   {
     "rules": {
       "licenses": {
         ".read": "auth != null",
         ".write": "auth != null",
         "$licenseId": {
           ".validate": "newData.hasChildren(['name', 'status', 'createdAt'])"
         }
       }
     }
   }
   ```

4. **Enable Firebase App Check** (Recommended):
   - Go to Firebase Console > App Check
   - Register your app
   - Add App Check SDK to your app

### HTTPS Configuration

Always use HTTPS in production:
- Vercel provides HTTPS automatically
- For manual deployment, use Let's Encrypt
- Redirect HTTP to HTTPS

### Environment Variables Security

- Never commit `.env` to Git
- Use different credentials for production
- Rotate secrets regularly
- Use environment variable management tools (Vercel, AWS Secrets Manager, etc.)

## 📊 Post-Deployment

### 1. Verify Deployment

- [ ] Visit your deployed URL
- [ ] Test login functionality
- [ ] Create a test license
- [ ] Verify database updates
- [ ] Test on mobile devices
- [ ] Check PWA installation
- [ ] Test offline functionality

### 2. Monitor Application

Set up monitoring:
- Vercel Analytics (if using Vercel)
- Firebase Performance Monitoring
- Error tracking (Sentry, LogRocket, etc.)
- Uptime monitoring (UptimeRobot, Pingdom)

### 3. Set Up Backups

- Enable Firebase automatic backups
- Export database regularly
- Keep backup of environment variables

### 4. Performance Optimization

- Enable Vercel Edge Network
- Configure caching headers
- Optimize images
- Enable compression

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🆘 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check all environment variables are set
   - Verify Node.js version (18+)
   - Clear `.next` folder and rebuild

2. **Firebase Connection Issues**:
   - Verify Firebase credentials
   - Check database URL
   - Ensure database rules allow access

3. **Authentication Not Working**:
   - Verify JWT_SECRET is set
   - Check Firebase Auth is enabled
   - Verify admin user exists

4. **PWA Not Installing**:
   - Check manifest.json is accessible
   - Verify service worker is registered
   - Ensure HTTPS is enabled

## 📞 Support

If you encounter issues:
1. Check the logs (Vercel logs or server logs)
2. Review Firebase console for errors
3. Check browser console for client-side errors
4. Open an issue on GitHub

## 🎉 Success!

Once deployed, your Trader Nidhi Admin Panel will be accessible to manage licenses from anywhere!

Remember to:
- Keep dependencies updated
- Monitor for security vulnerabilities
- Backup data regularly
- Review logs periodically

---

Happy Deploying! 🚀
