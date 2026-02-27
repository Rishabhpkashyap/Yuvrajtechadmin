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

    console.log('Fetching license analytics using Firebase Admin SDK')

    // Fetch from all three collections
    const [licensesSnapshot, extensionSnapshot, validationSnapshot] = await Promise.all([
      adminDb.ref('licenses').once('value'),
      adminDb.ref('extension_access').once('value'),
      adminDb.ref('license_validation').once('value')
    ])

    const licenses = licensesSnapshot.val() || {}
    const extensionAccess = extensionSnapshot.val() || {}
    const licenseValidation = validationSnapshot.val() || {}

    // Merge data for complete analytics
    const mergedLicenses: Record<string, any> = {}
    
    Object.keys(licenses).forEach(key => {
      mergedLicenses[key] = { ...licenses[key] }
    })

    Object.keys(extensionAccess).forEach(key => {
      if (mergedLicenses[key]) {
        mergedLicenses[key] = {
          ...mergedLicenses[key],
          ...extensionAccess[key],
          fingerprint: extensionAccess[key].fingerprint || mergedLicenses[key].fingerprint,
          deviceInfo: extensionAccess[key].deviceInfo || mergedLicenses[key].deviceInfo,
          lastUsed: extensionAccess[key].lastUsed || mergedLicenses[key].lastUsed,
          lastModified: extensionAccess[key].lastModified || mergedLicenses[key].lastModified
        }
      } else {
        mergedLicenses[key] = extensionAccess[key]
      }
    })

    const licenseArray = Object.values(mergedLicenses)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Basic statistics
    const totalLicenses = licenseArray.length
    const activeLicenses = licenseArray.filter(l => l.status === 'active').length
    const suspendedLicenses = licenseArray.filter(l => l.status === 'suspended').length
    const revokedLicenses = licenseArray.filter(l => l.status === 'revoked').length
    const boundLicenses = licenseArray.filter(l => l.fingerprint).length
    const unboundLicenses = totalLicenses - boundLicenses

    // Usage analytics
    const licensesUsedLast7Days = licenseArray.filter(l => 
      l.lastUsed && new Date(l.lastUsed) >= sevenDaysAgo
    ).length

    const licensesUsedLast30Days = licenseArray.filter(l => 
      l.lastUsed && new Date(l.lastUsed) >= thirtyDaysAgo
    ).length

    const neverUsedLicenses = licenseArray.filter(l => !l.lastUsed).length

    // Device platform analytics
    const devicePlatforms: Record<string, number> = {}
    licenseArray.forEach(license => {
      if (license.deviceInfo) {
        try {
          const deviceData = JSON.parse(license.deviceInfo)
          const platform = deviceData.platform || 'Unknown'
          devicePlatforms[platform] = (devicePlatforms[platform] || 0) + 1
        } catch {
          devicePlatforms['Unknown'] = (devicePlatforms['Unknown'] || 0) + 1
        }
      }
    })

    // Recent activity (last 10 license activities)
    const recentActivity = licenseArray
      .filter(l => l.lastUsed)
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, 10)
      .map(l => ({
        licenseKey: l.fullKey,
        name: l.name,
        lastUsed: l.lastUsed,
        platform: l.deviceInfo ? (() => {
          try {
            return JSON.parse(l.deviceInfo).platform || 'Unknown'
          } catch {
            return 'Unknown'
          }
        })() : null
      }))

    // License creation trends (last 30 days)
    const creationTrend: Record<string, number> = {}
    licenseArray.forEach(license => {
      if (license.createdAt) {
        const createdDate = new Date(license.createdAt)
        if (createdDate >= thirtyDaysAgo) {
          const dateKey = createdDate.toISOString().split('T')[0]
          creationTrend[dateKey] = (creationTrend[dateKey] || 0) + 1
        }
      }
    })

    // Usage trend (last 30 days)
    const usageTrend: Record<string, number> = {}
    licenseArray.forEach(license => {
      if (license.lastUsed) {
        const usedDate = new Date(license.lastUsed)
        if (usedDate >= thirtyDaysAgo) {
          const dateKey = usedDate.toISOString().split('T')[0]
          usageTrend[dateKey] = (usageTrend[dateKey] || 0) + 1
        }
      }
    })

    const analytics = {
      overview: {
        totalLicenses,
        activeLicenses,
        suspendedLicenses,
        revokedLicenses,
        boundLicenses,
        unboundLicenses,
        bindingRate: totalLicenses > 0 ? Math.round((boundLicenses / totalLicenses) * 100) : 0
      },
      usage: {
        licensesUsedLast7Days,
        licensesUsedLast30Days,
        neverUsedLicenses,
        usageRate7Days: activeLicenses > 0 ? Math.round((licensesUsedLast7Days / activeLicenses) * 100) : 0,
        usageRate30Days: activeLicenses > 0 ? Math.round((licensesUsedLast30Days / activeLicenses) * 100) : 0
      },
      platforms: devicePlatforms,
      recentActivity,
      trends: {
        creation: creationTrend,
        usage: usageTrend
      },
      collections: {
        licensesCount: Object.keys(licenses).length,
        extensionAccessCount: Object.keys(extensionAccess).length,
        validationCount: Object.keys(licenseValidation).length
      }
    }

    console.log('License analytics generated successfully')

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Error generating analytics:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: `Failed to generate analytics: ${errorMessage}` },
      { status: 500 }
    )
  }
}