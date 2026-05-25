import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchBills, createBill, approveBill, schedulePayment, executePayment } from '../store/slices/billsSlice'
import { fetchVendors } from '../store/slices/vendorsSlice'

type BillAction = 'SUBMIT' | 'EDIT' | 'DELETE' | 'APPROVE' | 'REJECT' | 'SCHEDULE' | 'PAY' | 'CANCEL_SCHEDULE' | 'VIEW_RECEIPT'

const primaryActions: BillAction[] = ['APPROVE', 'SCHEDULE', 'PAY']

const statusColors: Record<string, string> = {
  'Draft':            'bg-slate-500/20 text-slate-400 border border-slate-500/10',
  'Pending Approval': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/10',
  'Approved':         'bg-blue-500/20 text-blue-400 border border-blue-500/10',
  'Scheduled':        'bg-purple-500/20 text-purple-400 border border-purple-500/10',
  'Paid':             'bg-green-500/20 text-green-400 border border-green-500/10',
}

const paymentStatusColors: Record<string, string> = {
  'Scheduled':  'bg-purple-500/20 text-purple-400 border border-purple-500/10',
  'Processing': 'bg-blue-500/20 text-blue-400 border border-blue-500/10',
  'Completed':  'bg-green-500/20 text-green-400 border border-green-500/10',
  'Failed':     'bg-red-500/20 text-red-400 border border-red-500/10',
}

const BillsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { items: bills, loading } = useAppSelector((s) => s.bills)
  const { items: vendors } = useAppSelector((s) => s.vendors)
  const currentUser = useAppSelector((s) => s.auth.user)

  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null)

  // Form states
  const [createForm, setCreateForm] = useState({
    vendorId: '',
    amount: '',
    invoiceNumber: '',
    dueDate: '',
  })
  const [scheduleForm, setScheduleForm] = useState({
    paymentMethod: 'ACH' as 'ACH' | 'Paper Check' | 'Card',
    scheduledDate: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [openMenuBillId, setOpenMenuBillId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchBills())
    dispatch(fetchVendors())
  }, [dispatch])

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const formatDate = (d: string) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!createForm.vendorId) {
      setError('Please select a vendor')
      return
    }
    const result = await dispatch(
      createBill({
        vendorId: createForm.vendorId,
        amount: parseFloat(createForm.amount),
        invoiceNumber: createForm.invoiceNumber || undefined,
        dueDate: createForm.dueDate,
      })
    )
    if (createBill.fulfilled.match(result)) {
      setShowCreateModal(false)
      setCreateForm({ vendorId: '', amount: '', invoiceNumber: '', dueDate: '' })
      dispatch(fetchBills())
    } else {
      setError(result.payload as string || 'Failed to create bill')
    }
  }

  const handleApprove = async (id: string) => {
    if (window.confirm('Are you sure you want to approve this bill?')) {
      setError(null)
      const result = await dispatch(approveBill(id))
      if (approveBill.fulfilled.match(result)) {
        await dispatch(fetchBills())
      } else {
        setError(result.payload as string || 'Failed to approve bill')
      }
    }
  }

  const handleOpenSchedule = (id: string, dueDate: string) => {
    setSelectedBillId(id)
    setScheduleForm({
      paymentMethod: 'ACH',
      scheduledDate: dueDate ? new Date(dueDate).toISOString().split('T')[0] : '',
    })
    setShowScheduleModal(true)
  }

  const handleSchedulePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBillId) return
    setError(null)
    const result = await dispatch(
      schedulePayment({
        id: selectedBillId,
        paymentMethod: scheduleForm.paymentMethod,
        scheduledDate: scheduleForm.scheduledDate,
      })
    )
    if (schedulePayment.fulfilled.match(result)) {
      setShowScheduleModal(false)
      setSelectedBillId(null)
      await dispatch(fetchBills())
    } else {
      setError(result.payload as string || 'Failed to schedule payment')
    }
  }

  const handleExecutePayment = async (id: string) => {
    if (window.confirm('Are you sure you want to execute this payment now?')) {
      setError(null)
      const result = await dispatch(executePayment(id))
      if (executePayment.fulfilled.match(result)) {
        await dispatch(fetchBills())
      } else {
        setError(result.payload as string || 'Failed to execute payment')
      }
    }
  }

  const handleSecondaryAction = async (billId: string, action: BillAction) => {
    setOpenMenuBillId(null)
    switch (action) {
      case 'EDIT':
        setError('Edit bill not yet implemented')
        break
      case 'DELETE':
        if (window.confirm('Delete this bill permanently?')) {
          setError('Delete bill not yet implemented')
        }
        break
      case 'SUBMIT':
      case 'REJECT':
      case 'CANCEL_SCHEDULE':
      case 'VIEW_RECEIPT':
        setError(`"${actionLabel[action]}" not yet implemented`)
        break
    }
  }

  const actionLabel: Record<BillAction, string> = {
    SUBMIT: 'Submit',
    EDIT: 'Edit',
    DELETE: 'Delete',
    APPROVE: 'Approve',
    REJECT: 'Reject',
    SCHEDULE: 'Schedule',
    PAY: 'Pay Now',
    CANCEL_SCHEDULE: 'Cancel Schedule',
    VIEW_RECEIPT: 'View Receipt',
  }

  // Action authorizations based on role
  const canApprove = currentUser?.role === 'Admin' || currentUser?.role === 'Approver'
  const canPay = currentUser?.role === 'Admin'

  const filteredBills = bills.filter((b) => statusFilter === 'All' || b.status === statusFilter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bills</h1>
          <p className="text-slate-400 text-sm mt-0.5">{filteredBills.length} bills showing</p>
        </div>
        <button
          id="create-bill-btn"
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Bill
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-surface-border pb-4">
        {['All', 'Draft', 'Pending Approval', 'Approved', 'Scheduled', 'Paid'].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
              statusFilter === f
                ? 'bg-brand-600/20 text-brand-400 border-brand-500/20'
                : 'text-slate-400 border-transparent hover:bg-surface-hover hover:text-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        {loading && bills.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400">Loading…</div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-surface-border">
              <tr>
                {['Invoice / ID', 'Vendor', 'Created', 'Due Date', 'Status', 'Payment Status', 'Amount', 'Actions'].map((h) => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-500">
                    No bills found. Create your first bill.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const latestPayment = bill.payments?.[bill.payments.length - 1]
                  return (
                    <tr key={bill.id} className="hover:bg-surface-hover transition-colors">
                      <td className="table-cell font-mono text-xs text-slate-400">
                        {bill.invoiceNumber ?? bill.id.slice(0, 8) + '…'}
                      </td>
                      <td className="table-cell font-semibold text-white">
                        {bill.vendor?.name || 'Unknown Vendor'}
                      </td>
                      <td className="table-cell text-slate-300">{formatDate(bill.createdAt)}</td>
                      <td className="table-cell text-slate-300 font-medium">{formatDate(bill.dueDate)}</td>
                      <td className="table-cell">
                        <span className={`badge ${statusColors[bill.status] ?? ''}`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        {latestPayment ? (
                          <span className={`badge ${paymentStatusColors[latestPayment.status] ?? ''}`}>
                            {latestPayment.status} ({latestPayment.paymentMethod})
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="table-cell font-semibold text-white">
                        {formatCurrency(bill.amount)}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {bill.status === 'Pending Approval' && canApprove && (
                            <button
                              id={`action-approve-${bill.id}`}
                              onClick={() => handleApprove(bill.id)}
                              className="btn-secondary !px-2.5 !py-1 !text-xs !bg-yellow-600/10 !text-yellow-400 hover:!bg-yellow-600/20"
                            >
                              Approve
                            </button>
                          )}
                          {bill.status === 'Approved' && canApprove && (
                            <button
                              id={`action-schedule-${bill.id}`}
                              onClick={() => handleOpenSchedule(bill.id, bill.dueDate)}
                              className="btn-secondary !px-2.5 !py-1 !text-xs !bg-purple-600/10 !text-purple-400 hover:!bg-purple-600/20"
                            >
                              Schedule
                            </button>
                          )}
                          {bill.status === 'Scheduled' && canPay && (
                            <button
                              id={`action-pay-${bill.id}`}
                              onClick={() => handleExecutePayment(bill.id)}
                              className="btn-secondary !px-2.5 !py-1 !text-xs !bg-green-600/10 !text-green-400 hover:!bg-green-600/20"
                            >
                              Pay
                            </button>
                          )}

                          {/* Kebab menu */}
                          <div className="relative">
                            {bill.actions.some((a) => !primaryActions.includes(a as BillAction)) ? (
                              <>
                                <button
                                  id={`action-more-${bill.id}`}
                                  onClick={() => setOpenMenuBillId(openMenuBillId === bill.id ? null : bill.id)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-surface-hover transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="5" r="1.5" />
                                    <circle cx="12" cy="12" r="1.5" />
                                    <circle cx="12" cy="19" r="1.5" />
                                  </svg>
                                </button>

                                {openMenuBillId === bill.id && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenuBillId(null)} />
                                    <div className="absolute right-0 top-full mt-1 z-50 w-44 py-1 bg-surface-card border border-surface-border rounded-lg shadow-2xl">
                                      {bill.actions
                                        .filter((a) => !primaryActions.includes(a as BillAction))
                                        .map((action) => (
                                          <button
                                            key={action}
                                            id={`action-${action.toLowerCase()}-${bill.id}`}
                                            onClick={() => handleSecondaryAction(bill.id, action as BillAction)}
                                            className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-surface-hover hover:text-white transition-colors"
                                          >
                                            {actionLabel[action as BillAction] || action}
                                          </button>
                                        ))}
                                    </div>
                                  </>
                                )}
                              </>
                            ) : (
                              bill.actions.length === 0 && (
                                <span className="text-xs text-slate-500 italic">None</span>
                              )
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md relative border border-surface-border shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Create New Invoice / Bill</h2>
            {error && (
              <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateBill} className="space-y-4">
              <div>
                <label className="label">Vendor</label>
                <select
                  required
                  className="input select"
                  value={createForm.vendorId}
                  onChange={(e) => setCreateForm({ ...createForm, vendorId: e.target.value })}
                >
                  <option value="">Select Vendor...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input"
                  placeholder="0.00"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Invoice Number</label>
                <input
                  type="text"
                  className="input"
                  placeholder="INV-2026-XXXX"
                  value={createForm.invoiceNumber}
                  onChange={(e) => setCreateForm({ ...createForm, invoiceNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Due Date</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md relative border border-surface-border shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Schedule Payment</h2>
            {error && (
              <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSchedulePayment} className="space-y-4">
              <div>
                <label className="label">Payment Method</label>
                <select
                  required
                  className="input select"
                  value={scheduleForm.paymentMethod}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, paymentMethod: e.target.value as 'ACH' | 'Paper Check' | 'Card' })}
                >
                  <option value="ACH">ACH (Direct Deposit)</option>
                  <option value="Card">Credit Card</option>
                  <option value="Paper Check">Paper Check</option>
                </select>
              </div>
              <div>
                <label className="label">Payment Date</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={scheduleForm.scheduledDate}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BillsPage
