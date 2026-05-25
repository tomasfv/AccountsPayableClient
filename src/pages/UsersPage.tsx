import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchUsers, registerUser } from '../store/slices/authSlice'

const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { users, loading, user: currentUser } = useAppSelector((s) => s.auth)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'Submitter' as 'Admin' | 'Approver' | 'Submitter' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const result = await dispatch(registerUser(form))
    if (registerUser.fulfilled.match(result)) {
      setShowModal(false)
      setForm({ fullName: '', email: '', password: '', role: 'Submitter' })
    } else {
      setError(result.payload as string || 'Registration failed')
    }
  }

  const roleColors: Record<string, string> = {
    Admin: 'bg-brand-600/20 text-brand-400 border border-brand-500/10',
    Approver: 'bg-purple-600/20 text-purple-400 border border-purple-500/10',
    Submitter: 'bg-slate-600/20 text-slate-400 border border-slate-500/10',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-0.5">{users.length} registered users</p>
        </div>
        {currentUser?.role === 'Admin' && (
          <button
            id="create-user-btn"
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New User
          </button>
        )}
      </div>

      {/* Users List Card */}
      <div className="card !p-0 overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400">Loading users…</div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-surface-border">
              <tr>
                {['User', 'Email', 'Role', 'Joined'].map((h) => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-hover transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-white font-semibold text-sm">
                        {u.fullName[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-white">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="table-cell text-slate-300">{u.email}</td>
                  <td className="table-cell">
                    <span className={`badge ${roleColors[u.role] ?? ''}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="table-cell text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md relative border border-surface-border shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Register New User</h2>
            {error && (
              <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  required
                  className="input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div>
                <label className="label">System Role</label>
                <select
                  className="input select"
                  value={form.role}
                   onChange={(e) => setForm({ ...form, role: e.target.value as 'Admin' | 'Approver' | 'Submitter' })}
                >
                  <option value="Submitter">Submitter (Creates Bills)</option>
                  <option value="Approver">Approver (Approves & Schedules)</option>
                  <option value="Admin">Admin (Full Control + Execute Payments)</option>
                </select>
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage
