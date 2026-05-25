import React from 'react'
import { useAppSelector } from '../hooks/redux'

const ProfilePage: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user)

  if (!user) {
    return <div className="text-slate-400">Loading user profile…</div>
  }

  const getRolePermissions = (role: string) => {
    switch (role) {
      case 'Admin':
        return [
          'Create vendors and system users',
          'Create & submit invoices/bills',
          'Approve pending bills',
          'Schedule payments for approved bills',
          'Execute scheduled payments (ACH, card, paper checks)'
        ]
      case 'Approver':
        return [
          'Create & submit invoices/bills',
          'Approve pending bills',
          'Schedule payments for approved bills'
        ]
      case 'Submitter':
      default:
        return [
          'Create & submit invoices/bills (Saved as Pending Approval)'
        ]
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">User Profile</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your personal credentials and system authority levels</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="card md:col-span-1 flex flex-col items-center text-center p-6 space-y-4">
          <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-500/20">
            {user.fullName[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user.fullName}</h2>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <span className="badge bg-brand-600/20 text-brand-400 border border-brand-500/20">
            {user.role}
          </span>
        </div>

        {/* Permissions / Details Card */}
        <div className="card md:col-span-2 space-y-6">
          <div>
            <h3 className="text-md font-bold text-white mb-2">Account Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 block">User ID</span>
                <span className="font-mono text-xs text-slate-300">{user.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Created On</span>
                <span className="text-slate-300">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-surface-border pt-4">
            <h3 className="text-md font-bold text-white mb-3">System Permissions</h3>
            <ul className="space-y-2">
              {getRolePermissions(user.role).map((p, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <svg className="w-5 h-5 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
