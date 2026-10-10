import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

export default function Books() {
  const [books, setBooks] = useState([])
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 })
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', isbn: '', author: '', year: '', copies: 1, category_id: '' })
  const [coverFile, setCoverFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getBooks({ page, size: 12, search, category_id: catFilter })
      setBooks(res.data || [])
      setMeta(res.meta || { page: 1, pages: 1, total: 0 })
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }, [page, search, catFilter])

  useEffect(() => {
    api.getCategories()
      .then((r) => setCategories(r.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const openCreate = () => {
    setEditing(null)
    setForm({
      title: '',
      isbn: '',
      author: '',
      year: new Date().getFullYear(),
      copies: 1,
      category_id: categories[0]?.id || '',
    })
    setCoverFile(null)
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const openEdit = (b) => {
    setEditing(b)
    setForm({
      title: b.title,
      isbn: b.isbn || '',
      author: b.author,
      year: b.year || '',
      copies: b.copies,
      category_id: b.category_id,
    })
    setCoverFile(null)
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        author: form.author.trim(),
        isbn: form.isbn.trim() || null,
        year: form.year ? parseInt(form.year) : null,
        copies: parseInt(form.copies),
        category_id: form.category_id,
      }

      let bookId
      if (editing) {
        const res = await api.updateBook(editing.id, payload)
        bookId = editing.id
        setSuccess('Libro actualizado exitosamente')
      } else {
        const res = await api.createBook(payload)
        bookId = res.data?.id
        setSuccess('Libro creado exitosamente')
      }

      if (coverFile && bookId) {
        await api.uploadCover(bookId, coverFile)
      }

      setShowModal(false)
      fetchBooks()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`¿Estás seguro de eliminar el libro "${title}"?`)) return
    try {
      await api.deleteBook(id)
      setSuccess('Libro eliminado')
      fetchBooks()
    } catch (err) {
      setError(err.message)
    }
  }

  const catName = (id) => categories.find((c) => c.id === id)?.name || '-'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Catálogo de Libros</h1>
          <p className="text-sm text-gray-400">Gestiona los libros y ejemplares de la biblioteca</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-lg shadow-indigo-600/20"
        >
          <span>+</span> Nuevo Libro
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar por título o autor..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => {
            setCatFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-100 focus:outline-none focus:border-indigo-500 text-sm"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left py-3 px-4">Título</th>
                <th className="text-left py-3 px-4">Autor</th>
                <th className="text-left py-3 px-4">ISBN</th>
                <th className="text-left py-3 px-4">Año</th>
                <th className="text-left py-3 px-4">Categoría</th>
                <th className="text-center py-3 px-4">Copias</th>
                <th className="text-center py-3 px-4">Disponibles</th>
                <th className="text-right py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {books.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500">
                    {loading ? 'Cargando libros...' : 'No se encontraron libros'}
                  </td>
                </tr>
              ) : (
                books.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 text-gray-100 font-medium">{b.title}</td>
                    <td className="py-3 px-4 text-gray-300">{b.author}</td>
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">{b.isbn || '—'}</td>
                    <td className="py-3 px-4 text-gray-400">{b.year || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs border border-indigo-500/20">
                        {catName(b.category_id)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-300">{b.copies}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-xs ${
                          b.available > 0
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {b.available}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEdit(b)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(b.id, b.title)}
                        className="text-xs text-red-400 hover:text-red-300 hover:underline"
                      >
                        Eliminar
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
            Mostrando {books.length} de {meta.total} libros
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
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="text-lg font-bold text-gray-100">
                {editing ? 'Editar Libro' : 'Nuevo Libro'}
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
                <label className="block text-xs font-medium text-gray-400 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Cien años de soledad"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Autor *</label>
                <input
                  type="text"
                  required
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Gabriel García Márquez"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">ISBN (10 o 13)</label>
                  <input
                    type="text"
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="9780307474728"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Año de publicación</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="1967"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Total Copias *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.copies}
                    onChange={(e) => setForm({ ...form, copies: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Categoría *</label>
                  <select
                    required
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Selecciona categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Portada (PNG/JPEG máx 2MB)
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => setCoverFile(e.target.files[0] || null)}
                  className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700"
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
                  {editing ? 'Guardar Cambios' : 'Crear Libro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
