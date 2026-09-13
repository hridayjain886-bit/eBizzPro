import { api } from './client'

export const transportersApi = {
  list: () => api.get('/api/transporters'),
  get: (id) => api.get(`/api/transporters/${id}`),
  create: (data) => api.post('/api/transporters', data),
  update: (id, data) => api.patch(`/api/transporters/${id}`, data),
  remove: (id) => api.delete(`/api/transporters/${id}`),
}
