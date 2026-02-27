'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Copy, CheckCircle, Home, List } from 'lucide-react'
import toast from 'react-hot-toast'
import { authenticatedFetch } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'

interface GenerateForm {
  name: string
  contact: string
  remark: string
  status: string
}

export default function GenerateLicensePage() {
  const [form, setForm] = useState<GenerateForm>({
    name: '',
    contact: '',
    remark: '',
    status: 'active'
  })
  const [loading, setLoading] = useState(false)
  const [generatedLicense, setGeneratedLicense] = useState<any>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name.trim()) {
      toast.error('Customer name is required')
      return
    }

    setLoading(true)

    try {
      const response = await authenticatedFetch('/api/licenses/generate', {
        method: 'POST',
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedLicense(data)
        toast.success('License generated!')
        
        setForm({
          name: '',
          contact: '',
          remark: '',
          status: 'active'
        })
      } else {
        toast.error(data.message || 'Failed to generate')
      }
    } catch (error) {
      toast.error('Failed to generate')
    } finally {
      setLoading(false)
    }
  }

  const copyLicenseKey = () => {
    if (generatedLicense) {
      navigator.clipboard.writeText(generatedLicense.licenseKey)
      toast.success('Copied!')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-zinc-800">
        <div className="px-4 py-3">
          <h1 className="text-sm font-semibold text-white">Generate License</h1>
          <p className="text-xs text-zinc-500">Create new license key</p>
        </div>
      </div>

      <main className="px-4 py-4 space-y-4">
        {/* Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">License Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Customer Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-700"
                placeholder="Enter customer name"
                required
              />
              <p className="text-xs text-zinc-600 mt-1">
                First 4 letters used in key
              </p>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Contact</label>
              <input
                type="text"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-700"
                placeholder="Phone, email, etc."
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-700"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Notes</label>
              <textarea
                value={form.remark}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-700"
                placeholder="Customer notes..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-black rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="loading-spinner h-4 w-4 mr-2 border-2 border-black/20 border-t-black"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate License
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated License */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Generated License</h2>
          
          {generatedLicense ? (
            <div className="space-y-3">
              <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="ml-2">
                    <h3 className="text-xs font-medium text-green-300">
                      License Generated!
                    </h3>
                    <p className="text-xs text-green-400/80">
                      Ready to use
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">License Key</label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-xs font-mono text-zinc-300 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800">
                      {generatedLicense.licenseKey}
                    </code>
                    <button
                      onClick={copyLicenseKey}
                      className="p-2 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Customer</label>
                    <p className="text-xs text-white">{generatedLicense.licenseObject.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Status</label>
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded ${
                      generatedLicense.licenseObject.status === 'active' 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-orange-500/10 text-orange-400'
                    }`}>
                      {generatedLicense.licenseObject.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Device</label>
                  <span className="inline-flex px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-500">
                    Awaiting Activation
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard/licenses')}
                className="w-full py-2.5 bg-zinc-800 text-white rounded-lg font-medium text-sm"
              >
                View All Licenses
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-2">
                <Plus className="w-5 h-5 text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-xs mb-1">
                Fill form to generate
              </p>
              <p className="text-zinc-600 text-xs">
                License will appear here
              </p>
            </div>
          )}
        </div>
      </main>

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
            <span className="text-xs text-white mt-1 font-medium">New</span>
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
