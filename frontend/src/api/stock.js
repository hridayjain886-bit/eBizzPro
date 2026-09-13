import { api } from './client'

export const stockApi = {
  list: () => api.get('/api/stock'),
  get: (id) => api.get(`/api/stock/${id}`),
  create: (data) => api.post('/api/stock', data),
  update: (id, data) => api.patch(`/api/stock/${id}`, data),
  remove: (id) => api.delete(`/api/stock/${id}`),
}
