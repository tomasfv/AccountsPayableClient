import React from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { setDeveloperRole } from '../store/slices/authSlice'

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)

  const handleRoleOverride = (role: 'Admin' | 'Approver' | 'Submitter') => {
    dispatch(setDeveloperRole(role))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage system properties, preferences, and developer tools</p>
      </div>

      {/* Developer Settings Card */}
      <div className="card space-y-4 border border-brand-500/20 bg-brand-950/10">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-brand-500/20 text-brand-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Developer Testing Tools</h3>
        </div>
        <p className="text-sm text-slate-300">
          Toggle your system role on-the-fly to preview layout access and permissions. No logout required.
        </p>
        
        {user ? (
          <div className="space-y-3 pt-2">
            <label className="label">Active User Role</label>
            <div className="flex gap-2">
              {(['Submitter', 'Approver', 'Admin'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleOverride(role)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium border transition-all duration-200 text-sm ${
                    user.role === role
                      ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-600/20'
                      : 'bg-surface border-surface-border text-slate-400 hover:text-white hover:bg-surface-hover'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              * Note: Role overrides apply locally for navigation and action authorization.
            </p>
          </div>
        ) : (
          <p className="text-sm text-red-400">Please sign in to configure role overrides.</p>
        )}
      </div>

      {/* System Settings (Mocked) */}
      <div className="card space-y-6">
        <h3 className="text-lg font-semibold text-white">General Settings</h3>
        <div className="space-y-4 divide-y divide-surface-border">
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-sm font-semibold text-white">Dark Mode Theme</p>
              <p className="text-xs text-slate-500">Use high-contrast theme across application views</p>
            </div>
            <div className="w-11 h-6 bg-brand-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm font-semibold text-white">Email Notifications</p>
              <p className="text-xs text-slate-500">Alert creators/approvers upon approval state transitions</p>
            </div>
            <div className="w-11 h-6 bg-slate-800 rounded-full flex items-center justify-start px-1 cursor-pointer">
              <div className="w-4 h-4 bg-slate-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
