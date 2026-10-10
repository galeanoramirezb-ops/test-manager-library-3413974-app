import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/books', label: '📚 Libros' },
  { to: '/members', label: '👥 Miembros' },
  { to: '/loans', label: '📋 Préstamos' },
  { to: '/overdue', label: '⚠️ Vencidos' },
  { to: '/reports', label: '📊 Reportes' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Manager Library
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
            ADSO 3413974
          </span>
        </div>

        <div className="flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-sm font-medium text-gray-200 block">{user?.username || 'Usuario'}</span>
            <span className="text-xs text-gray-400 capitalize block">{user?.role || 'admin'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-800 hover:bg-red-500/20 hover:text-red-300 text-gray-300 transition-colors border border-gray-700"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
