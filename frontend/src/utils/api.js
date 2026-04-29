import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
})

export const patentAPI = {
  search: (text, top_k = 5) =>
    api.post('/api/patent/search', { text, top_k }),
  upload: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/api/patent/upload', fd)
  },
}

export const trademarkAPI = {
  checkText: (brand_name, nice_class = 42) =>
    api.post('/api/trademark/check-text', { brand_name, nice_class }),
  checkImage: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/api/trademark/check-image', fd)
  },
}

export const priorArtAPI = {
  analyze: (text, top_k = 5) =>
    api.post('/api/prior-art/analyze', { text, top_k }),
}

export const dashboardAPI = {
  summary: () => api.get('/api/dashboard/summary'),
  trends:  () => api.get('/api/dashboard/trends'),
  alerts:  () => api.get('/api/dashboard/alerts'),
}

export default api
