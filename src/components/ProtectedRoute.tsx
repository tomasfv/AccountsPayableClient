import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../hooks/redux'

// Redirects unauthenticated users to /login
const ProtectedRoute: React.FC = () => {
  const token = useAppSelector((s) => s.auth.token)
  return token ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
