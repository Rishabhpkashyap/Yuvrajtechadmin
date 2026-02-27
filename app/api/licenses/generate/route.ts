import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyFirebaseToken } from '@/lib/auth-middleware'

// Generate license key in format: NAME-DDMM-RAND
function generateLicenseKey(name: string, date?: Date): string {
  // Extract first 4 letters from name (uppercase, remove spaces)
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase()
  const namePart = cleanName.substring(0, 4).padEnd(4, 'X')
  
  // Use provided date or current date for DDMM format
  const targetDate = date || new Date()
  const day = targetDate.getDate().toString().padStart(2, '0')
  const month = (targetDate.getMonth() + 1).toString().padStart(2, '0')
  const datePart = day + month
  
  // Generate secure random 4-character alphanumeric string
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let randomPart = ''
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return `${namePart}-${datePart}-${randomPart}`
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const uid = await verifyFirebaseToken(request)
    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const requestBody = await request.json()
    console.log('Generate license request:', requestBody)
    
    const { name, contact, remark, status = 'active', customDate } = requestBody

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      )
    }

    const date = customDate ? new Date(customDate) : undefined
    const licenseKey = generateLicenseKey(name, date)
    
    const currentDate = date || new Date()
    const currentTimestamp = new Date().toISOString()
    
    // Main license object for licenses collection
    const licenseObject = {
      name: name.trim(),
      date: `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`,
      randomPart: licenseKey.split('-')[2],
      fullKey: licenseKey,
      status,
      createdAt: currentTimestamp,
      remark: remark ? `${remark}${contact ? ` | Contact: ${contact}` : ''}` : (contact ? `Contact: ${contact}` : '')
    }

    // Extension access object (for public extension validation)
    const extensionAccessObject = {
      name: name.trim(),
      date: `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`,
      randomPart: licenseKey.split('-')[2],
      fullKey: licenseKey,
      status,
      createdAt: currentTimestamp,
      lastModified: currentTimestamp,
      lastUsed: null,
      fingerprint: null,
      deviceInfo: null,
      remark: remark ? `${remark}${contact ? ` | Contact: ${contact}` : ''}` : (contact ? `Contact: ${contact}` : '')
    }

    // Save to Firebase using Admin SDK
    console.log('Saving license to Firebase:', licenseKey, licenseObject)
    
    // Save to main licenses collection (for admin panel)
    const licenseRef = adminDb.ref(`licenses/${licenseKey}`)
    await licenseRef.set(licenseObject)
    
    // Save to extension_access collection (for extension validation)
    const extensionRef = adminDb.ref(`extension_access/${licenseKey}`)
    await extensionRef.set(extensionAccessObject)
    
    console.log('License saved successfully to Firebase')

    return NextResponse.json({
      success: true,
      message: 'License generated successfully',
      licenseKey,
      licenseObject
    })

  } catch (error) {
    console.error('Error generating license:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: `Failed to generate license: ${errorMessage}` },
      { status: 500 }
    )
  }
}