const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token')
  }

  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  async request(path, options = {}) {
    const headers = { ...options.headers }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(options.body)
    }

    const res = await fetch(`${API_URL}${path}`, { ...options, headers })

    if (res.status === 204) {
      return null
    }

    if (res.status === 401) {
      this.setToken(null)
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      throw new Error('Sesión expirada o credenciales inválidas')
    }

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      const msg = data.message || data.error?.message || data.detail || `Error ${res.status}`
      throw new Error(msg)
    }

    return data
  }

  // Auth
  login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { username, password },
    })
  }

  // Categories
  async getCategories() {
    const res = await this.request('/categories')
    const list = Array.isArray(res) ? res : (res.data || res.items || [])
    return { data: list }
  }

  // Books
  async getBooks(params = {}) {
    const q = new URLSearchParams()
    if (params.page) q.set('page', params.page)
    if (params.size) q.set('size', params.size)
    if (params.search) q.set('q', params.search)
    if (params.category_id) q.set('category_id', params.category_id)

    const res = await this.request(`/books?${q.toString()}`)
    const items = (res.items || res.data || []).map((b) => ({
      ...b,
      copies: b.total_copies ?? b.copies ?? 1,
      available: b.available_copies ?? b.available ?? 0,
      category_id: b.category?.id ?? b.category_id,
      category_name: b.category?.name ?? b.category_name ?? '',
    }))

    const page = res.page || 1
    const size = res.size || params.size || 15
    const total = res.total ?? items.length
    const pages = Math.ceil(total / size) || 1

    return {
      data: items,
      meta: { page, size, total, pages },
    }
  }

  createBook(data) {
    const payload = {
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      total_copies: data.total_copies ?? data.copies ?? 1,
      category_id: data.category_id,
    }
    return this.request('/books', { method: 'POST', body: payload })
  }

  updateBook(id, data) {
    const payload = {
      title: data.title,
      author: data.author,
      total_copies: data.total_copies ?? data.copies ?? 1,
      category_id: data.category_id,
    }
    return this.request(`/books/${id}`, { method: 'PUT', body: payload })
  }

  deleteBook(id) {
    return this.request(`/books/${id}`, { method: 'DELETE' })
  }

  uploadCover(id, file) {
    const fd = new FormData()
    fd.append('file', file)
    return this.request(`/books/${id}/cover`, { method: 'PUT', body: fd })
  }

  getCoverUrl(id) {
    return `${API_URL}/books/${id}/cover`
  }

  deleteCover(id) {
    return this.request(`/books/${id}/cover`, { method: 'DELETE' })
  }

  // Members
  async getMembers(params = {}) {
    const q = new URLSearchParams()
    if (params.page) q.set('page', params.page)
    if (params.size) q.set('size', params.size)
    if (params.search) q.set('q', params.search)

    const res = await this.request(`/members?${q.toString()}`)
    const items = (res.items || res.data || []).map((m) => ({
      ...m,
      full_name: m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim(),
      document_number: m.document_number || m.email || '',
      active_loans: m.active_loans ?? 0,
    }))

    const page = res.page || 1
    const size = res.size || params.size || 15
    const total = res.total ?? items.length
    const pages = Math.ceil(total / size) || 1

    return {
      data: items,
      meta: { page, size, total, pages },
    }
  }

  createMember(data) {
    return this.request('/members', {
      method: 'POST',
      body: {
        full_name: data.full_name,
        document_number: data.document_number,
      },
    })
  }

  // Loans
  async getLoans(params = {}) {
    const q = new URLSearchParams()
    if (params.page) q.set('page', params.page)
    if (params.size) q.set('size', params.size)
    if (params.member_id) q.set('member_id', params.member_id)
    if (params.status) q.set('status', params.status)

    const res = await this.request(`/loans?${q.toString()}`)
    const items = res.items || res.data || []
    const page = res.page || 1
    const size = res.size || params.size || 15
    const total = res.total ?? items.length
    const pages = Math.ceil(total / size) || 1

    return {
      data: items,
      meta: { page, size, total, pages },
    }
  }

  createLoan(data) {
    return this.request('/loans', {
      method: 'POST',
      body: {
        member_id: data.member_id,
        items: data.items.map((i) => ({ book_id: i.book_id })),
      },
    })
  }

  async getLoan(id) {
    const res = await this.request(`/loans/${id}`)
    return { data: res }
  }

  returnItem(loanId, itemId) {
    return this.request(`/loans/${loanId}/items/${itemId}/return`, { method: 'POST' })
  }

  async getOverdue() {
    const res = await this.request('/loans/overdue')
    const items = (res.items || res.data || []).map((row) => ({
      loan_id: row.loan_id,
      item_id: row.item_id,
      book_title: row.book_title || row.title,
      member_name: row.member_name,
      due_date: row.due_at || row.due_date,
      days_overdue: row.days_late || row.days_overdue || 0,
    }))
    return { data: items }
  }

  // Reports
  async getMostBorrowed(params = {}) {
    const q = new URLSearchParams()
    if (params.from) q.set('from', params.from)
    if (params.to) q.set('to', params.to)

    const res = await this.request(`/reports/most-borrowed?${q.toString()}`)
    const rows = (res.rows || res.data || []).map((r) => ({
      book_id: r.book_id,
      title: r.book_title || r.title,
      category_name: r.category_name || '',
      times_borrowed: r.times_borrowed || 0,
    }))
    return { data: rows }
  }
}

export const api = new ApiClient()

