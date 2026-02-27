const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin using environment variables
if (!admin.apps.length) {
  try {
    // Use environment variables for Firebase configuration
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    process.exit(1);
  }
}

async function createAdminUser() {
  try {
    const userRecord = await admin.auth().createUser({
      email: 'admin@quotex-coder.com',
      password: 'admin123',
      displayName: 'Admin User',
      emailVerified: true,
    });

    console.log('Successfully created admin user:', userRecord.uid);
    console.log('Email: admin@quotex-coder.com');
    console.log('Password: admin123');
    
    // Set custom claims for admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log('Admin claims set successfully');
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('Admin user already exists');
    } else {
      console.error('Error creating admin user:', error);
    }
  }
}

createAdminUser().then(() => {
  console.log('Setup complete');
  process.exit(0);
}).catch(console.error);