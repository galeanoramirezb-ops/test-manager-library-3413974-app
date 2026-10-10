import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

export default function Members() {
  const [members, setMembers] = useState([])
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ full_name: '', document_number: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getMembers({ page, size: 12, search })
      setMembers(res.data || [])
      setMeta(res.meta || { page: 1, pages: 1, total: 0 })
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }, [page, search])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const openCreate = () => {
    setForm({ full_name: '', document_number: '' })
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.createMember({
        full_name: form.full_name.trim(),
        document_number: form.document_number.trim(),
      })
      setSuccess('Socio registrado exitosamente')
      setShowModal(false)
      fetchMembers()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Gestión de Socios</h1>
          <p className="text-sm text-gray-400">Padrón de socios habilitados para préstamos de biblioteca</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-lg shadow-indigo-600/20"
        >
          <span>+</span> Registrar Socio
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

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar socio por nombre o número de documento..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left py-3 px-4">Nombre Completo</th>
                <th className="text-left py-3 px-4">N° Documento</th>
                <th className="text-center py-3 px-4">Préstamos Activos</th>
                <th className="text-center py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {members.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-500">
                    {loading ? 'Cargando socios...' : 'No se encontraron socios registrados'}
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 text-gray-100 font-medium">
                      {m.full_name}
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-mono text-xs">{m.document_number}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-semibold px-2.5 py-0.5 rounded-full text-xs ${
                          m.active_loans > 0
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-gray-800 text-gray-500'
                        }`}
                      >
                        {m.active_loans}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Habilitado
                      </span>
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
            Mostrando {members.length} de {meta.total} socios
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

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="text-lg font-bold text-gray-100">
                Registrar Nuevo Socio
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-200 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Ana María López"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">N° de Documento de Identidad *</label>
                <input
                  type="text"
                  required
                  value={form.document_number}
                  onChange={(e) => setForm({ ...form, document_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="1020304050"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
                >
                  Registrar Socio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
