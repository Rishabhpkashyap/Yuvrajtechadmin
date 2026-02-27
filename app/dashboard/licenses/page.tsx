'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RotateCcw,
  Home,
  Copy,
  Check,
  Filter,
  X,
  User,
  Smartphone,
  Calendar,
  Clock,
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

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<Record<string, License>>({})
  const [filteredLicenses, setFilteredLicenses] = useState<Record<string, License>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deviceFilter, setDeviceFilter] = useState('all')
  const [editingLicense, setEditingLicense] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<License>>({})
  const [copiedLicense, setCopiedLicense] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const getDevicePlatform = (deviceInfo?: string) => {
    if (!deviceInfo) return null
    try {
      const parsed = JSON.parse(deviceInfo)
      return parsed.platform || 'Unknown'
    } catch {
      return 'Unknown'
    }
  }

  useEffect(() => {
    if (user) {
      loadLicenses()
    }
  }, [user])

  useEffect(() => {
    filterLicenses()
  }, [licenses, searchTerm, statusFilter, deviceFilter])

  const loadLicenses = async () => {
    try {
      const response = await authenticatedFetch('/api/licenses')
      const data = await response.json()

      if (data.success) {
        setLicenses(data.licenses || {})
      } else {
        toast.error('Failed to load licenses')
      }
    } catch (error) {
      toast.error('Failed to load licenses')
    } finally {
      setLoading(false)
    }
  }

  const filterLicenses = () => {
    let filtered = { ...licenses }

    if (searchTerm) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([key, license]) =>
          key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          license.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (license.remark && license.remark.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      )
    }

    if (statusFilter !== 'all') {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, license]) => license.status === statusFilter)
      )
    }

    if (deviceFilter !== 'all') {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, license]) => {
          if (deviceFilter === 'bound') return license.fingerprint !== null
          if (deviceFilter === 'unbound') return license.fingerprint === null
          return true
        })
      )
    }

    setFilteredLicenses(filtered)
  }

  const copyLicenseKey = async (licenseKey: string) => {
    try {
      await navigator.clipboard.writeText(licenseKey)
      setCopiedLicense(licenseKey)
      toast.success('Copied!')
      setTimeout(() => setCopiedLicense(null), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handleEdit = (licenseKey: string) => {
    const license = licenses[licenseKey]
    setEditingLicense(licenseKey)
    setEditForm(license)
  }

  const handleSaveEdit = async () => {
    if (!editingLicense) return

    try {
      const response = await authenticatedFetch(`/api/licenses/${editingLicense}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Updated')
        setEditingLicense(null)
        loadLicenses()
      } else {
        toast.error(data.message || 'Failed to update')
      }
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (licenseKey: string) => {
    if (!confirm(`Delete ${licenseKey}?`)) {
      return
    }

    try {
      const response = await authenticatedFetch(`/api/licenses/${licenseKey}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Deleted')
        loadLicenses()
      } else {
        toast.error(data.message || 'Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const handleResetDevice = async (licenseKey: string) => {
    if (!confirm(`Reset device for ${licenseKey}?`)) {
      return
    }

    const license = licenses[licenseKey]
    const updatedLicense = { 
      ...license, 
      fingerprint: null,
      deviceInfo: null
    }

    try {
      const response = await authenticatedFetch(`/api/licenses/${licenseKey}`, {
        method: 'PUT',
        body: JSON.stringify(updatedLicense),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Device reset')
        loadLicenses()
      } else {
        toast.error(data.message || 'Failed to reset')
      }
    } catch (error) {
      toast.error('Failed to reset')
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
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-zinc-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-sm font-semibold text-white">All Licenses</h1>
            <span className="text-xs text-zinc-500">{Object.keys(filteredLicenses).length} total</span>
          </div>
          
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search licenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-700"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex space-x-2 mt-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-zinc-700"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="revoked">Revoked</option>
              </select>
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="flex-1 px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-zinc-700"
              >
                <option value="all">All Devices</option>
                <option value="bound">Bound</option>
                <option value="unbound">Free</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* License List */}
      <main className="px-4 py-3 space-y-2">
        {Object.entries(filteredLicenses).map(([key, license]) => (
          <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <code className="text-xs font-mono text-zinc-300 bg-zinc-950 px-2 py-1 rounded truncate">
                  {key}
                </code>
                <button
                  onClick={() => copyLicenseKey(key)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors flex-shrink-0"
                >
                  {copiedLicense === key ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded flex-shrink-0 ml-2 ${
                license.status === 'active' 
                  ? 'bg-green-500/10 text-green-400' 
                  : license.status === 'suspended'
                  ? 'bg-orange-500/10 text-orange-400'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {license.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs mb-3">
              <div className="flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-white truncate">{license.name}</div>
                  {license.remark && (
                    <div className="text-zinc-600 truncate">{license.remark}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    license.fingerprint 
                      ? 'bg-blue-500/10 text-blue-400' 
                      : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {license.fingerprint ? 'Bound' : 'Free'}
                  </span>
                </div>
                {license.deviceInfo && (
                  <div className="text-xs text-zinc-600">
                    {getDevicePlatform(license.deviceInfo)}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  <span className="text-zinc-500 truncate">
                    {new Date(license.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  <span className="text-zinc-500 truncate">
                    {license.lastUsed ? new Date(license.lastUsed).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-1 pt-2 border-t border-zinc-800">
              <button
                onClick={() => handleEdit(key)}
                className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleResetDevice(key)}
                className="p-1.5 text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={!license.fingerprint}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(key)}
                className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {Object.keys(filteredLicenses).length === 0 && (
          <div className="text-center py-12">
            <Search className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No licenses found</p>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingLicense && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-zinc-900 border-t border-zinc-800 rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Edit License</h3>
              <button
                onClick={() => setEditingLicense(null)}
                className="p-1 text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">License Key</label>
                <input
                  type="text"
                  value={editingLicense}
                  disabled
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-600 text-sm cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-700"
                />
              </div>
              
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Status</label>
                <select
                  value={editForm.status || 'active'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-700"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Remark</label>
                <textarea
                  value={editForm.remark || ''}
                  onChange={(e) => setEditForm({ ...editForm, remark: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => setEditingLicense(null)}
                className="flex-1 px-4 py-2.5 bg-zinc-800 text-white rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2.5 bg-white text-black rounded-lg text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-zinc-800 z-50">
        <div className="flex items-center justify-around px-4 py-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex flex-col items-center space-y-1 py-2 px-8 text-zinc-500 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
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
            className="flex flex-col items-center space-y-1 py-2 px-8 text-white"
          >
            <List className="w-5 h-5" />
            <span className="text-xs font-medium">Licenses</span>
          </button>
        </div>
      </div>
    </div>
  )
}
