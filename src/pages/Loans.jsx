import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

export default function Loans() {
  const [loans, setLoans] = useState([])
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  const [members, setMembers] = useState([])
  const [books, setBooks] = useState([])
  const [memberId, setMemberId] = useState('')
  const [items, setItems] = useState([{ book_id: '', quantity: 1 }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchLoans = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getLoans({ page, size: 12, status: statusFilter })
      setLoans(res.data || [])
      setMeta(res.meta || { page: 1, pages: 1, total: 0 })
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }, [page, statusFilter])

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  const openCreate = async () => {
    try {
      const [m, b] = await Promise.all([
        api.getMembers({ size: 100 }),
        api.getBooks({ size: 100 }),
      ])
      setMembers(m.data || [])
      setBooks(b.data || [])
      setMemberId('')
      setItems([{ book_id: '', quantity: 1 }])
      setShowCreate(true)
      setError('')
      setSuccess('')
    } catch (e) {
      setError(e.message)
    }
  }

  const addItem = () => {
    if (items.length >= 3) {
      setError('Máximo 3 libros distintos por préstamo según la política (RNF-1 / §7)')
      return
    }
    setItems((i) => [...i, { book_id: '', quantity: 1 }])
  }

  const removeItem = (idx) => {
    setItems((i) => i.filter((_, j) => j !== idx))
  }

  const updateItem = (idx, field, val) => {
    setItems((i) => i.map((it, j) => (j === idx ? { ...it, [field]: val } : it)))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const validItems = items
        .filter((i) => i.book_id)
        .map((i) => ({ book_id: i.book_id, quantity: parseInt(i.quantity) || 1 }))

      if (!memberId) {
        setError('Debes seleccionar un miembro')
        return
      }

      if (!validItems.length) {
        setError('Agrega al menos un libro para el préstamo')
        return
      }

      await api.createLoan({ member_id: memberId, items: validItems })
      setSuccess('Préstamo registrado exitosamente')
      setShowCreate(false)
      fetchLoans()
    } catch (err) {
      setError(err.message)
    }
  }

  const viewDetail = async (loanId) => {
    try {
      const res = await api.getLoan(loanId)
      setShowDetail(res.data)
    } catch (e) {
      setError(e.message)
    }
  }

  const returnItem = async (loanId, itemId) => {
    try {
      await api.returnItem(loanId, itemId)
      setSuccess('Ejemplar devuelto exitosamente')
      const updated = await api.getLoan(loanId)
      setShowDetail(updated.data)
      fetchLoans()
    } catch (e) {
      setError(e.message)
    }
  }

  const statusBadge = (s) => {
    const config = {
      open: { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Abierto' },
      closed: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Cerrado' },
      overdue: { bg: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Vencido' },
    }
    const c = config[s] || { bg: 'bg-gray-800 text-gray-400 border-gray-700', label: s }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg}`}>
        {c.label}
      </span>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Préstamos</h1>
          <p className="text-sm text-gray-400">Control de salidas, devoluciones y plazos de entrega</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-lg shadow-indigo-600/20"
        >
          <span>+</span> Nuevo Préstamo
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-white">&times;</button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Filter */}
      <div className="mb-6 flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-100 focus:outline-none focus:border-indigo-500 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="open">Abiertos (en curso)</option>
          <option value="closed">Cerrados (completados)</option>
          <option value="overdue">Vencidos (fuera de plazo)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left py-3 px-4">Miembro</th>
                <th className="text-left py-3 px-4">Fecha Préstamo</th>
                <th className="text-left py-3 px-4">Fecha Vencimiento</th>
                <th className="text-center py-3 px-4">Items</th>
                <th className="text-center py-3 px-4">Estado</th>
                <th className="text-right py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    {loading ? 'Cargando préstamos...' : 'No se encontraron préstamos'}
                  </td>
                </tr>
              ) : (
                loans.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 text-gray-100 font-medium">
                      {l.member_name || l.member_id}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(l.loaned_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(l.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-300">
                      {l.item_count ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-center">{statusBadge(l.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => viewDetail(l.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta.pages > 1 && (
        <div className="flex justify-between items-center mt-4 px-2 text-sm text-gray-400">
          <span>
            Mostrando {loans.length} de {meta.total} préstamos
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 disabled:opacity-40 hover:bg-gray-800"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 font-medium text-gray-300">
              {meta.page} / {meta.pages}
            </span>
            <button
              disabled={page >= meta.pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 disabled:opacity-40 hover:bg-gray-800"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-100">Nuevo Préstamo</h2>
                <p className="text-xs text-gray-400">Plazo estándar: 14 días. Máx 3 libros.</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-200 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Miembro *</label>
                <select
                  required
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Selecciona un miembro...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.first_name} {m.last_name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-400">Libros a Prestar *</label>
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-gray-800/40 p-2.5 rounded-lg border border-gray-800">
                    <select
                      required
                      value={item.book_id}
                      onChange={(e) => updateItem(idx, 'book_id', e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Selecciona libro...</option>
                      {books
                        .filter((b) => b.available > 0)
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.title} — {b.available} disp.
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className="w-16 px-2 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-center text-xs focus:outline-none focus:border-indigo-500"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-red-400 hover:text-red-300 p-1 text-sm"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}

                {items.length < 3 && (
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    + Agregar otro libro
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
                >
                  Registrar Préstamo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowDetail(null)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-100">Detalle del Préstamo</h2>
                <p className="text-xs text-gray-400 font-mono">ID: {showDetail.id}</p>
              </div>
              <button onClick={() => setShowDetail(null)} className="text-gray-400 hover:text-gray-200 text-lg">
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm bg-gray-800/40 p-3 rounded-lg border border-gray-800">
              <div>
                <span className="text-xs text-gray-400 block">Estado:</span>
                <div>{statusBadge(showDetail.status)}</div>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Miembro:</span>
                <span className="text-gray-200 font-medium">{showDetail.member_name || showDetail.member_id}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Fecha préstamo:</span>
                <span className="text-gray-300">{new Date(showDetail.loaned_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Fecha vencimiento:</span>
                <span className="text-gray-300">{new Date(showDetail.due_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Ejemplares prestados
              </h3>
              <div className="space-y-2">
                {(showDetail.items || []).map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800 border border-gray-700/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-100">{it.book_title || it.book_id}</p>
                      <p className="text-xs text-gray-400">Cantidad: {it.quantity}</p>
                    </div>

                    {it.returned_at ? (
                      <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Devuelto {new Date(it.returned_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <button
                        onClick={() => returnItem(showDetail.id, it.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                      >
                        Marcar Devolución
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-800">
              <button
                onClick={() => setShowDetail(null)}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
