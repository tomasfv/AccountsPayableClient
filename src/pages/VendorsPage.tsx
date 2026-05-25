import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchVendors, createVendor } from '../store/slices/vendorsSlice'

const VendorsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { items: vendors, loading } = useAppSelector((s) => s.vendors)
  const currentUser = useAppSelector((s) => s.auth.user)

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bankName: '',
    bankRoutingNumber: '',
    bankAccountNumber: '',
  })

  useEffect(() => {
    dispatch(fetchVendors())
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(createVendor(form))
    if (createVendor.fulfilled.match(result)) {
      toast.success('Vendor created successfully')
      setShowModal(false)
      setForm({ name: '', email: '', phone: '', bankName: '', bankRoutingNumber: '', bankAccountNumber: '' })
      dispatch(fetchVendors())
    } else {
      toast.error((result.payload as string) || 'Failed to create vendor')
    }
  }

  const canManageVendors = currentUser?.role === 'Admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vendors</h1>
          <p className="text-slate-400 text-sm mt-0.5">{vendors.length} total vendors</p>
        </div>
        {canManageVendors && (
          <button
            id="create-vendor-btn"
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Vendor
          </button>
        )}
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && vendors.length === 0 ? (
          <p className="text-slate-400 col-span-full text-center py-16">Loading…</p>
        ) : vendors.length === 0 ? (
          <p className="text-slate-500 col-span-full text-center py-16">No vendors yet.</p>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor.id} className="card hover:border-brand-700 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center text-brand-400 font-bold text-lg">
                  {vendor.name[0].toUpperCase()}
                </div>
                <span className={`badge ${vendor.status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/10' : 'bg-red-500/20 text-red-400 border border-red-500/10'}`}>
                  {vendor.status}
                </span>
              </div>
              <h3 className="font-semibold text-white text-base">{vendor.name}</h3>
              <p className="text-slate-400 text-sm mt-0.5">{vendor.email}</p>
              {vendor.phone && (
                <p className="text-slate-400 text-xs mt-1">📞 {vendor.phone}</p>
              )}
              {vendor.bankName && (
                <div className="mt-3 pt-3 border-t border-surface-border space-y-1">
                  <p className="text-slate-400 text-xs font-semibold">BANK DETAILS</p>
                  <p className="text-slate-500 text-xs">🏦 {vendor.bankName}</p>
                  {vendor.bankAccountNumber && (
                    <p className="text-slate-500 text-xs font-mono">
                      Acct: *******{vendor.bankAccountNumber.slice(-4)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md relative border border-surface-border shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Add New Vendor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Vendor Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="Acme Corporation"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="billing@acme.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="text"
                  className="input"
                  placeholder="123-456-7890"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="pt-2 border-t border-surface-border">
                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Bank Details (Optional)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="label">Bank Name</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Chase Bank"
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Routing Number</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="123456789"
                        value={form.bankRoutingNumber}
                        onChange={(e) => setForm({ ...form, bankRoutingNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Account Number</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="987654321"
                        value={form.bankAccountNumber}
                        onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorsPage
