import { api } from './client'

export const invoicesApi = {
  list: () => api.get('/api/invoices'),
  get: (id) => api.get(`/api/invoices/${id}`),
  create: (data) => api.post('/api/invoices', data),
  update: (id, data) => api.patch(`/api/invoices/${id}`, data),
  updateStatus: (id, data) => api.patch(`/api/invoices/${id}/status`, data),
  remove: (id, restoreStock = false) => api.delete(`/api/invoices/${id}`, { params: { restoreStock } }),
}
