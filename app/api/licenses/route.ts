import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyFirebaseToken } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const uid = await verifyFirebaseToken(request)
    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Fetching licenses using Firebase Admin SDK')

    // Fetch from all three collections to get complete data
    const [licensesSnapshot, extensionSnapshot, validationSnapshot] = await Promise.all([
      adminDb.ref('licenses').once('value'),
      adminDb.ref('extension_access').once('value'),
      adminDb.ref('license_validation').once('value')
    ])

    const licenses = licensesSnapshot.val() || {}
    const extensionAccess = extensionSnapshot.val() || {}
    const licenseValidation = validationSnapshot.val() || {}

    // Merge data from all collections to get complete license information
    const mergedLicenses: Record<string, any> = {}
    
    // Start with main licenses collection
    Object.keys(licenses).forEach(key => {
      mergedLicenses[key] = { ...licenses[key] }
    })

    // Merge extension_access data (device binding info)
    Object.keys(extensionAccess).forEach(key => {
      if (mergedLicenses[key]) {
        mergedLicenses[key] = {
          ...mergedLicenses[key],
          ...extensionAccess[key],
          // Prefer extension_access for device-related fields
          fingerprint: extensionAccess[key].fingerprint || mergedLicenses[key].fingerprint,
          deviceInfo: extensionAccess[key].deviceInfo || mergedLicenses[key].deviceInfo,
          lastUsed: extensionAccess[key].lastUsed || mergedLicenses[key].lastUsed,
          lastModified: extensionAccess[key].lastModified || mergedLicenses[key].lastModified
        }
      } else {
        // License exists in extension_access but not in main licenses
        mergedLicenses[key] = extensionAccess[key]
      }
    })

    // Add validation data if available
    Object.keys(licenseValidation).forEach(key => {
      if (mergedLicenses[key]) {
        mergedLicenses[key].validationData = licenseValidation[key]
      }
    })

    console.log('Licenses fetched successfully:', Object.keys(mergedLicenses).length, 'licenses')

    const responseData = {
      success: true,
      licenses: mergedLicenses
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error fetching licenses:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: `Failed to fetch licenses: ${errorMessage}` },
      { status: 500 }
    )
  }
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

    const licenseData = await request.json()
    const { licenseKey, ...license } = licenseData

    const licenseRef = adminDb.ref(`licenses/${licenseKey}`)
    await licenseRef.set({
      ...license,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'License created successfully',
      licenseKey
    })

  } catch (error) {
    console.error('Error creating license:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: `Failed to create license: ${errorMessage}` },
      { status: 500 }
    )
  }
}