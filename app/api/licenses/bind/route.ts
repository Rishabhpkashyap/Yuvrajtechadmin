import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { licenseKey, fingerprint, deviceInfo } = await request.json()

    if (!licenseKey || !fingerprint) {
      return NextResponse.json(
        { success: false, message: 'License key and fingerprint are required' },
        { status: 400 }
      )
    }

    // Check if license exists in extension_access
    const extensionRef = adminDb.ref(`extension_access/${licenseKey}`)
    const snapshot = await extensionRef.once('value')
    
    if (!snapshot.exists()) {
      return NextResponse.json(
        { success: false, message: 'License not found' },
        { status: 404 }
      )
    }

    const license = snapshot.val()

    // Check license status
    if (license.status !== 'active') {
      return NextResponse.json(
        { success: false, message: `License is ${license.status}` },
        { status: 403 }
      )
    }

    // Check if license is already bound to a different device
    if (license.fingerprint && license.fingerprint !== fingerprint) {
      return NextResponse.json(
        { success: false, message: 'License already bound to another device' },
        { status: 409 }
      )
    }

    const currentTimestamp = new Date().toISOString()

    try {
      // Use atomic multi-path update for consistency
      const updates: Record<string, any> = {}
      
      // Update extension_access collection
      updates[`extension_access/${licenseKey}/fingerprint`] = fingerprint
      updates[`extension_access/${licenseKey}/deviceInfo`] = deviceInfo || null
      updates[`extension_access/${licenseKey}/lastUsed`] = currentTimestamp
      updates[`extension_access/${licenseKey}/lastModified`] = currentTimestamp
      
      // Update main licenses collection
      updates[`licenses/${licenseKey}/fingerprint`] = fingerprint
      updates[`licenses/${licenseKey}/deviceInfo`] = deviceInfo || null
      updates[`licenses/${licenseKey}/lastUsed`] = currentTimestamp
      updates[`licenses/${licenseKey}/lastModified`] = currentTimestamp
      
      // Update license_validation collection
      updates[`license_validation/${licenseKey}/fingerprint`] = fingerprint
      updates[`license_validation/${licenseKey}/deviceInfo`] = deviceInfo || null
      updates[`license_validation/${licenseKey}/lastUsed`] = currentTimestamp

      // Execute atomic update
      await adminDb.ref().update(updates)

    } catch (updateError) {
      console.error('Error during device binding update:', updateError)
      throw new Error('Failed to bind device - database update failed')
    }

    return NextResponse.json({
      success: true,
      message: 'Device bound successfully',
      license: {
        name: license.name,
        status: license.status,
        fingerprint: fingerprint,
        lastUsed: currentTimestamp
      }
    })

  } catch (error) {
    console.error('Error binding device:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: `Failed to bind device: ${errorMessage}` },
      { status: 500 }
    )
  }
}