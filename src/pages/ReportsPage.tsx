import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchBills } from '../store/slices/billsSlice'

const ReportsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { items: bills, loading } = useAppSelector((s) => s.bills)

  useEffect(() => {
    dispatch(fetchBills())
  }, [dispatch])

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  // Calculations
  const stats = bills.reduce(
    (acc, bill) => {
      acc.totalVolume += bill.amount
      if (bill.status === 'Paid') {
        acc.paidAmount += bill.amount
        acc.paidCount++
      } else if (bill.status === 'Scheduled') {
        acc.scheduledAmount += bill.amount
        acc.scheduledCount++
      } else if (bill.status === 'Pending Approval') {
        acc.pendingApprovalAmount += bill.amount
        acc.pendingApprovalCount++
      } else {
        acc.otherAmount += bill.amount
        acc.otherCount++
      }
      return acc
    },
    {
      totalVolume: 0,
      paidAmount: 0,
      paidCount: 0,
      scheduledAmount: 0,
      scheduledCount: 0,
      pendingApprovalAmount: 0,
      pendingApprovalCount: 0,
      otherAmount: 0,
      otherCount: 0,
    }
  )

  // Vendor distribution
  const vendorMap: Record<string, { amount: number; name: string }> = {}
  bills.forEach((bill) => {
    const vName = bill.vendor?.name || 'Unknown Vendor'
    if (!vendorMap[vName]) {
      vendorMap[vName] = { amount: 0, name: vName }
    }
    vendorMap[vName].amount += bill.amount
  })
  const vendorStats = Object.values(vendorMap).sort((a, b) => b.amount - a.amount)
  const maxVendorAmount = vendorStats.length > 0 ? Math.max(...vendorStats.map((v) => v.amount)) : 1

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Financial Reports</h1>
        <p className="text-slate-400 text-sm mt-0.5">Overview of accounts payable flows and vendor distribution</p>
      </div>

      {loading && bills.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Loading metrics…</div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-surface-card border border-surface-border">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Volume</span>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.totalVolume)}</p>
              <p className="text-xs text-slate-400 mt-2">{bills.length} total bills registered</p>
            </div>
            <div className="card bg-surface-card border border-surface-border">
              <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">Total Paid</span>
              <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(stats.paidAmount)}</p>
              <p className="text-xs text-slate-400 mt-2">{stats.paidCount} paid transactions</p>
            </div>
            <div className="card bg-surface-card border border-surface-border">
              <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Scheduled Outflow</span>
              <p className="text-2xl font-bold text-purple-400 mt-1">{formatCurrency(stats.scheduledAmount)}</p>
              <p className="text-xs text-slate-400 mt-2">{stats.scheduledCount} scheduled payments</p>
            </div>
            <div className="card bg-surface-card border border-surface-border">
              <span className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">Pending Approval</span>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{formatCurrency(stats.pendingApprovalAmount)}</p>
              <p className="text-xs text-slate-400 mt-2">{stats.pendingApprovalCount} bills awaiting sign-off</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cash Flow Allocation */}
            <div className="card space-y-4">
              <h3 className="text-lg font-semibold text-white">Cash Flow Allocation</h3>
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-sm mb-1 text-slate-300">
                    <span>Paid</span>
                    <span className="font-semibold text-green-400">
                      {formatCurrency(stats.paidAmount)} (
                      {stats.totalVolume ? Math.round((stats.paidAmount / stats.totalVolume) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalVolume ? (stats.paidAmount / stats.totalVolume) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1 text-slate-300">
                    <span>Scheduled</span>
                    <span className="font-semibold text-purple-400">
                      {formatCurrency(stats.scheduledAmount)} (
                      {stats.totalVolume ? Math.round((stats.scheduledAmount / stats.totalVolume) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalVolume ? (stats.scheduledAmount / stats.totalVolume) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1 text-slate-300">
                    <span>Pending Approval</span>
                    <span className="font-semibold text-yellow-400">
                      {formatCurrency(stats.pendingApprovalAmount)} (
                      {stats.totalVolume ? Math.round((stats.pendingApprovalAmount / stats.totalVolume) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalVolume ? (stats.pendingApprovalAmount / stats.totalVolume) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1 text-slate-300">
                    <span>Drafts / Other</span>
                    <span className="font-semibold text-slate-400">
                      {formatCurrency(stats.otherAmount)} (
                      {stats.totalVolume ? Math.round((stats.otherAmount / stats.totalVolume) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalVolume ? (stats.otherAmount / stats.totalVolume) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Spending Distribution */}
            <div className="card space-y-4">
              <h3 className="text-lg font-semibold text-white">Top Vendors by Volume</h3>
              <div className="space-y-4 pt-2">
                {vendorStats.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">No vendor spending data available.</p>
                ) : (
                  vendorStats.slice(0, 5).map((v) => (
                    <div key={v.name}>
                      <div className="flex justify-between text-sm mb-1 text-slate-300">
                        <span>{v.name}</span>
                        <span className="font-semibold text-white">{formatCurrency(v.amount)}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(v.amount / maxVendorAmount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ReportsPage
