// Script to sync missing licenses from extension_access to licenses collection
const admin = require('firebase-admin');

// Initialize Firebase Admin (use your existing config)
if (!admin.apps.length) {
  admin.initializeApp({
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    // Add your service account config here
  });
}

const db = admin.database();

async function syncMissingLicenses() {
  try {
    console.log('🔄 Starting license sync...');
    
    // Get both collections
    const [extensionSnapshot, licensesSnapshot] = await Promise.all([
      db.ref('extension_access').once('value'),
      db.ref('licenses').once('value')
    ]);
    
    const extensionData = extensionSnapshot.val() || {};
    const licensesData = licensesSnapshot.val() || {};
    
    const missingLicenses = [];
    
    // Find licenses that exist in extension_access but not in licenses
    Object.keys(extensionData).forEach(key => {
      if (!licensesData[key]) {
        missingLicenses.push(key);
      }
    });
    
    console.log(`📋 Found ${missingLicenses.length} missing licenses:`, missingLicenses);
    
    // Sync missing licenses
    const updates = {};
    missingLicenses.forEach(key => {
      const extensionLicense = extensionData[key];
      // Copy essential fields to licenses collection
      updates[`licenses/${key}`] = {
        name: extensionLicense.name,
        date: extensionLicense.date,
        randomPart: extensionLicense.randomPart,
        fullKey: extensionLicense.fullKey,
        status: extensionLicense.status,
        createdAt: extensionLicense.createdAt,
        lastModified: extensionLicense.lastModified,
        lastUsed: extensionLicense.lastUsed,
        fingerprint: extensionLicense.fingerprint || null,
        deviceInfo: extensionLicense.deviceInfo || null,
        remark: extensionLicense.remark || '',
        // Copy additional fields if they exist
        ...(extensionLicense.address && { address: extensionLicense.address }),
        ...(extensionLicense.balance && { balance: extensionLicense.balance }),
        ...(extensionLicense.expiry && { expiry: extensionLicense.expiry })
      };
    });
    
    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      console.log('✅ Successfully synced missing licenses!');
    } else {
      console.log('✅ All licenses are already in sync!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing licenses:', error);
    process.exit(1);
  }
}

syncMissingLicenses();