import { NextRequest } from 'next/server'
import { adminAuth } from './firebase-admin'

export async function verifyFirebaseToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.split('Bearer ')[1]
    
    if (!adminAuth) {
      console.error('Firebase Admin Auth not available')
      return null
    }
    
    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken.uid
  } catch (error) {
    console.error('Firebase token verification failed:', error)
    return null
  }
}

// Keep backward compatibility
export async function verifyAdminToken(request: NextRequest): Promise<string | null> {
  return verifyFirebaseToken(request)
}