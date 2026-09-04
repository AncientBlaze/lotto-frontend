import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://kkrv7hmk-8080.inc1.devtunnels.ms',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dear6_admin_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
