# Quick Start Guide - Yuvraj Tech Admin Panel

Get your admin panel up and running in 5 minutes!

## 🎯 Prerequisites

Before you begin, make sure you have:
- Git installed ([Download Git](https://git-scm.com/downloads))
- Node.js 18+ installed ([Download Node.js](https://nodejs.org/))
- A GitHub account
- A Firebase account

## 🚀 Step 1: Upload to GitHub

### Windows Users:
1. Open Command Prompt or PowerShell in the project folder
2. Run the setup script:
   ```cmd
   git-setup.bat
   ```

### Mac/Linux Users:
1. Open Terminal in the project folder
2. Make the script executable and run it:
   ```bash
   chmod +x git-setup.sh
   ./git-setup.sh
   ```

### Manual Method (if scripts don't work):
```bash
# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Yuvraj Tech Admin Panel"

# Rename branch to main
git branch -M main

# Add remote origin
git remote add origin https://github.com/Rishabhpkashyap/TraderNidhi.git

# Push to GitHub
git push -u origin main
```

## 🔥 Step 2: Set Up Firebase

1. **Create Firebase Project**:
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Name it "TraderNidhi" or similar
   - Disable Google Analytics (optional)
   - Click "Create project"

2. **Enable Realtime Database**:
   - In Firebase Console, go to "Build" > "Realtime Database"
   - Click "Create Database"
   - Choose location (closest to your users)
   - Start in "Test mode" (we'll secure it later)
   - Click "Enable"

3. **Enable Authentication**:
   - Go to "Build" > "Authentication"
   - Click "Get started"
   - Click "Email/Password"
   - Enable it and click "Save"

4. **Get Firebase Config**:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click the web icon (</>)
   - Register app with nickname "TraderNidhi Admin"
   - Copy the config values

5. **Get Admin SDK Credentials**:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Keep it safe (don't commit to Git!)

## ⚙️ Step 3: Configure Environment

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** and fill in:
   - Firebase config from Step 2.4
   - Admin SDK credentials from Step 2.5
   - Generate JWT_SECRET:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Set ADMIN_USERNAME and ADMIN_PASSWORD

## 🔐 Step 4: Create Admin User

1. **Go to Firebase Console** > Authentication > Users
2. Click "Add user"
3. Enter email and password (same as in .env)
4. Click "Add user"

## 🔒 Step 5: Secure Database

1. **Go to Realtime Database** > Rules
2. Replace with:
   ```json
   {
     "rules": {
       "licenses": {
         ".read": "auth != null",
         ".write": "auth != null"
       }
     }
   }
   ```
3. Click "Publish"

## 💻 Step 6: Run Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   - Go to http://localhost:3000
   - Login with your admin credentials
   - Start managing licenses!

## 🌐 Step 7: Deploy to Vercel (Optional)

1. **Go to** https://vercel.com
2. **Sign in** with GitHub
3. **Import** your TraderNidhi repository
4. **Add environment variables** from your `.env` file
5. **Deploy**!

Your admin panel will be live at `https://your-project.vercel.app`

## ✅ Verification Checklist

After setup, verify:
- [ ] Can access login page
- [ ] Can login with admin credentials
- [ ] Dashboard shows statistics
- [ ] Can create new license
- [ ] License appears in list
- [ ] Can edit license
- [ ] Can delete license
- [ ] PWA install prompt appears (on mobile)

## 🆘 Common Issues

### "Git is not recognized"
- Install Git from https://git-scm.com/downloads
- Restart your terminal after installation

### "Node is not recognized"
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### "Firebase connection failed"
- Check your Firebase credentials in `.env`
- Verify database URL is correct
- Ensure database rules allow authenticated access

### "Login not working"
- Verify admin user exists in Firebase Authentication
- Check ADMIN_USERNAME and ADMIN_PASSWORD in `.env`
- Ensure JWT_SECRET is set

### "Module not found"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

## 📚 Next Steps

Now that your admin panel is running:

1. **Customize branding** (if needed)
2. **Add more admin users** in Firebase Authentication
3. **Set up monitoring** (Firebase Analytics, Vercel Analytics)
4. **Configure custom domain** (if using Vercel)
5. **Enable Firebase App Check** for additional security
6. **Set up backups** for your database

## 📖 Documentation

- [Full README](README.md) - Complete project documentation
- [Deployment Guide](DEPLOYMENT.md) - Detailed deployment instructions
- [Environment Variables](.env.example) - All configuration options

## 🎉 You're All Set!

Your Yuvraj Tech Admin Panel is now ready to manage licenses!

For support or questions, open an issue on GitHub.

---

Happy License Managing! 🚀
