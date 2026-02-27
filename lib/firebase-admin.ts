import admin from 'firebase-admin'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        let serviceAccount = null

        // Try individual environment variables first (most reliable)
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            console.log('Using individual Firebase environment variables')
            serviceAccount = {
                type: 'service_account',
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: 'https://accounts.google.com/o/oauth2/auth',
                token_uri: 'https://oauth2.googleapis.com/token',
                auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
                client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
                universe_domain: 'googleapis.com'
            }
        }
        // Try Base64 encoded service account
        else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
            try {
                console.log('Using Base64 encoded service account key')
                const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf8')
                serviceAccount = JSON.parse(serviceAccountJson)
            } catch (base64Error) {
                console.error('Failed to decode Base64 service account:', base64Error)
            }
        }
        // Fallback to direct JSON service account
        else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            try {
                console.log('Using direct JSON service account key')
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
            } catch (jsonError) {
                console.error('Failed to parse JSON service account:', jsonError)
            }
        }

        // Initialize with service account if available
        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL,
            })
            console.log('Firebase Admin initialized with service account successfully')
        } else {
            // For development or fallback, initialize with database URL only
            console.warn('No valid Firebase service account found, initializing with database URL only')
            admin.initializeApp({
                databaseURL: process.env.FIREBASE_DATABASE_URL,
            })
        }
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error)
        // Initialize a minimal app to prevent crashes
        try {
            admin.initializeApp({
                databaseURL: process.env.FIREBASE_DATABASE_URL,
            })
        } catch (fallbackError) {
            console.error('Fallback Firebase initialization also failed:', fallbackError)
        }
    }
}

export const adminDb = admin.database()

// Export auth only if available
export const adminAuth = (() => {
    try {
        return admin.auth()
    } catch (error) {
        console.warn('Firebase Auth not available:', (error as Error).message)
        return null
    }
})()