import axios from 'axios';

const api = axios.create();

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data) => axios.post('http://localhost:8000/auth/register', data),
  login: (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    return axios.post('http://localhost:8000/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
};

export const hotelAPI = {
  list: (params) => api.get('http://localhost:8001/hotels/', { params }),
  get: (id) => api.get(`http://localhost:8001/hotels/${id}`),
  seed: () => api.get('http://localhost:8001/hotels/seed'),
  create: (data) => api.post('http://localhost:8001/hotels/', data),
  update: (id, data) => api.put(`http://localhost:8001/hotels/${id}`, data),
  delete: (id) => api.delete(`http://localhost:8001/hotels/${id}`),
};

export const bookingAPI = {
  create: (data) => api.post('http://localhost:8002/bookings/', data),
  getMyBookings: () => api.get('http://localhost:8002/bookings/my'),
  getAll: () => api.get('http://localhost:8002/bookings/'),
  cancel: (id) => api.post(`http://localhost:8002/bookings/${id}/cancel`),
};

export const paymentAPI = {
  process: (data) => api.post('http://localhost:8003/payments/', data),
};

export const userAPI = {
  getAll: () => api.get('http://localhost:8000/users/'),
};

export default api;
