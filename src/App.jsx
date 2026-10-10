import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Books from './pages/Books'
import Members from './pages/Members'
import Loans from './pages/Loans'
import Overdue from './pages/Overdue'
import Reports from './pages/Reports'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {user && <Navbar />}
      <main className={`flex-1 ${user ? 'pt-20 pb-12' : ''}`}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/books" replace /> : <Login />} />
          <Route path="/" element={<ProtectedRoute><Navigate to="/books" replace /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
          <Route path="/overdue" element={<ProtectedRoute><Overdue /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Routes>
      </main>
      {user && (
        <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
          Manager Library &bull; Prueba Técnica ADSO 3413974 &bull; Stack: React + Laravel
        </footer>
      )}
    </div>
  )
}
