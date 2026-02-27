import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyFirebaseToken } from '@/lib/auth-middleware'

export async function POST(
  request: NextRequest,
  { params }: { params: { licenseKey: string } }
) {
  try {
    // Verify authentication
    const uid = await verifyFirebaseToken(request)
    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const licenseKey = params.licenseKey

    // Check if license exists
    const licenseRef = adminDb.ref(`licenses/${licenseKey}`)
    const snapshot = await licenseRef.once('value')
    
    if (!snapshot.exists()) {
      return NextResponse.json(
        { success: false, message: 'License not found' },
        { status: 404 }
      )
    }

    const currentTimestamp = new Date().toISOString()

    // Perform atomic multi-path update across all three collections
    // This ensures all-or-nothing update (transaction-like behavior)
    const updates: Record<string, any> = {}
    
    // Update licenses collection
    updates[`licenses/${licenseKey}/fingerprint`] = null
    updates[`licenses/${licenseKey}/deviceInfo`] = null
    updates[`licenses/${licenseKey}/lastModified`] = currentTimestamp
    
    // Update extension_access collection
    updates[`extension_access/${licenseKey}/fingerprint`] = null
    updates[`extension_access/${licenseKey}/deviceInfo`] = null
    updates[`extension_access/${licenseKey}/lastModified`] = currentTimestamp
    
    // Remove license_validation entry (setting to null removes the path)
    updates[`license_validation/${licenseKey}`] = null

    // Execute atomic update
    await adminDb.ref().update(updates)

    console.log(`Device binding reset successfully for license: ${licenseKey}`)

    return NextResponse.json({
      success: true,
      message: 'Device binding reset successfully'
    })

  } catch (error) {
    console.error('Error resetting device binding:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: `Failed to reset device binding: ${errorMessage}` },
      { status: 500 }
    )
  }
}
