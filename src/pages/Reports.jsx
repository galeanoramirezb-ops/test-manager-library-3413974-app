import React, { useState, useEffect } from 'react'
import { api } from '../api'

export default function Reports() {
  const today = new Date().toISOString().split('T')[0]
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0]

  const [from, setFrom] = useState(sixtyDaysAgo)
  const [to, setTo] = useState(today)
  const [limit, setLimit] = useState(10)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchReport = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getMostBorrowed({ from, to, limit })
      setData(res.data || [])
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReport()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Reportes de Circulación</h1>
        <p className="text-sm text-gray-400">
          Estadísticas de demanda y libros más prestados en un periodo determinado
        </p>
      </div>

      {/* Filter panel */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6 shadow-xl">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Fecha Inicial (Desde)</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Fecha Final (Hasta)</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Top Límite</label>
            <input
              type="number"
              min="1"
              max="50"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-24 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-indigo-500 text-center"
            />
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors disabled:opacity-50 shadow-lg shadow-indigo-600/20"
          >
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {data !== null && (
        data.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <h2 className="text-lg font-bold text-gray-200 mb-1">Sin registros</h2>
            <p className="text-gray-400 text-sm">No hubo préstamos registrados en el rango de fechas seleccionado.</p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="text-center py-3 px-4 w-16">Posición</th>
                    <th className="text-left py-3 px-4">Título del Libro</th>
                    <th className="text-left py-3 px-4">Autor</th>
                    <th className="text-center py-3 px-4">Total Préstamos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {data.map((row, idx) => (
                    <tr key={row.book_id || idx} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4 text-center font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${
                            idx === 0
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : idx === 1
                              ? 'bg-gray-300/20 text-gray-200 border border-gray-300/30'
                              : idx === 2
                              ? 'bg-amber-700/20 text-amber-400 border border-amber-700/30'
                              : 'text-gray-500'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-100 font-medium">
                        {row.title}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {row.author}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-sm px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                          {row.times_borrowed}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  )
}

