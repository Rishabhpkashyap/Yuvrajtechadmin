'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="flex flex-col items-center space-y-6 relative z-10">
          <div className="relative">
            <div className="loading-spinner h-20 w-20 border-4 border-violet-500/20 border-t-violet-500"></div>
            <div className="absolute inset-0 loading-spinner h-20 w-20 border-4 border-transparent border-t-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-center">
            <p className="text-gray-300 text-lg font-medium">Loading MOD QUOTEX</p>
            <p className="text-gray-500 text-sm mt-1">Initializing your experience...</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}