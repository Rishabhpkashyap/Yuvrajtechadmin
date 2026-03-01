import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title: 'Yuvraj Tech - Admin Panel',
  description: 'Professional license management system for Yuvraj Tech',
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TN Admin',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Yuvraj Tech Admin Panel',
    title: 'Yuvraj Tech - Admin Panel',
    description: 'Professional license management system for Yuvraj Tech',
  },
  twitter: {
    card: 'summary',
    title: 'Yuvraj Tech - Admin Panel',
    description: 'Professional license management system for Yuvraj Tech',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="TN Admin" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TN Admin" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.svg" />
        
        {/* Splash Screens */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-inter">
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.95) 0%, rgba(10, 10, 10, 0.95) 100%)',
                color: '#E1E1E1',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(14, 165, 233, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#0ea5e9',
                  secondary: '#0c1220',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#0c1220',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}