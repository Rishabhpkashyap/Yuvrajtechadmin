# Trader Nidhi Admin Panel

A professional, mobile-first admin panel for Trader Nidhi license management built with Next.js, TypeScript, and Firebase.

## ✨ Features

- 🔐 Secure admin authentication with Firebase
- 📊 Real-time license management dashboard
- 📱 Mobile-first responsive design
- 🎨 Dark minimal UI theme
- 🔥 Firebase Realtime Database integration
- 📴 Offline functionality with PWA support
- 🎯 TypeScript for type safety
- ⚡ Fast and optimized performance
- 🔄 Real-time license status updates
- 📈 License analytics and statistics

## 🛠️ Tech Stack

- **Framework**: Next.js 13.5.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth + Custom JWT
- **UI Icons**: Lucide React
- **PWA**: Progressive Web App support
- **Deployment**: Vercel-ready

## 📱 Mobile-First Design

This admin panel is specifically designed for mobile devices with:
- Bottom navigation for easy thumb access
- Slim, compact license cards
- Touch-optimized buttons and interactions
- Responsive layouts that work on all screen sizes
- Dark theme optimized for OLED displays

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Realtime Database

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Rishabhpkashyap/TraderNidhi.git
cd TraderNidhi
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

4. **Configure your `.env` file:**

Open `.env` and fill in your Firebase credentials and other settings. See `.env.example` for detailed instructions.

Key variables to configure:
- Firebase Client Config (NEXT_PUBLIC_FIREBASE_*)
- Firebase Admin SDK Config (FIREBASE_*)
- JWT_SECRET (generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- ADMIN_USERNAME and ADMIN_PASSWORD

5. **Set up Firebase:**
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Realtime Database
   - Enable Email/Password authentication
   - Download service account key from Project Settings > Service Accounts
   - Set database rules (see `.env.example` for rules)

6. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
├── app/                      # Next.js 13 app directory
│   ├── api/                 # API routes
│   │   └── licenses/        # License management endpoints
│   ├── dashboard/           # Dashboard pages
│   │   ├── licenses/        # License list and management
│   │   └── page.tsx         # Dashboard home
│   ├── login/              # Authentication page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/             # Reusable React components
│   ├── BackgroundParticles.tsx
│   ├── GlassContainer.tsx
│   ├── OfflineIndicator.tsx
│   ├── ProtectedRoute.tsx
│   └── PWAInstallPrompt.tsx
├── lib/                    # Utility libraries
│   ├── api-client.ts       # API client utilities
│   ├── auth-context.tsx    # Authentication context
│   ├── auth-middleware.ts  # Auth middleware
│   ├── firebase-admin.ts   # Firebase Admin SDK
│   └── firebase-client.ts  # Firebase Client SDK
├── public/                 # Static assets
│   ├── icons/             # PWA icons
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service worker
├── scripts/               # Utility scripts
│   ├── generate-pwa-icons.js
│   ├── setup-firebase-users.js
│   └── sync-licenses.js
└── ...
```

## 🎯 Key Features

### License Management
- Create new licenses with customer details
- View all licenses with search and filters
- Edit license information
- Delete licenses
- Reset device bindings
- Real-time status updates

### Dashboard
- Overview statistics (Total, Active, Bound, Free licenses)
- Recent licenses list
- Quick actions for common tasks

### Mobile Navigation
- Bottom navigation bar with 3 main sections:
  - Home: Dashboard overview
  - New: Generate new license
  - Licenses: View and manage all licenses

### Security
- Firebase Authentication
- JWT token-based sessions
- Protected API routes
- Secure environment variables
- Admin-only access

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Configure environment variables in Vercel dashboard
5. Deploy

### Environment Variables in Vercel

Add all variables from your `.env` file to Vercel:
- Go to Project Settings > Environment Variables
- Add each variable from `.env.example`
- Deploy

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 🔐 Environment Variables

See `.env.example` for a complete list of required environment variables with detailed setup instructions.

Key variables:
- `NEXT_PUBLIC_FIREBASE_*` - Firebase client configuration
- `FIREBASE_*` - Firebase Admin SDK credentials
- `JWT_SECRET` - Secret key for JWT tokens
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD` - Admin login password
- `NODE_ENV` - Environment mode (development/production)

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore` by default
2. **Use strong passwords** - For admin accounts
3. **Rotate JWT secrets** - Regularly update JWT_SECRET
4. **Enable Firebase security rules** - Restrict database access
5. **Use HTTPS** - Always use secure connections in production
6. **Keep dependencies updated** - Run `npm audit` regularly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

**Rishabh P Kashyap**
- GitHub: [@Rishabhpkashyap](https://github.com/Rishabhpkashyap)

## 📞 Support

For support, please contact the development team or open an issue in the repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for backend services
- Tailwind CSS for styling utilities
- Lucide for beautiful icons

---

Made with ❤️ for Trader Nidhi
