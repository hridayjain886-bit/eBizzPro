import { api } from './client'

export const partiesApi = {
  list: () => api.get('/api/parties'),
  get: (id) => api.get(`/api/parties/${id}`),
  create: (data) => api.post('/api/parties', data),
  update: (id, data) => api.patch(`/api/parties/${id}`, data),
  remove: (id) => api.delete(`/api/parties/${id}`),
}
