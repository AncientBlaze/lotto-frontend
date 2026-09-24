import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://162.35.117.146',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('dear6_admin_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401 &&
      typeof window !== 'undefined'
    ) {
      localStorage.removeItem('dear6_admin_token')
    }

    return Promise.reject(error)
  },
)
