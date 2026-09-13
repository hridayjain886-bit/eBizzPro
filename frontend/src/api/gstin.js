import { api } from './client'

export const gstinApi = {
  lookup: (gstin) => api.get(`/api/gstin/${encodeURIComponent(gstin)}`),
}
