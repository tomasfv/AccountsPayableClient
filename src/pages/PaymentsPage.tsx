import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchBills } from '../store/slices/billsSlice'

const PaymentsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { items: bills, loading } = useAppSelector((s) => s.bills)

  useEffect(() => {
    dispatch(fetchBills())
  }, [dispatch])

  // Extract all payments from bills
  const payments = bills.flatMap((bill) => 
    (bill.payments || []).map((payment) => ({
      ...payment,
      billInvoice: bill.invoiceNumber || `Bill #${bill.id.slice(0, 8)}`,
      billAmount: bill.amount,
      vendorName: bill.vendor?.name || 'Unknown Vendor'
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const statusColors: Record<string, string> = {
    'Scheduled':  'bg-purple-500/20 text-purple-400 border border-purple-500/10',
    'Processing': 'bg-blue-500/20 text-blue-400 border border-blue-500/10',
    'Completed':  'bg-green-500/20 text-green-400 border border-green-500/10',
    'Failed':     'bg-red-500/20 text-red-400 border border-red-500/10',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <p className="text-slate-400 text-sm mt-0.5">{payments.length} total payments tracked</p>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        {loading && payments.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400">Loading payments…</div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-surface-border">
              <tr>
                {['Invoice', 'Vendor', 'Method', 'Scheduled Date', 'Paid Date', 'Status', 'Ref Code', 'Amount'].map((h) => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-500">
                    No payment history found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-hover transition-colors">
                    <td className="table-cell font-mono text-xs text-brand-400">{p.billInvoice}</td>
                    <td className="table-cell font-semibold text-white">{p.vendorName}</td>
                    <td className="table-cell text-slate-300">{p.paymentMethod}</td>
                    <td className="table-cell text-slate-400">{formatDate(p.scheduledDate)}</td>
                    <td className="table-cell text-slate-400">
                      {p.paidDate ? formatDate(p.paidDate) : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${statusColors[p.status] ?? ''}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="table-cell font-mono text-xs text-slate-500">
                      {p.transactionReference || <span className="text-slate-600">—</span>}
                    </td>
                    <td className="table-cell font-semibold text-white">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default PaymentsPage
