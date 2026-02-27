import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyFirebaseToken } from '@/lib/auth-middleware'

export async function PUT(
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
    const updateData = await request.json()

    // Validate status field if provided
    if (updateData.status && !['active', 'suspended', 'revoked'].includes(updateData.status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value. Must be: active, suspended, or revoked' },
        { status: 400 }
      )
    }

    const licenseRef = adminDb.ref(`licenses/${licenseKey}`)
    
    // Check if license exists in main collection
    let snapshot = await licenseRef.once('value')
    
    if (!snapshot.exists()) {
      // ✅ FIXED: Check extension_access if not found in main licenses
      console.log(`License ${licenseKey} not found in main collection, checking extension_access...`)
      const extensionRef = adminDb.ref(`extension_access/${licenseKey}`)
      const extensionSnapshot = await extensionRef.once('value')
      
      if (!extensionSnapshot.exists()) {
        return NextResponse.json(
          { success: false, message: 'License not found' },
          { status: 404 }
        )
      }
      
      // License exists in extension_access, sync it to main collection
      const licenseData = extensionSnapshot.val()
      await licenseRef.set(licenseData)
      console.log(`✅ Synced license ${licenseKey} to main collection`)
      
      // Re-read the snapshot
      snapshot = await licenseRef.once('value')
    }

    const currentTimestamp = new Date().toISOString()
    const updatedData = {
      ...updateData,
      lastModified: currentTimestamp
    }

    // Store original data for potential rollback
    const originalData = snapshot.val()

    try {
      // 1. Update the license in main collection
      await licenseRef.update(updatedData)

      // 2. Update in extension_access collection (check existence first)
      const extensionRef = adminDb.ref(`extension_access/${licenseKey}`)
      const extensionSnapshot = await extensionRef.once('value')
      
      if (extensionSnapshot.exists()) {
        await extensionRef.update(updatedData)
      } else {
        // If doesn't exist, create it with merged data
        await extensionRef.set({
          ...originalData,
          ...updatedData
        })
      }

      // 3. Handle license_validation collection based on fingerprint changes
      const validationRef = adminDb.ref(`license_validation/${licenseKey}`)
      
      if (updateData.fingerprint === null) {
        // Remove validation entry if fingerprint is being cleared (reset operation)
        await validationRef.remove()
      } else if (updateData.fingerprint) {
        // Update or create validation data if fingerprint is being set
        await validationRef.set({
          fingerprint: updateData.fingerprint,
          deviceInfo: updateData.deviceInfo || null,
          lastUsed: currentTimestamp
        })
      } else if (updateData.deviceInfo !== undefined && extensionSnapshot.exists()) {
        // If only deviceInfo is being updated and validation exists
        const validationSnapshot = await validationRef.once('value')
        if (validationSnapshot.exists()) {
          await validationRef.update({
            deviceInfo: updateData.deviceInfo
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: 'License updated successfully'
      })

    } catch (updateError) {
      console.error('Error during multi-collection update:', updateError)
      
      // Attempt to rollback main license update
      try {
        await licenseRef.set(originalData)
        console.log('Rollback successful')
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError)
      }
      
      throw updateError
    }

  } catch (error) {
    console.error('Error updating license:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: `Failed to update license: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const licenseRef = adminDb.ref(`licenses/${licenseKey}`)
    
    // Check if license exists in main collection
    let snapshot = await licenseRef.once('value')
    
    if (!snapshot.exists()) {
      // ✅ FIXED: Check extension_access if not found in main licenses
      console.log(`License ${licenseKey} not found in main collection for deletion, checking extension_access...`)
      const extensionRef = adminDb.ref(`extension_access/${licenseKey}`)
      const extensionSnapshot = await extensionRef.once('value')
      
      if (!extensionSnapshot.exists()) {
        return NextResponse.json(
          { success: false, message: 'License not found' },
          { status: 404 }
        )
      }
      
      // License exists in extension_access, we can proceed with deletion
      console.log(`✅ Found license ${licenseKey} in extension_access, proceeding with deletion`)
    }

    // Delete the license from all collections using atomic multi-path update
    const updates: Record<string, any> = {}
    updates[`licenses/${licenseKey}`] = null
    updates[`extension_access/${licenseKey}`] = null
    updates[`license_validation/${licenseKey}`] = null

    await adminDb.ref().update(updates)

    return NextResponse.json({
      success: true,
      message: 'License deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting license:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: `Failed to delete license: ${errorMessage}` },
      { status: 500 }
    )
  }
}