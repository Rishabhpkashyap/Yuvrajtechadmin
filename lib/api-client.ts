import { auth } from './firebase-client'

export async function getAuthHeaders(): Promise<HeadersInit> {
  if (!auth) {
    throw new Error('Firebase auth not initialized')
  }
  
  const user = auth.currentUser
  if (!user) {
    throw new Error('User not authenticated')
  }

  const token = await user.getIdToken()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders()
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  })
}