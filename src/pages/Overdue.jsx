import React, { useState, useEffect } from 'react'
import { api } from '../api'

export default function Overdue() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOverdue = () => {
    setLoading(true)
    setError('')
    api.getOverdue()
      .then((res) => {
        setItems(res.data || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOverdue()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <span>Préstamos Vencidos</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-normal border border-red-500/30">
              Alerta de mora
            </span>
          </h1>
          <p className="text-sm text-gray-400">
            Libros cuyo plazo de devolución de 14 días ha expirado sin registrar retorno
          </p>
        </div>
        <button
          onClick={fetchOverdue}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 text-xs font-medium transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-500">Cargando préstamos vencidos...</div>
      ) : items.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-lg font-bold text-gray-200 mb-1">¡Al día!</h2>
          <p className="text-gray-400 text-sm">No hay préstamos vencidos en este momento.</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4">Miembro</th>
                  <th className="text-left py-3 px-4">Libro</th>
                  <th className="text-left py-3 px-4">Fecha Vencimiento</th>
                  <th className="text-center py-3 px-4">Días de Atraso</th>
                  <th className="text-center py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {items.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 text-gray-100 font-medium">
                      {row.member_name}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {row.book_title}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(row.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-red-400 font-mono">
                        +{row.days_overdue} {row.days_overdue === 1 ? 'día' : 'días'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                        Vencido
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
