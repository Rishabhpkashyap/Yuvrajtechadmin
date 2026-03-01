'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Shield,
  Activity,
  Plus,
  Search,
  LogOut,
  Key,
  Smartphone,
  Home,
  List
} from 'lucide-react'
import toast from 'react-hot-toast'
import { authenticatedFetch } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'

interface License {
  name: string
  fullKey: string
  status: string
  fingerprint: string | null
  createdAt: string
  lastUsed?: string
  lastModified?: string
  deviceInfo?: string
  remark?: string
}

interface DashboardStats {
  total: number
  active: number
  bound: number
  unbound: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ total: 0, active: 0, bound: 0, unbound: 0 })
  const [recentLicenses, setRecentLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const { user, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      const response = await authenticatedFetch('/api/licenses')

      if (response.status === 401) {
        toast.error('Authentication failed')
        return
      }

      const data = await response.json()

      if (data.success) {
        const licenses = Object.values(data.licenses) as License[]

        const total = licenses.length
        const active = licenses.filter(l => l.status === 'active').length
        const bound = licenses.filter(l => l.fingerprint && l.fingerprint !== null).length
        const unbound = total - bound

        setStats({ total, active, bound, unbound })

        const recent = licenses
          .filter(l => l.createdAt)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8)

        setRecentLicenses(recent)
      }
    } catch (error) {
      console.error('Dashboard data error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to sign out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center space-y-3">
          <div className="loading-spinner h-8 w-8 border-2 border-zinc-800 border-t-zinc-400"></div>
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Minimal Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-zinc-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-zinc-400" />
              <div>
                <h1 className="text-sm font-semibold text-white">Yuvraj Tech</h1>
                <p className="text-xs text-zinc-500">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-zinc-500" />
              <span className="text-xs text-zinc-500 uppercase">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-xs text-zinc-500 uppercase">Active</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.active}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-zinc-500 uppercase">Bound</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.bound}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Key className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-zinc-500 uppercase">Free</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{stats.unbound}</p>
          </div>
        </div>

        {/* Recent Licenses */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Recent Licenses</h3>
            <button
              onClick={() => router.push('/dashboard/licenses')}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              View All
            </button>
          </div>
          
          {recentLicenses.length > 0 ? (
            <div className="space-y-2">
              {recentLicenses.map((license, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      license.status === 'active' ? 'bg-green-400' : 'bg-orange-400'
                    }`}></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-zinc-300 truncate">{license.fullKey}</p>
                      <p className="text-xs text-zinc-600 truncate">{license.name}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ml-2 ${
                    license.fingerprint 
                      ? 'bg-blue-500/10 text-blue-400' 
                      : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {license.fingerprint ? 'Bound' : 'Free'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
              <p className="text-zinc-600 text-xs">No licenses yet</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-zinc-800 z-50">
        <div className="flex items-center justify-around px-4 py-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex flex-col items-center space-y-1 py-2 px-8 text-white"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          
          <button
            onClick={() => router.push('/dashboard/licenses/generate')}
            className="flex flex-col items-center -mt-6"
          >
            <div className="bg-white text-black rounded-full p-3 shadow-lg">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs text-white mt-1">New</span>
          </button>
          
          <button
            onClick={() => router.push('/dashboard/licenses')}
            className="flex flex-col items-center space-y-1 py-2 px-8 text-zinc-500 hover:text-white transition-colors"
          >
            <List className="w-5 h-5" />
            <span className="text-xs">Licenses</span>
          </button>
        </div>
      </div>
    </div>
  )
}
