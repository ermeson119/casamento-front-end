import React from 'react'
import { Toaster } from 'react-hot-toast'
import { AdminAuthProvider, useAdminAuth } from '../contexts/AdminAuthContext'
import { AdminLogin } from './AdminLogin'
import { AdminDashboard } from './AdminDashboard'

function AdminContent() {
  const { user, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AdminLogin />
  }

  return <AdminDashboard />
}

export function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminContent />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '16px',
          },
        }}
      />
    </AdminAuthProvider>
  )
}
