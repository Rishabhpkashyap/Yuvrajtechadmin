import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { licenseKey, fingerprint, deviceInfo, autoBindDevice } = await request.json()

    if (!licenseKey) {
      return NextResponse.json(
        { success: false, message: 'License key is required' },
        { status: 400 }
      )
    }

    // Check license in extension_access (public read access)
    const extensionRef = adminDb.ref(`extension_access/${licenseKey}`)
    const snapshot = await extensionRef.once('value')
    
    if (!snapshot.exists()) {
      return NextResponse.json(
        { success: false, message: 'License not found' },
        { status: 404 }
      )
    }

    const license = snapshot.val()

    // Validate license structure
    if (!license.fullKey || license.fullKey !== licenseKey) {
      return NextResponse.json(
        { success: false, message: 'Invalid license data' },
        { status: 400 }
      )
    }

    // Check license status
    if (license.status !== 'active') {
      return NextResponse.json(
        { success: false, message: `License is ${license.status}` },
        { status: 403 }
      )
    }

    const currentTimestamp = new Date().toISOString()

    // Check device binding
    if (!license.fingerprint) {
      // Check if automatic device binding is requested
      if (autoBindDevice && fingerprint) {
        // Automatically bind the device using atomic update
        try {
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
          
          // Create entry in license_validation collection
          updates[`license_validation/${licenseKey}/fingerprint`] = fingerprint
          updates[`license_validation/${licenseKey}/deviceInfo`] = deviceInfo || null
          updates[`license_validation/${licenseKey}/lastUsed`] = currentTimestamp

          // Execute atomic update
          await adminDb.ref().update(updates)
          
          return NextResponse.json({
            success: true,
            needsBinding: false,
            autoBindSuccess: true,
            message: 'Device automatically bound to license',
            license: {
              name: license.name,
              status: license.status,
              fingerprint: fingerprint,
              lastUsed: currentTimestamp
            }
          })
        } catch (bindError) {
          console.error('Auto-binding failed:', bindError)
          // Fall back to manual binding
          return NextResponse.json({
            success: true,
            needsBinding: true,
            message: 'License needs device binding'
          })
        }
      } else {
        return NextResponse.json({
          success: true,
          needsBinding: true,
          message: 'License needs device binding'
        })
      }
    }

    if (fingerprint && license.fingerprint !== fingerprint) {
      return NextResponse.json(
        { success: false, message: 'License bound to different device' },
        { status: 409 }
      )
    }

    // Update last used timestamp for valid access
    if (fingerprint === license.fingerprint) {
      try {
        // Use atomic multi-path update
        const updates: Record<string, any> = {}
        updates[`extension_access/${licenseKey}/lastUsed`] = currentTimestamp
        updates[`licenses/${licenseKey}/lastUsed`] = currentTimestamp
        updates[`license_validation/${licenseKey}/lastUsed`] = currentTimestamp
        
        // Update deviceInfo if provided
        if (deviceInfo) {
          updates[`extension_access/${licenseKey}/deviceInfo`] = deviceInfo
          updates[`licenses/${licenseKey}/deviceInfo`] = deviceInfo
          updates[`license_validation/${licenseKey}/deviceInfo`] = deviceInfo
        }

        await adminDb.ref().update(updates)
      } catch (updateError) {
        console.error('Error updating last used timestamp:', updateError)
        // Don't fail validation if timestamp update fails
      }
    }

    return NextResponse.json({
      success: true,
      needsBinding: false,
      license: {
        name: license.name,
        status: license.status,
        fingerprint: license.fingerprint,
        lastUsed: license.lastUsed || currentTimestamp
      }
    })

  } catch (error) {
    console.error('Error validating license:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: `Validation failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}