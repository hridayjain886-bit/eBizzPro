import { api } from './client'

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  verifyEmail: (data) => api.post('/api/auth/verify-email', data),
  resendOtp: (data) => api.post('/api/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
  verifyResetOtp: (data) => api.post('/api/auth/verify-reset-otp', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
  login: (data) => api.post('/api/auth/login', data),
  google: (data) => api.post('/api/auth/google', data),
  me: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.patch('/api/auth/profile', data),
}
