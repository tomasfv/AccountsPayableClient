import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './hooks/redux'
import { fetchMe } from './store/slices/authSlice'

import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import BillsPage from './pages/BillsPage'
import VendorsPage from './pages/VendorsPage'
import UsersPage from './pages/UsersPage'
import PaymentsPage from './pages/PaymentsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'

const App: React.FC = () => {
  const dispatch = useAppDispatch()
  const token = useAppSelector((s) => s.auth.token)

  // On mount, re-hydrate the user session from the stored token
  useEffect(() => {
    if (token) {
      dispatch(fetchMe())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/bills" replace />} />
            <Route path="/bills" element={<BillsPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/bills" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
